<script setup lang="ts">
import type { ColumnDef } from '@/types';

const props = defineProps<{ value: any; column: ColumnDef }>();

const sizeClasses: Record<string, string> = {
  small: 'h-8 w-8',
  medium: 'h-10 w-10',
  large: 'h-14 w-14',
  'extra-large': 'h-20 w-20',
};
</script>
<template>
  <img
    v-if="value"
    :src="value"
    :class="[
      sizeClasses[column.imageSize ?? 'medium'],
      column.rounded ? 'rounded-full' : 'rounded',
      'object-cover',
    ]"
    alt=""
  />
  <img
    v-else-if="column.fallbackImage"
    :src="column.fallbackImage"
    :class="[sizeClasses[column.imageSize ?? 'medium'], 'rounded opacity-50']"
    alt=""
  />
</template>
