<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import type { ActionDef } from '@/types';

defineProps<{
  actions: ActionDef[];
  row: Record<string, any>;
  asDropdown?: boolean;
}>();

const emit = defineEmits<{
  action: [action: ActionDef, row: Record<string, any>];
}>();

function navigateTo(url: string): void {
  globalThis.window?.location.assign(url);
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
        <a v-if="action.type === 'link' && action.url" :href="action.url" :class="getVariantClass(action.variant)">
          <Button variant="ghost" size="sm" :disabled="action.disabled">{{ action.label }}</Button>
        </a>
        <Button v-else variant="ghost" size="sm" :disabled="action.disabled" :class="getVariantClass(action.variant)" @click="emit('action', action, row)">
          {{ action.label }}
        </Button>
      </template>
    </template>
  </div>

  <DropdownMenu v-else>
    <template #trigger>
      <Button variant="ghost" size="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
      </Button>
    </template>
    <template v-for="action in actions" :key="action.name">
      <DropdownMenuItem v-if="!action.hidden" :disabled="action.disabled" @click="action.type === 'link' && action.url ? navigateTo(action.url) : emit('action', action, row)">
        <span :class="getVariantClass(action.variant)">{{ action.label }}</span>
      </DropdownMenuItem>
    </template>
  </DropdownMenu>
</template>
