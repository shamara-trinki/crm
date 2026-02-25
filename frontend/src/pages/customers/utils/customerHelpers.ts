import { type Customer, customersApi } from "@/lib/api";
import { type ImportPreview, STATUS_OPTIONS, TYPE_OPTIONS } from "../types/customer.types";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Hash, Building2, Phone, MapPin, Calendar, CheckCircle, Tag, FileText, Clock,
} from "lucide-react";
import type { ColumnDefinition } from "../types/customer.types";

export const AVAILABLE_COLUMNS: ColumnDefinition[] = [
  { key: "userid", label: "ID", defaultVisible: true, icon: Hash },
  { key: "company", label: "Company", defaultVisible: true, icon: Building2 },
  { key: "phonenumber", label: "Phone", defaultVisible: true, icon: Phone },
  { key: "city", label: "City", defaultVisible: true, icon: MapPin },
  { key: "address", label: "Address", defaultVisible: true, icon: MapPin },
  { key: "datecreated", label: "Date Created", defaultVisible: false, icon: Calendar },
  { key: "active", label: "Active", defaultVisible: false, icon: CheckCircle },
  { key: "type", label: "Type", defaultVisible: false, icon: Tag },
  { key: "note", label: "Note", defaultVisible: false, icon: FileText },
  { key: "status", label: "Status", defaultVisible: false, icon: Clock },
];

export const REQUIRED_FIELDS = ["company"] as const;
export const OPTIONAL_FIELDS = [
  "phonenumber", "city", "address", "note", "status", "type", "active",
] as const;

export const getDefaultVisibleColumns = (): string[] =>
  AVAILABLE_COLUMNS.filter((col) => col.defaultVisible).map((col) => col.key);

export const getColumnIcon = (columnKey: string) => {
  const column = AVAILABLE_COLUMNS.find((col) => col.key === columnKey);
  return column?.icon || null;
};

export const prepareExportData = (
  customersToExport: Customer[],
  visibleColumns: string[]
) => {
  return customersToExport.map((customer) => {
    const row: Record<string, any> = {};
    visibleColumns.forEach((key) => {
      const column = AVAILABLE_COLUMNS.find((col) => col.key === key);
      if (!column) return;
      const value = customer[key as keyof Customer];
      switch (key) {
        case "datecreated":
          row[column.label] = value ? new Date(value as string).toLocaleDateString() : "-";
          break;
        case "active":
          row[column.label] = value === 1 ? "Active" : "Inactive";
          break;
        default:
          row[column.label] = value || "-";
      }
    });
    return row;
  });
};

export const exportToExcel = (
  dataToExport: Customer[],
  filename: string,
  visibleColumns: string[]
) => {
  const exportData = prepareExportData(dataToExport, visibleColumns);
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Customers");
  XLSX.writeFile(wb, `${filename}.xlsx`);
  return dataToExport.length;
};

export const exportToPDF = (
  dataToExport: Customer[],
  filename: string,
  visibleColumns: string[]
) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Customers List", 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Total Records: ${dataToExport.length}`, 14, 36);

  const columns = visibleColumns.map((key) => {
    const column = AVAILABLE_COLUMNS.find((col) => col.key === key);
    return column?.label || key;
  });

  const rows = dataToExport.map((customer) =>
    visibleColumns.map((key) => {
      const value = customer[key as keyof Customer];
      switch (key) {
        case "datecreated":
          return value ? new Date(value as string).toLocaleDateString() : "-";
        case "active":
          return value === 1 ? "Active" : "Inactive";
        default:
          return value || "-";
      }
    })
  );

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 45,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 45 },
  });

  doc.save(`${filename}.pdf`);
  return dataToExport.length;
};

export const fetchAllCustomersForExport = async (
  debouncedSearch: string
): Promise<Customer[]> => {
  const initialResponse = await customersApi.list({ page: 1, limit: 1 });
  const totalCount = initialResponse.data.total;
  const response = await customersApi.list({
    page: 1,
    limit: totalCount,
    search: debouncedSearch,
  });
  return response.data.data;
};

export const parseImportFile = (data: Uint8Array): any[] => {
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
};

export const previewImportRows = (rows: any[]): ImportPreview[] => {
  if (rows.length < 2) return [];

  const headers = rows[0] as string[];
  const dataRows = rows.slice(1);

  const headerMap: Record<string, keyof Customer> = {
    Company: "company", company: "company",
    Phone: "phonenumber", phone: "phonenumber", phonenumber: "phonenumber",
    City: "city", city: "city",
    Address: "address", address: "address",
    Note: "note", note: "note",
    Status: "status", status: "status",
    Type: "type", type: "type",
    Active: "active", active: "active",
  };

  return dataRows.map((row: any[], index: number) => {
    const rowData: Partial<Customer> = {};
    const errors: string[] = [];

    headers.forEach((header, colIndex) => {
      const fieldName = headerMap[header];
      if (fieldName && row[colIndex] !== undefined) {
        let value = row[colIndex];
        if (fieldName === "active") {
          if (typeof value === "string") {
            const lv = value.toLowerCase();
            value = (lv === "active" || lv === "yes" || lv === "1" || lv === "true") ? 1 : 0;
          } else {
            value = value ? 1 : 0;
          }
        }
        (rowData as Record<keyof Customer, any>)[fieldName] = value;
      }
    });

    if (!rowData.company || String(rowData.company).trim() === "") {
      errors.push("Company name is required");
    }
    if (rowData.status) {
      const validStatuses = STATUS_OPTIONS.map((opt) => opt.value);
      if (!validStatuses.includes(rowData.status.toLowerCase())) {
        errors.push(`Invalid status. Valid values: ${validStatuses.join(", ")}`);
      }
    }
    if (rowData.type) {
      const validTypes = TYPE_OPTIONS.map((opt) => opt.value);
      if (!validTypes.includes(rowData.type.toLowerCase())) {
        errors.push(`Invalid type. Valid values: ${validTypes.join(", ")}`);
      }
    }

    return { rowNumber: index + 2, data: rowData, errors, isValid: errors.length === 0 };
  });
};

export const downloadTemplate = () => {
  const template = [
    ["Company", "Phone", "City", "Address", "Status", "Type", "Active", "Note"],
    ["Example Company", "+1234567890", "New York", "123 Main St", "active", "business", "Yes", "Sample note"],
  ];
  const ws = XLSX.utils.aoa_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "customer_import_template.xlsx");
};
