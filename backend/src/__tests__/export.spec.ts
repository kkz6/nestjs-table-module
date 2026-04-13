import { Export } from '../export';
import { ExportFormat } from '../enums';

describe('Export', () => {
  describe('make() factory', () => {
    it('creates with name, fileName, and format', () => {
      const exp = Export.make('users', 'users-export', ExportFormat.Xlsx);
      expect(exp.getName()).toBe('users');
      expect(exp.getFileName()).toBe('users-export');
      expect(exp.getFormat()).toBe(ExportFormat.Xlsx);
    });

    it('label defaults to name', () => {
      const exp = Export.make('users', 'users-export', ExportFormat.Csv);
      expect(exp.getLabel()).toBe('users');
    });

    it('label can be set explicitly', () => {
      const exp = Export.make('users', 'users-export', ExportFormat.Csv).label(
        'Export Users',
      );
      expect(exp.getLabel()).toBe('Export Users');
    });
  });

  describe('authorization', () => {
    it('isAuthorized returns true by default', () => {
      const exp = Export.make('users', 'users-export', ExportFormat.Xlsx);
      expect(exp.isAuthorized({ role: 'user' })).toBe(true);
    });

    it('isAuthorized respects authorize callback', () => {
      const exp = Export.make('users', 'users-export', ExportFormat.Xlsx)
        .authorize((user) => user.role === 'admin');

      expect(exp.isAuthorized({ role: 'admin' })).toBe(true);
      expect(exp.isAuthorized({ role: 'user' })).toBe(false);
    });
  });

  describe('filteredOnly / selectedOnly', () => {
    it('filteredOnly defaults to true', () => {
      const exp = Export.make('users', 'users-export', ExportFormat.Xlsx);
      expect(exp.isFilteredOnly()).toBe(true);
    });

    it('filteredOnly can be set to false', () => {
      const exp = Export.make(
        'users',
        'users-export',
        ExportFormat.Xlsx,
      ).filteredOnly(false);
      expect(exp.isFilteredOnly()).toBe(false);
    });

    it('selectedOnly defaults to false', () => {
      const exp = Export.make('users', 'users-export', ExportFormat.Xlsx);
      expect(exp.isSelectedOnly()).toBe(false);
    });

    it('selectedOnly can be set to true', () => {
      const exp = Export.make(
        'users',
        'users-export',
        ExportFormat.Xlsx,
      ).selectedOnly();
      expect(exp.isSelectedOnly()).toBe(true);
    });
  });

  describe('chainable builders return this', () => {
    it('all builder methods return the same instance', () => {
      const exp = Export.make('users', 'users-export', ExportFormat.Xlsx);

      expect(exp.label('Test')).toBe(exp);
      expect(exp.authorize(() => true)).toBe(exp);
      expect(exp.filteredOnly()).toBe(exp);
      expect(exp.selectedOnly()).toBe(exp);
    });
  });

  describe('toArray() serialization', () => {
    it('serializes correctly', () => {
      const exp = Export.make('users', 'users-export', ExportFormat.Csv).label(
        'Export All Users',
      );

      expect(exp.toArray()).toEqual({
        name: 'users',
        label: 'Export All Users',
        fileName: 'users-export',
        format: ExportFormat.Csv,
      });
    });

    it('serializes with defaults', () => {
      const exp = Export.make('orders', 'orders-file', ExportFormat.Pdf);

      expect(exp.toArray()).toEqual({
        name: 'orders',
        label: 'orders',
        fileName: 'orders-file',
        format: ExportFormat.Pdf,
      });
    });
  });
});
