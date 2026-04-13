import { TableViewController } from '../table-view.controller';
import { TableViewService } from '../../services/table-view.service';

describe('TableViewController', () => {
  let controller: TableViewController;
  let viewService: jest.Mocked<TableViewService>;

  beforeEach(() => {
    viewService = {
      findByUser: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as any;

    controller = new TableViewController(viewService);
  });

  describe('list()', () => {
    it('calls viewService.findByUser with correct tableClass and userId', async () => {
      const mockViews = [{ id: 1, title: 'My View' }];
      viewService.findByUser.mockResolvedValue(mockViews as any);

      const req = { user: { id: 5 } };
      const result = await controller.list('UsersTable', req);

      expect(viewService.findByUser).toHaveBeenCalledWith('UsersTable', 5);
      expect(result).toEqual(mockViews);
    });

    it('uses userId 0 when req.user is undefined', async () => {
      viewService.findByUser.mockResolvedValue([]);

      const req = {};
      await controller.list('UsersTable', req);

      expect(viewService.findByUser).toHaveBeenCalledWith('UsersTable', 0);
    });
  });

  describe('store()', () => {
    it('calls viewService.create with correct args', async () => {
      const mockView = { id: 1, title: 'New View', requestPayload: { sort: 'name:asc' } };
      viewService.create.mockResolvedValue(mockView as any);

      const body = { title: 'New View', requestPayload: { sort: 'name:asc' } };
      const req = { user: { id: 7 } };
      const result = await controller.store('UsersTable', body, req);

      expect(viewService.create).toHaveBeenCalledWith('UsersTable', body, 7);
      expect(result).toEqual(mockView);
    });
  });

  describe('destroy()', () => {
    it('calls viewService.delete with correct args', async () => {
      viewService.delete.mockResolvedValue({ success: true });

      const req = { user: { id: 7 } };
      const result = await controller.destroy('UsersTable', 99, req);

      expect(viewService.delete).toHaveBeenCalledWith('UsersTable', 99, 7);
      expect(result).toEqual({ success: true });
    });
  });
});
