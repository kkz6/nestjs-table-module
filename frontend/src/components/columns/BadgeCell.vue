<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@/types';

defineProps<{ value: any; column: ColumnDef }>();
</script>
<template>
  <Badge
    v-if="value && typeof value === 'object'"
    :variant="value.variant || 'default'"
  >
    {{ value.value }}
  </Badge>
  <span v-else>{{ value ?? '' }}</span>
</template>
