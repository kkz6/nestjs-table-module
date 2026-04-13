<script setup lang="ts">
import { Button } from '@/components/ui/button';
import type { EmptyStateDef } from '@/types';

defineProps<{
  config?: EmptyStateDef | null;
}>();
</script>
<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div v-if="config?.icon" class="mb-4 text-muted-foreground">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
    </div>
    <h3 class="text-lg font-semibold">{{ config?.title ?? 'No results found' }}</h3>
    <p v-if="config?.message" class="mt-1 text-sm text-muted-foreground">{{ config.message }}</p>
    <a v-if="config?.action" :href="config.action.url" class="mt-4">
      <Button>{{ config.action.label }}</Button>
    </a>
  </div>
</template>
