import { type Customer } from "@/lib/api";
import { type LucideIcon } from "lucide-react";

export interface ImportPreview {
  rowNumber: number;
  data: Partial<Customer>;
  errors: string[];
  isValid: boolean;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  defaultVisible: boolean;
  icon: LucideIcon;
}

export interface StatusOption {
  value: string;
  label: string;
  color: string;
}

export interface TypeOption {
  value: string;
  label: string;
}

export interface CustomerFormData {
  company: string;
  phonenumber: string;
  city: string;
  address: string;
  note: string;
  status: string;
  type: string;
  active: number;
}

export const INITIAL_FORM_DATA: CustomerFormData = {
  company: "",
  phonenumber: "",
  city: "",
  address: "",
  note: "",
  status: "",
  type: "",
  active: 1,
};

export const STATUS_OPTIONS: StatusOption[] = [
  { value: "implementation", label: "Implementation", color: "bg-yellow-500" },
  { value: "finished", label: "Finished", color: "bg-green-500" },
  { value: "not-finished", label: "Not finished", color: "bg-red-500" },
];

export const TYPE_OPTIONS: TypeOption[] = [
  { value: "business", label: "Business" },
  { value: "individual", label: "Individual" },
  { value: "enterprise", label: "Enterprise" },
  { value: "government", label: "Government" },
  { value: "non-profit", label: "Non-Profit" },
];

export const AVAILABLE_COLUMNS: ColumnDefinition[] = [];
// Will be populated with icons in the component that uses them
