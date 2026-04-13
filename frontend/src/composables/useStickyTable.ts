import { ref, onMounted, onUnmounted } from 'vue';

export function useStickyTable() {
  const tableRef = ref<HTMLElement | null>(null);
  const headerStuck = ref(false);
  const scrolledLeft = ref(false);
  const scrolledRight = ref(false);

  let observer: IntersectionObserver | null = null;

  function handleScroll() {
    if (!tableRef.value) return;
    const container = tableRef.value.querySelector('.overflow-auto');
    if (!container) return;

    scrolledLeft.value = container.scrollLeft > 0;
    scrolledRight.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 1;
  }

  onMounted(() => {
    if (!tableRef.value) return;

    // Sticky header detection
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.marginBottom = '-1px';
    tableRef.value.prepend(sentinel);

    observer = new IntersectionObserver(
      ([entry]) => {
        headerStuck.value = !entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);

    // Horizontal scroll detection
    const container = tableRef.value.querySelector('.overflow-auto');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
    const container = tableRef.value?.querySelector('.overflow-auto');
    if (container) {
      container.removeEventListener('scroll', handleScroll);
    }
  });

  return { tableRef, headerStuck, scrolledLeft, scrolledRight };
}
