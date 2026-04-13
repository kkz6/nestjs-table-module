import { Action } from '../action';
import { ActionType, Variant } from '../enums';

describe('Action', () => {
  describe('make() factory', () => {
    it('creates with name and auto-generated label', () => {
      const action = Action.make('delete');
      expect(action.getName()).toBe('delete');
      expect(action.getLabel()).toBe('Delete');
    });

    it('creates with explicit label', () => {
      const action = Action.make('delete', 'Remove Item');
      expect(action.getName()).toBe('delete');
      expect(action.getLabel()).toBe('Remove Item');
    });
  });

  describe('chainable builders all return this', () => {
    it('all builder methods return the same instance', () => {
      const action = Action.make('test');

      expect(action.asButton()).toBe(action);
      expect(action.asLink()).toBe(action);
      expect(action.variant(Variant.Destructive)).toBe(action);
      expect(action.icon('trash')).toBe(action);
      expect(action.confirm({ title: 'Sure?' })).toBe(action);
      expect(action.handle(async () => {})).toBe(action);
      expect(action.before(async () => {})).toBe(action);
      expect(action.after(async () => {})).toBe(action);
      expect(action.authorize(() => true)).toBe(action);
      expect(action.disabled(() => false)).toBe(action);
      expect(action.hidden(() => false)).toBe(action);
      expect(action.url(() => '/test')).toBe(action);
      expect(action.download()).toBe(action);
      expect(action.bulk()).toBe(action);
      expect(action.meta({ key: 'val' })).toBe(action);
      expect(action.dataAttributes({ 'data-id': '1' })).toBe(action);
    });
  });

  describe('asButton / asLink', () => {
    it('asButton sets type to Button', () => {
      const action = Action.make('test').asLink().asButton();
      expect(action.toArray().type).toBe(ActionType.Button);
    });

    it('asLink sets type to Link', () => {
      const action = Action.make('test').asLink();
      expect(action.toArray().type).toBe(ActionType.Link);
    });
  });

  describe('variant, icon, confirm', () => {
    it('variant sets the variant', () => {
      const action = Action.make('test').variant(Variant.Destructive);
      expect(action.toArray().variant).toBe(Variant.Destructive);
    });

    it('icon sets the icon', () => {
      const action = Action.make('test').icon('trash');
      expect(action.toArray().icon).toBe('trash');
    });

    it('confirm sets the confirm config', () => {
      const config = { title: 'Are you sure?', message: 'This is permanent' };
      const action = Action.make('test').confirm(config);
      expect(action.toArray().confirm).toEqual(config);
    });
  });

  describe('isAuthorized()', () => {
    it('returns true by default when no authorize callback', () => {
      const action = Action.make('test');
      expect(action.isAuthorized({ role: 'user' })).toBe(true);
    });

    it('respects authorize callback', () => {
      const action = Action.make('test').authorize(
        (user) => user.role === 'admin',
      );
      expect(action.isAuthorized({ role: 'admin' })).toBe(true);
      expect(action.isAuthorized({ role: 'user' })).toBe(false);
    });
  });

  describe('isDisabledFor()', () => {
    it('returns false by default when no disabled callback', () => {
      const action = Action.make('test');
      expect(action.isDisabledFor({ status: 'active' })).toBe(false);
    });

    it('respects disabled callback', () => {
      const action = Action.make('test').disabled(
        (item) => item.status === 'locked',
      );
      expect(action.isDisabledFor({ status: 'locked' })).toBe(true);
      expect(action.isDisabledFor({ status: 'active' })).toBe(false);
    });
  });

  describe('isHiddenFor()', () => {
    it('returns false by default when no hidden callback', () => {
      const action = Action.make('test');
      expect(action.isHiddenFor({ status: 'active' })).toBe(false);
    });

    it('respects hidden callback', () => {
      const action = Action.make('test').hidden(
        (item) => item.status === 'draft',
      );
      expect(action.isHiddenFor({ status: 'draft' })).toBe(true);
      expect(action.isHiddenFor({ status: 'published' })).toBe(false);
    });
  });

  describe('resolveUrl()', () => {
    it('returns null if no url resolver', () => {
      const action = Action.make('test');
      expect(action.resolveUrl({ id: 1 })).toBeNull();
    });

    it('returns value from url resolver', () => {
      const action = Action.make('test').url((item) => `/items/${item.id}`);
      expect(action.resolveUrl({ id: 42 })).toBe('/items/42');
    });
  });

  describe('execute()', () => {
    it('runs handler and returns result', async () => {
      const action = Action.make('test').handle(async (item, repo) => {
        return { deleted: item.id };
      });

      const result = await action.execute({ id: 1 }, {});
      expect(result).toEqual({ deleted: 1 });
    });

    it('runs before and after hooks', async () => {
      const callOrder: string[] = [];

      const action = Action.make('test')
        .before(async (item) => {
          callOrder.push('before');
        })
        .handle(async (item, repo) => {
          callOrder.push('handle');
          return 'done';
        })
        .after(async (item, result) => {
          callOrder.push('after');
          expect(result).toBe('done');
        });

      const result = await action.execute({ id: 1 }, {});
      expect(result).toBe('done');
      expect(callOrder).toEqual(['before', 'handle', 'after']);
    });

    it('returns undefined when no handler is set', async () => {
      const action = Action.make('test');
      const result = await action.execute({ id: 1 }, {});
      expect(result).toBeUndefined();
    });
  });

  describe('bulk()', () => {
    it('marks as bulk action', () => {
      const action = Action.make('test').bulk();
      expect(action.isBulk()).toBe(true);
    });

    it('defaults to non-bulk', () => {
      const action = Action.make('test');
      expect(action.isBulk()).toBe(false);
    });
  });

  describe('toArray() serialization', () => {
    it('serializes correctly with defaults', () => {
      const action = Action.make('delete');
      const serialized = action.toArray();

      expect(serialized).toEqual({
        name: 'delete',
        label: 'Delete',
        type: ActionType.Button,
        variant: Variant.Default,
        icon: null,
        confirm: null,
        download: false,
        meta: null,
        dataAttributes: null,
      });
    });

    it('serializes correctly with customized values', () => {
      const action = Action.make('delete', 'Remove')
        .asLink()
        .variant(Variant.Destructive)
        .icon('trash')
        .confirm({ title: 'Sure?', message: 'Cannot undo' })
        .download()
        .meta({ key: 'val' })
        .dataAttributes({ 'data-action': 'delete' });

      const serialized = action.toArray();

      expect(serialized).toEqual({
        name: 'delete',
        label: 'Remove',
        type: ActionType.Link,
        variant: Variant.Destructive,
        icon: 'trash',
        confirm: { title: 'Sure?', message: 'Cannot undo' },
        download: true,
        meta: { key: 'val' },
        dataAttributes: { 'data-action': 'delete' },
      });
    });

    it('does not include functions in serialized output', () => {
      const action = Action.make('test')
        .handle(async () => {})
        .before(async () => {})
        .after(async () => {})
        .authorize(() => true)
        .disabled(() => false)
        .hidden(() => false)
        .url(() => '/test');

      const serialized = action.toArray();
      const values = Object.values(serialized);

      for (const value of values) {
        expect(typeof value).not.toBe('function');
      }
    });
  });
});
