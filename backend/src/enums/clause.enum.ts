export enum Clause {
  // Text
  Equals = 'equals',
  NotEquals = 'not_equals',
  StartsWith = 'starts_with',
  EndsWith = 'ends_with',
  NotStartsWith = 'not_starts_with',
  NotEndsWith = 'not_ends_with',
  Contains = 'contains',
  NotContains = 'not_contains',
  // Boolean
  IsTrue = 'is_true',
  IsFalse = 'is_false',
  IsSet = 'is_set',
  IsNotSet = 'is_not_set',
  // Date
  Before = 'before',
  EqualOrBefore = 'equal_or_before',
  After = 'after',
  EqualOrAfter = 'equal_or_after',
  Between = 'between',
  NotBetween = 'not_between',
  // Numeric
  GreaterThan = 'greater_than',
  GreaterThanOrEqual = 'greater_than_or_equal',
  LessThan = 'less_than',
  LessThanOrEqual = 'less_than_or_equal',
  // Set
  In = 'in',
  NotIn = 'not_in',
  // Trashed
  WithTrashed = 'with_trashed',
  OnlyTrashed = 'only_trashed',
  WithoutTrashed = 'without_trashed',
}

export function isNegatedClause(clause: Clause): boolean {
  return [
    Clause.NotEquals, Clause.NotStartsWith, Clause.NotEndsWith,
    Clause.NotContains, Clause.NotBetween, Clause.NotIn,
  ].includes(clause);
}

export function isWithoutComparisonClause(clause: Clause): boolean {
  return [
    Clause.IsTrue, Clause.IsFalse, Clause.IsSet, Clause.IsNotSet,
    Clause.WithTrashed, Clause.OnlyTrashed, Clause.WithoutTrashed,
  ].includes(clause);
}
