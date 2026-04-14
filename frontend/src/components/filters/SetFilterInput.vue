<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox';
import type { FilterOption } from '@/types/table';

const props = defineProps<{
  value: string;
  options: FilterOption[];
}>();

const emit = defineEmits<{ update: [value: string] }>();

function getSelected(): string[] {
  return props.value ? props.value.split(',') : [];
}

function toggle(optValue: string) {
  const selected = getSelected();
  const idx = selected.indexOf(optValue);
  if (idx >= 0) {
    selected.splice(idx, 1);
  } else {
    selected.push(optValue);
  }
  emit('update', selected.join(','));
}
</script>
<template>
  <div class="max-h-48 space-y-1 overflow-y-auto">
    <label
      v-for="opt in options"
      :key="opt.value"
      class="flex items-center gap-2 text-sm cursor-pointer"
    >
      <Checkbox :model-value="getSelected().includes(opt.value)" @update:model-value="toggle(opt.value)" />
      {{ opt.label }}
    </label>
  </div>
</template>
