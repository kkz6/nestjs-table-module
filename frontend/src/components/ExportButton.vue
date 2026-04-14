<script setup lang="ts">
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { ExportDef } from '@/types/table';

defineProps<{
  exports: ExportDef[];
}>();

const emit = defineEmits<{
  export: [exportDef: ExportDef];
}>();
</script>
<template>
  <DropdownMenu v-if="exports.length">
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        Export
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem v-for="exp in exports" :key="exp.name" @click="emit('export', exp)">
        {{ exp.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
