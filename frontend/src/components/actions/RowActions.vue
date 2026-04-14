<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import type { ActionDef } from '@/types/table';

defineProps<{
  actions: ActionDef[];
  row: Record<string, any>;
  asDropdown?: boolean;
}>();

const emit = defineEmits<{
  action: [action: ActionDef, row: Record<string, any>];
}>();



function handleAction(action: ActionDef, row: Record<string, any>): void {
  if (action.type === 'link' && action.url) {
    globalThis.window?.location.assign(action.url);
  } else {
    emit('action', action, row);
  }
}

function getVariantClass(variant: string): string {
  const map: Record<string, string> = {
    destructive: 'text-destructive',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  };
  return map[variant] ?? '';
}
</script>
<template>
  <div v-if="!asDropdown" class="flex items-center gap-1">
    <template v-for="action in actions" :key="action.name">
      <template v-if="!action.hidden">
        <Button variant="ghost" size="sm" :disabled="action.disabled" :class="getVariantClass(action.variant)" @click="handleAction(action, row)">
          {{ action.label }}
        </Button>
      </template>
    </template>
  </div>

  <DropdownMenu v-else>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <template v-for="action in actions" :key="action.name">
        <DropdownMenuItem v-if="!action.hidden" :disabled="action.disabled" @click="handleAction(action, row)">
          <span :class="getVariantClass(action.variant)">{{ action.label }}</span>
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
