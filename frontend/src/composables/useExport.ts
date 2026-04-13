import { ref } from 'vue';

export function useExport() {
  const isExporting = ref(false);
  const exportProgress = ref(0);
  const exportError = ref<string | null>(null);

  async function triggerExport(
    tableClass: string,
    exportName: string,
    queryParams?: Record<string, any>,
    selectedIds?: string[],
  ) {
    isExporting.value = true;
    exportProgress.value = 0;
    exportError.value = null;

    try {
      const response = await fetch(`/table/export/${tableClass}/${exportName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIds, ...queryParams }),
      });

      if (!response.ok) throw new Error(`Export trigger failed: ${response.statusText}`);
      const { jobId } = await response.json();

      const eventSource = new EventSource(`/table/export/stream/${jobId}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        exportProgress.value = data.progress;

        if (data.status === 'completed') {
          eventSource.close();
          isExporting.value = false;
          window.location.href = data.downloadUrl;
        }

        if (data.status === 'failed') {
          eventSource.close();
          isExporting.value = false;
          exportError.value = data.error;
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        isExporting.value = false;
        exportError.value = 'Connection lost';
      };
    } catch (error: any) {
      isExporting.value = false;
      exportError.value = error.message;
    }
  }

  function resetExport() {
    isExporting.value = false;
    exportProgress.value = 0;
    exportError.value = null;
  }

  return { isExporting, exportProgress, exportError, triggerExport, resetExport };
}
