import { TextColumn } from '../text-column';
import { NumericColumn } from '../numeric-column';
import { DateColumn } from '../date-column';
import { DateTimeColumn } from '../date-time-column';
import { BooleanColumn } from '../boolean-column';
import { BadgeColumn } from '../badge-column';
import { ImageColumn } from '../image-column';
import { ActionColumn } from '../action-column';
import { ColumnAlignment, ImageSize, ImagePosition } from '../../enums';

describe('TextColumn', () => {
  it('has type "text"', () => {
    const col = TextColumn.make('name');
    expect(col.toArray().type).toBe('text');
  });
});

describe('NumericColumn', () => {
  it('has type "numeric"', () => {
    const col = NumericColumn.make('amount');
    expect(col.toArray().type).toBe('numeric');
  });
});

describe('DateColumn', () => {
  // Reset default format before each test
  beforeEach(() => {
    DateColumn.setDefaultFormat('YYYY-MM-DD');
  });

  it('has type "date"', () => {
    const col = DateColumn.make('created_at');
    expect(col.toArray().type).toBe('date');
  });

  it('formats dates with default format', () => {
    const col = DateColumn.make('created_at');
    const result = col.mapValue('2024-03-15T10:30:00Z');
    expect(result).toBe('2024-03-15');
  });

  it('formats dates with custom format', () => {
    const col = DateColumn.make('created_at').format('DD/MM/YYYY');
    const result = col.mapValue('2024-03-15T10:30:00Z');
    expect(result).toBe('15/03/2024');
  });

  it('returns null for falsy values', () => {
    const col = DateColumn.make('created_at');
    expect(col.mapValue(null)).toBeNull();
    expect(col.mapValue('')).toBeNull();
    expect(col.mapValue(undefined)).toBeNull();
  });

  it('returns null for invalid date strings', () => {
    const col = DateColumn.make('created_at');
    expect(col.mapValue('not-a-date')).toBeNull();
  });

  it('uses configurable default format', () => {
    DateColumn.setDefaultFormat('DD-MM-YYYY');
    const col = DateColumn.make('created_at');
    const result = col.mapValue('2024-03-15T10:30:00Z');
    expect(result).toBe('15-03-2024');
  });

  it('getFormat() returns instance format when set', () => {
    const col = DateColumn.make('created_at').format('MM/DD/YYYY');
    expect(col.getFormat()).toBe('MM/DD/YYYY');
  });

  it('getFormat() returns default format when instance format not set', () => {
    const col = DateColumn.make('created_at');
    expect(col.getFormat()).toBe('YYYY-MM-DD');
  });
});

describe('DateTimeColumn', () => {
  beforeEach(() => {
    DateTimeColumn.setDefaultFormat('YYYY-MM-DD HH:mm:ss');
  });

  it('has type "datetime"', () => {
    const col = DateTimeColumn.make('created_at');
    expect(col.toArray().type).toBe('datetime');
  });

  it('formats datetimes with default format', () => {
    const col = DateTimeColumn.make('created_at');
    // Use a fixed UTC date and check the result contains proper formatting
    const result = col.mapValue('2024-03-15T10:30:45Z');
    // The exact output depends on timezone, but format should match pattern
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('formats datetimes with custom format', () => {
    const col = DateTimeColumn.make('created_at').format('DD/MM/YYYY HH:mm');
    const result = col.mapValue('2024-03-15T10:30:45Z');
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });

  it('returns null for falsy values', () => {
    const col = DateTimeColumn.make('created_at');
    expect(col.mapValue(null)).toBeNull();
    expect(col.mapValue('')).toBeNull();
  });

  it('getFormat() returns default datetime format', () => {
    const col = DateTimeColumn.make('created_at');
    expect(col.getFormat()).toBe('YYYY-MM-DD HH:mm:ss');
  });
});

describe('BooleanColumn', () => {
  // Reset defaults before each test
  beforeEach(() => {
    BooleanColumn.setDefaultTrueLabel('Yes');
    BooleanColumn.setDefaultFalseLabel('No');
    BooleanColumn.setDefaultTrueIcon(null);
    BooleanColumn.setDefaultFalseIcon(null);
  });

  it('has type "boolean"', () => {
    const col = BooleanColumn.make('active');
    expect(col.toArray().type).toBe('boolean');
  });

  it('maps truthy values to true label', () => {
    const col = BooleanColumn.make('active');
    expect(col.mapValue(true)).toBe('Yes');
    expect(col.mapValue(1)).toBe('Yes');
  });

  it('maps falsy values to false label', () => {
    const col = BooleanColumn.make('active');
    expect(col.mapValue(false)).toBe('No');
    expect(col.mapValue(0)).toBe('No');
  });

  it('supports custom labels', () => {
    const col = BooleanColumn.make('active')
      .trueLabel('Enabled')
      .falseLabel('Disabled');
    expect(col.mapValue(true)).toBe('Enabled');
    expect(col.mapValue(false)).toBe('Disabled');
  });

  it('supports static default labels', () => {
    BooleanColumn.setDefaultTrueLabel('On');
    BooleanColumn.setDefaultFalseLabel('Off');
    const col = BooleanColumn.make('active');
    expect(col.mapValue(true)).toBe('On');
    expect(col.mapValue(false)).toBe('Off');
  });

  it('mapForTable returns boolean when icons are set', () => {
    const col = BooleanColumn.make('active')
      .trueIcon('check-circle')
      .falseIcon('x-circle');
    expect(col.mapForTable(true)).toBe(true);
    expect(col.mapForTable(false)).toBe(false);
  });

  it('mapForTable returns label when icons are not set', () => {
    const col = BooleanColumn.make('active');
    expect(col.mapForTable(true)).toBe('Yes');
    expect(col.mapForTable(false)).toBe('No');
  });

  it('serializes icons in toArray()', () => {
    const col = BooleanColumn.make('active')
      .trueIcon('check')
      .falseIcon('x');

    const arr = col.toArray();
    expect(arr.trueIcon).toBe('check');
    expect(arr.falseIcon).toBe('x');
    expect(arr.trueLabel).toBe('Yes');
    expect(arr.falseLabel).toBe('No');
  });

  it('serializes default icons as null when not set', () => {
    const col = BooleanColumn.make('active');
    const arr = col.toArray();
    expect(arr.trueIcon).toBeNull();
    expect(arr.falseIcon).toBeNull();
  });
});

describe('BadgeColumn', () => {
  it('has type "badge"', () => {
    const col = BadgeColumn.make('status');
    expect(col.toArray().type).toBe('badge');
  });

  it('resolves variants from a map object', () => {
    const col = BadgeColumn.make('status').variant({
      active: 'success',
      inactive: 'destructive',
    });

    expect(col.resolveVariant('active')).toBe('success');
    expect(col.resolveVariant('inactive')).toBe('destructive');
    expect(col.resolveVariant('unknown')).toBeNull();
  });

  it('resolves variants from a function', () => {
    const col = BadgeColumn.make('status').variant(
      (value) => value === 'active' ? 'success' : 'default',
    );

    expect(col.resolveVariant('active')).toBe('success');
    expect(col.resolveVariant('inactive')).toBe('default');
  });

  it('resolves icons from a map object', () => {
    const col = BadgeColumn.make('status').icon({
      active: 'check-circle',
      inactive: 'x-circle',
    });

    expect(col.resolveIcon('active')).toBe('check-circle');
    expect(col.resolveIcon('inactive')).toBe('x-circle');
    expect(col.resolveIcon('unknown')).toBeNull();
  });

  it('resolves icons from a function', () => {
    const col = BadgeColumn.make('status').icon(
      (value) => value === 'active' ? 'check' : null,
    );

    expect(col.resolveIcon('active')).toBe('check');
    expect(col.resolveIcon('inactive')).toBeNull();
  });

  it('returns null when no variant resolver is set', () => {
    const col = BadgeColumn.make('status');
    expect(col.resolveVariant('active')).toBeNull();
  });

  it('returns null when no icon resolver is set', () => {
    const col = BadgeColumn.make('status');
    expect(col.resolveIcon('active')).toBeNull();
  });

  it('mapForTable returns object with value, variant, and icon', () => {
    const col = BadgeColumn.make('status')
      .variant({ active: 'success' })
      .icon({ active: 'check' });

    const result = col.mapForTable('active');
    expect(result).toEqual({
      value: 'active',
      variant: 'success',
      icon: 'check',
    });
  });

  it('mapForTable uses mapAs for the value', () => {
    const col = BadgeColumn.make('status')
      .mapAs({ active: 'Active', inactive: 'Inactive' })
      .variant({ active: 'success' });

    const result = col.mapForTable('active');
    expect(result).toEqual({
      value: 'Active',
      variant: 'success',
      icon: null,
    });
  });

  it('mapForExport returns plain value (not enriched object)', () => {
    const col = BadgeColumn.make('status')
      .variant({ active: 'success' })
      .icon({ active: 'check' });

    const result = col.mapForExport('active');
    expect(result).toBe('active');
  });

  it('mapForExport uses exportAs when set', () => {
    const col = BadgeColumn.make('status')
      .exportAs((val) => `Status: ${val}`);

    const result = col.mapForExport('active');
    expect(result).toBe('Status: active');
  });
});

describe('ImageColumn', () => {
  it('has type "image"', () => {
    const col = ImageColumn.make('avatar');
    expect(col.toArray().type).toBe('image');
  });

  it('toArray includes image properties with defaults', () => {
    const col = ImageColumn.make('avatar');
    const arr = col.toArray();

    expect(arr.imageSize).toBe(ImageSize.Medium);
    expect(arr.imagePosition).toBe(ImagePosition.Start);
    expect(arr.fallbackImage).toBeNull();
    expect(arr.rounded).toBe(false);
  });

  it('toArray includes customized image properties', () => {
    const col = ImageColumn.make('avatar')
      .size(ImageSize.Large)
      .position(ImagePosition.End)
      .fallback('https://example.com/default.png')
      .rounded();

    const arr = col.toArray();
    expect(arr.imageSize).toBe(ImageSize.Large);
    expect(arr.imagePosition).toBe(ImagePosition.End);
    expect(arr.fallbackImage).toBe('https://example.com/default.png');
    expect(arr.rounded).toBe(true);
  });

  it('chainable methods return this', () => {
    const col = ImageColumn.make('avatar');
    expect(col.size(ImageSize.Small)).toBe(col);
    expect(col.position(ImagePosition.End)).toBe(col);
    expect(col.fallback(null)).toBe(col);
    expect(col.rounded()).toBe(col);
  });
});

describe('ActionColumn', () => {
  // Reset default before each test
  beforeEach(() => {
    ActionColumn.defaultAsDropdown(false);
  });

  it('has type "action"', () => {
    const col = ActionColumn.make();
    expect(col.toArray().type).toBe('action');
  });

  it('always has _actions as attribute', () => {
    const col = ActionColumn.make();
    expect(col.getAttribute()).toBe('_actions');
  });

  it('is not toggleable by default', () => {
    const col = ActionColumn.make();
    expect(col.isToggleable()).toBe(false);
  });

  it('is not exportable', () => {
    const col = ActionColumn.make();
    expect(col.shouldBeExported()).toBe(false);
  });

  it('defaults alignment to Right', () => {
    const col = ActionColumn.make();
    expect(col.toArray().alignment).toBe(ColumnAlignment.Right);
  });

  it('serializes asDropdown property', () => {
    const col = ActionColumn.make().asDropdown();
    expect(col.toArray().asDropdown).toBe(true);
  });

  it('asDropdown defaults to false', () => {
    const col = ActionColumn.make();
    expect(col.toArray().asDropdown).toBe(false);
  });

  it('static defaultAsDropdown affects new instances', () => {
    ActionColumn.defaultAsDropdown(true);
    const col = ActionColumn.make();
    expect(col.toArray().asDropdown).toBe(true);
  });

  it('accepts a custom header', () => {
    const col = ActionColumn.make('Actions');
    expect(col.getHeader()).toBe('Actions');
  });

  it('has empty header when none provided', () => {
    const col = ActionColumn.make();
    expect(col.getHeader()).toBe('');
  });
});
