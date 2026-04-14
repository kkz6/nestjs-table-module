<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M12 3v18" /><rect width="6" height="6" x="15" y="3" rx="1" /><rect width="6" height="6" x="3" y="15" rx="1" /><rect width="6" height="6" x="15" y="15" rx="1" /><rect width="6" height="6" x="3" y="3" rx="1" /></svg>
        Columns
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuCheckboxItem
        v-for="col in columns.filter(c => c.toggleable)"
        :key="col.key"
        :checked="isVisible(col, visibleColumns)"
        @update:checked="emit('toggle', col.key)"
      >
        {{ col.header }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
