import { TableViewService } from '../table-view.service';

describe('TableViewService', () => {
  let service: TableViewService;
  let repo: any;

  beforeEach(() => {
    repo = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    service = new TableViewService(repo);
  });

  describe('findByUser()', () => {
    it('calls repo.find with correct where and order', async () => {
      const mockViews = [
        { id: 1, title: 'View A', tableClass: 'UsersTable', userId: 5 },
      ];
      repo.find.mockResolvedValue(mockViews);

      const result = await service.findByUser('UsersTable', 5);

      expect(repo.find).toHaveBeenCalledWith({
        where: { tableClass: 'UsersTable', userId: 5 },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockViews);
    });
  });

  describe('create()', () => {
    it('calls repo.create then repo.save', async () => {
      const dto = { title: 'My View', requestPayload: { sort: 'name:asc' } };
      const createdEntity = {
        tableClass: 'UsersTable',
        userId: 7,
        title: 'My View',
        requestPayload: { sort: 'name:asc' },
      };
      const savedEntity = { ...createdEntity, id: 1 };

      repo.create.mockReturnValue(createdEntity);
      repo.save.mockResolvedValue(savedEntity);

      const result = await service.create('UsersTable', dto as any, 7);

      expect(repo.create).toHaveBeenCalledWith({
        tableClass: 'UsersTable',
        userId: 7,
        title: 'My View',
        requestPayload: { sort: 'name:asc' },
      });
      expect(repo.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(savedEntity);
    });
  });

  describe('delete()', () => {
    it('calls repo.delete with correct criteria and returns { success: true }', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete('UsersTable', 99, 7);

      expect(repo.delete).toHaveBeenCalledWith({
        id: 99,
        tableClass: 'UsersTable',
        userId: 7,
      });
      expect(result).toEqual({ success: true });
    });
  });
});
