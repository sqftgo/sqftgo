export { Button, type ButtonProps } from "./Button";
export { Badge, StatusBadge, toneFromStatus, type BadgeProps, type BadgeTone } from "./Badge";
export { SearchInput, type SearchInputProps } from "./SearchInput";
export { Switch, type SwitchProps } from "./Switch";
export { Alert, type AlertProps, type AlertVariant } from "./Alert";
export {
  Dialog,
  ConfirmDialog,
  type DialogProps,
  type ConfirmDialogProps,
} from "./Dialog";
export { Panel, type PanelProps } from "./Panel";
export { Avatar, type AvatarProps, type AvatarSize, type AvatarTone, type AvatarShape } from "./Avatar";
export { ProgressBar, type ProgressBarProps, type ProgressTone } from "./ProgressBar";
export {
  MonthlyTrendChart,
  type MonthlyTrendPoint,
  type MonthlyTrendChartProps,
} from "./MonthlyTrendChart";
export {
  CityDonutChart,
  type CitySharePoint,
  type CityDonutChartProps,
} from "./CityDonutChart";
export { SettingsRow, type SettingsRowProps } from "./SettingsRow";
export { DashboardPageHeader, type DashboardPageHeaderProps } from "./DashboardPageHeader";
export { DataTable, type DataTableColumn, type DataTableProps } from "./DataTable";
export { StatCard, KpiGrid, type StatCardProps } from "./StatCard";
export {
  FormField,
  TextInput,
  TextArea,
  type FormFieldProps,
  type TextInputProps,
  type TextAreaProps,
} from "./FormField";
export { ErrorState, type ErrorStateProps } from "./ErrorState";
export { EmptyState } from "./EmptyState";
export { LoadingSpinner, GlobalLoading } from "./Loading";
export { Skeleton, PageLoader, PropertyCardSkeleton, PropertyGridSkeleton } from "./Skeleton";
export { default as CustomSelect, type SelectOption } from "./CustomSelect";
export { default as DropdownMenu, type DropdownMenuItem } from "./DropdownMenu";
export { default as StepProgress } from "./StepProgress";
export { CitySelectorDropdown } from "./CitySelectorDropdown";

/** @deprecated Import from `@/features/*` — kept for gradual migration */
export {
  NotificationsPageShell,
  type NotificationsPageShellProps,
  type NotificationPrefItem,
  type DashboardNotification,
} from "@/features/notifications/components/NotificationsPageShell";
export { PropertyCard } from "@/features/properties/components/PropertyCard";
export { formatIndianCurrency } from "@/lib/format";
export { FilterPanel, type FilterState } from "@/features/properties/components/FilterPanel";
export { InquiryForm } from "@/features/inquiries/components/InquiryForm";
export { VisitBookingForm } from "@/features/visits/components/VisitBookingForm";
export { default as CityMap } from "@/features/locations/components/CityMap";
export { UserDropdown } from "@/features/auth/components/UserDropdown";
