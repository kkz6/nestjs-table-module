export interface ActionConfirm {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ActionDef {
  name: string;
  label: string;
  type: 'button' | 'link';
  variant: string;
  icon?: string | null;
  confirm?: ActionConfirm | null;
  disabled?: boolean;
  hidden?: boolean;
  url?: string;
  download?: boolean;
  meta?: Record<string, any> | null;
  dataAttributes?: Record<string, string> | null;
}

export interface ExportDef {
  name: string;
  label: string;
  fileName: string;
  format: string;
}
