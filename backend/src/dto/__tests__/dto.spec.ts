import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { TableQueryDto } from '../table-query.dto';
import { ActionRequestDto } from '../action-request.dto';
import { StoreViewDto } from '../view.dto';

describe('TableQueryDto', () => {
  function createDto(data: Record<string, any>): TableQueryDto {
    return plainToInstance(TableQueryDto, data);
  }

  it('valid: page=1, limit=15, sort="name:asc", search="john"', async () => {
    const dto = createDto({ page: 1, limit: 15, sort: 'name:asc', search: 'john' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('defaults page to 1 and limit to 15', () => {
    const dto = createDto({});
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(15);
  });

  it('invalid: page=0 (min 1)', async () => {
    const dto = createDto({ page: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const pageError = errors.find((e) => e.property === 'page');
    expect(pageError).toBeDefined();
  });

  it('invalid: page=-1', async () => {
    const dto = createDto({ page: -1 });
    const errors = await validate(dto);
    const pageError = errors.find((e) => e.property === 'page');
    expect(pageError).toBeDefined();
  });

  it('invalid: limit=0 (min 1)', async () => {
    const dto = createDto({ limit: 0 });
    const errors = await validate(dto);
    const limitError = errors.find((e) => e.property === 'limit');
    expect(limitError).toBeDefined();
  });

  it('invalid: limit=101 (max 100)', async () => {
    const dto = createDto({ limit: 101 });
    const errors = await validate(dto);
    const limitError = errors.find((e) => e.property === 'limit');
    expect(limitError).toBeDefined();
  });

  it('invalid: page="abc" (not int)', async () => {
    const dto = createDto({ page: 'abc' });
    const errors = await validate(dto);
    const pageError = errors.find((e) => e.property === 'page');
    expect(pageError).toBeDefined();
  });

  it('valid: limit at boundary 1', async () => {
    const dto = createDto({ limit: 1 });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('valid: limit at boundary 100', async () => {
    const dto = createDto({ limit: 100 });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('transforms filters from JSON string', () => {
    const filtersObj = { name: { contains: 'john' } };
    const dto = createDto({ filters: JSON.stringify(filtersObj) });
    expect(dto.filters).toEqual(filtersObj);
  });

  it('passes filters object through unchanged', () => {
    const filtersObj = { name: { contains: 'john' } };
    const dto = createDto({ filters: filtersObj });
    expect(dto.filters).toEqual(filtersObj);
  });

  it('keeps invalid JSON string as-is for filters', () => {
    const dto = createDto({ filters: 'not-json' });
    expect(dto.filters).toBe('not-json');
  });
});

describe('ActionRequestDto', () => {
  function createDto(data: Record<string, any>): ActionRequestDto {
    return plainToInstance(ActionRequestDto, data);
  }

  it('valid with id', async () => {
    const dto = createDto({ id: '123' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.id).toBe('123');
  });

  it('valid with ids', async () => {
    const dto = createDto({ ids: ['1', '2', '3'] });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.ids).toEqual(['1', '2', '3']);
  });

  it('valid with both id and ids', async () => {
    const dto = createDto({ id: '1', ids: ['2', '3'] });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('valid with no fields (both optional)', async () => {
    const dto = createDto({});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('invalid: id is not a string', async () => {
    const dto = createDto({ id: 123 });
    const errors = await validate(dto);
    const idError = errors.find((e) => e.property === 'id');
    expect(idError).toBeDefined();
  });

  it('invalid: ids is not an array', async () => {
    const dto = createDto({ ids: 'not-array' });
    const errors = await validate(dto);
    const idsError = errors.find((e) => e.property === 'ids');
    expect(idsError).toBeDefined();
  });
});

describe('StoreViewDto', () => {
  function createDto(data: Record<string, any>): StoreViewDto {
    return plainToInstance(StoreViewDto, data);
  }

  it('valid: title and requestPayload', async () => {
    const dto = createDto({ title: 'My view', requestPayload: { filters: {} } });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.title).toBe('My view');
    expect(dto.requestPayload).toEqual({ filters: {} });
  });

  it('invalid: missing title (empty string)', async () => {
    const dto = createDto({ title: '', requestPayload: { filters: {} } });
    const errors = await validate(dto);
    const titleError = errors.find((e) => e.property === 'title');
    expect(titleError).toBeDefined();
  });

  it('invalid: missing title (undefined)', async () => {
    const dto = createDto({ requestPayload: { filters: {} } });
    const errors = await validate(dto);
    const titleError = errors.find((e) => e.property === 'title');
    expect(titleError).toBeDefined();
  });

  it('invalid: missing requestPayload', async () => {
    const dto = createDto({ title: 'My view' });
    const errors = await validate(dto);
    const payloadError = errors.find((e) => e.property === 'requestPayload');
    expect(payloadError).toBeDefined();
  });

  it('invalid: requestPayload is not an object', async () => {
    const dto = createDto({ title: 'My view', requestPayload: 'not-object' });
    const errors = await validate(dto);
    const payloadError = errors.find((e) => e.property === 'requestPayload');
    expect(payloadError).toBeDefined();
  });

  it('invalid: title is not a string', async () => {
    const dto = createDto({ title: 123, requestPayload: {} });
    const errors = await validate(dto);
    const titleError = errors.find((e) => e.property === 'title');
    expect(titleError).toBeDefined();
  });
});
