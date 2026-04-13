<script setup lang="ts">
import { CheckboxRoot, CheckboxIndicator } from 'radix-vue';
import { computed } from 'vue';
import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<{
  checked?: boolean;
  disabled?: boolean;
}>(), {
  checked: false,
  disabled: false,
});

const emit = defineEmits<{
  'update:checked': [value: boolean];
}>();

function handleChange(value: boolean | 'indeterminate') {
  emit('update:checked', value === true);
}
</script>

<template>
  <CheckboxRoot
    :checked="checked"
    :disabled="disabled"
    :class="cn('peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground')"
    @update:checked="handleChange"
  >
    <CheckboxIndicator class="flex items-center justify-center text-current">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
