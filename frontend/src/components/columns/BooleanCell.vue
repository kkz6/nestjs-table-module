<script setup lang="ts">
import type { ColumnDef } from '@/types';

const props = defineProps<{ value: any; column: ColumnDef }>();
</script>
<template>
  <span :class="column.cellClass">
    <template v-if="column.trueIcon || column.falseIcon">
      <span v-if="value" class="text-green-600">&#10003;</span>
      <span v-else class="text-red-600">&#10007;</span>
    </template>
    <template v-else>{{ value }}</template>
  </span>
</template>
