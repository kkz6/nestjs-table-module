<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { PaginationData } from '@/types';

const props = defineProps<{
  pagination: PaginationData;
  perPageOptions: number[];
}>();

const emit = defineEmits<{
  page: [page: number];
  perPage: [value: number];
}>();

const pages = computed(() => {
  const { currentPage, lastPage } = props.pagination;
  if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);

  const pages: (number | string)[] = [1];
  if (currentPage > 3) pages.push('...');

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(lastPage - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (currentPage < lastPage - 2) pages.push('...');
  pages.push(lastPage);

  return pages;
});

const perPageSelectOptions = computed(() =>
  props.perPageOptions.map(v => ({ value: String(v), label: `${v} per page` }))
);
</script>
<template>
  <div class="flex items-center justify-between border-t px-4 py-3">
    <div class="text-sm text-muted-foreground">
      <template v-if="pagination.total > 0">
        Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }}
      </template>
    </div>

    <div class="flex items-center gap-2">
      <Select
        :model-value="String(pagination.perPage)"
        :options="perPageSelectOptions"
        @update:model-value="emit('perPage', Number($event))"
      />

      <div v-if="pagination.type === 'full'" class="flex items-center gap-1">
        <Button variant="outline" size="sm" :disabled="pagination.currentPage <= 1" @click="emit('page', pagination.currentPage - 1)">
          Prev
        </Button>
        <template v-for="p in pages" :key="p">
          <span v-if="p === '...'" class="px-2 text-muted-foreground">...</span>
          <Button v-else :variant="p === pagination.currentPage ? 'default' : 'outline'" size="sm" @click="emit('page', p as number)">
            {{ p }}
          </Button>
        </template>
        <Button variant="outline" size="sm" :disabled="pagination.currentPage >= pagination.lastPage" @click="emit('page', pagination.currentPage + 1)">
          Next
        </Button>
      </div>

      <div v-else class="flex items-center gap-1">
        <Button variant="outline" size="sm" :disabled="pagination.currentPage <= 1" @click="emit('page', pagination.currentPage - 1)">
          Previous
        </Button>
        <Button variant="outline" size="sm" :disabled="!pagination.nextCursor && pagination.currentPage >= pagination.lastPage" @click="emit('page', pagination.currentPage + 1)">
          Next
        </Button>
      </div>
    </div>
  </div>
</template>
