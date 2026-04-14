import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { BaseTable } from '../base-table';
import { TableQueryDto } from '../dto/table-query.dto';
import { TableResponse, PaginationData } from '../interfaces';
import { PaginationType } from '../enums';
import { isWithoutComparisonClause, Clause } from '../enums';

@Injectable()
export class TableQueryService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async execute<T = any>(table: BaseTable<T>, query: TableQueryDto): Promise<TableResponse<T>> {
    // Parse bracket-notation filters from raw query (e.g., filters[name][contains]=x)
    const parsedFilters = this.parseFilters(query);

    const config = table.getConfig();
    const repo = this.dataSource.getRepository(config.resource);
    const qb = repo.createQueryBuilder('entity');

    // 1. Apply eager loading for nested columns/filters
    this.applyEagerLoading(qb, table);

    // 2. Apply global search
    if (query.search) {
      this.applySearch(qb, table, query.search);
    }

    // 3. Apply filters
    if (parsedFilters && Object.keys(parsedFilters).length > 0) {
      this.applyFilters(qb, table, parsedFilters);
    }

    // 4. Apply sorting
    this.applySort(qb, table, query.sort);

    // 5. Paginate
    const paginationResult = await this.paginate(qb, table, query);

    // 6. Transform data through column mappers
    const data = paginationResult.data.map((item: any) => this.transformItem(item, table)) as T[];

    // 7. Build meta
    const meta = table.toMeta();

    return { meta, data, pagination: paginationResult.paginationData };
  }

  private parseFilters(query: any): Record<string, Record<string, string>> | undefined {
    // If filters is already a nested object, return it
    if (query.filters && typeof query.filters === 'object' && !Array.isArray(query.filters)) {
      // Check if it's already properly nested (e.g., { firstName: { contains: 'x' } })
      const firstValue = Object.values(query.filters)[0];
      if (firstValue && typeof firstValue === 'object') {
        return query.filters;
      }
    }

    // Parse bracket-notation from flat query keys: "filters[key][clause]" = "value"
    const filters: Record<string, Record<string, string>> = {};
    for (const [key, value] of Object.entries(query)) {
      const match = key.match(/^filters\[(\w+)]\[(\w+)]$/);
      if (match) {
        const [, filterKey, clause] = match;
        if (!filters[filterKey]) filters[filterKey] = {};
        filters[filterKey][clause] = value as string;
      }
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
  }

  private applyEagerLoading(qb: SelectQueryBuilder<any>, table: BaseTable<any>): void {
    const relations = new Set<string>();
    for (const column of table.getColumns()) {
      if (column.isNested()) {
        relations.add(column.getRelationshipName());
      }
    }
    for (const filter of table.getFilters()) {
      if (filter.isNested()) {
        relations.add(filter.getRelationshipName());
      }
    }
    for (const relation of relations) {
      qb.leftJoinAndSelect(`entity.${relation}`, relation);
    }
  }

  private applySearch(qb: SelectQueryBuilder<any>, table: BaseTable<any>, search: string): void {
    const searchableColumns = table.getColumns().filter(c => c.isSearchable());
    const config = table.getConfig();
    const searchableFields = config.searchable ?? [];
    const allSearchable = [
      ...searchableColumns.map(c => c.getAttribute()),
      ...searchableFields,
    ];

    if (allSearchable.length === 0) return;

    const conditions: string[] = [];
    const params: Record<string, string> = {};

    allSearchable.forEach((attr, i) => {
      const col = attr.includes('.')
        ? `${attr.split('.')[0]}.${attr.split('.')[1]}`
        : `entity.${attr}`;
      conditions.push(`${col} ILIKE :search_${i}`);
      params[`search_${i}`] = `%${search}%`;
    });

    qb.andWhere(`(${conditions.join(' OR ')})`, params);
  }

  private applyFilters(
    qb: SelectQueryBuilder<any>,
    table: BaseTable<any>,
    filters: Record<string, Record<string, string>>,
  ): void {
    const tableFilters = table.getFilters();

    for (const [key, clauseMap] of Object.entries(filters)) {
      const filter = tableFilters.find(f => f.getAttribute() === key);
      if (!filter) continue;

      for (const [clauseStr, value] of Object.entries(clauseMap)) {
        const clause = clauseStr as Clause;
        if (!filter.getClauses().includes(clause)) continue;

        const validated = filter.validate(value, clause);
        if (validated === null && !isWithoutComparisonClause(clause)) continue;

        filter.handle(qb, clause, validated);
      }
    }
  }

  private applySort(qb: SelectQueryBuilder<any>, table: BaseTable<any>, sort?: string): void {
    const config = table.getConfig();

    if (sort) {
      const [column, direction] = sort.split(':');
      const col = table.getColumns().find(c => c.getAttribute() === column);
      if (col?.isSortable()) {
        const customSort = col.getSortUsing();
        if (customSort) {
          customSort(qb, direction);
        } else {
          const attr = col.isNested()
            ? `${col.getRelationshipName()}.${col.getRelationshipColumn()}`
            : `entity.${col.getAttribute()}`;
          qb.orderBy(attr, direction.toUpperCase() as 'ASC' | 'DESC');
        }
        return;
      }
    }

    if (config.defaultSort) {
      qb.orderBy(
        `entity.${config.defaultSort.column}`,
        config.defaultSort.direction.toUpperCase() as 'ASC' | 'DESC',
      );
    }
  }

  private async paginate(
    qb: SelectQueryBuilder<any>,
    table: BaseTable<any>,
    query: TableQueryDto,
  ): Promise<{ data: any[]; paginationData: PaginationData }> {
    const config = table.getConfig();
    const page = query.page ?? 1;
    const perPage = query.limit ?? config.defaultPerPage ?? 15;
    const paginationType = config.pagination ?? PaginationType.Full;

    if (paginationType === PaginationType.Cursor) {
      const data = await qb.take(perPage + 1).getMany();
      const hasMore = data.length > perPage;
      if (hasMore) data.pop();

      return {
        data,
        paginationData: {
          type: PaginationType.Cursor,
          currentPage: page,
          lastPage: 0,
          perPage,
          total: 0,
          from: 0,
          to: data.length,
          nextCursor: hasMore ? 'next' : null,
          previousCursor: page > 1 ? 'prev' : null,
        },
      };
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getMany();

    const lastPage = Math.ceil(total / perPage) || 1;
    const from = total > 0 ? (page - 1) * perPage + 1 : 0;
    const to = Math.min(page * perPage, total);

    return {
      data,
      paginationData: {
        type: paginationType,
        currentPage: page,
        lastPage,
        perPage,
        total,
        from,
        to,
      },
    };
  }

  private transformItem(item: any, table: BaseTable<any>): Record<string, any> {
    const result: Record<string, any> = { id: item.id };

    for (const column of table.getColumns()) {
      if (column.getAttribute() === '_actions') continue;
      const rawValue = column.getDataFromItem(item);
      result[column.getAttribute()] = column.mapForTable(rawValue, item);
    }

    const rowActions = table.getRowActions();
    if (rowActions.length > 0) {
      result._actions = rowActions.map(action => ({
        ...action.toArray(),
        url: action.resolveUrl(item),
        disabled: action.isDisabledFor(item),
        hidden: action.isHiddenFor(item),
      }));
    }

    return result;
  }
}
