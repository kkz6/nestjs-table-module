<script setup lang="ts">
import { DropdownMenuItem } from 'radix-vue';

defineProps<{
  disabled?: boolean;
}>();
</script>

<template>
  <DropdownMenuItem
    :disabled="disabled"
    class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
  >
    <slot />
  </DropdownMenuItem>
</template>
