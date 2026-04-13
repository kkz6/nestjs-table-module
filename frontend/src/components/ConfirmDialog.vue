<script setup lang="ts">
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ActionDef } from '@/types';

defineProps<{
  action: ActionDef;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>
<template>
  <Dialog
    :open="true"
    :title="action.confirm?.title ?? 'Confirm'"
    :description="action.confirm?.message"
    @update:open="(v) => !v && emit('cancel')"
  >
    <div class="flex justify-end gap-2 pt-4">
      <Button variant="outline" @click="emit('cancel')">
        {{ action.confirm?.cancelLabel ?? 'Cancel' }}
      </Button>
      <Button :variant="action.variant === 'destructive' ? 'destructive' : 'default'" @click="emit('confirm')">
        {{ action.confirm?.confirmLabel ?? 'Confirm' }}
      </Button>
    </div>
  </Dialog>
</template>
