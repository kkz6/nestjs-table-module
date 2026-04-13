<script setup lang="ts">
import type { ColumnDef } from '@/types';
import TextCell from './TextCell.vue';
import NumericCell from './NumericCell.vue';
import DateCell from './DateCell.vue';
import DateTimeCell from './DateTimeCell.vue';
import BooleanCell from './BooleanCell.vue';
import BadgeCell from './BadgeCell.vue';
import ImageCell from './ImageCell.vue';

defineProps<{
  value: any;
  column: ColumnDef;
}>();
</script>
<template>
  <TextCell v-if="column.type === 'text'" :value="value" :column="column" />
  <NumericCell v-else-if="column.type === 'numeric'" :value="value" :column="column" />
  <DateCell v-else-if="column.type === 'date'" :value="value" :column="column" />
  <DateTimeCell v-else-if="column.type === 'datetime'" :value="value" :column="column" />
  <BooleanCell v-else-if="column.type === 'boolean'" :value="value" :column="column" />
  <BadgeCell v-else-if="column.type === 'badge'" :value="value" :column="column" />
  <ImageCell v-else-if="column.type === 'image'" :value="value" :column="column" />
  <span v-else>{{ value }}</span>
</template>
