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
