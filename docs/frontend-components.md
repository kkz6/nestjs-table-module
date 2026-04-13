# Frontend Components

The Vue frontend is built as a component tree with `DataTable` as the root component, orchestrating sub-components for search, filtering, pagination, actions, and cell rendering.

---

## DataTable

The main component that ties everything together. It initializes the composables, fetches data, and renders the full table UI.

### Props

| Prop             | Type    | Default | Description                                                 |
|------------------|---------|---------|-------------------------------------------------------------|
| `endpoint`       | string  | -       | **Required.** The API endpoint to fetch table data from     |
| `defaultPerPage` | number  | `15`    | Initial number of rows per page                             |
| `debounce`       | number  | `300`   | Debounce delay in ms for search and filter changes          |
| `syncUrl`        | boolean | `true`  | Whether to sync table state to URL query parameters         |
| `tableClass`     | string  | `''`    | The table class name, used for actions and exports          |

### Behavior

- On mount, initializes `useTable`, `useActions`, `useExport`, and `useStickyTable` composables.
- Computes `visibleColumnDefs` from meta columns, respecting toggleable/visible state.
- Renders checkboxes when bulk actions or exports are defined.
- Shows a loading spinner overlay during data fetching.
- Displays the `EmptyState` component when data is empty and not loading.

### Usage

```vue
<DataTable
  endpoint="/api/users"
  table-class="UsersTable"
  :default-per-page="30"
  :debounce="500"
  :sync-url="true"
/>
```

---

## SearchInput

A text input with a search icon for global search.

### Props

| Prop          | Type   | Default        | Description               |
|---------------|--------|----------------|---------------------------|
| `modelValue`  | string | -              | Current search value      |
| `placeholder` | string | `"Search..."`  | Placeholder text          |

### Events

| Event               | Payload  | Description                        |
|---------------------|----------|------------------------------------|
| `update:modelValue` | `string` | Emitted on every keystroke         |

### Usage

```vue
<SearchInput
  :model-value="search"
  placeholder="Search by name, email..."
  @update:model-value="setSearch"
/>
```

Debouncing is handled by the `useTable` composable, not by this component.

---

## TablePagination

Renders pagination controls that adapt to the pagination type.

### Props

| Prop             | Type             | Default | Description                            |
|------------------|------------------|---------|----------------------------------------|
| `pagination`     | `PaginationData` | -       | The pagination data from the response  |
| `perPageOptions` | `number[]`       | -       | Available per-page values              |

### Events

| Event     | Payload  | Description                            |
|-----------|----------|----------------------------------------|
| `page`    | `number` | Emitted when the user selects a page   |
| `perPage` | `number` | Emitted when per-page value changes    |

### Rendering Behavior

- **Full pagination** (`type === 'full'`): Renders numbered page buttons with Prev/Next and ellipsis for large page ranges. Shows "Showing X to Y of Z" text.
- **Simple/Cursor pagination** (`type !== 'full'`): Renders only Previous/Next buttons. Next is disabled when `nextCursor` is null (cursor mode) or when at the last page.
- **Per-page selector**: Always shown, renders a `<Select>` component with options like "15 per page", "30 per page", etc.

### Usage

```vue
<TablePagination
  :pagination="pagination"
  :per-page-options="[15, 30, 50, 100]"
  @page="setPage"
  @per-page="setPerPage"
/>
```

---

## ToggleColumnsDropdown

A dropdown menu that lets users show/hide toggleable columns.

### Props

| Prop             | Type          | Default | Description                           |
|------------------|---------------|---------|---------------------------------------|
| `columns`        | `ColumnDef[]` | -       | All column definitions from meta      |
| `visibleColumns` | `string[]`    | -       | Currently visible column keys         |

### Events

| Event    | Payload  | Description                                |
|----------|----------|--------------------------------------------|
| `toggle` | `string` | Emitted with the column key to toggle      |

### Behavior

- Only shows columns where `toggleable` is `true`.
- Each menu item has a checkbox indicating visibility.
- If `visibleColumns` is empty, the component uses the column's default `visible` property.

### Usage

```vue
<ToggleColumnsDropdown
  :columns="meta.columns"
  :visible-columns="visibleColumns"
  @toggle="toggleColumn"
/>
```

---

## EmptyState

Renders a centered empty state message when the table has no data.

### Props

| Prop     | Type                       | Default | Description                     |
|----------|----------------------------|---------|---------------------------------|
| `config` | `EmptyStateDef \| null`    | -       | Empty state configuration       |

### Rendering

Displays a centered vertical layout with optional icon, title, message, and action button. Falls back to "No results found" when no config is provided.

See [Empty States](./empty-states.md) for full details.

---

## ConfirmDialog

A modal dialog that prompts the user to confirm or cancel an action.

### Props

| Prop     | Type        | Default | Description                                |
|----------|-------------|---------|--------------------------------------------|
| `action` | `ActionDef` | -       | The action requiring confirmation          |

### Events

| Event     | Payload | Description                       |
|-----------|---------|-----------------------------------|
| `confirm` | -       | Emitted when user clicks Confirm  |
| `cancel`  | -       | Emitted when user clicks Cancel   |

### Behavior

- Opens a modal dialog with the action's `confirm.title` and `confirm.message`.
- The confirm button uses `destructive` variant if the action is destructive.
- Button labels default to "Confirm" and "Cancel" but can be customized via `confirm.confirmLabel` and `confirm.cancelLabel`.
- Clicking outside the dialog triggers `cancel`.

### Usage

```vue
<ConfirmDialog
  v-if="confirmAction"
  :action="confirmAction"
  @confirm="handleConfirm"
  @cancel="cancelAction"
/>
```

---

## ExportButton

A dropdown button that lists available export formats.

### Props

| Prop      | Type          | Default | Description                        |
|-----------|---------------|---------|------------------------------------|
| `exports` | `ExportDef[]` | -       | Available export definitions       |

### Events

| Event    | Payload     | Description                              |
|----------|-------------|------------------------------------------|
| `export` | `ExportDef` | Emitted when user selects an export      |

### Behavior

- Renders a "Export" button with a download icon.
- Clicking opens a dropdown listing each export option by label (e.g., "Excel", "CSV", "PDF").

### Usage

```vue
<ExportButton
  :exports="meta.exports"
  @export="handleExport"
/>
```

---

## ExportProgressOverlay

A full-screen overlay that shows export progress.

### Props

| Prop       | Type   | Default | Description                          |
|------------|--------|---------|--------------------------------------|
| `progress` | number | -       | Current progress percentage (0-100)  |

### Rendering

- Fixed-position overlay with semi-transparent black background.
- Centered card with "Exporting..." text, a progress bar, and a percentage label.
- The progress bar width animates as the percentage changes.

### Usage

```vue
<ExportProgressOverlay v-if="isExporting" :progress="exportProgress" />
```

---

## AddFilterDropdown

A dropdown that lists available filters for the user to add.

### Props

| Prop               | Type          | Default | Description                              |
|--------------------|---------------|---------|------------------------------------------|
| `filters`          | `FilterDef[]` | -       | All available filter definitions         |
| `activeFilterKeys` | `string[]`    | -       | Keys of currently active filters         |

### Events

| Event | Payload  | Description                                    |
|-------|----------|------------------------------------------------|
| `add` | `string` | Emitted with the filter key when user selects  |

### Behavior

- Renders a "Filter" button with a filter icon.
- Lists all non-hidden filters in the dropdown.
- Already-active filters are shown as disabled.

### Usage

```vue
<AddFilterDropdown
  :filters="meta.filters"
  :active-filter-keys="Object.keys(activeFilters)"
  @add="(key) => addFilter(key, defaultClause, '')"
/>
```

---

## ActiveFilters

Renders a row of filter chips for all currently active filters.

### Props

| Prop            | Type                                       | Default | Description                        |
|-----------------|--------------------------------------------|---------|------------------------------------|
| `filters`       | `FilterDef[]`                              | -       | All filter definitions             |
| `activeFilters` | `Record<string, Record<string, string>>`   | -       | Current filter state               |

### Events

| Event    | Payload                             | Description                            |
|----------|-------------------------------------|----------------------------------------|
| `update` | `(key: string, clause: string, value: string)` | Emitted when a filter value changes |
| `remove` | `string`                            | Emitted when a filter is removed       |

### Behavior

- Iterates over `activeFilters` entries.
- For each active filter, renders a `FilterChip` component.
- Passes the first clause/value pair from the clause map.

### Usage

```vue
<ActiveFilters
  :filters="meta.filters"
  :active-filters="activeFilters"
  @update="(key, clause, value) => updateFilter(key, clause, value)"
  @remove="removeFilter"
/>
```

---

## FilterChip

A single filter chip with a popover for editing the clause and value.

### Props

| Prop     | Type        | Default | Description                        |
|----------|-------------|---------|------------------------------------|
| `filter` | `FilterDef` | -       | The filter definition              |
| `clause` | `string`    | -       | Current clause (e.g., `"contains"`)|
| `value`  | `string`    | -       | Current filter value               |

### Events

| Event    | Payload                       | Description                              |
|----------|-------------------------------|------------------------------------------|
| `update` | `(clause: string, value: string)` | Emitted when clause or value changes |
| `remove` | -                             | Emitted when the X button is clicked     |

### Behavior

- Displays as a pill/chip showing `"Label: value"`.
- Has an X button to remove the filter.
- Clicking the chip opens a popover with a clause selector dropdown and the appropriate filter input component:
  - `TextFilterInput` for text filters
  - `NumericFilterInput` for numeric filters
  - `DateFilterInput` for date filters
  - `BooleanFilterInput` for boolean filters
  - `SetFilterInput` for set filters

---

## RowActions

Renders row-level action buttons or a dropdown menu.

### Props

| Prop         | Type          | Default | Description                                  |
|--------------|---------------|---------|----------------------------------------------|
| `actions`    | `ActionDef[]` | -       | Row-specific actions (with resolved URLs)    |
| `row`        | `object`      | -       | The current row data                         |
| `asDropdown` | `boolean`     | -       | If true, renders as a three-dot dropdown     |

### Events

| Event    | Payload                             | Description                             |
|----------|-------------------------------------|-----------------------------------------|
| `action` | `(action: ActionDef, row: object)`  | Emitted when a button action is clicked |

### Rendering Modes

- **Inline** (`asDropdown=false`): Renders each action as a ghost button. Link-type actions render as `<a>` tags.
- **Dropdown** (`asDropdown=true`): Renders a three-dot button that opens a dropdown menu with all actions.

### Behavior

- Hidden actions (`action.hidden === true`) are not rendered.
- Disabled actions are visually greyed out and non-clickable.
- Variant-specific colors: `destructive` (red), `success` (green), `warning` (yellow).

---

## BulkActionsDropdown

A dropdown for bulk actions and exports, shown when rows are selected.

### Props

| Prop            | Type          | Default | Description                           |
|-----------------|---------------|---------|---------------------------------------|
| `actions`       | `ActionDef[]` | -       | Available bulk actions                |
| `exports`       | `ExportDef[]` | -       | Available export options              |
| `selectedCount` | `number`      | -       | Number of selected rows               |

### Events

| Event    | Payload     | Description                              |
|----------|-------------|------------------------------------------|
| `action` | `ActionDef` | Emitted when a bulk action is selected   |
| `export` | `ExportDef` | Emitted when an export is selected       |

### Rendering

- Button label shows "Actions (N)" where N is the selected count.
- Dropdown has two sections separated by a divider: "Actions" and "Export".

---

## CellRenderer

A dispatcher component that renders the correct cell component based on column type.

### Props

| Prop     | Type        | Default | Description                |
|----------|-------------|---------|----------------------------|
| `value`  | `any`       | -       | The cell value             |
| `column` | `ColumnDef` | -       | The column definition      |

### Behavior

Routes to the appropriate cell component based on `column.type`:

| `column.type` | Component      |
|----------------|---------------|
| `text`         | `TextCell`    |
| `numeric`      | `NumericCell` |
| `date`         | `DateCell`    |
| `datetime`     | `DateTimeCell`|
| `boolean`      | `BooleanCell` |
| `badge`        | `BadgeCell`   |
| `image`        | `ImageCell`   |

Falls back to a plain `<span>{{ value }}</span>` for unrecognized types.

---

## Cell Components

All cell components share the same props interface:

### Common Props

| Prop     | Type        | Default | Description                |
|----------|-------------|---------|----------------------------|
| `value`  | `any`       | -       | The cell value             |
| `column` | `ColumnDef` | -       | The column definition      |

### TextCell

Renders text with optional truncation and wrapping support.

- Applies `truncate` CSS class when `column.truncate` is set, with a `maxWidth` based on the truncate value (in `ch` units).
- Applies `whitespace-normal` when `column.wrap` is true.
- Applies custom `column.cellClass` if set.

### NumericCell

Renders numeric values with `tabular-nums` font variant for aligned digits.

### DateCell

Renders a date string as-is. The value is pre-formatted on the backend.

### DateTimeCell

Renders a datetime string as-is. The value is pre-formatted on the backend.

### BooleanCell

Renders boolean values with optional icons:

- When `trueIcon` or `falseIcon` is set on the column, renders a green checkmark or red X mark.
- Otherwise, renders the raw value.

### BadgeCell

Renders values as styled badges using the `Badge` UI component:

- Expects the value to be an object with `value` and `variant` properties (pre-mapped on the backend via `BadgeColumn`).
- The `variant` controls the badge color (e.g., `success`, `destructive`, `warning`).
- Falls back to plain text if the value is not an object.

### ImageCell

Renders an image with configurable size, rounding, and fallback:

- Size classes: `small` (h-8 w-8), `medium` (h-10 w-10), `large` (h-14 w-14), `extra-large` (h-20 w-20).
- When `column.rounded` is true, applies `rounded-full` for circular images.
- When the value is null/empty and `column.fallbackImage` is set, renders the fallback at 50% opacity.
