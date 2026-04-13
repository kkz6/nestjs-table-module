---
name: adding-table-exports
description: Use when adding data export functionality (Excel, CSV, PDF) to a table — covers Export builder, async pipeline, and SSE progress
---

# Adding Table Exports

## Overview

Exports let users download table data as Excel, CSV, or PDF files. Exports run asynchronously with real-time progress via Server-Sent Events (SSE).

## Defining Exports

```typescript
exports() {
  return [
    Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx),
    Export.make('CSV', 'users.csv', ExportFormat.Csv),
    Export.make('PDF', 'users.pdf', ExportFormat.Pdf),
  ];
}
```

## Export Builder API

```typescript
Export.make(name, fileName, format)   // Factory
  .label('Download Excel')            // Custom label (defaults to name)
  .authorize((user) => user.isAdmin)  // Gate access
  .filteredOnly()                     // Respect current filters (default: true)
  .selectedOnly()                     // Only export selected rows
```

**ExportFormat:** `Xlsx`, `Csv`, `Pdf`

## How It Works (Async Pipeline)

1. User clicks export → Frontend `POST /table/export/:tableClass/:exportName`
2. Backend creates `ExportJob` entity (status: pending), returns `{ jobId }`
3. Backend starts async processing (not awaited)
4. Frontend opens SSE: `GET /table/export/stream/:jobId`
5. Backend emits progress: `{ status: 'processing', progress: 50 }`
6. Backend generates file (ExcelJS for xlsx/csv, PDFKit for pdf)
7. Backend emits: `{ status: 'completed', downloadUrl: '/table/export/download/:jobId' }`
8. Frontend auto-triggers download

## Column Export Behavior

- `ActionColumn` is never exported
- Use `.dontExport()` on any column to exclude it
- Use `.exportAs((value, item) => formatted)` for custom export formatting

```typescript
TextColumn.make('name').exportAs((value) => value.toUpperCase()),
NumericColumn.make('price').exportAs((value) => `$${value.toFixed(2)}`),
ImageColumn.make('avatar').dontExport(),
```

## Frontend

The `<DataTable>` component includes the export button automatically when `exports()` returns items. The `<ExportProgressOverlay>` shows during processing.

For custom usage:
```typescript
import { useExport } from '@kkmodules/vue-table';

const { triggerExport, isExporting, exportProgress, exportError } = useExport();
await triggerExport('UsersTable', 'Excel');
```
