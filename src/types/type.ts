import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

export interface MenuItem {
  name: string;
  icon: ForwardRefExoticComponent<SVGProps<SVGSVGElement> & RefAttributes<SVGSVGElement>>;
  route: string;
  features: string[];
  submenu?: MenuItem[];
}

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

// Types for our feedback components
export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}

export interface ProgressBarProps {
  progress: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  action?: React.ReactNode;
}

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
  }>;
  buttonTxt?: string;
  className?: string;
  pageSize?: number;
  searchable?: boolean;
  isLoading?: boolean;
  optionsOverflow?: boolean;
  onRowClick?: (item: T) => void;
  onAddButtonClick?: (item: any) => void;
  enableSelection?: boolean;
  enableExport?: boolean;
  enableColumnVisibility?: boolean;
  enableRowExpansion?: boolean;
  renderExpandedRow?: (item: T) => React.ReactNode;
  rowActions?: Array<{
    label: string;
    onClick: (item: T) => void;
  }>;
}
