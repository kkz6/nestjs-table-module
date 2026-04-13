<script setup lang="ts">
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { FilterDef } from '@/types';

defineProps<{
  filters: FilterDef[];
  activeFilterKeys: string[];
}>();

const emit = defineEmits<{
  add: [key: string];
}>();
</script>
<template>
  <DropdownMenu>
    <template #trigger>
      <Button variant="outline" size="sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
        Filter
      </Button>
    </template>
    <DropdownMenuItem
      v-for="filter in filters.filter(f => !f.hidden)"
      :key="filter.key"
      :disabled="activeFilterKeys.includes(filter.key)"
      @click="emit('add', filter.key)"
    >
      {{ filter.label }}
    </DropdownMenuItem>
  </DropdownMenu>
</template>
