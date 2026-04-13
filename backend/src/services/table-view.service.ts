import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableViewEntity } from '../entities/table-view.entity';
import { StoreViewDto } from '../dto/view.dto';

@Injectable()
export class TableViewService {
  constructor(
    @InjectRepository(TableViewEntity)
    private viewRepo: Repository<TableViewEntity>,
  ) {}

  async findByUser(tableClass: string, userId: number) {
    return this.viewRepo.find({
      where: { tableClass, userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(tableClass: string, dto: StoreViewDto, userId: number) {
    const view = this.viewRepo.create({
      tableClass,
      userId,
      title: dto.title,
      requestPayload: dto.requestPayload,
    });
    return this.viewRepo.save(view);
  }

  async delete(tableClass: string, id: number, userId: number) {
    await this.viewRepo.delete({ id, tableClass, userId });
    return { success: true };
  }
}
