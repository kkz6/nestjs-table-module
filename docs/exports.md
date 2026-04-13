# Exports

The export system allows users to download table data as Excel (XLSX), CSV, or PDF files. Exports run asynchronously on the backend with real-time progress updates delivered to the frontend via Server-Sent Events (SSE).

Exports are defined in your table class by overriding the `exports()` method.

```ts
import { Export, ExportFormat } from '@nestjs-table-module/backend';

class UsersTable extends BaseTable<User> {
  exports() {
    return [
      Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx),
      Export.make('CSV', 'users.csv', ExportFormat.Csv),
      Export.make('PDF', 'users.pdf', ExportFormat.Pdf),
    ];
  }
}
```

---

## Table of Contents

- [Export Builder](#export-builder)
- [ExportFormat Enum](#exportformat-enum)
- [Export Pipeline](#export-pipeline)
- [ExportJob Entity](#exportjob-entity)
- [Backend Services](#backend-services)
- [ExportFormat Details](#exportformat-details)
- [Frontend Integration](#frontend-integration)
- [Complete Example](#complete-example)

---

## Export Builder

### Factory

```ts
static make(name: string, fileName: string, format: ExportFormat): Export
```

Creates a new export definition.

- `name` -- a unique identifier for this export, used in API routes and serialization. Also used as the default label.
- `fileName` -- the filename for the downloaded file (e.g., `'users.xlsx'`).
- `format` -- the output format: `ExportFormat.Xlsx`, `ExportFormat.Csv`, or `ExportFormat.Pdf`.

```ts
Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx)
Export.make('CSV', 'users.csv', ExportFormat.Csv)
Export.make('PDF Report', 'users-report.pdf', ExportFormat.Pdf)
```

### Builder Methods

All builder methods return `this` for chaining.

#### `label(l: string): this`

Sets a custom display label for the export button. By default, the `name` is used as the label.

```ts
Export.make('xlsx', 'users.xlsx', ExportFormat.Xlsx)
  .label('Export as Excel')
```

#### `authorize(callback: (user: any) => boolean): this`

Sets an authorization gate for the export. If the callback returns `false`, the export is not available to the user.

```ts
Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx)
  .authorize((user) => user.role === 'admin')
```

#### `filteredOnly(value?: boolean): this`

When enabled (default: `true`), the export respects the current table filters. The active query state (search, filters, sort) is captured and replayed during export generation. When disabled, all records are exported regardless of active filters.

```ts
// Export only filtered data (default behavior)
Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx)
  .filteredOnly()

// Export all data regardless of filters
Export.make('Full Export', 'all-users.xlsx', ExportFormat.Xlsx)
  .filteredOnly(false)
```

#### `selectedOnly(value?: boolean): this`

When enabled, the export only includes the rows currently selected by the user. Defaults to `false`. When called without arguments, defaults to `true`.

```ts
Export.make('Selected', 'selected-users.xlsx', ExportFormat.Xlsx)
  .selectedOnly()
```

### Getter Methods

| Method | Return Type | Description |
|---|---|---|
| `getName()` | `string` | The export's unique name |
| `getLabel()` | `string` | The display label |
| `getFileName()` | `string` | The output filename |
| `getFormat()` | `ExportFormat` | The export format |
| `isAuthorized(user)` | `boolean` | Whether the user is authorized (returns `true` if no gate set) |
| `isFilteredOnly()` | `boolean` | Whether to respect active filters |
| `isSelectedOnly()` | `boolean` | Whether to only export selected rows |

### Serialization

#### `toArray(): ExportSerialized`

Serializes the export definition for the frontend.

```ts
interface ExportSerialized {
  name: string;       // Unique identifier
  label: string;      // Display text
  fileName: string;   // Output filename
  format: ExportFormat; // 'xlsx', 'csv', or 'pdf'
}
```

**Not included in serialization:** `authorize` callback, `filteredOnly` flag, `selectedOnly` flag. These are evaluated server-side during export processing.

---

## ExportFormat Enum

| Value | String | Library | Description |
|---|---|---|---|
| `ExportFormat.Xlsx` | `'xlsx'` | ExcelJS | Microsoft Excel workbook |
| `ExportFormat.Csv` | `'csv'` | ExcelJS | Comma-separated values |
| `ExportFormat.Pdf` | `'pdf'` | PDFKit | PDF document with table layout |

---

## Export Pipeline

The export system uses an asynchronous pipeline with SSE for real-time progress updates. Here is the complete flow:

### Step 1: Frontend Triggers Export

The frontend sends a `POST` request to initiate the export.

```
POST /table/export/:tableClass/:exportName
```

The request includes the current query state (filters, search, sort) as query parameters, and optionally selected IDs in the body.

### Step 2: Backend Creates ExportJob

The `TableExportController` receives the request, resolves the table from the registry, and creates an `ExportJobEntity` with status `'pending'`.

```ts
const job = await this.exportService.createJob(table, exportName, query, body, userId);
```

### Step 3: Backend Starts Async Processing

The controller kicks off asynchronous export processing **without awaiting it**, and immediately returns the `jobId` to the frontend.

```ts
// Non-blocking -- processing happens in the background
this.exportService.processExport(job.id).catch(() => {});
return { jobId: job.id };
```

### Step 4: Frontend Connects to SSE Stream

The frontend uses the `jobId` to open an SSE connection for real-time progress updates.

```
GET /table/export/stream/:jobId (SSE endpoint)
```

The backend uses NestJS `@Sse()` decorator with an RxJS Observable piped from `TableSseService`.

### Step 5: Backend Emits Progress Events

During processing, the service emits progress events through the SSE channel.

```ts
// Processing started
{ status: 'processing', progress: 0 }

// Data fetched, generating file
{ status: 'processing', progress: 50 }
```

### Step 6: Backend Generates File

The service generates the export file based on the format:

- **XLSX/CSV:** Uses ExcelJS to create a workbook, add columns and rows, then write to file.
- **PDF:** Uses PDFKit to create a document with a table layout.

Files are written to the `exports/` directory in the project root: `exports/{jobId}-{fileName}`.

### Step 7: Backend Emits Completion

When the file is ready, the service updates the job status and emits a completion event with a download URL.

```ts
{
  status: 'completed',
  progress: 100,
  downloadUrl: '/table/export/download/:jobId'
}
```

If an error occurs, a failure event is emitted instead:

```ts
{
  status: 'failed',
  progress: 0,
  error: 'Error message'
}
```

### Step 8: Frontend Downloads File

On receiving the `'completed'` event, the frontend closes the SSE connection and triggers a file download by navigating to the `downloadUrl`. The backend serves the file using Express `res.download()`.

```
GET /table/export/download/:jobId
```

### Pipeline Diagram

```
Frontend                              Backend
   |                                     |
   |  POST /export/:table/:name         |
   |------------------------------------>|
   |                                     |  Create ExportJobEntity (pending)
   |  { jobId: "abc-123" }              |  Start processExport() (async)
   |<------------------------------------|
   |                                     |
   |  GET /export/stream/abc-123 (SSE)  |
   |------------------------------------>|
   |                                     |  Update job -> processing
   |  { status: processing, progress: 0 }|
   |<------------------------------------|
   |                                     |  Fetch data from database
   |  { status: processing, progress: 50}|
   |<------------------------------------|
   |                                     |  Generate XLSX/CSV/PDF file
   |  { status: completed, progress: 100,|
   |    downloadUrl: "/export/dl/abc" }  |
   |<------------------------------------|
   |                                     |
   |  GET /export/download/abc-123      |
   |------------------------------------>|
   |  << file download >>               |
   |<------------------------------------|
```

---

## ExportJob Entity

The `ExportJobEntity` is a TypeORM entity that tracks the state of each export operation. It is stored in the `export_jobs` table.

```ts
@Entity('export_jobs')
export class ExportJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;                          // Unique job identifier (UUID)

  @Column()
  tableClass: string;                  // Registry name of the table

  @Column()
  exportName: string;                  // Name of the export definition

  @Column()
  fileName: string;                    // Output filename (e.g., 'users.xlsx')

  @Column({ type: 'varchar' })
  format: ExportFormat;                // 'xlsx', 'csv', or 'pdf'

  @Column({ type: 'jsonb' })
  queryState: Record<string, any>;     // Captured query parameters (filters, search, sort)

  @Column({ nullable: true, type: 'text' })
  selectedIds: string;                 // Comma-separated IDs (if selectedOnly)

  @Column({ default: 'pending' })
  status: string;                      // 'pending' | 'processing' | 'completed' | 'failed'

  @Column({ default: 0 })
  progress: number;                    // 0-100 progress percentage

  @Column({ nullable: true })
  filePath: string;                    // Absolute path to the generated file

  @Column()
  userId: number;                      // ID of the user who triggered the export

  @CreateDateColumn()
  createdAt: Date;                     // Timestamp of export creation
}
```

### Job Status Lifecycle

```
pending -> processing -> completed
                     \-> failed
```

---

## Backend Services

### TableExportService

The core service that orchestrates export creation and file generation.

#### `createJob(table, exportName, query, body, userId): Promise<ExportJobEntity>`

Creates a new export job entity from the table's export definition and the current request context.

1. Finds the matching `Export` definition by name from `table.getExports()`
2. Creates an `ExportJobEntity` with the export's filename, format, and the captured query state
3. Saves and returns the entity

#### `getJob(jobId: string): Promise<ExportJobEntity | null>`

Retrieves a job entity by its UUID.

#### `processExport(jobId: string): Promise<void>`

The main async processing pipeline:

1. Loads the job entity
2. Updates status to `'processing'`, emits progress `0`
3. Resolves the table from the registry
4. Creates a TypeORM query builder for the table's resource entity
5. Fetches data (applies filters from query state when implemented)
6. Emits progress `50`
7. Ensures the `exports/` directory exists
8. Generates the file based on format (XLSX, CSV, or PDF)
9. Updates job with `status: 'completed'`, `progress: 100`, and `filePath`
10. Emits completion event with `downloadUrl`

On error: updates status to `'failed'` and emits a failure event with the error message.

### TableSseService

Manages SSE event streams for export progress updates using RxJS.

#### `emit(event: ExportEvent): void`

Emits an event to all connected SSE clients. Events are filtered by `jobId` so each client only receives updates for their export.

```ts
interface ExportEvent {
  jobId: string;
  status: string;       // 'processing' | 'completed' | 'failed'
  progress: number;     // 0-100
  downloadUrl?: string; // Present on completion
  error?: string;       // Present on failure
}
```

#### `getStream(jobId: string): Observable<MessageEvent>`

Returns an RxJS Observable that emits `MessageEvent` objects filtered by `jobId`. Used by the `@Sse()` endpoint in the controller.

---

## ExportFormat Details

### XLSX (Excel)

Uses the [ExcelJS](https://github.com/exceljs/exceljs) library to generate Excel workbooks.

**Process:**

1. Creates a new `ExcelJS.Workbook` with a worksheet named `'Data'`
2. Configures columns from the table's exportable columns (those where `shouldBeExported()` returns `true`)
3. Each column gets: `header` (from `col.getHeader()`), `key` (from `col.getAttribute()`), and `width: 20`
4. Iterates through data rows, calling `col.mapForExport(rawValue, item)` on each column
5. Writes the workbook via `workbook.xlsx.writeFile(filePath)`

```ts
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Data');

sheet.columns = columns.map((col) => ({
  header: col.getHeader(),
  key: col.getAttribute(),
  width: 20,
}));

for (const item of data) {
  const row = {};
  for (const col of columns) {
    row[col.getAttribute()] = col.mapForExport(col.getDataFromItem(item), item);
  }
  sheet.addRow(row);
}

await workbook.xlsx.writeFile(filePath);
```

### CSV

Also uses ExcelJS but writes using the CSV writer.

**Process:** Identical to XLSX (same workbook creation, column setup, and row population), but uses `workbook.csv.writeFile(filePath)` instead.

```ts
await workbook.csv.writeFile(filePath);
```

### PDF

Uses [PDFKit](https://pdfkit.org/) to generate PDF documents with a simple table layout.

**Process:**

1. Creates a `PDFDocument` with landscape A4 layout and 30px margins
2. Pipes the output to a file write stream
3. Renders column headers in bold Helvetica (10pt)
4. Renders data rows in regular Helvetica (9pt)
5. Each column gets 100px width with 10px gap (110px total per column)
6. Auto-paginates when content exceeds 550px height
7. Values are passed through `col.mapForExport()` and cast to string

```ts
const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
doc.pipe(fs.createWriteStream(filePath));

// Headers
doc.fontSize(10).font('Helvetica-Bold');
for (const col of columns) {
  doc.text(col.getHeader(), x, 30, { width: 100 });
  x += 110;
}

// Rows
doc.font('Helvetica').fontSize(9);
for (const item of data) {
  for (const col of columns) {
    const value = col.mapForExport(col.getDataFromItem(item), item);
    doc.text(String(value ?? ''), x, y, { width: 100 });
    x += 110;
  }
  y += 15;
  if (y > 550) { doc.addPage(); y = 30; }
}

doc.end();
```

---

## Frontend Integration

### `useExport` Composable

The `useExport` composable manages the complete export lifecycle on the frontend.

```ts
const {
  isExporting,      // Ref<boolean> -- true while an export is in progress
  exportProgress,   // Ref<number> -- 0-100 progress percentage
  exportError,      // Ref<string | null> -- error message if export failed
  triggerExport,    // (tableClass, exportName, queryParams?, selectedIds?) => Promise<void>
  resetExport,      // () => void -- resets all state
} = useExport();
```

### `triggerExport(tableClass, exportName, queryParams?, selectedIds?)`

Initiates an export and manages the full async flow.

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `tableClass` | `string` | The table's registry name |
| `exportName` | `string` | The export definition's name |
| `queryParams` | `Record<string, any>` | Optional: current filters, search, sort state |
| `selectedIds` | `string[]` | Optional: array of selected row IDs |

**Internal flow:**

1. Sets `isExporting` to `true`, `exportProgress` to `0`, clears errors
2. Sends `POST /table/export/:tableClass/:exportName` with query params and selected IDs
3. Receives `{ jobId }` from the response
4. Opens an `EventSource` connection to `GET /table/export/stream/:jobId`
5. On each SSE message:
   - Updates `exportProgress` from `data.progress`
   - If `status === 'completed'`: closes EventSource, sets `isExporting` to `false`, navigates to `data.downloadUrl` to trigger download
   - If `status === 'failed'`: closes EventSource, sets `isExporting` to `false`, sets `exportError` to `data.error`
6. On EventSource error: closes connection, sets `exportError` to `'Connection lost'`
7. On fetch error: sets `exportError` to the error message

### `resetExport()`

Resets all reactive state to initial values:
- `isExporting` -> `false`
- `exportProgress` -> `0`
- `exportError` -> `null`

### Frontend Export Type

```ts
interface ExportDef {
  name: string;       // Export identifier
  label: string;      // Display text
  fileName: string;   // Output filename
  format: string;     // 'xlsx', 'csv', or 'pdf'
}
```

### ExportButton and ExportProgressOverlay

The frontend includes two components for the export UI:

- **`ExportButton`** -- renders a dropdown with available export options from the table meta
- **`ExportProgressOverlay`** -- shows a progress bar overlay while an export is in progress

---

## Complete Example

### Backend: Table Definition

```ts
import { BaseTable } from '@nestjs-table-module/backend';
import { TableConfig } from '@nestjs-table-module/backend';
import { Export, ExportFormat, SortDirection, PaginationType } from '@nestjs-table-module/backend';
import { TextColumn, NumericColumn, DateTimeColumn } from '@nestjs-table-module/backend';

@TableConfig({
  resource: OrderEntity,
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
  pagination: PaginationType.Full,
})
export class OrdersTable extends BaseTable<OrderEntity> {
  columns() {
    return [
      TextColumn.make('orderNumber').sortable().searchable(),
      TextColumn.make('customerName').sortable(),
      NumericColumn.make('total').sortable(),
      DateTimeColumn.make('createdAt').sortable(),
    ];
  }

  exports() {
    return [
      // Standard Excel export -- respects active filters
      Export.make('Excel', 'orders.xlsx', ExportFormat.Xlsx)
        .label('Export as Excel'),

      // CSV export -- all data, no filter restriction
      Export.make('Full CSV', 'all-orders.csv', ExportFormat.Csv)
        .label('Export All (CSV)')
        .filteredOnly(false),

      // PDF export -- selected rows only, admin-only
      Export.make('PDF Report', 'orders-report.pdf', ExportFormat.Pdf)
        .label('PDF Report (Selected)')
        .selectedOnly()
        .authorize((user) => user.role === 'admin'),
    ];
  }
}
```

### Frontend: Using the Export

```vue
<script setup lang="ts">
import { useExport } from '@nestjs-table-module/frontend';

const { isExporting, exportProgress, exportError, triggerExport, resetExport } = useExport();

// Trigger an Excel export with current filters
async function handleExport(exportName: string) {
  await triggerExport(
    'OrdersTable',
    exportName,
    { search: 'acme', filters: { status: { equals: 'pending' } } },
  );
}

// Trigger a selected-only export
async function handleExportSelected(selectedIds: string[]) {
  await triggerExport(
    'OrdersTable',
    'PDF Report',
    undefined,
    selectedIds,
  );
}
</script>

<template>
  <div>
    <!-- Export buttons -->
    <button @click="handleExport('Excel')" :disabled="isExporting">
      Export Excel
    </button>
    <button @click="handleExport('Full CSV')" :disabled="isExporting">
      Export All CSV
    </button>

    <!-- Progress overlay -->
    <div v-if="isExporting" class="export-progress">
      Exporting... {{ exportProgress }}%
    </div>

    <!-- Error display -->
    <div v-if="exportError" class="export-error">
      Export failed: {{ exportError }}
      <button @click="resetExport">Dismiss</button>
    </div>
  </div>
</template>
```

### API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/table/export/:tableClass/:exportName` | Trigger an export, returns `{ jobId }` |
| `GET` (SSE) | `/table/export/stream/:jobId` | Real-time progress stream |
| `GET` | `/table/export/download/:jobId` | Download the completed export file |

All endpoints are protected by JWT authentication via `@UseGuards(AuthGuard('jwt'))`.
