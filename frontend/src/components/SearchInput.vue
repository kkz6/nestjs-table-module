<script setup lang="ts">
import { Input } from '@/components/ui/input';

defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>
<template>
  <div class="relative">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
    <Input
      :model-value="modelValue"
      :placeholder="placeholder ?? 'Search...'"
      class="pl-9"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>
