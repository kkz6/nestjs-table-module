import { TableActionController } from '../table-action.controller';
import { TableRegistry } from '../../table-registry';
import { NotFoundException } from '@nestjs/common';
import { Action } from '../../action';

describe('TableActionController', () => {
  let controller: TableActionController;
  let registry: TableRegistry;

  beforeEach(() => {
    registry = new TableRegistry();
    controller = new TableActionController(registry);
  });

  function registerTableWithActions(rowActions: Action[], bulkActions: Action[] = []) {
    const table: any = {
      setRegistryName: jest.fn(),
      getRowActions: jest.fn().mockReturnValue(rowActions),
      getBulkActions: jest.fn().mockReturnValue(bulkActions),
    };
    registry.register('TestTable', table);
    return table;
  }

  it('executes action and returns result when tableClass and actionName are valid', async () => {
    const action = Action.make('edit').handle(async () => ({ updated: true }));
    registerTableWithActions([action]);

    const result = await controller.execute('TestTable', 'edit', {});

    expect(result).toEqual({ updated: true });
  });

  it('throws NotFoundException for unknown tableClass', async () => {
    await expect(
      controller.execute('UnknownTable', 'edit', {}),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException for unknown actionName', async () => {
    registerTableWithActions([Action.make('edit')]);

    await expect(
      controller.execute('TestTable', 'nonexistent', {}),
    ).rejects.toThrow(NotFoundException);
  });

  it('passes body.id to action.execute for row action', async () => {
    const handler = jest.fn().mockResolvedValue({ done: true });
    const action = Action.make('edit').handle(handler);
    registerTableWithActions([action]);

    await controller.execute('TestTable', 'edit', { id: '42' });

    expect(handler).toHaveBeenCalledWith('42', undefined);
  });

  it('passes body.ids to action.execute for bulk action', async () => {
    const handler = jest.fn().mockResolvedValue({ deleted: 3 });
    const action = Action.make('bulkDelete').bulk().handle(handler);
    registerTableWithActions([], [action]);

    await controller.execute('TestTable', 'bulkDelete', { ids: ['1', '2', '3'] });

    expect(handler).toHaveBeenCalledWith(['1', '2', '3'], undefined);
  });

  it('returns { success: true } when action returns undefined', async () => {
    const action = Action.make('doSomething').handle(async () => undefined);
    registerTableWithActions([action]);

    const result = await controller.execute('TestTable', 'doSomething', {});

    expect(result).toEqual({ success: true });
  });
});
