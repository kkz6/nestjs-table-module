<script setup lang="ts">
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef } from '@/types';

defineProps<{
  columns: ColumnDef[];
  visibleColumns: string[];
}>();

const emit = defineEmits<{
  toggle: [key: string];
}>();

function isVisible(col: ColumnDef, visibleColumns: string[]): boolean {
  if (visibleColumns.length === 0) return col.visible;
  return visibleColumns.includes(col.key);
}
</script>
<template>
  <DropdownMenu>
    <template #trigger>
      <Button variant="outline" size="sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M12 3v18" /><rect width="6" height="6" x="15" y="3" rx="1" /><rect width="6" height="6" x="3" y="15" rx="1" /><rect width="6" height="6" x="15" y="15" rx="1" /><rect width="6" height="6" x="3" y="3" rx="1" /></svg>
        Columns
      </Button>
    </template>
    <DropdownMenuItem v-for="col in columns.filter(c => c.toggleable)" :key="col.key" @click.prevent="emit('toggle', col.key)">
      <Checkbox :checked="isVisible(col, visibleColumns)" class="mr-2" />
      {{ col.header }}
    </DropdownMenuItem>
  </DropdownMenu>
</template>
