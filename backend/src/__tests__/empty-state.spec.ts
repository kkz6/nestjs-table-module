import { EmptyState } from '../empty-state';

describe('EmptyState', () => {
  describe('make() factory', () => {
    it('creates an empty instance', () => {
      const state = EmptyState.make();
      expect(state).toBeInstanceOf(EmptyState);
    });
  });

  describe('chainable builders', () => {
    it('title() sets the title and returns this', () => {
      const state = EmptyState.make();
      const result = state.title('No results');
      expect(result).toBe(state);
    });

    it('message() sets the message and returns this', () => {
      const state = EmptyState.make();
      const result = state.message('Try adjusting your filters');
      expect(result).toBe(state);
    });

    it('icon() sets the icon and returns this', () => {
      const state = EmptyState.make();
      const result = state.icon('search');
      expect(result).toBe(state);
    });

    it('action() sets the action and returns this', () => {
      const state = EmptyState.make();
      const result = state.action({ label: 'Create New', url: '/create' });
      expect(result).toBe(state);
    });
  });

  describe('toArray() serialization', () => {
    it('serializes empty state with defaults', () => {
      const state = EmptyState.make();
      expect(state.toArray()).toEqual({
        title: '',
        message: '',
        icon: undefined,
        action: null,
      });
    });

    it('serializes with all values set', () => {
      const state = EmptyState.make()
        .title('No users found')
        .message('Try adjusting your search or filters')
        .icon('users')
        .action({ label: 'Add User', url: '/users/create' });

      expect(state.toArray()).toEqual({
        title: 'No users found',
        message: 'Try adjusting your search or filters',
        icon: 'users',
        action: { label: 'Add User', url: '/users/create' },
      });
    });

    it('serializes with partial values', () => {
      const state = EmptyState.make()
        .title('Nothing here')
        .icon('inbox');

      expect(state.toArray()).toEqual({
        title: 'Nothing here',
        message: '',
        icon: 'inbox',
        action: null,
      });
    });
  });
});
