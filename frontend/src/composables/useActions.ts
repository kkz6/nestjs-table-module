import { ref, computed } from 'vue';
import type { ActionDef, ActionConfirm } from '../types';

export function useActions() {
  const selectedIds = ref<Set<string>>(new Set());
  const confirmAction = ref<ActionDef | null>(null);
  const pendingAction = ref<{ action: ActionDef; payload: any } | null>(null);

  const allSelected = computed(() => false); // Will be set based on data length
  const hasSelection = computed(() => selectedIds.value.size > 0);
  const selectedCount = computed(() => selectedIds.value.size);

  function toggleSelect(id: string) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id);
    } else {
      selectedIds.value.add(id);
    }
    selectedIds.value = new Set(selectedIds.value); // trigger reactivity
  }

  function toggleSelectAll(ids: string[]) {
    if (selectedIds.value.size === ids.length) {
      selectedIds.value = new Set();
    } else {
      selectedIds.value = new Set(ids);
    }
  }

  function clearSelection() {
    selectedIds.value = new Set();
  }

  async function executeAction(
    tableClass: string,
    action: ActionDef,
    payload?: { id?: string; ids?: string[] },
  ) {
    if (action.confirm) {
      confirmAction.value = action;
      pendingAction.value = { action, payload };
      return;
    }

    return performAction(tableClass, action, payload);
  }

  async function executeConfirmedAction(tableClass: string) {
    if (!pendingAction.value) return;
    const { action, payload } = pendingAction.value;
    confirmAction.value = null;
    pendingAction.value = null;
    return performAction(tableClass, action, payload);
  }

  function cancelAction() {
    confirmAction.value = null;
    pendingAction.value = null;
  }

  async function performAction(
    tableClass: string,
    action: ActionDef,
    payload?: { id?: string; ids?: string[] },
  ) {
    if (action.type === 'link' && action.url) {
      window.location.href = action.url;
      return;
    }

    const response = await fetch(`/table/action/${tableClass}/${action.name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload ?? {}),
    });

    if (!response.ok) {
      throw new Error(`Action failed: ${response.statusText}`);
    }

    return response.json();
  }

  return {
    selectedIds, allSelected, hasSelection, selectedCount,
    confirmAction, pendingAction,
    toggleSelect, toggleSelectAll, clearSelection,
    executeAction, executeConfirmedAction, cancelAction,
  };
}
