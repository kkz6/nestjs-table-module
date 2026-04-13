<script setup lang="ts">
import type { ColumnDef } from '@/types';
defineProps<{ value: any; column: ColumnDef }>();
</script>
<template>
  <span :class="column.cellClass">{{ value ?? '' }}</span>
</template>
