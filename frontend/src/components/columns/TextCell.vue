<script setup lang="ts">
import type { ColumnDef } from '@/types';
defineProps<{ value: any; column: ColumnDef }>();
</script>
<template>
  <span
    :class="[
      column.cellClass,
      { 'truncate': column.truncate },
      { 'whitespace-normal': column.wrap },
    ]"
    :style="column.truncate ? { maxWidth: `${column.truncate}ch` } : undefined"
  >{{ value ?? '' }}</span>
</template>
