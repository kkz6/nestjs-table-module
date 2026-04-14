<script setup lang="ts">
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { ActionDef, ExportDef } from '@/types/table';

defineProps<{
  actions: ActionDef[];
  exports: ExportDef[];
  selectedCount: number;
}>();

const emit = defineEmits<{
  action: [action: ActionDef];
  export: [exportDef: ExportDef];
}>();
</script>
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        Actions ({{ selectedCount }})
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel v-if="actions.length">Actions</DropdownMenuLabel>
      <DropdownMenuItem v-for="action in actions" :key="action.name" @click="emit('action', action)">
        {{ action.label }}
      </DropdownMenuItem>
      <DropdownMenuSeparator v-if="actions.length && exports.length" />
      <DropdownMenuLabel v-if="exports.length">Export</DropdownMenuLabel>
      <DropdownMenuItem v-for="exp in exports" :key="exp.name" @click="emit('export', exp)">
        {{ exp.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
