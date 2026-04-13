# NestJS + Vue Table Module — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Full port of the Laravel/React InertiaUI Table Module to NestJS (TypeORM) + Vue 3 (shadcn-vue), designed as a drop-in module for the brocoders/nestjs-boilerplate.

**Architecture:** Backend is a NestJS module following the boilerplate's layered patterns (controllers, services, DTOs, entities, repository pattern). Frontend is a Vue 3 component library using composables for state and shadcn-vue for UI primitives. Communication via REST API with SSE for async exports.

**Tech Stack:** NestJS 11, TypeORM, class-validator, class-transformer, ExcelJS, PDFKit, Vue 3, shadcn-vue, Tailwind CSS, vue-router

**Reference Codebase:** `/Users/karthickk/kkprojects/table-module/` (Laravel version — use as behavioral reference)

---

## Phase 1: Project Scaffolding

### Task 1: Initialize backend package

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/tsconfig.build.json`
- Create: `backend/.eslintrc.js`
- Create: `backend/.prettierrc`
- Create: `backend/.gitignore`
- Create: `backend/nest-cli.json`

**Step 1: Create backend directory and init npm**

```bash
cd /Users/karthickk/kkprojects/nestjs-table-module
mkdir -p backend/src
cd backend
```

**Step 2: Create package.json**

```json
{
  "name": "@kkmodules/nestjs-table",
  "version": "1.0.0",
  "description": "NestJS table module with filtering, sorting, pagination, actions, and exports",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\"",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "peerDependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/typeorm": "^11.0.0",
    "typeorm": "^0.3.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "rxjs": "^7.0.0"
  },
  "dependencies": {
    "exceljs": "^4.4.0",
    "pdfkit": "^0.15.0",
    "pdfkit-table": "^0.1.99"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@nestjs/typeorm": "^11.0.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^22.0.0",
    "class-transformer": "^0.5.0",
    "class-validator": "^0.14.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0",
    "ts-jest": "^29.1.0",
    "typeorm": "^0.3.0",
    "typescript": "^5.9.0"
  }
}
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strict": false,
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 4: Create nest-cli.json**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src"
}
```

**Step 5: Install dependencies**

```bash
cd /Users/karthickk/kkprojects/nestjs-table-module/backend
npm install
```

**Step 6: Commit**

```bash
git add .
git commit -m "chore: initialize backend package with NestJS dependencies"
```

---

### Task 2: Initialize frontend package

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/.gitignore`

**Step 1: Create frontend directory**

```bash
cd /Users/karthickk/kkprojects/nestjs-table-module
mkdir -p frontend/src
```

**Step 2: Create package.json**

```json
{
  "name": "@kkmodules/vue-table",
  "version": "1.0.0",
  "description": "Vue 3 table component library with shadcn-vue",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "module": "dist/index.mjs",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./style.css": "./dist/style.css"
  },
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix",
    "type-check": "vue-tsc --noEmit"
  },
  "peerDependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.0.0"
  },
  "dependencies": {
    "@vueuse/core": "^12.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-vue-next": "^0.400.0",
    "radix-vue": "^1.9.0",
    "tailwind-merge": "^2.3.0",
    "tailwindcss-animate": "^1.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@types/node": "^22.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.9.0",
    "vite": "^6.0.0",
    "vite-plugin-dts": "^4.0.0",
    "vue": "^3.5.0",
    "vue-router": "^4.0.0",
    "vue-tsc": "^2.0.0"
  }
}
```

**Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    dts({ insertTypesEntry: true }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueTable',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
        },
      },
    },
  },
});
```

**Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 5: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
```

**Step 6: Install dependencies**

```bash
cd /Users/karthickk/kkprojects/nestjs-table-module/frontend
npm install
```

**Step 7: Commit**

```bash
git add .
git commit -m "chore: initialize frontend package with Vue 3, shadcn-vue, Tailwind"
```

---

## Phase 2: Backend — Enums & Interfaces

### Task 3: Create all enums

**Files:**
- Create: `backend/src/enums/clause.enum.ts`
- Create: `backend/src/enums/pagination-type.enum.ts`
- Create: `backend/src/enums/sort-direction.enum.ts`
- Create: `backend/src/enums/column-alignment.enum.ts`
- Create: `backend/src/enums/variant.enum.ts`
- Create: `backend/src/enums/action-type.enum.ts`
- Create: `backend/src/enums/export-format.enum.ts`
- Create: `backend/src/enums/image-size.enum.ts`
- Create: `backend/src/enums/image-position.enum.ts`
- Create: `backend/src/enums/scroll-position.enum.ts`
- Create: `backend/src/enums/index.ts`

**Step 1: Create clause.enum.ts**

This is the most important enum — all 24 filter comparison clauses.

```typescript
export enum Clause {
  // Text
  Equals = 'equals',
  NotEquals = 'not_equals',
  StartsWith = 'starts_with',
  EndsWith = 'ends_with',
  NotStartsWith = 'not_starts_with',
  NotEndsWith = 'not_ends_with',
  Contains = 'contains',
  NotContains = 'not_contains',

  // Boolean
  IsTrue = 'is_true',
  IsFalse = 'is_false',
  IsSet = 'is_set',
  IsNotSet = 'is_not_set',

  // Date
  Before = 'before',
  EqualOrBefore = 'equal_or_before',
  After = 'after',
  EqualOrAfter = 'equal_or_after',
  Between = 'between',
  NotBetween = 'not_between',

  // Numeric
  GreaterThan = 'greater_than',
  GreaterThanOrEqual = 'greater_than_or_equal',
  LessThan = 'less_than',
  LessThanOrEqual = 'less_than_or_equal',

  // Set
  In = 'in',
  NotIn = 'not_in',

  // Trashed
  WithTrashed = 'with_trashed',
  OnlyTrashed = 'only_trashed',
  WithoutTrashed = 'without_trashed',
}

export function isNegatedClause(clause: Clause): boolean {
  return [
    Clause.NotEquals,
    Clause.NotStartsWith,
    Clause.NotEndsWith,
    Clause.NotContains,
    Clause.NotBetween,
    Clause.NotIn,
  ].includes(clause);
}

export function isWithoutComparisonClause(clause: Clause): boolean {
  return [
    Clause.IsTrue,
    Clause.IsFalse,
    Clause.IsSet,
    Clause.IsNotSet,
    Clause.WithTrashed,
    Clause.OnlyTrashed,
    Clause.WithoutTrashed,
  ].includes(clause);
}
```

**Step 2: Create all other enums**

```typescript
// pagination-type.enum.ts
export enum PaginationType {
  Full = 'full',
  Simple = 'simple',
  Cursor = 'cursor',
}

// sort-direction.enum.ts
export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

// column-alignment.enum.ts
export enum ColumnAlignment {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

// variant.enum.ts
export enum Variant {
  Default = 'default',
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Destructive = 'destructive',
  Secondary = 'secondary',
  Outline = 'outline',
  Ghost = 'ghost',
  Link = 'link',
}

// action-type.enum.ts
export enum ActionType {
  Button = 'button',
  Link = 'link',
}

// export-format.enum.ts
export enum ExportFormat {
  Xlsx = 'xlsx',
  Csv = 'csv',
  Pdf = 'pdf',
}

// image-size.enum.ts
export enum ImageSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  ExtraLarge = 'extra-large',
  Custom = 'custom',
}

// image-position.enum.ts
export enum ImagePosition {
  Start = 'start',
  End = 'end',
}

// scroll-position.enum.ts
export enum ScrollPosition {
  TopOfPage = 'topOfPage',
  TopOfTable = 'topOfTable',
  Preserve = 'preserve',
}
```

**Step 3: Create barrel export**

```typescript
// index.ts
export * from './clause.enum';
export * from './pagination-type.enum';
export * from './sort-direction.enum';
export * from './column-alignment.enum';
export * from './variant.enum';
export * from './action-type.enum';
export * from './export-format.enum';
export * from './image-size.enum';
export * from './image-position.enum';
export * from './scroll-position.enum';
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add all enum definitions"
```

---

### Task 4: Create TypeScript interfaces

**Files:**
- Create: `backend/src/interfaces/column.interface.ts`
- Create: `backend/src/interfaces/filter.interface.ts`
- Create: `backend/src/interfaces/action.interface.ts`
- Create: `backend/src/interfaces/export.interface.ts`
- Create: `backend/src/interfaces/table-config.interface.ts`
- Create: `backend/src/interfaces/table-response.interface.ts`
- Create: `backend/src/interfaces/index.ts`

**Step 1: Create all interface files**

Reference: These interfaces define the data contracts between backend and frontend.

```typescript
// column.interface.ts
import { ColumnAlignment, ImageSize, ImagePosition } from '../enums';

export interface ColumnSerialized {
  type: string;
  key: string;
  header: string;
  sortable: boolean;
  searchable: boolean;
  toggleable: boolean;
  visible: boolean;
  alignment: ColumnAlignment;
  wrap: boolean;
  truncate: number | false;
  headerClass: string | null;
  cellClass: string | null;
  stickable: boolean;
  meta: Record<string, any> | null;
  // BooleanColumn extras
  trueIcon?: string | null;
  falseIcon?: string | null;
  trueLabel?: string;
  falseLabel?: string;
  // BadgeColumn extras
  variants?: Record<string, string>;
  // ImageColumn extras
  imageSize?: ImageSize;
  imagePosition?: ImagePosition;
  fallbackImage?: string | null;
  rounded?: boolean;
  // ActionColumn extras
  asDropdown?: boolean;
}

// filter.interface.ts
import { Clause } from '../enums';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSerialized {
  key: string;
  label: string;
  type: string;
  clauses: Clause[];
  options?: FilterOption[];
  multiple?: boolean;
  hidden?: boolean;
  default?: {
    value: any;
    clause: Clause;
  } | null;
}

export interface FilterState {
  enabled: boolean;
  value: any;
  clause: Clause;
}

// action.interface.ts
import { ActionType, Variant } from '../enums';

export interface ActionConfirm {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ActionSerialized {
  name: string;
  label: string;
  type: ActionType;
  variant: Variant;
  icon?: string | null;
  confirm?: ActionConfirm | null;
  disabled?: boolean;
  hidden?: boolean;
  url?: string;
  download?: boolean;
  meta?: Record<string, any> | null;
  dataAttributes?: Record<string, string> | null;
}

// export.interface.ts
import { ExportFormat } from '../enums';

export interface ExportSerialized {
  name: string;
  label: string;
  fileName: string;
  format: ExportFormat;
}

// table-config.interface.ts
import { PaginationType, SortDirection, ScrollPosition } from '../enums';

export interface TableConfigOptions {
  resource: Function; // TypeORM entity class
  defaultSort?: { column: string; direction: SortDirection };
  pagination?: PaginationType;
  perPageOptions?: number[];
  defaultPerPage?: number;
  softDeletes?: boolean;
  searchable?: string[];
  stickyHeader?: boolean;
  debounce?: number;
  scrollPosition?: ScrollPosition;
}

// table-response.interface.ts
import { ColumnSerialized } from './column.interface';
import { FilterSerialized, FilterState } from './filter.interface';
import { ActionSerialized } from './action.interface';
import { ExportSerialized } from './export.interface';
import { PaginationType } from '../enums';

export interface TableMeta {
  columns: ColumnSerialized[];
  filters: FilterSerialized[];
  actions: {
    row: ActionSerialized[];
    bulk: ActionSerialized[];
  };
  exports: ExportSerialized[];
  search: {
    enabled: boolean;
    placeholder: string;
  };
  perPageOptions: number[];
  softDeletes: boolean;
  stickyHeader: boolean;
  debounce: number;
  scrollPosition: string;
  views: ViewSerialized[];
  emptyState: EmptyStateSerialized | null;
}

export interface PaginationData {
  type: PaginationType;
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  nextCursor?: string | null;
  previousCursor?: string | null;
}

export interface TableResponse<T = any> {
  meta: TableMeta;
  data: T[];
  pagination: PaginationData;
}

export interface ViewSerialized {
  id: number;
  title: string;
  requestPayload: Record<string, any>;
}

export interface EmptyStateSerialized {
  title: string;
  message?: string;
  icon?: string;
  action?: {
    label: string;
    url: string;
  } | null;
}
```

**Step 2: Create barrel export**

```typescript
// index.ts
export * from './column.interface';
export * from './filter.interface';
export * from './action.interface';
export * from './export.interface';
export * from './table-config.interface';
export * from './table-response.interface';
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add TypeScript interfaces for table contracts"
```

---

## Phase 3: Backend — Column System

### Task 5: Implement base Column class

**Files:**
- Create: `backend/src/columns/column.ts`
- Test: `backend/src/columns/__tests__/column.spec.ts`

**Step 1: Write failing test**

```typescript
// column.spec.ts
import { Column } from '../column';
import { ColumnAlignment } from '../../enums';

// Concrete implementation for testing
class TestColumn extends Column {
  readonly type = 'test';
}

describe('Column', () => {
  it('creates with make() factory', () => {
    const col = TestColumn.make('name');
    expect(col.getAttribute()).toBe('name');
    expect(col.getHeader()).toBe('Name');
  });

  it('generates header from attribute', () => {
    const col = TestColumn.make('created_at');
    expect(col.getHeader()).toBe('Created at');
  });

  it('supports chainable builders', () => {
    const col = TestColumn.make('name')
      .sortable()
      .searchable()
      .toggleable()
      .centerAligned();
    expect(col.isSortable()).toBe(true);
    expect(col.isSearchable()).toBe(true);
    expect(col.isToggleable()).toBe(true);
    expect(col.toArray().alignment).toBe(ColumnAlignment.Center);
  });

  it('serializes to array', () => {
    const result = TestColumn.make('name').sortable().toArray();
    expect(result).toMatchObject({
      type: 'test',
      key: 'name',
      header: 'Name',
      sortable: true,
      toggleable: true,
      visible: true,
      alignment: 'left',
    });
  });

  it('supports mapAs transformation', () => {
    const col = TestColumn.make('name').mapAs((value) => value.toUpperCase());
    expect(col.mapValue('hello')).toBe('HELLO');
  });

  it('detects nested relations', () => {
    const col = TestColumn.make('department.name');
    expect(col.isNested()).toBe(true);
    expect(col.getRelationshipName()).toBe('department');
    expect(col.getRelationshipColumn()).toBe('name');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/karthickk/kkprojects/nestjs-table-module/backend
npx jest src/columns/__tests__/column.spec.ts --no-coverage
```

Expected: FAIL

**Step 3: Implement Column class**

Reference: `/Users/karthickk/kkprojects/table-module/src/Columns/Column.php`

```typescript
// column.ts
import { ColumnAlignment } from '../enums';
import { ColumnSerialized } from '../interfaces';

export abstract class Column {
  abstract readonly type: string;

  protected attribute: string = '';
  protected header: string = '';
  protected _sortable: boolean = false;
  protected _toggleable: boolean = true;
  protected _searchable: boolean = false;
  protected _visible: boolean = true;
  protected _alignment: ColumnAlignment = ColumnAlignment.Left;
  protected _wrap: boolean = false;
  protected _truncate: number | false = false;
  protected _headerClass: string | null = null;
  protected _cellClass: string | null = null;
  protected _stickable: boolean = false;
  protected _meta: Record<string, any> | null = null;
  protected _mapAs: ((value: any, item: any) => any) | null = null;
  protected _exportAs: ((value: any, item: any) => any) | null = null;
  protected _shouldExport: boolean = true;
  protected _sortUsing: ((qb: any, direction: string, column: Column) => void) | null = null;

  static make(attribute: string, header?: string): any {
    const instance = new (this as any)();
    instance.attribute = attribute;
    instance.header = header ?? Column.generateHeader(attribute);
    return instance;
  }

  private static generateHeader(attribute: string): string {
    const column = attribute.includes('.') ? attribute.split('.').pop()! : attribute;
    return column
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  }

  getAttribute(): string {
    return this.attribute;
  }

  getHeader(): string {
    return this.header;
  }

  isSortable(): boolean {
    return this._sortable;
  }

  isSearchable(): boolean {
    return this._searchable;
  }

  isToggleable(): boolean {
    return this._toggleable;
  }

  isVisible(): boolean {
    return this._visible;
  }

  isStickable(): boolean {
    return this._stickable;
  }

  shouldBeExported(): boolean {
    return this._shouldExport;
  }

  isNested(): boolean {
    return this.attribute.includes('.');
  }

  getRelationshipName(): string {
    return this.attribute.split('.').slice(0, -1).join('.');
  }

  getRelationshipColumn(): string {
    return this.attribute.split('.').pop()!;
  }

  // Chainable builders
  sortable(value = true): this {
    this._sortable = value;
    return this;
  }

  notSortable(): this {
    this._sortable = false;
    return this;
  }

  searchable(value = true): this {
    this._searchable = value;
    return this;
  }

  notSearchable(): this {
    this._searchable = false;
    return this;
  }

  toggleable(value = true): this {
    this._toggleable = value;
    return this;
  }

  notToggleable(): this {
    this._toggleable = false;
    return this;
  }

  visible(value = true): this {
    this._visible = value;
    return this;
  }

  hidden(): this {
    this._visible = false;
    return this;
  }

  align(alignment: ColumnAlignment): this {
    this._alignment = alignment;
    return this;
  }

  leftAligned(): this {
    return this.align(ColumnAlignment.Left);
  }

  centerAligned(): this {
    return this.align(ColumnAlignment.Center);
  }

  rightAligned(): this {
    return this.align(ColumnAlignment.Right);
  }

  wrap(value = true): this {
    this._wrap = value;
    return this;
  }

  truncate(length: number): this {
    this._truncate = length;
    return this;
  }

  headerClass(value: string): this {
    this._headerClass = value;
    return this;
  }

  cellClass(value: string): this {
    this._cellClass = value;
    return this;
  }

  stickable(value = true): this {
    this._stickable = value;
    return this;
  }

  notStickable(): this {
    this._stickable = false;
    return this;
  }

  meta(value: Record<string, any>): this {
    this._meta = value;
    return this;
  }

  mapAs(callback: (value: any, item: any) => any): this {
    this._mapAs = callback;
    return this;
  }

  exportAs(callback: (value: any, item: any) => any): this {
    this._exportAs = callback;
    return this;
  }

  dontExport(): this {
    this._shouldExport = false;
    return this;
  }

  sortUsing(callback: (qb: any, direction: string, column: Column) => void): this {
    this._sortUsing = callback;
    return this;
  }

  getSortUsing() {
    return this._sortUsing;
  }

  mapValue(value: any, item?: any): any {
    if (this._mapAs) {
      return this._mapAs(value, item);
    }
    return value;
  }

  mapForTable(value: any, item?: any): any {
    return this.mapValue(value, item);
  }

  mapForExport(value: any, item?: any): any {
    if (this._exportAs) {
      return this._exportAs(value, item);
    }
    return this.mapValue(value, item);
  }

  getDataFromItem(item: Record<string, any>): any {
    if (this.isNested()) {
      const parts = this.attribute.split('.');
      let value: any = item;
      for (const part of parts) {
        value = value?.[part];
      }
      return value;
    }
    return item[this.attribute];
  }

  toArray(): ColumnSerialized {
    return {
      type: this.type,
      key: this.attribute,
      header: this.header,
      sortable: this._sortable,
      searchable: this._searchable,
      toggleable: this._toggleable,
      visible: this._visible,
      alignment: this._alignment,
      wrap: this._wrap,
      truncate: this._truncate,
      headerClass: this._headerClass,
      cellClass: this._cellClass,
      stickable: this._stickable,
      meta: this._meta,
    };
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npx jest src/columns/__tests__/column.spec.ts --no-coverage
```

Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: implement base Column class with chainable builder API"
```

---

### Task 6: Implement all column types

**Files:**
- Create: `backend/src/columns/text-column.ts`
- Create: `backend/src/columns/numeric-column.ts`
- Create: `backend/src/columns/date-column.ts`
- Create: `backend/src/columns/date-time-column.ts`
- Create: `backend/src/columns/boolean-column.ts`
- Create: `backend/src/columns/badge-column.ts`
- Create: `backend/src/columns/image-column.ts`
- Create: `backend/src/columns/action-column.ts`
- Create: `backend/src/columns/index.ts`
- Test: `backend/src/columns/__tests__/columns.spec.ts`

**Step 1: Write failing tests**

```typescript
// columns.spec.ts
import { TextColumn } from '../text-column';
import { NumericColumn } from '../numeric-column';
import { DateColumn } from '../date-column';
import { DateTimeColumn } from '../date-time-column';
import { BooleanColumn } from '../boolean-column';
import { BadgeColumn } from '../badge-column';
import { ImageColumn } from '../image-column';
import { ActionColumn } from '../action-column';

describe('TextColumn', () => {
  it('has type "text"', () => {
    expect(TextColumn.make('name').toArray().type).toBe('text');
  });
});

describe('NumericColumn', () => {
  it('has type "numeric"', () => {
    expect(NumericColumn.make('amount').toArray().type).toBe('numeric');
  });
});

describe('DateColumn', () => {
  it('has type "date"', () => {
    expect(DateColumn.make('created_at').toArray().type).toBe('date');
  });

  it('formats date values', () => {
    const col = DateColumn.make('created_at').format('YYYY-MM-DD');
    expect(col.getFormat()).toBe('YYYY-MM-DD');
  });

  it('maps date values', () => {
    const col = DateColumn.make('created_at');
    const result = col.mapValue('2025-03-15T10:30:00Z');
    expect(result).toMatch(/2025/);
  });
});

describe('DateTimeColumn', () => {
  it('has type "datetime"', () => {
    expect(DateTimeColumn.make('updated_at').toArray().type).toBe('datetime');
  });
});

describe('BooleanColumn', () => {
  it('has type "boolean"', () => {
    expect(BooleanColumn.make('is_active').toArray().type).toBe('boolean');
  });

  it('maps boolean values to labels', () => {
    const col = BooleanColumn.make('is_active');
    expect(col.mapValue(true)).toBe('Yes');
    expect(col.mapValue(false)).toBe('No');
  });

  it('supports custom labels', () => {
    const col = BooleanColumn.make('is_active')
      .trueLabel('Active')
      .falseLabel('Inactive');
    expect(col.mapValue(true)).toBe('Active');
    expect(col.mapValue(false)).toBe('Inactive');
  });

  it('serializes icons', () => {
    const col = BooleanColumn.make('is_active')
      .trueIcon('check')
      .falseIcon('x');
    const arr = col.toArray();
    expect(arr.trueIcon).toBe('check');
    expect(arr.falseIcon).toBe('x');
  });
});

describe('BadgeColumn', () => {
  it('has type "badge"', () => {
    expect(BadgeColumn.make('status').toArray().type).toBe('badge');
  });

  it('resolves variants from map', () => {
    const col = BadgeColumn.make('status').variant({
      active: 'success',
      inactive: 'destructive',
    });
    const result = col.mapForTable('active');
    expect(result).toMatchObject({ value: 'active', variant: 'success' });
  });

  it('resolves icons from map', () => {
    const col = BadgeColumn.make('status')
      .variant({ active: 'success' })
      .icon({ active: 'check' });
    const result = col.mapForTable('active');
    expect(result).toMatchObject({ value: 'active', icon: 'check', variant: 'success' });
  });
});

describe('ImageColumn', () => {
  it('has type "image"', () => {
    expect(ImageColumn.make('avatar').toArray().type).toBe('image');
  });
});

describe('ActionColumn', () => {
  it('has type "action"', () => {
    const col = ActionColumn.make();
    expect(col.toArray().type).toBe('action');
  });

  it('is not toggleable', () => {
    expect(ActionColumn.make().isToggleable()).toBe(false);
  });

  it('is not exportable', () => {
    expect(ActionColumn.make().shouldBeExported()).toBe(false);
  });

  it('always has _actions attribute', () => {
    expect(ActionColumn.make().getAttribute()).toBe('_actions');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npx jest src/columns/__tests__/columns.spec.ts --no-coverage
```

**Step 3: Implement all column types**

Reference: `/Users/karthickk/kkprojects/table-module/src/Columns/` (all files)

```typescript
// text-column.ts
import { Column } from './column';

export class TextColumn extends Column {
  readonly type = 'text';
}

// numeric-column.ts
import { Column } from './column';

export class NumericColumn extends Column {
  readonly type = 'numeric';
}

// date-column.ts
import { Column } from './column';

export class DateColumn extends Column {
  readonly type = 'date';

  private _format: string = 'YYYY-MM-DD';
  private static _defaultFormat: string = 'YYYY-MM-DD';

  static setDefaultFormat(format: string): void {
    DateColumn._defaultFormat = format;
  }

  format(format: string): this {
    this._format = format;
    return this;
  }

  getFormat(): string {
    return this._format ?? DateColumn._defaultFormat;
  }

  mapValue(value: any): any {
    if (!value) return null;
    try {
      const date = new Date(value);
      return this.formatDate(date, this.getFormat());
    } catch {
      return value;
    }
  }

  private formatDate(date: Date, format: string): string {
    const map: Record<string, string> = {
      'YYYY': date.getFullYear().toString(),
      'MM': String(date.getMonth() + 1).padStart(2, '0'),
      'DD': String(date.getDate()).padStart(2, '0'),
    };
    let result = format;
    for (const [key, val] of Object.entries(map)) {
      result = result.replace(key, val);
    }
    return result;
  }
}

// date-time-column.ts
import { Column } from './column';

export class DateTimeColumn extends Column {
  readonly type = 'datetime';

  private _format: string = 'YYYY-MM-DD HH:mm:ss';
  private static _defaultFormat: string = 'YYYY-MM-DD HH:mm:ss';

  static setDefaultFormat(format: string): void {
    DateTimeColumn._defaultFormat = format;
  }

  format(format: string): this {
    this._format = format;
    return this;
  }

  getFormat(): string {
    return this._format ?? DateTimeColumn._defaultFormat;
  }

  mapValue(value: any): any {
    if (!value) return null;
    try {
      const date = new Date(value);
      return this.formatDateTime(date, this.getFormat());
    } catch {
      return value;
    }
  }

  private formatDateTime(date: Date, format: string): string {
    const map: Record<string, string> = {
      'YYYY': date.getFullYear().toString(),
      'MM': String(date.getMonth() + 1).padStart(2, '0'),
      'DD': String(date.getDate()).padStart(2, '0'),
      'HH': String(date.getHours()).padStart(2, '0'),
      'mm': String(date.getMinutes()).padStart(2, '0'),
      'ss': String(date.getSeconds()).padStart(2, '0'),
    };
    let result = format;
    for (const [key, val] of Object.entries(map)) {
      result = result.replace(key, val);
    }
    return result;
  }
}

// boolean-column.ts
import { Column } from './column';
import { ColumnSerialized } from '../interfaces';

export class BooleanColumn extends Column {
  readonly type = 'boolean';

  private _trueLabel: string = 'Yes';
  private _falseLabel: string = 'No';
  private _trueIcon: string | null = null;
  private _falseIcon: string | null = null;

  private static _defaultTrueLabel: string = 'Yes';
  private static _defaultFalseLabel: string = 'No';
  private static _defaultTrueIcon: string | null = null;
  private static _defaultFalseIcon: string | null = null;

  static setDefaultTrueLabel(label: string): void {
    BooleanColumn._defaultTrueLabel = label;
  }

  static setDefaultFalseLabel(label: string): void {
    BooleanColumn._defaultFalseLabel = label;
  }

  static setDefaultTrueIcon(icon: string): void {
    BooleanColumn._defaultTrueIcon = icon;
  }

  static setDefaultFalseIcon(icon: string): void {
    BooleanColumn._defaultFalseIcon = icon;
  }

  trueLabel(label: string): this {
    this._trueLabel = label;
    return this;
  }

  falseLabel(label: string): this {
    this._falseLabel = label;
    return this;
  }

  trueIcon(icon: string): this {
    this._trueIcon = icon;
    return this;
  }

  falseIcon(icon: string): this {
    this._falseIcon = icon;
    return this;
  }

  getTrueLabel(): string {
    return this._trueLabel ?? BooleanColumn._defaultTrueLabel;
  }

  getFalseLabel(): string {
    return this._falseLabel ?? BooleanColumn._defaultFalseLabel;
  }

  mapValue(value: any): any {
    return value ? this.getTrueLabel() : this.getFalseLabel();
  }

  mapForTable(value: any): any {
    if (this._trueIcon || this._falseIcon || BooleanColumn._defaultTrueIcon || BooleanColumn._defaultFalseIcon) {
      return !!value;
    }
    return this.mapValue(value);
  }

  toArray(): ColumnSerialized {
    return {
      ...super.toArray(),
      trueIcon: this._trueIcon ?? BooleanColumn._defaultTrueIcon,
      falseIcon: this._falseIcon ?? BooleanColumn._defaultFalseIcon,
      trueLabel: this.getTrueLabel(),
      falseLabel: this.getFalseLabel(),
    };
  }
}

// badge-column.ts
import { Column } from './column';

export class BadgeColumn extends Column {
  readonly type = 'badge';

  private _variantResolver: ((value: any, item?: any) => string) | null = null;
  private _iconResolver: ((value: any, item?: any) => string | null) | null = null;

  variant(resolver: Record<string, string> | ((value: any, item?: any) => string)): this {
    if (typeof resolver === 'function') {
      this._variantResolver = resolver;
    } else {
      this._variantResolver = (value) => resolver[value] ?? 'default';
    }
    return this;
  }

  icon(resolver: Record<string, string> | ((value: any, item?: any) => string | null)): this {
    if (typeof resolver === 'function') {
      this._iconResolver = resolver;
    } else {
      this._iconResolver = (value) => resolver[value] ?? null;
    }
    return this;
  }

  resolveVariant(value: any, item?: any): string {
    return this._variantResolver?.(value, item) ?? 'default';
  }

  resolveIcon(value: any, item?: any): string | null {
    return this._iconResolver?.(value, item) ?? null;
  }

  mapForTable(value: any, item?: any): any {
    return {
      value: this.mapValue(value, item),
      variant: this.resolveVariant(value, item),
      icon: this.resolveIcon(value, item),
    };
  }

  mapForExport(value: any, item?: any): any {
    if (this._exportAs) {
      return this._exportAs(value, item);
    }
    return this.mapValue(value, item);
  }
}

// image-column.ts
import { Column } from './column';
import { ImageSize, ImagePosition } from '../enums';
import { ColumnSerialized } from '../interfaces';

export class ImageColumn extends Column {
  readonly type = 'image';

  private _imageSize: ImageSize = ImageSize.Medium;
  private _imagePosition: ImagePosition = ImagePosition.Start;
  private _fallbackImage: string | null = null;
  private _rounded: boolean = false;

  size(size: ImageSize): this {
    this._imageSize = size;
    return this;
  }

  position(position: ImagePosition): this {
    this._imagePosition = position;
    return this;
  }

  fallback(url: string): this {
    this._fallbackImage = url;
    return this;
  }

  rounded(value = true): this {
    this._rounded = value;
    return this;
  }

  toArray(): ColumnSerialized {
    return {
      ...super.toArray(),
      imageSize: this._imageSize,
      imagePosition: this._imagePosition,
      fallbackImage: this._fallbackImage,
      rounded: this._rounded,
    };
  }
}

// action-column.ts
import { Column } from './column';
import { ColumnAlignment } from '../enums';
import { ColumnSerialized } from '../interfaces';

export class ActionColumn extends Column {
  readonly type = 'action';

  private _asDropdown: boolean = false;
  private static _defaultAsDropdown: boolean = false;

  static make(header?: string): ActionColumn {
    const instance = new ActionColumn();
    instance['attribute'] = '_actions';
    instance['header'] = header ?? 'Actions';
    instance['_alignment'] = ColumnAlignment.Right;
    instance['_toggleable'] = false;
    instance['_shouldExport'] = false;
    return instance;
  }

  static defaultAsDropdown(value = true): void {
    ActionColumn._defaultAsDropdown = value;
  }

  getAttribute(): string {
    return '_actions';
  }

  asDropdown(value = true): this {
    this._asDropdown = value;
    return this;
  }

  shouldBeExported(): boolean {
    return false;
  }

  toArray(): ColumnSerialized {
    return {
      ...super.toArray(),
      asDropdown: this._asDropdown || ActionColumn._defaultAsDropdown,
    };
  }
}
```

**Step 4: Create barrel export**

```typescript
// index.ts
export { Column } from './column';
export { TextColumn } from './text-column';
export { NumericColumn } from './numeric-column';
export { DateColumn } from './date-column';
export { DateTimeColumn } from './date-time-column';
export { BooleanColumn } from './boolean-column';
export { BadgeColumn } from './badge-column';
export { ImageColumn } from './image-column';
export { ActionColumn } from './action-column';
```

**Step 5: Run tests**

```bash
npx jest src/columns/__tests__/ --no-coverage
```

Expected: PASS

**Step 6: Commit**

```bash
git add .
git commit -m "feat: implement all 9 column types"
```

---

## Phase 4: Backend — Filter System

### Task 7: Implement base Filter class and all filter types

**Files:**
- Create: `backend/src/filters/filter.ts`
- Create: `backend/src/filters/text-filter.ts`
- Create: `backend/src/filters/numeric-filter.ts`
- Create: `backend/src/filters/date-filter.ts`
- Create: `backend/src/filters/boolean-filter.ts`
- Create: `backend/src/filters/set-filter.ts`
- Create: `backend/src/filters/trashed-filter.ts`
- Create: `backend/src/filters/index.ts`
- Test: `backend/src/filters/__tests__/filter.spec.ts`
- Test: `backend/src/filters/__tests__/text-filter.spec.ts`
- Test: `backend/src/filters/__tests__/set-filter.spec.ts`

**Step 1: Write failing tests for base Filter**

```typescript
// filter.spec.ts
import { Filter } from '../filter';
import { Clause } from '../../enums';

class TestFilter extends Filter {
  readonly type = 'test';
  defaultClauses(): Clause[] {
    return [Clause.Equals, Clause.NotEquals];
  }
  apply(qb: any, attribute: string, clause: Clause, value: any): void {}
  validate(value: any, clause: Clause): any { return value; }
}

describe('Filter', () => {
  it('creates with make() factory', () => {
    const filter = TestFilter.make('name');
    expect(filter.getAttribute()).toBe('name');
    expect(filter.getLabel()).toBe('Name');
  });

  it('returns default clauses', () => {
    const filter = TestFilter.make('name');
    expect(filter.getClauses()).toEqual([Clause.Equals, Clause.NotEquals]);
  });

  it('supports custom clauses', () => {
    const filter = TestFilter.make('name').clauses([Clause.Contains]);
    expect(filter.getClauses()).toEqual([Clause.Contains]);
  });

  it('adds nullable clauses', () => {
    const filter = TestFilter.make('name').nullable();
    expect(filter.getClauses()).toContain(Clause.IsSet);
    expect(filter.getClauses()).toContain(Clause.IsNotSet);
  });

  it('detects nested relations', () => {
    const filter = TestFilter.make('department.name');
    expect(filter.isNested()).toBe(true);
    expect(filter.getRelationshipName()).toBe('department');
    expect(filter.getRelationshipColumn()).toBe('name');
  });

  it('serializes to array', () => {
    const result = TestFilter.make('name').toArray();
    expect(result).toMatchObject({
      key: 'name',
      label: 'Name',
      type: 'test',
      clauses: [Clause.Equals, Clause.NotEquals],
    });
  });

  it('supports default values', () => {
    const filter = TestFilter.make('name').default('John', Clause.Equals);
    expect(filter.hasDefaultValue()).toBe(true);
    expect(filter.getDefaultValue()).toBe('John');
    expect(filter.getDefaultClause()).toBe(Clause.Equals);
  });
});
```

**Step 2: Implement base Filter and all filter types**

```typescript
// filter.ts
import { Clause, isWithoutComparisonClause } from '../enums';
import { FilterSerialized, FilterOption } from '../interfaces';

export abstract class Filter {
  abstract readonly type: string;

  protected attribute: string = '';
  protected label: string | null = null;
  protected _clauses: Clause[] | null = null;
  protected _defaultValue: any = undefined;
  protected _defaultClause: Clause | null = null;
  protected _applyUsing: ((qb: any, attribute: string, clause: Clause, value: any) => void) | null = null;
  protected _hidden: boolean = false;

  abstract defaultClauses(): Clause[];
  abstract apply(qb: any, attribute: string, clause: Clause, value: any): void;
  abstract validate(value: any, clause: Clause): any;

  static make(attribute: string, label?: string): any {
    const instance = new (this as any)();
    instance.attribute = attribute;
    instance.label = label ?? null;
    return instance;
  }

  getAttribute(): string {
    return this.attribute;
  }

  getLabel(): string {
    if (this.label) return this.label;
    const column = this.attribute.includes('.') ? this.attribute.split('.').pop()! : this.attribute;
    return column
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  }

  getClauses(): Clause[] {
    return this._clauses ?? this.defaultClauses();
  }

  clauses(clauses: Clause[]): this {
    this._clauses = clauses;
    return this;
  }

  nullable(): this {
    const current = this.getClauses();
    if (!current.includes(Clause.IsSet)) current.push(Clause.IsSet);
    if (!current.includes(Clause.IsNotSet)) current.push(Clause.IsNotSet);
    this._clauses = current;
    return this;
  }

  default(value: any, clause?: Clause): this {
    this._defaultValue = value;
    this._defaultClause = clause ?? null;
    return this;
  }

  hasDefaultValue(): boolean {
    return this._defaultValue !== undefined;
  }

  getDefaultValue(): any {
    return this._defaultValue;
  }

  getDefaultClause(): Clause {
    return this._defaultClause ?? this.getClauses()[0];
  }

  applyUsing(callback: (qb: any, attribute: string, clause: Clause, value: any) => void): this {
    this._applyUsing = callback;
    return this;
  }

  hidden(value: boolean = true): this {
    this._hidden = value;
    return this;
  }

  isHidden(): boolean {
    return this._hidden;
  }

  isNested(): boolean {
    return this.attribute.includes('.');
  }

  getRelationshipName(): string {
    return this.attribute.split('.').slice(0, -1).join('.');
  }

  getRelationshipColumn(): string {
    return this.attribute.split('.').pop()!;
  }

  handle(qb: any, clause: Clause, value: any): void {
    if (clause === Clause.IsSet) {
      qb.andWhere(`${this.attribute} IS NOT NULL`);
      return;
    }
    if (clause === Clause.IsNotSet) {
      qb.andWhere(`${this.attribute} IS NULL`);
      return;
    }
    if (this._applyUsing) {
      this._applyUsing(qb, this.attribute, clause, value);
      return;
    }
    this.apply(qb, this.attribute, clause, value);
  }

  toArray(): FilterSerialized {
    return {
      key: this.attribute,
      label: this.getLabel(),
      type: this.type,
      clauses: this.getClauses(),
      hidden: this._hidden,
      default: this.hasDefaultValue()
        ? { value: this._defaultValue, clause: this.getDefaultClause() }
        : null,
    };
  }
}
```

```typescript
// text-filter.ts
import { Filter } from './filter';
import { Clause } from '../enums';

export class TextFilter extends Filter {
  readonly type = 'text';

  defaultClauses(): Clause[] {
    return [
      Clause.Contains, Clause.NotContains,
      Clause.StartsWith, Clause.EndsWith,
      Clause.NotStartsWith, Clause.NotEndsWith,
      Clause.Equals, Clause.NotEquals,
    ];
  }

  validate(value: any, clause: Clause): any {
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    return null;
  }

  apply(qb: any, attribute: string, clause: Clause, value: any): void {
    const param = `filter_${attribute.replace(/\./g, '_')}_${Date.now()}`;
    switch (clause) {
      case Clause.Contains:
        qb.andWhere(`${attribute} ILIKE :${param}`, { [param]: `%${value}%` });
        break;
      case Clause.NotContains:
        qb.andWhere(`${attribute} NOT ILIKE :${param}`, { [param]: `%${value}%` });
        break;
      case Clause.StartsWith:
        qb.andWhere(`${attribute} ILIKE :${param}`, { [param]: `${value}%` });
        break;
      case Clause.EndsWith:
        qb.andWhere(`${attribute} ILIKE :${param}`, { [param]: `%${value}` });
        break;
      case Clause.NotStartsWith:
        qb.andWhere(`${attribute} NOT ILIKE :${param}`, { [param]: `${value}%` });
        break;
      case Clause.NotEndsWith:
        qb.andWhere(`${attribute} NOT ILIKE :${param}`, { [param]: `%${value}` });
        break;
      case Clause.Equals:
        qb.andWhere(`${attribute} = :${param}`, { [param]: value });
        break;
      case Clause.NotEquals:
        qb.andWhere(`${attribute} != :${param}`, { [param]: value });
        break;
    }
  }
}
```

```typescript
// numeric-filter.ts
import { Filter } from './filter';
import { Clause } from '../enums';

export class NumericFilter extends Filter {
  readonly type = 'numeric';

  defaultClauses(): Clause[] {
    return [
      Clause.Equals, Clause.NotEquals,
      Clause.GreaterThan, Clause.GreaterThanOrEqual,
      Clause.LessThan, Clause.LessThanOrEqual,
      Clause.Between, Clause.NotBetween,
    ];
  }

  validate(value: any, clause: Clause): any {
    if (clause === Clause.Between || clause === Clause.NotBetween) {
      if (!Array.isArray(value) || value.length !== 2) return null;
      const [a, b] = value;
      if (isNaN(Number(a)) || isNaN(Number(b))) return null;
      return [Number(a), Number(b)];
    }
    if (isNaN(Number(value))) return null;
    return Number(value);
  }

  apply(qb: any, attribute: string, clause: Clause, value: any): void {
    const param = `filter_${attribute.replace(/\./g, '_')}_${Date.now()}`;
    switch (clause) {
      case Clause.Equals:
        qb.andWhere(`${attribute} = :${param}`, { [param]: value });
        break;
      case Clause.NotEquals:
        qb.andWhere(`${attribute} != :${param}`, { [param]: value });
        break;
      case Clause.GreaterThan:
        qb.andWhere(`${attribute} > :${param}`, { [param]: value });
        break;
      case Clause.GreaterThanOrEqual:
        qb.andWhere(`${attribute} >= :${param}`, { [param]: value });
        break;
      case Clause.LessThan:
        qb.andWhere(`${attribute} < :${param}`, { [param]: value });
        break;
      case Clause.LessThanOrEqual:
        qb.andWhere(`${attribute} <= :${param}`, { [param]: value });
        break;
      case Clause.Between:
        qb.andWhere(`${attribute} BETWEEN :${param}_min AND :${param}_max`, {
          [`${param}_min`]: value[0],
          [`${param}_max`]: value[1],
        });
        break;
      case Clause.NotBetween:
        qb.andWhere(`${attribute} NOT BETWEEN :${param}_min AND :${param}_max`, {
          [`${param}_min`]: value[0],
          [`${param}_max`]: value[1],
        });
        break;
    }
  }
}
```

```typescript
// date-filter.ts
import { Filter } from './filter';
import { Clause } from '../enums';

export class DateFilter extends Filter {
  readonly type = 'date';

  defaultClauses(): Clause[] {
    return [
      Clause.Before, Clause.After,
      Clause.EqualOrBefore, Clause.EqualOrAfter,
      Clause.Equals, Clause.NotEquals,
      Clause.Between, Clause.NotBetween,
    ];
  }

  validate(value: any, clause: Clause): any {
    if (clause === Clause.Between || clause === Clause.NotBetween) {
      if (!Array.isArray(value) || value.length !== 2) return null;
      const [a, b] = value.map((v: any) => this.parseDate(v));
      if (!a || !b) return null;
      return [a, b];
    }
    return this.parseDate(value);
  }

  private parseDate(value: any): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  }

  apply(qb: any, attribute: string, clause: Clause, value: any): void {
    const param = `filter_${attribute.replace(/\./g, '_')}_${Date.now()}`;
    switch (clause) {
      case Clause.Before:
        qb.andWhere(`${attribute} < :${param}`, { [param]: value });
        break;
      case Clause.After:
        qb.andWhere(`${attribute} > :${param}`, { [param]: value });
        break;
      case Clause.EqualOrBefore:
        qb.andWhere(`${attribute} <= :${param}`, { [param]: value });
        break;
      case Clause.EqualOrAfter:
        qb.andWhere(`${attribute} >= :${param}`, { [param]: value });
        break;
      case Clause.Equals:
        qb.andWhere(`DATE(${attribute}) = :${param}`, { [param]: value });
        break;
      case Clause.NotEquals:
        qb.andWhere(`DATE(${attribute}) != :${param}`, { [param]: value });
        break;
      case Clause.Between:
        qb.andWhere(`${attribute} BETWEEN :${param}_min AND :${param}_max`, {
          [`${param}_min`]: value[0],
          [`${param}_max`]: value[1],
        });
        break;
      case Clause.NotBetween:
        qb.andWhere(`${attribute} NOT BETWEEN :${param}_min AND :${param}_max`, {
          [`${param}_min`]: value[0],
          [`${param}_max`]: value[1],
        });
        break;
    }
  }
}
```

```typescript
// boolean-filter.ts
import { Filter } from './filter';
import { Clause } from '../enums';

export class BooleanFilter extends Filter {
  readonly type = 'boolean';

  defaultClauses(): Clause[] {
    return [Clause.IsTrue, Clause.IsFalse];
  }

  validate(value: any, clause: Clause): any {
    return null; // No value needed for IsTrue/IsFalse
  }

  default(value: boolean, clause?: Clause): this {
    this._defaultValue = null;
    this._defaultClause = clause ?? (value ? Clause.IsTrue : Clause.IsFalse);
    return this;
  }

  apply(qb: any, attribute: string, clause: Clause, value: any): void {
    const param = `filter_${attribute.replace(/\./g, '_')}_${Date.now()}`;
    switch (clause) {
      case Clause.IsTrue:
        qb.andWhere(`${attribute} = :${param}`, { [param]: true });
        break;
      case Clause.IsFalse:
        qb.andWhere(`${attribute} = :${param}`, { [param]: false });
        break;
    }
  }
}
```

```typescript
// set-filter.ts
import { Filter } from './filter';
import { Clause } from '../enums';
import { FilterOption, FilterSerialized } from '../interfaces';

export class SetFilter extends Filter {
  readonly type = 'set';

  private _options: FilterOption[] = [];
  private _multiple: boolean = true;

  defaultClauses(): Clause[] {
    return [Clause.In, Clause.NotIn, Clause.Equals, Clause.NotEquals];
  }

  options(options: FilterOption[] | Record<string, string>): this {
    if (Array.isArray(options)) {
      this._options = options;
    } else {
      this._options = Object.entries(options).map(([value, label]) => ({ value, label }));
    }
    return this;
  }

  multiple(value = true): this {
    this._multiple = value;
    return this;
  }

  withoutClause(): this {
    this._clauses = [Clause.Equals];
    return this;
  }

  getOptions(): FilterOption[] {
    return this._options;
  }

  isMultiple(): boolean {
    return this._multiple;
  }

  validate(value: any, clause: Clause): any {
    if (clause === Clause.In || clause === Clause.NotIn) {
      if (!Array.isArray(value)) return [String(value)];
      return value.filter((v: any) => typeof v === 'string' || typeof v === 'number').map(String);
    }
    return String(value);
  }

  apply(qb: any, attribute: string, clause: Clause, value: any): void {
    const param = `filter_${attribute.replace(/\./g, '_')}_${Date.now()}`;
    switch (clause) {
      case Clause.In:
        qb.andWhere(`${attribute} IN (:...${param})`, { [param]: value });
        break;
      case Clause.NotIn:
        qb.andWhere(`${attribute} NOT IN (:...${param})`, { [param]: value });
        break;
      case Clause.Equals:
        qb.andWhere(`${attribute} = :${param}`, { [param]: value });
        break;
      case Clause.NotEquals:
        qb.andWhere(`${attribute} != :${param}`, { [param]: value });
        break;
    }
  }

  toArray(): FilterSerialized {
    return {
      ...super.toArray(),
      options: this._options,
      multiple: this._multiple,
    };
  }
}
```

```typescript
// trashed-filter.ts
import { SetFilter } from './set-filter';
import { Clause } from '../enums';

export class TrashedFilter extends SetFilter {
  static make(attribute = 'trashed', label = 'Trashed'): TrashedFilter {
    const instance = new TrashedFilter();
    instance['attribute'] = attribute;
    instance['label'] = label;
    instance.options([
      { value: 'without_trashed', label: 'Without trashed' },
      { value: 'with_trashed', label: 'With trashed' },
      { value: 'only_trashed', label: 'Only trashed' },
    ]);
    instance.withoutClause();
    instance.applyUsing((qb, _attr, _clause, value) => {
      switch (value) {
        case 'with_trashed':
        case 'all':
          // Remove the default deletedAt IS NULL condition
          qb.withDeleted();
          break;
        case 'only_trashed':
          qb.withDeleted();
          qb.andWhere('entity.deletedAt IS NOT NULL');
          break;
        case 'without_trashed':
        default:
          // Default behavior — deletedAt IS NULL already applied by TypeORM
          break;
      }
    });
    return instance;
  }
}
```

```typescript
// index.ts
export { Filter } from './filter';
export { TextFilter } from './text-filter';
export { NumericFilter } from './numeric-filter';
export { DateFilter } from './date-filter';
export { BooleanFilter } from './boolean-filter';
export { SetFilter } from './set-filter';
export { TrashedFilter } from './trashed-filter';
```

**Step 3: Run tests**

```bash
npx jest src/filters/__tests__/ --no-coverage
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: implement filter system with all 7 filter types and 24 clauses"
```

---

## Phase 5: Backend — Action, Export, EmptyState, BaseTable

### Task 8: Implement Action and Export builders

**Files:**
- Create: `backend/src/action.ts`
- Create: `backend/src/export.ts`
- Create: `backend/src/empty-state.ts`
- Test: `backend/src/action.spec.ts`
- Test: `backend/src/export.spec.ts`

Reference: `/Users/karthickk/kkprojects/table-module/src/Action.php` and `/Users/karthickk/kkprojects/table-module/src/Export.php`

The Action class should mirror the Laravel version's chainable API: `Action.make('delete').asButton().variant(Variant.Destructive).confirm({...}).handle(async (row, repo) => ...)`. The Export class mirrors: `Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx)`.

Include full builder methods for: name, label, type (button/link), variant, icon, confirm dialog, authorization, before/after/handle callbacks, bulk flag, disabled/hidden conditions, url resolver, download flag, data attributes, meta.

**Step 1: Write failing tests and implement. Full code is provided in the Action/Export source files referenced above — port all methods.**

**Step 2: Commit**

```bash
git add .
git commit -m "feat: implement Action, Export, and EmptyState builders"
```

---

### Task 9: Implement BaseTable, @TableConfig decorator, and TableRegistry

**Files:**
- Create: `backend/src/base-table.ts`
- Create: `backend/src/decorators/table-config.decorator.ts`
- Create: `backend/src/table-registry.ts`
- Test: `backend/src/base-table.spec.ts`

**Step 1: Implement @TableConfig decorator**

```typescript
// decorators/table-config.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { TableConfigOptions } from '../interfaces';

export const TABLE_CONFIG_KEY = 'TABLE_CONFIG';

export function TableConfig(options: TableConfigOptions): ClassDecorator {
  return SetMetadata(TABLE_CONFIG_KEY, options);
}
```

**Step 2: Implement BaseTable**

```typescript
// base-table.ts — abstract class that users extend
// Must provide: columns(), filters(), actions(), exports(), emptyState()
// Reads config from @TableConfig decorator metadata
// Serializes to TableResponse format for the API
// Handles soft delete auto-detection and auto-actions
```

Reference: `/Users/karthickk/kkprojects/table-module/src/Table.php` — port the column/filter/action/export management, soft delete trait logic, serialization to `toMeta()` method.

Key differences from Laravel:
- No Inertia integration — just returns JSON
- No base64 class names — uses TableRegistry
- No signed URLs — uses NestJS guards
- No encrypted state — NestJS keeps state in memory

**Step 3: Implement TableRegistry**

```typescript
// table-registry.ts
import { Injectable } from '@nestjs/common';
import { BaseTable } from './base-table';

@Injectable()
export class TableRegistry {
  private tables = new Map<string, BaseTable<any>>();

  register(name: string, table: BaseTable<any>): void {
    this.tables.set(name, table);
  }

  get(name: string): BaseTable<any> | undefined {
    return this.tables.get(name);
  }

  has(name: string): boolean {
    return this.tables.has(name);
  }
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: implement BaseTable, @TableConfig decorator, and TableRegistry"
```

---

## Phase 6: Backend — Query Service & DTOs

### Task 10: Implement TableQueryDto and TableQueryService

**Files:**
- Create: `backend/src/dto/table-query.dto.ts`
- Create: `backend/src/dto/action-request.dto.ts`
- Create: `backend/src/dto/export-request.dto.ts`
- Create: `backend/src/dto/view.dto.ts`
- Create: `backend/src/services/table-query.service.ts`
- Test: `backend/src/services/__tests__/table-query.service.spec.ts`

**Step 1: Create DTOs**

```typescript
// dto/table-query.dto.ts
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class TableQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 15;

  @IsOptional()
  @IsString()
  sort?: string; // "column:asc" or "column:desc"

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return value; }
    }
    return value;
  })
  filters?: Record<string, Record<string, string>>;

  @IsOptional()
  @IsString()
  columns?: string; // comma-separated visible column keys
}

// dto/action-request.dto.ts
import { IsOptional, IsString, IsArray } from 'class-validator';

export class ActionRequestDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsArray()
  ids?: string[];
}

// dto/export-request.dto.ts
import { IsOptional, IsArray, IsString } from 'class-validator';

export class ExportRequestDto {
  @IsOptional()
  @IsArray()
  selectedIds?: string[];

  @IsOptional()
  @IsString()
  columns?: string;
}

// dto/view.dto.ts
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class StoreViewDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  requestPayload: Record<string, any>;
}

export class DeleteViewDto {
  @IsOptional()
  @IsString()
  id?: string;
}
```

**Step 2: Implement TableQueryService**

This is the core engine. Reference: `/Users/karthickk/kkprojects/table-module/src/QueryBuilder.php`

```typescript
// services/table-query.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { BaseTable } from '../base-table';
import { TableQueryDto } from '../dto/table-query.dto';
import { TableResponse, PaginationData } from '../interfaces';
import { PaginationType, SortDirection, Clause } from '../enums';
import { Column } from '../columns';
import { Filter } from '../filters';

@Injectable()
export class TableQueryService {
  constructor(private dataSource: DataSource) {}

  async execute<T>(table: BaseTable<T>, query: TableQueryDto): Promise<TableResponse<T>> {
    const config = table.getConfig();
    const repo = this.dataSource.getRepository(config.resource);
    const qb = repo.createQueryBuilder('entity');

    // 1. Apply eager loading for nested columns
    this.applyEagerLoading(qb, table);

    // 2. Apply soft delete scope
    if (!config.softDeletes) {
      // TypeORM handles this automatically with @DeleteDateColumn
    }

    // 3. Apply global search
    if (query.search) {
      this.applySearch(qb, table, query.search);
    }

    // 4. Apply filters
    if (query.filters) {
      this.applyFilters(qb, table, query.filters);
    }

    // 5. Apply sorting
    this.applySort(qb, table, query.sort);

    // 6. Paginate and return
    const pagination = await this.paginate(qb, table, query);
    const meta = table.toMeta();

    // 7. Transform data through column mappers
    const data = pagination.data.map((item: any) =>
      this.transformItem(item, table),
    );

    return {
      meta,
      data,
      pagination: pagination.paginationData,
    };
  }

  private applyEagerLoading(qb: SelectQueryBuilder<any>, table: BaseTable<any>): void {
    const relations = new Set<string>();
    for (const column of table.getColumns()) {
      if (column.isNested()) {
        relations.add(column.getRelationshipName());
      }
    }
    for (const filter of table.getFilters()) {
      if (filter.isNested()) {
        relations.add(filter.getRelationshipName());
      }
    }
    for (const relation of relations) {
      qb.leftJoinAndSelect(`entity.${relation}`, relation);
    }
  }

  private applySearch(qb: SelectQueryBuilder<any>, table: BaseTable<any>, search: string): void {
    const searchableColumns = table.getColumns().filter((c) => c.isSearchable());
    const config = table.getConfig();
    const searchableFields = config.searchable ?? [];
    const allSearchable = [
      ...searchableColumns.map((c) => c.getAttribute()),
      ...searchableFields,
    ];

    if (allSearchable.length === 0) return;

    const conditions = allSearchable.map((attr, i) => {
      const col = attr.includes('.')
        ? `${attr.split('.')[0]}.${attr.split('.')[1]}`
        : `entity.${attr}`;
      return `${col} ILIKE :search_${i}`;
    });

    const params: Record<string, string> = {};
    allSearchable.forEach((_, i) => {
      params[`search_${i}`] = `%${search}%`;
    });

    qb.andWhere(`(${conditions.join(' OR ')})`, params);
  }

  private applyFilters(
    qb: SelectQueryBuilder<any>,
    table: BaseTable<any>,
    filters: Record<string, Record<string, string>>,
  ): void {
    const tableFilters = table.getFilters();

    for (const [key, clauseMap] of Object.entries(filters)) {
      const filter = tableFilters.find((f) => f.getAttribute() === key);
      if (!filter) continue;

      for (const [clauseStr, value] of Object.entries(clauseMap)) {
        const clause = clauseStr as Clause;
        if (!filter.getClauses().includes(clause)) continue;

        const validated = filter.validate(value, clause);
        if (validated === null && !isWithoutComparisonClause(clause)) continue;

        const attr = filter.isNested()
          ? `${filter.getRelationshipName()}.${filter.getRelationshipColumn()}`
          : `entity.${filter.getAttribute()}`;

        filter.handle(qb, clause, validated);
      }
    }
  }

  private applySort(qb: SelectQueryBuilder<any>, table: BaseTable<any>, sort?: string): void {
    const config = table.getConfig();

    if (sort) {
      const [column, direction] = sort.split(':');
      const col = table.getColumns().find((c) => c.getAttribute() === column);
      if (col?.isSortable()) {
        const customSort = col.getSortUsing();
        if (customSort) {
          customSort(qb, direction, col);
        } else {
          const attr = col.isNested()
            ? `${col.getRelationshipName()}.${col.getRelationshipColumn()}`
            : `entity.${col.getAttribute()}`;
          qb.orderBy(attr, direction.toUpperCase() as 'ASC' | 'DESC');
        }
        return;
      }
    }

    // Default sort
    if (config.defaultSort) {
      qb.orderBy(
        `entity.${config.defaultSort.column}`,
        config.defaultSort.direction.toUpperCase() as 'ASC' | 'DESC',
      );
    }
  }

  private async paginate(
    qb: SelectQueryBuilder<any>,
    table: BaseTable<any>,
    query: TableQueryDto,
  ): Promise<{ data: any[]; paginationData: PaginationData }> {
    const config = table.getConfig();
    const page = query.page ?? 1;
    const perPage = query.limit ?? config.defaultPerPage ?? 15;
    const paginationType = config.pagination ?? PaginationType.Full;

    if (paginationType === PaginationType.Cursor) {
      // Cursor pagination — simplified implementation
      const data = await qb.take(perPage + 1).getMany();
      const hasMore = data.length > perPage;
      if (hasMore) data.pop();

      return {
        data,
        paginationData: {
          type: PaginationType.Cursor,
          currentPage: page,
          lastPage: 0,
          perPage,
          total: 0,
          from: 0,
          to: data.length,
          nextCursor: hasMore ? 'next' : null,
          previousCursor: page > 1 ? 'prev' : null,
        },
      };
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getMany();

    const lastPage = Math.ceil(total / perPage);
    const from = total > 0 ? (page - 1) * perPage + 1 : 0;
    const to = Math.min(page * perPage, total);

    return {
      data,
      paginationData: {
        type: paginationType,
        currentPage: page,
        lastPage,
        perPage,
        total,
        from,
        to,
      },
    };
  }

  private transformItem(item: any, table: BaseTable<any>): Record<string, any> {
    const result: Record<string, any> = { id: item.id };

    for (const column of table.getColumns()) {
      if (column.getAttribute() === '_actions') continue;
      const rawValue = column.getDataFromItem(item);
      result[column.getAttribute()] = column.mapForTable(rawValue, item);
    }

    // Resolve row action URLs
    const rowActions = table.getRowActions();
    if (rowActions.length > 0) {
      result._actions = rowActions.map((action) => ({
        ...action.toArray(),
        url: action.resolveUrl(item),
        disabled: action.isDisabledFor(item),
        hidden: action.isHiddenFor(item),
      }));
    }

    return result;
  }
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: implement TableQueryService with filtering, sorting, search, and pagination"
```

---

## Phase 7: Backend — Controllers & Entities

### Task 11: Implement TypeORM entities and migrations

**Files:**
- Create: `backend/src/entities/table-view.entity.ts`
- Create: `backend/src/entities/export-job.entity.ts`

**Step 1: Create entities following boilerplate patterns**

```typescript
// entities/table-view.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('table_views')
export class TableViewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number;

  @Column()
  tableClass: string;

  @Column({ nullable: true })
  tableName: string;

  @Column()
  title: string;

  @Column({ type: 'jsonb' })
  requestPayload: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// entities/export-job.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn,
} from 'typeorm';
import { ExportFormat } from '../enums';

@Entity('export_jobs')
export class ExportJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tableClass: string;

  @Column()
  exportName: string;

  @Column()
  fileName: string;

  @Column({ type: 'enum', enum: ExportFormat })
  format: ExportFormat;

  @Column({ type: 'jsonb' })
  queryState: Record<string, any>;

  @Column({ nullable: true })
  selectedIds: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 0 })
  progress: number;

  @Column({ nullable: true })
  filePath: string;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add TableView and ExportJob TypeORM entities"
```

---

### Task 12: Implement controllers

**Files:**
- Create: `backend/src/controllers/table-action.controller.ts`
- Create: `backend/src/controllers/table-export.controller.ts`
- Create: `backend/src/controllers/table-view.controller.ts`
- Create: `backend/src/services/table-export.service.ts`
- Create: `backend/src/services/table-view.service.ts`
- Create: `backend/src/services/table-sse.service.ts`

**Step 1: Implement all controllers and services**

Controllers follow the boilerplate pattern: thin controllers delegating to services, with DTOs for validation and guards for authorization.

```typescript
// controllers/table-action.controller.ts
import { Controller, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TableRegistry } from '../table-registry';
import { ActionRequestDto } from '../dto/action-request.dto';

@Controller('table')
@UseGuards(AuthGuard('jwt'))
export class TableActionController {
  constructor(private registry: TableRegistry) {}

  @Post('action/:tableClass/:actionName')
  async execute(
    @Param('tableClass') tableClass: string,
    @Param('actionName') actionName: string,
    @Body() body: ActionRequestDto,
    @Req() req: any,
  ) {
    const table = this.registry.get(tableClass);
    if (!table) throw new Error(`Table ${tableClass} not found`);

    const allActions = [...table.getRowActions(), ...table.getBulkActions()];
    const action = allActions.find((a) => a.getName() === actionName);
    if (!action) throw new Error(`Action ${actionName} not found`);

    // Check authorization
    if (!action.isAuthorized(req.user)) {
      throw new Error('Unauthorized');
    }

    // Execute
    const result = await action.execute(body.id ?? body.ids, this.registry);
    return result;
  }
}
```

```typescript
// controllers/table-export.controller.ts
import {
  Controller, Post, Get, Param, Query, Res, Sse, UseGuards, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { TableRegistry } from '../table-registry';
import { TableExportService } from '../services/table-export.service';
import { TableSseService } from '../services/table-sse.service';
import { ExportRequestDto } from '../dto/export-request.dto';
import { TableQueryDto } from '../dto/table-query.dto';

@Controller('table')
@UseGuards(AuthGuard('jwt'))
export class TableExportController {
  constructor(
    private registry: TableRegistry,
    private exportService: TableExportService,
    private sseService: TableSseService,
  ) {}

  @Post('export/:tableClass/:exportName')
  async trigger(
    @Param('tableClass') tableClass: string,
    @Param('exportName') exportName: string,
    @Query() query: TableQueryDto,
    @Body() body: ExportRequestDto,
    @Req() req: any,
  ) {
    const table = this.registry.get(tableClass);
    if (!table) throw new Error(`Table ${tableClass} not found`);

    const job = await this.exportService.createJob(
      table, exportName, query, body, req.user.id,
    );

    // Start async export (not awaited)
    this.exportService.processExport(job.id).catch(() => {});

    return { jobId: job.id };
  }

  @Sse('export/stream/:jobId')
  stream(@Param('jobId') jobId: string): Observable<MessageEvent> {
    return this.sseService.getStream(jobId);
  }

  @Get('export/download/:jobId')
  async download(
    @Param('jobId') jobId: string,
    @Res() res: Response,
  ) {
    const job = await this.exportService.getJob(jobId);
    if (!job || job.status !== 'completed') {
      return res.status(404).json({ message: 'Export not ready' });
    }
    return res.download(job.filePath, job.fileName);
  }
}
```

```typescript
// controllers/table-view.controller.ts
import {
  Controller, Post, Get, Delete, Param, Body, UseGuards, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TableViewService } from '../services/table-view.service';
import { StoreViewDto } from '../dto/view.dto';

@Controller('table/views')
@UseGuards(AuthGuard('jwt'))
export class TableViewController {
  constructor(private viewService: TableViewService) {}

  @Get(':tableClass')
  async list(
    @Param('tableClass') tableClass: string,
    @Req() req: any,
  ) {
    return this.viewService.findByUser(tableClass, req.user.id);
  }

  @Post(':tableClass')
  async store(
    @Param('tableClass') tableClass: string,
    @Body() body: StoreViewDto,
    @Req() req: any,
  ) {
    return this.viewService.create(tableClass, body, req.user.id);
  }

  @Delete(':tableClass/:id')
  async destroy(
    @Param('tableClass') tableClass: string,
    @Param('id') id: number,
    @Req() req: any,
  ) {
    return this.viewService.delete(tableClass, id, req.user.id);
  }
}
```

```typescript
// services/table-view.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableViewEntity } from '../entities/table-view.entity';
import { StoreViewDto } from '../dto/view.dto';

@Injectable()
export class TableViewService {
  constructor(
    @InjectRepository(TableViewEntity)
    private viewRepo: Repository<TableViewEntity>,
  ) {}

  async findByUser(tableClass: string, userId: number) {
    return this.viewRepo.find({
      where: { tableClass, userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(tableClass: string, dto: StoreViewDto, userId: number) {
    const view = this.viewRepo.create({
      tableClass,
      userId,
      title: dto.title,
      requestPayload: dto.requestPayload,
    });
    return this.viewRepo.save(view);
  }

  async delete(tableClass: string, id: number, userId: number) {
    await this.viewRepo.delete({ id, tableClass, userId });
    return { success: true };
  }
}
```

```typescript
// services/table-sse.service.ts
import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

interface ExportEvent {
  jobId: string;
  status: string;
  progress: number;
  downloadUrl?: string;
  error?: string;
}

@Injectable()
export class TableSseService {
  private events$ = new Subject<ExportEvent>();

  emit(event: ExportEvent): void {
    this.events$.next(event);
  }

  getStream(jobId: string): Observable<MessageEvent> {
    return this.events$.pipe(
      filter((e) => e.jobId === jobId),
      map((e) => ({
        data: JSON.stringify({
          status: e.status,
          progress: e.progress,
          downloadUrl: e.downloadUrl,
          error: e.error,
        }),
      }) as MessageEvent),
    );
  }
}
```

```typescript
// services/table-export.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ExportJobEntity } from '../entities/export-job.entity';
import { TableSseService } from './table-sse.service';
import { TableRegistry } from '../table-registry';
import { TableQueryService } from './table-query.service';
import { ExportFormat } from '../enums';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TableExportService {
  constructor(
    @InjectRepository(ExportJobEntity)
    private jobRepo: Repository<ExportJobEntity>,
    private sseService: TableSseService,
    private registry: TableRegistry,
    private queryService: TableQueryService,
    private dataSource: DataSource,
  ) {}

  async createJob(table: any, exportName: string, query: any, body: any, userId: number) {
    const exportDef = table.getExports().find((e: any) => e.getName() === exportName);
    if (!exportDef) throw new Error(`Export ${exportName} not found`);

    const job = this.jobRepo.create({
      tableClass: table.getRegistryName(),
      exportName,
      fileName: exportDef.getFileName(),
      format: exportDef.getFormat(),
      queryState: query,
      selectedIds: body.selectedIds?.join(',') ?? null,
      status: 'pending',
      userId,
    });

    return this.jobRepo.save(job);
  }

  async getJob(jobId: string) {
    return this.jobRepo.findOneBy({ id: jobId });
  }

  async processExport(jobId: string) {
    const job = await this.jobRepo.findOneBy({ id: jobId });
    if (!job) return;

    try {
      job.status = 'processing';
      await this.jobRepo.save(job);
      this.sseService.emit({ jobId, status: 'processing', progress: 0 });

      const table = this.registry.get(job.tableClass);
      if (!table) throw new Error('Table not found');

      // Fetch all data (no pagination for exports)
      const config = table.getConfig();
      const repo = this.dataSource.getRepository(config.resource);
      const qb = repo.createQueryBuilder('entity');
      // Apply filters from queryState... (reuse query service logic)
      const data = await qb.getMany();

      this.sseService.emit({ jobId, status: 'processing', progress: 50 });

      // Generate file based on format
      const exportDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });
      const filePath = path.join(exportDir, `${jobId}-${job.fileName}`);

      if (job.format === ExportFormat.Xlsx || job.format === ExportFormat.Csv) {
        await this.generateSpreadsheet(table, data, filePath, job.format);
      } else if (job.format === ExportFormat.Pdf) {
        await this.generatePdf(table, data, filePath);
      }

      job.status = 'completed';
      job.progress = 100;
      job.filePath = filePath;
      await this.jobRepo.save(job);

      this.sseService.emit({
        jobId,
        status: 'completed',
        progress: 100,
        downloadUrl: `/table/export/download/${jobId}`,
      });
    } catch (error: any) {
      job.status = 'failed';
      await this.jobRepo.save(job);
      this.sseService.emit({
        jobId,
        status: 'failed',
        progress: 0,
        error: error.message,
      });
    }
  }

  private async generateSpreadsheet(table: any, data: any[], filePath: string, format: ExportFormat) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Data');

    const columns = table.getColumns().filter((c: any) => c.shouldBeExported());
    sheet.columns = columns.map((col: any) => ({
      header: col.getHeader(),
      key: col.getAttribute(),
      width: 20,
    }));

    for (const item of data) {
      const row: Record<string, any> = {};
      for (const col of columns) {
        row[col.getAttribute()] = col.mapForExport(col.getDataFromItem(item), item);
      }
      sheet.addRow(row);
    }

    if (format === ExportFormat.Csv) {
      await workbook.csv.writeFile(filePath);
    } else {
      await workbook.xlsx.writeFile(filePath);
    }
  }

  private async generatePdf(table: any, data: any[], filePath: string) {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const columns = table.getColumns().filter((c: any) => c.shouldBeExported());

    // Header
    doc.fontSize(10).font('Helvetica-Bold');
    let x = 30;
    for (const col of columns) {
      doc.text(col.getHeader(), x, 30, { width: 100 });
      x += 110;
    }

    // Rows
    doc.font('Helvetica').fontSize(9);
    let y = 50;
    for (const item of data) {
      x = 30;
      for (const col of columns) {
        const value = col.mapForExport(col.getDataFromItem(item), item);
        doc.text(String(value ?? ''), x, y, { width: 100 });
        x += 110;
      }
      y += 15;
      if (y > 550) {
        doc.addPage();
        y = 30;
      }
    }

    doc.end();
    await new Promise((resolve) => stream.on('finish', resolve));
  }
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: implement controllers for actions, exports (SSE), and saved views"
```

---

### Task 13: Implement TableModule

**Files:**
- Create: `backend/src/table.module.ts`
- Create: `backend/src/index.ts`

**Step 1: Create the NestJS module**

```typescript
// table.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableViewEntity } from './entities/table-view.entity';
import { ExportJobEntity } from './entities/export-job.entity';
import { TableQueryService } from './services/table-query.service';
import { TableExportService } from './services/table-export.service';
import { TableViewService } from './services/table-view.service';
import { TableSseService } from './services/table-sse.service';
import { TableActionController } from './controllers/table-action.controller';
import { TableExportController } from './controllers/table-export.controller';
import { TableViewController } from './controllers/table-view.controller';
import { TableRegistry } from './table-registry';
import { BaseTable } from './base-table';

@Module({})
export class TableModule {
  static forRoot(tables?: BaseTable<any>[]): DynamicModule {
    return {
      module: TableModule,
      imports: [
        TypeOrmModule.forFeature([TableViewEntity, ExportJobEntity]),
      ],
      controllers: [
        TableActionController,
        TableExportController,
        TableViewController,
      ],
      providers: [
        TableQueryService,
        TableExportService,
        TableViewService,
        TableSseService,
        TableRegistry,
        {
          provide: 'TABLE_REGISTRATIONS',
          useFactory: (registry: TableRegistry) => {
            if (tables) {
              for (const table of tables) {
                registry.register(table.getRegistryName(), table);
              }
            }
          },
          inject: [TableRegistry],
        },
      ],
      exports: [
        TableQueryService,
        TableRegistry,
        TableSseService,
      ],
    };
  }
}
```

```typescript
// index.ts — barrel export for the entire backend package
export { TableModule } from './table.module';
export { BaseTable } from './base-table';
export { TableConfig } from './decorators/table-config.decorator';
export { TableQueryService } from './services/table-query.service';
export { TableRegistry } from './table-registry';
export { TableQueryDto } from './dto/table-query.dto';
export * from './columns';
export * from './filters';
export * from './enums';
export * from './interfaces';
export { Action } from './action';
export { Export } from './export';
export { EmptyState } from './empty-state';
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: implement TableModule with forRoot() registration"
```

---

## Phase 8: Frontend — Types & Composables

### Task 14: Create shared TypeScript types for frontend

**Files:**
- Create: `frontend/src/types/table.ts`
- Create: `frontend/src/types/column.ts`
- Create: `frontend/src/types/filter.ts`
- Create: `frontend/src/types/action.ts`
- Create: `frontend/src/types/pagination.ts`
- Create: `frontend/src/types/index.ts`

**Step 1: Create types that mirror the backend response contract**

These types should match the `TableResponse`, `TableMeta`, `ColumnSerialized`, `FilterSerialized`, `ActionSerialized`, `PaginationData` interfaces from the backend exactly. Reference: backend `interfaces/` directory.

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add shared TypeScript types for frontend"
```

---

### Task 15: Implement useTable composable

**Files:**
- Create: `frontend/src/composables/useTable.ts`
- Create: `frontend/src/composables/useFilters.ts`
- Create: `frontend/src/composables/useActions.ts`
- Create: `frontend/src/composables/useExport.ts`
- Create: `frontend/src/composables/useStickyTable.ts`
- Create: `frontend/src/composables/index.ts`

**Step 1: Implement useTable**

Reference: `/Users/karthickk/kkprojects/table-module/resources/js/useTable.ts`

```typescript
// composables/useTable.ts
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { TableResponse, TableMeta, PaginationData } from '../types';

export interface UseTableOptions {
  defaultPerPage?: number;
  debounce?: number;
  syncUrl?: boolean;
}

export function useTable<T = any>(endpoint: string, options: UseTableOptions = {}) {
  const router = useRouter();
  const route = useRoute();

  const data = ref<T[]>([]);
  const meta = ref<TableMeta | null>(null);
  const pagination = ref<PaginationData | null>(null);
  const isLoading = ref(false);
  const isEmpty = computed(() => !isLoading.value && data.value.length === 0);

  // State
  const currentPage = ref(1);
  const perPage = ref(options.defaultPerPage ?? 15);
  const sortColumn = ref<string | null>(null);
  const sortDirection = ref<'asc' | 'desc'>('asc');
  const search = ref('');
  const activeFilters = reactive<Record<string, Record<string, string>>>({});
  const visibleColumns = ref<string[]>([]);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Initialize from URL
  function initFromUrl() {
    if (!options.syncUrl) return;
    const q = route.query;
    if (q.page) currentPage.value = Number(q.page);
    if (q.limit) perPage.value = Number(q.limit);
    if (q.sort) {
      const [col, dir] = String(q.sort).split(':');
      sortColumn.value = col;
      sortDirection.value = dir as 'asc' | 'desc';
    }
    if (q.search) search.value = String(q.search);
    // Parse filters from URL
    for (const [key, val] of Object.entries(q)) {
      if (key.startsWith('filters[')) {
        const match = key.match(/filters\[(\w+)]\[(\w+)]/);
        if (match) {
          const [, filterKey, clause] = match;
          if (!activeFilters[filterKey]) activeFilters[filterKey] = {};
          activeFilters[filterKey][clause] = String(val);
        }
      }
    }
  }

  // Build query params
  function buildParams(): Record<string, any> {
    const params: Record<string, any> = {
      page: currentPage.value,
      limit: perPage.value,
    };
    if (sortColumn.value) {
      params.sort = `${sortColumn.value}:${sortDirection.value}`;
    }
    if (search.value) {
      params.search = search.value;
    }
    if (Object.keys(activeFilters).length > 0) {
      params.filters = activeFilters;
    }
    if (visibleColumns.value.length > 0) {
      params.columns = visibleColumns.value.join(',');
    }
    return params;
  }

  // Sync to URL
  function syncToUrl() {
    if (!options.syncUrl) return;
    const params = buildParams();
    const query: Record<string, string> = {};
    query.page = String(params.page);
    query.limit = String(params.limit);
    if (params.sort) query.sort = params.sort;
    if (params.search) query.search = params.search;
    if (params.filters) {
      for (const [key, clauseMap] of Object.entries(params.filters as Record<string, Record<string, string>>)) {
        for (const [clause, value] of Object.entries(clauseMap)) {
          query[`filters[${key}][${clause}]`] = value;
        }
      }
    }
    router.replace({ query });
  }

  // Fetch data
  async function fetchData() {
    isLoading.value = true;
    try {
      const params = buildParams();
      const queryString = new URLSearchParams();

      queryString.set('page', String(params.page));
      queryString.set('limit', String(params.limit));
      if (params.sort) queryString.set('sort', params.sort);
      if (params.search) queryString.set('search', params.search);
      if (params.filters) {
        for (const [key, clauseMap] of Object.entries(params.filters as Record<string, Record<string, string>>)) {
          for (const [clause, value] of Object.entries(clauseMap)) {
            queryString.set(`filters[${key}][${clause}]`, value);
          }
        }
      }

      const response = await fetch(`${endpoint}?${queryString.toString()}`);
      const result: TableResponse<T> = await response.json();

      data.value = result.data;
      meta.value = result.meta;
      pagination.value = result.pagination;
    } catch (error) {
      console.error('Failed to fetch table data:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function debouncedFetch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      syncToUrl();
      fetchData();
    }, options.debounce ?? 300);
  }

  // Public methods
  function setPage(page: number) {
    currentPage.value = page;
    syncToUrl();
    fetchData();
  }

  function setPerPage(value: number) {
    perPage.value = value;
    currentPage.value = 1;
    syncToUrl();
    fetchData();
  }

  function setSort(column: string) {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn.value = column;
      sortDirection.value = 'asc';
    }
    currentPage.value = 1;
    syncToUrl();
    fetchData();
  }

  function setSearch(value: string) {
    search.value = value;
    currentPage.value = 1;
    debouncedFetch();
  }

  function addFilter(key: string, clause: string, value: string) {
    if (!activeFilters[key]) activeFilters[key] = {};
    activeFilters[key][clause] = value;
    currentPage.value = 1;
    debouncedFetch();
  }

  function removeFilter(key: string) {
    delete activeFilters[key];
    currentPage.value = 1;
    debouncedFetch();
  }

  function updateFilter(key: string, clause: string, value: string) {
    activeFilters[key] = { [clause]: value };
    currentPage.value = 1;
    debouncedFetch();
  }

  function toggleColumn(key: string) {
    const idx = visibleColumns.value.indexOf(key);
    if (idx >= 0) {
      visibleColumns.value.splice(idx, 1);
    } else {
      visibleColumns.value.push(key);
    }
  }

  function refresh() {
    fetchData();
  }

  onMounted(() => {
    initFromUrl();
    fetchData();
  });

  return {
    // Data
    data, meta, pagination, isLoading, isEmpty,
    // State
    currentPage, perPage, sortColumn, sortDirection, search, activeFilters, visibleColumns,
    // Methods
    setPage, setPerPage, setSort, setSearch,
    addFilter, removeFilter, updateFilter,
    toggleColumn, refresh,
  };
}
```

**Step 2: Implement useFilters, useActions, useExport, useStickyTable composables**

Reference: `/Users/karthickk/kkprojects/table-module/resources/js/actions.ts`, `/Users/karthickk/kkprojects/table-module/resources/js/useStickyTable.ts`

Port the React hooks to Vue composables using `ref()`, `computed()`, `watch()` instead of `useState`, `useMemo`, `useEffect`.

For `useExport`: use `EventSource` API for SSE instead of polling.

```typescript
// composables/useExport.ts
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
      const { jobId } = await response.json();

      // Connect to SSE stream
      const eventSource = new EventSource(`/table/export/stream/${jobId}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        exportProgress.value = data.progress;

        if (data.status === 'completed') {
          eventSource.close();
          isExporting.value = false;
          // Trigger download
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

  return { isExporting, exportProgress, exportError, triggerExport };
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: implement Vue composables (useTable, useFilters, useActions, useExport, useStickyTable)"
```

---

## Phase 9: Frontend — Vue Components

### Task 16: Set up shadcn-vue base components

**Files:**
- Create: `frontend/src/lib/utils.ts`
- Create: `frontend/src/components/ui/button/`
- Create: `frontend/src/components/ui/dropdown-menu/`
- Create: `frontend/src/components/ui/dialog/`
- Create: `frontend/src/components/ui/select/`
- Create: `frontend/src/components/ui/popover/`
- Create: `frontend/src/components/ui/badge/`
- Create: `frontend/src/components/ui/checkbox/`
- Create: `frontend/src/components/ui/input/`
- Create: `frontend/src/components/ui/calendar/`

**Step 1: Initialize shadcn-vue components**

Use `npx shadcn-vue@latest init` and then add required components:

```bash
cd /Users/karthickk/kkprojects/nestjs-table-module/frontend
npx shadcn-vue@latest init
npx shadcn-vue@latest add button dropdown-menu dialog select popover badge checkbox input calendar
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add shadcn-vue UI primitives"
```

---

### Task 17: Implement column cell components

**Files:**
- Create: `frontend/src/components/columns/TextCell.vue`
- Create: `frontend/src/components/columns/NumericCell.vue`
- Create: `frontend/src/components/columns/DateCell.vue`
- Create: `frontend/src/components/columns/DateTimeCell.vue`
- Create: `frontend/src/components/columns/BooleanCell.vue`
- Create: `frontend/src/components/columns/BadgeCell.vue`
- Create: `frontend/src/components/columns/ImageCell.vue`
- Create: `frontend/src/components/columns/ActionCell.vue`
- Create: `frontend/src/components/columns/CellRenderer.vue`
- Create: `frontend/src/components/columns/index.ts`

**Step 1: Implement cell components**

Reference: React components in `/Users/karthickk/kkprojects/table-module/resources/js/` — port to Vue SFC format.

`CellRenderer.vue` is a dynamic component that switches based on column type:

```vue
<!-- CellRenderer.vue -->
<template>
  <TextCell v-if="column.type === 'text'" :value="value" :column="column" />
  <NumericCell v-else-if="column.type === 'numeric'" :value="value" :column="column" />
  <DateCell v-else-if="column.type === 'date'" :value="value" :column="column" />
  <DateTimeCell v-else-if="column.type === 'datetime'" :value="value" :column="column" />
  <BooleanCell v-else-if="column.type === 'boolean'" :value="value" :column="column" />
  <BadgeCell v-else-if="column.type === 'badge'" :value="value" :column="column" />
  <ImageCell v-else-if="column.type === 'image'" :value="value" :column="column" />
  <span v-else>{{ value }}</span>
</template>
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: implement column cell renderer components"
```

---

### Task 18: Implement filter components

**Files:**
- Create: `frontend/src/components/filters/AddFilterDropdown.vue`
- Create: `frontend/src/components/filters/ActiveFilters.vue`
- Create: `frontend/src/components/filters/FilterChip.vue`
- Create: `frontend/src/components/filters/TextFilterInput.vue`
- Create: `frontend/src/components/filters/NumericFilterInput.vue`
- Create: `frontend/src/components/filters/DateFilterInput.vue`
- Create: `frontend/src/components/filters/BooleanFilterInput.vue`
- Create: `frontend/src/components/filters/SetFilterInput.vue`
- Create: `frontend/src/components/filters/index.ts`

Reference: `/Users/karthickk/kkprojects/table-module/resources/js/Filter.tsx` and `/Users/karthickk/kkprojects/table-module/resources/js/AddFilterDropdown.tsx`

Each filter input renders appropriate UI:
- TextFilterInput: text input with clause selector
- NumericFilterInput: number input with clause selector
- DateFilterInput: calendar date picker with clause selector (uses shadcn-vue Calendar)
- BooleanFilterInput: simple IsTrue/IsFalse toggle
- SetFilterInput: multi-select dropdown with checkboxes

FilterChip wraps a filter input in a Popover with remove button.

**Step 1: Implement all filter components, commit**

```bash
git add .
git commit -m "feat: implement filter UI components"
```

---

### Task 19: Implement action components

**Files:**
- Create: `frontend/src/components/actions/RowActions.vue`
- Create: `frontend/src/components/actions/BulkActionsDropdown.vue`
- Create: `frontend/src/components/actions/ActionsDropdown.vue`
- Create: `frontend/src/components/actions/index.ts`

Reference: `/Users/karthickk/kkprojects/table-module/resources/js/RowActions.tsx` and `/Users/karthickk/kkprojects/table-module/resources/js/ActionsDropdown.tsx`

**Step 1: Implement, commit**

```bash
git add .
git commit -m "feat: implement action UI components (row actions, bulk actions)"
```

---

### Task 20: Implement main DataTable component

**Files:**
- Create: `frontend/src/components/DataTable.vue`
- Create: `frontend/src/components/TableHeader.vue`
- Create: `frontend/src/components/TableBody.vue`
- Create: `frontend/src/components/TablePagination.vue`
- Create: `frontend/src/components/SearchInput.vue`
- Create: `frontend/src/components/EmptyState.vue`
- Create: `frontend/src/components/ConfirmDialog.vue`
- Create: `frontend/src/components/ToggleColumnsDropdown.vue`
- Create: `frontend/src/components/ViewsDropdown.vue`
- Create: `frontend/src/components/exports/ExportButton.vue`
- Create: `frontend/src/components/exports/ExportProgressOverlay.vue`

Reference: `/Users/karthickk/kkprojects/table-module/resources/js/Table.tsx`

**DataTable.vue is the main entry point:**

```vue
<!-- DataTable.vue — simplified structure -->
<template>
  <div ref="tableRef" class="w-full">
    <TableHeader
      :meta="meta"
      :search="search"
      :active-filters="activeFilters"
      :selected-ids="selectedIds"
      @search="setSearch"
      @add-filter="addFilter"
      @remove-filter="removeFilter"
      @update-filter="updateFilter"
      @toggle-column="toggleColumn"
      @bulk-action="executeBulkAction"
      @export="triggerExport"
    />

    <div class="relative overflow-auto">
      <table class="w-full caption-bottom text-sm">
        <thead :class="{ 'sticky top-0 z-10 bg-background': meta?.stickyHeader }">
          <tr>
            <th v-if="hasRowActions" class="w-10">
              <Checkbox :checked="allSelected" @update:checked="toggleSelectAll" />
            </th>
            <th
              v-for="col in visibleColumnDefs"
              :key="col.key"
              :class="[col.headerClass, `text-${col.alignment}`]"
              class="h-10 px-4 font-medium text-muted-foreground"
              @click="col.sortable && setSort(col.key)"
            >
              {{ col.header }}
              <SortIcon v-if="col.sortable" :active="sortColumn === col.key" :direction="sortDirection" />
            </th>
          </tr>
        </thead>

        <TableBody
          :data="data"
          :columns="visibleColumnDefs"
          :has-row-actions="hasRowActions"
          :selected-ids="selectedIds"
          @toggle-select="toggleSelect"
        />
      </table>

      <EmptyState v-if="isEmpty" :config="meta?.emptyState" />
    </div>

    <TablePagination
      v-if="pagination"
      :pagination="pagination"
      :per-page-options="meta?.perPageOptions ?? [15, 30, 50, 100]"
      @page="setPage"
      @per-page="setPerPage"
    />

    <ConfirmDialog
      v-if="confirmAction"
      :action="confirmAction"
      @confirm="executeConfirmedAction"
      @cancel="cancelAction"
    />

    <ExportProgressOverlay
      v-if="isExporting"
      :progress="exportProgress"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTable } from '../composables/useTable';
import { useActions } from '../composables/useActions';
import { useExport } from '../composables/useExport';
// ... import all sub-components

const props = defineProps<{
  endpoint: string;
  defaultPerPage?: number;
  debounce?: number;
  syncUrl?: boolean;
}>();

const {
  data, meta, pagination, isLoading, isEmpty,
  sortColumn, sortDirection, search, activeFilters, visibleColumns,
  setPage, setPerPage, setSort, setSearch,
  addFilter, removeFilter, updateFilter, toggleColumn, refresh,
} = useTable(props.endpoint, {
  defaultPerPage: props.defaultPerPage,
  debounce: props.debounce,
  syncUrl: props.syncUrl ?? true,
});

const { selectedIds, allSelected, toggleSelect, toggleSelectAll, executeAction, confirmAction, executeConfirmedAction, cancelAction } = useActions();
const { isExporting, exportProgress, triggerExport } = useExport();

const visibleColumnDefs = computed(() =>
  meta.value?.columns.filter((c) => c.visible) ?? [],
);
const hasRowActions = computed(() =>
  (meta.value?.actions.row.length ?? 0) > 0 || (meta.value?.actions.bulk.length ?? 0) > 0,
);
</script>
```

**Step 1: Implement all remaining components. Commit**

```bash
git add .
git commit -m "feat: implement DataTable and all sub-components"
```

---

### Task 21: Create frontend barrel export and utilities

**Files:**
- Create: `frontend/src/utils/url-helpers.ts`
- Create: `frontend/src/utils/icon-resolver.ts`
- Create: `frontend/src/index.ts`

```typescript
// frontend/src/index.ts
export { default as DataTable } from './components/DataTable.vue';
export { useTable } from './composables/useTable';
export { useFilters } from './composables/useFilters';
export { useActions } from './composables/useActions';
export { useExport } from './composables/useExport';
export { useStickyTable } from './composables/useStickyTable';
export * from './types';
```

**Step 1: Commit**

```bash
git add .
git commit -m "feat: add barrel exports and utility functions"
```

---

## Phase 10: Integration & Testing

### Task 22: Write backend integration tests

**Files:**
- Create: `backend/src/__tests__/table-query.service.spec.ts`
- Create: `backend/src/__tests__/table-action.controller.spec.ts`
- Create: `backend/src/__tests__/table-export.service.spec.ts`

Write integration tests using `@nestjs/testing` that:
1. Create a test entity and table definition
2. Test query building with various filters, sorts, and search
3. Test action execution
4. Test export generation

Reference: `/Users/karthickk/kkprojects/table-module/tests/` for test patterns.

**Step 1: Implement tests. Commit**

```bash
git add .
git commit -m "test: add backend integration tests"
```

---

### Task 23: Create example usage

**Files:**
- Create: `backend/src/examples/users-table.example.ts`
- Create: `frontend/src/examples/UsersPage.vue`

Create a complete example showing how to use the module with a `UsersTable` definition (backend) and `UsersPage.vue` (frontend). This serves as documentation and a smoke test.

**Step 1: Write example files**

```typescript
// backend/src/examples/users-table.example.ts
import { BaseTable, TableConfig } from '..';
import { TextColumn, DateTimeColumn, BadgeColumn, ActionColumn } from '../columns';
import { TextFilter, DateFilter, SetFilter, BooleanFilter } from '../filters';
import { Action } from '../action';
import { Export } from '../export';
import { EmptyState } from '../empty-state';
import { SortDirection, PaginationType, Variant, ExportFormat } from '../enums';

// Assuming a UserEntity exists in the consuming project
// import { UserEntity } from '../users/entities/user.entity';

@TableConfig({
  resource: Object, // Replace with UserEntity
  defaultSort: { column: 'createdAt', direction: SortDirection.Desc },
  pagination: PaginationType.Full,
  perPageOptions: [15, 30, 50, 100],
  softDeletes: true,
  searchable: ['name', 'email'],
  stickyHeader: true,
})
export class UsersTable extends BaseTable<any> {
  columns() {
    return [
      TextColumn.make('name').sortable().searchable(),
      TextColumn.make('email').sortable().searchable(),
      BadgeColumn.make('status').variant({ active: 'success', inactive: 'destructive' }),
      DateTimeColumn.make('createdAt').sortable(),
      ActionColumn.make(),
    ];
  }

  filters() {
    return [
      TextFilter.make('name'),
      TextFilter.make('email'),
      SetFilter.make('role').options([
        { value: '1', label: 'Admin' },
        { value: '2', label: 'User' },
      ]),
      DateFilter.make('createdAt'),
      BooleanFilter.make('isActive'),
    ];
  }

  actions() {
    return [
      Action.make('edit').asLink().url((row: any) => `/users/${row.id}/edit`),
      Action.make('delete')
        .asButton()
        .variant(Variant.Destructive)
        .confirm({ title: 'Delete user?', message: 'This cannot be undone.' })
        .handle(async (row: any, repo: any) => repo.softDelete(row.id)),
    ];
  }

  exports() {
    return [
      Export.make('Excel', 'users.xlsx', ExportFormat.Xlsx),
      Export.make('CSV', 'users.csv', ExportFormat.Csv),
    ];
  }

  emptyState() {
    return EmptyState.make()
      .title('No users found')
      .message('Try adjusting your filters or create a new user')
      .icon('users');
  }
}
```

```vue
<!-- frontend/src/examples/UsersPage.vue -->
<template>
  <div class="container mx-auto py-6">
    <h1 class="text-2xl font-bold mb-6">Users</h1>
    <DataTable endpoint="/api/users" :sync-url="true" :debounce="300" />
  </div>
</template>

<script setup lang="ts">
import { DataTable } from '..';
</script>
```

**Step 2: Commit**

```bash
git add .
git commit -m "docs: add usage examples for backend and frontend"
```

---

### Task 24: Final wiring and README

**Files:**
- Create: `README.md`

Write a README covering:
1. Installation (backend + frontend)
2. Backend setup (`TableModule.forRoot()` in app.module.ts)
3. Defining a table (example with all features)
4. Using in a controller
5. Frontend setup (import DataTable component)
6. Using DataTable in a page
7. API reference for all column types, filter types, actions, exports

**Step 1: Write README. Commit**

```bash
git add .
git commit -m "docs: add comprehensive README"
```
