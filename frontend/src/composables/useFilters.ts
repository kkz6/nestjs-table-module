import { reactive, computed } from 'vue';
import type { FilterDef } from '../types';

export function useFilters() {
  const activeFilters = reactive<Record<string, { clause: string; value: string }>>({});

  function addFilter(key: string, clause: string, value: string) {
    activeFilters[key] = { clause, value };
  }

  function removeFilter(key: string) {
    delete activeFilters[key];
  }

  function updateClause(key: string, clause: string) {
    if (activeFilters[key]) {
      activeFilters[key].clause = clause;
    }
  }

  function updateValue(key: string, value: string) {
    if (activeFilters[key]) {
      activeFilters[key].value = value;
    }
  }

  function isActive(key: string): boolean {
    return key in activeFilters;
  }

  function getActiveKeys(): string[] {
    return Object.keys(activeFilters);
  }

  return { activeFilters, addFilter, removeFilter, updateClause, updateValue, isActive, getActiveKeys };
}
