<script setup lang="ts">
defineProps<{
  progress: number;
}>();
</script>
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="rounded-lg bg-background p-6 shadow-lg">
      <p class="mb-2 text-sm font-medium">Exporting...</p>
      <div class="h-2 w-64 overflow-hidden rounded-full bg-muted">
        <div class="h-full bg-primary transition-all" :style="{ width: `${progress}%` }" />
      </div>
      <p class="mt-1 text-right text-xs text-muted-foreground">{{ progress }}%</p>
    </div>
  </div>
</template>
