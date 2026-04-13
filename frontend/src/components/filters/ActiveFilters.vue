<script setup lang="ts">
import type { FilterDef } from '@/types';
import FilterChip from './FilterChip.vue';

defineProps<{
  filters: FilterDef[];
  activeFilters: Record<string, Record<string, string>>;
}>();

const emit = defineEmits<{
  update: [key: string, clause: string, value: string];
  remove: [key: string];
}>();

function getFilterDef(key: string, filters: FilterDef[]): FilterDef | undefined {
  return filters.find(f => f.key === key);
}

function getFirstEntry(clauseMap: Record<string, string>): { clause: string; value: string } {
  const [clause, value] = Object.entries(clauseMap)[0] ?? ['', ''];
  return { clause, value };
}
</script>
<template>
  <div class="flex flex-wrap gap-2">
    <template v-for="(clauseMap, key) in activeFilters" :key="key">
      <FilterChip
        v-if="getFilterDef(key as string, filters)"
        :filter="getFilterDef(key as string, filters)!"
        :clause="getFirstEntry(clauseMap).clause"
        :value="getFirstEntry(clauseMap).value"
        @update="(clause, value) => emit('update', key as string, clause, value)"
        @remove="emit('remove', key as string)"
      />
    </template>
  </div>
</template>
