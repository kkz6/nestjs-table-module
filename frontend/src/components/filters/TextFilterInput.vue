<script setup lang="ts">
import { Input } from '@/components/ui/input';
defineProps<{ value: string }>();
const emit = defineEmits<{ update: [value: string] }>();
</script>
<template>
  <Input :model-value="value" placeholder="Enter value..." @update:model-value="emit('update', $event)" />
</template>
