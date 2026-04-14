<script setup lang="ts">
import { ref } from 'vue';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FilterDef } from '@/types';
import TextFilterInput from './TextFilterInput.vue';
import NumericFilterInput from './NumericFilterInput.vue';
import DateFilterInput from './DateFilterInput.vue';
import BooleanFilterInput from './BooleanFilterInput.vue';
import SetFilterInput from './SetFilterInput.vue';

const props = defineProps<{
  filter: FilterDef;
  clause: string;
  value: string;
}>();

const emit = defineEmits<{
  update: [clause: string, value: string];
  remove: [];
}>();

function formatClause(c: string): string {
  return c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
</script>
<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="secondary" size="sm" class="gap-1">
        {{ filter.label }}: {{ value || formatClause(clause) }}
        <button class="ml-1 hover:text-destructive" @click.stop="emit('remove')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" :side-offset="8" :collision-padding="16" class="w-64 p-3">
      <div class="space-y-3">
        <Select :model-value="clause" @update:model-value="emit('update', $event, value)">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="c in filter.clauses" :key="c" :value="c">{{ formatClause(c) }}</SelectItem>
          </SelectContent>
        </Select>
        <TextFilterInput v-if="filter.type === 'text'" :value="value" @update="emit('update', clause, $event)" />
        <NumericFilterInput v-else-if="filter.type === 'numeric'" :value="value" @update="emit('update', clause, $event)" />
        <DateFilterInput v-else-if="filter.type === 'date'" :value="value" @update="emit('update', clause, $event)" />
        <BooleanFilterInput v-else-if="filter.type === 'boolean'" :clause="clause" @update="emit('update', $event, '')" />
        <SetFilterInput v-else-if="filter.type === 'set'" :value="value" :options="filter.options ?? []" @update="emit('update', clause, $event)" />
      </div>
    </PopoverContent>
  </Popover>
</template>
