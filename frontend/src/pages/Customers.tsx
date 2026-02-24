import React, { useState, useEffect, useRef } from "react";
import { customersApi, type Customer } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Loader2,
  Building2,
  Phone,
  MapPin,
  Hash,
  Calendar,
  CheckCircle,
  Tag,
  FileText,
  Clock,
  Settings2,
  MoreHorizontal,
  Mail,
  Edit,
  Trash2,
  Trash,
  MapPinned,
  Download,
  Upload,
  FileSpreadsheet,
  FileText as FileTextIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  PlusCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Progress } from "@/components/ui/progress";

// Interface for import preview data
interface ImportPreview {
  rowNumber: number;
  data: Partial<Customer>;
  errors: string[];
  isValid: boolean;
}

const CustomersPage = () => {
  const navigate = useNavigate();
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Selection state for bulk delete
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Edit form state - all fields except ID
  const [editFormData, setEditFormData] = useState({
    company: "",
    phonenumber: "",
    city: "",
    address: "",
    note: "",
    status: "",
    type: "",
    active: 1,
  });
  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    company: "",
    phonenumber: "",
    city: "",
    address: "",
    note: "",
    status: "",
    type: "",
    active: 1,
  });

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);

  // Bulk delete confirmation dialog state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Import state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importSuccess, setImportSuccess] = useState<number>(0);
  const [importErrors, setImportErrors] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Debounce search (wait 500ms after user stops typing)
  const debouncedSearch = useDebounce(search, 500);

  // Define all available columns with icons for ALL columns
  const AVAILABLE_COLUMNS = [
    { key: "userid", label: "ID", defaultVisible: true, icon: Hash },
    { key: "company", label: "Company", defaultVisible: true, icon: Building2 },
    { key: "phonenumber", label: "Phone", defaultVisible: true, icon: Phone },
    { key: "city", label: "City", defaultVisible: true, icon: MapPin },
    { key: "address", label: "Address", defaultVisible: true, icon: MapPin },
    {
      key: "datecreated",
      label: "Date Created",
      defaultVisible: false,
      icon: Calendar,
    },
    {
      key: "active",
      label: "Active",
      defaultVisible: false,
      icon: CheckCircle,
    },
    { key: "type", label: "Type", defaultVisible: false, icon: Tag },
    { key: "note", label: "Note", defaultVisible: false, icon: FileText },
    { key: "status", label: "Status", defaultVisible: false, icon: Clock },
  ];

  // Define required and optional fields for import validation
  const REQUIRED_FIELDS = ["company"] as const;
  const OPTIONAL_FIELDS = [
    "phonenumber",
    "city",
    "address",
    "note",
    "status",
    "type",
    "active",
  ] as const;

  // State to track which columns are visible with localStorage persistence
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem("customerColumns");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return AVAILABLE_COLUMNS.filter((col) => col.defaultVisible).map(
          (col) => col.key,
        );
      }
    }
    return AVAILABLE_COLUMNS.filter((col) => col.defaultVisible).map(
      (col) => col.key,
    );
  });

  // Status options for dropdown
  const statusOptions = [
    {
      value: "implementation",
      label: "Implementation",
      color: "bg-yellow-500",
    },
    { value: "finished", label: "Finished", color: "bg-green-500" },
    { value: "not-finished", label: "Not finished", color: "bg-red-500" },
  ];

  // Type options for dropdown
  const typeOptions = [
    { value: "business", label: "Business" },
    { value: "individual", label: "Individual" },
    { value: "enterprise", label: "Enterprise" },
    { value: "government", label: "Government" },
    { value: "non-profit", label: "Non-Profit" },
  ];

  // Save to localStorage whenever visible columns change
  useEffect(() => {
    localStorage.setItem("customerColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Fetch customers when page, limit, or debounced search changes
  useEffect(() => {
    fetchCustomers();
  }, [page, limit, debouncedSearch]);

  // Reset selection when customers change
  useEffect(() => {
    setSelectedCustomers([]);
    setSelectAll(false);
  }, [customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customersApi.list({
        page,
        limit,
        search: debouncedSearch,
      });

      setCustomers(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalCustomers(response.data.total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle create button click - reset form
  const handleCreateClick = () => {
    setCreateFormData({
      company: "",
      phonenumber: "",
      city: "",
      address: "",
      note: "",
      status: "",
      type: "",
      active: 1,
    });
    setCreateDialogOpen(true);
  };

  // Handle save new customer
  const handleSaveCreate = async () => {
    // Validate required fields
    if (!createFormData.company.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await customersApi.create(createFormData);

      toast({
        title: "Success",
        description: "Customer created successfully",
      });

      setCreateDialogOpen(false);
      fetchCustomers(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      });
    }
  };

  // Add this new function to fetch all customers for export
  const fetchAllCustomersForExport = async (): Promise<Customer[]> => {
    try {
      // First, get the total count
      const initialResponse = await customersApi.list({ page: 1, limit: 1 });
      const totalCount = initialResponse.data.total;

      // Fetch all customers in one request
      const response = await customersApi.list({
        page: 1,
        limit: totalCount,
        search: debouncedSearch, // Preserve search if any
      });

      return response.data.data;
    } catch (error) {
      console.error("Error fetching all customers:", error);
      throw error;
    }
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Pagination handlers
  const handleFirstPage = () => setPage(1);
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleLastPage = () => setPage(totalPages);

  // Clear search
  const handleClearSearch = () => {
    setSearch("");
  };

  // Handle select all customers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((c) => c.userid));
    }
    setSelectAll(!selectAll);
  };

  // Handle select single customer
  const handleSelectCustomer = (customerId: number) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
      setSelectAll(false);
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  // Handle edit button click - populate form with all customer data
  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditFormData({
      company: customer.company || "",
      phonenumber: customer.phonenumber || "",
      city: customer.city || "",
      address: customer.address || "",
      note: customer.note || "",
      status: customer.status || "",
      type: customer.type || "",
      active: customer.active,
    });
    setEditDialogOpen(true);
  };

  // Handle form input changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select changes - for status and type
  const handleSelectChange = (name: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle active checkbox change
  const handleActiveChange = (checked: boolean) => {
    setEditFormData((prev) => ({
      ...prev,
      active: checked ? 1 : 0,
    }));
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingCustomer) return;

    try {
      await customersApi.update(editingCustomer.userid, editFormData);

      toast({
        title: "Success",
        description: "Customer updated successfully",
      });

      setEditDialogOpen(false);
      fetchCustomers(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    }
  };

  // Handle delete button click
  const handleDeleteClick = (customerId: number) => {
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await customersApi.delete(customerToDelete);

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });

      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      fetchCustomers(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;

    try {
      // Delete each selected customer
      await Promise.all(selectedCustomers.map((id) => customersApi.delete(id)));

      toast({
        title: "Success",
        description: `${selectedCustomers.length} customers deleted successfully`,
      });

      setBulkDeleteDialogOpen(false);
      setSelectedCustomers([]);
      setSelectAll(false);
      fetchCustomers(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customers",
        variant: "destructive",
      });
    }
  };

  // Handle contact button click
  const handleContactClick = (customerId: number) => {
    navigate(`/contact/${customerId}`);
  };

  // Helper function to render active badge
  const renderActiveBadge = (isActive: number) => {
    if (isActive === 1) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          Active
        </Badge>
      );
    } else {
      return <Badge variant="destructive">Inactive</Badge>;
    }
  };

  // Helper function to render status badge
  const renderStatusBadge = (status: string | null | undefined) => {
    if (!status) return "-";

    switch (status.toLowerCase()) {
      case "finished":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            {status}
          </Badge>
        );
      case "implementation":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500 text-white hover:bg-yellow-600"
          >
            {status}
          </Badge>
        );
      case "not-finished":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return status;
    }
  };

  // Helper function to render cell content based on column key
  const renderCellContent = (customer: Customer, columnKey: string) => {
    switch (columnKey) {
      case "userid":
        return customer.userid;
      case "company":
        return customer.company || "-";
      case "phonenumber":
        return customer.phonenumber || "-";
      case "city":
        return customer.city || "-";
      case "address":
        return customer.address || "-";
      case "datecreated":
        return customer.datecreated
          ? new Date(customer.datecreated).toLocaleDateString()
          : "-";
      case "active":
        return renderActiveBadge(customer.active);
      case "type":
        return customer.type ? (
          <Badge variant="outline">{customer.type}</Badge>
        ) : (
          "-"
        );
      case "note":
        return (
          <div className="max-w-[200px] truncate" title={customer.note || ""}>
            {customer.note || "-"}
          </div>
        );
      case "status":
        return renderStatusBadge(customer.status);
      default:
        return "-";
    }
  };

  // Get icon component for a column key
  const getColumnIcon = (columnKey: string) => {
    const column = AVAILABLE_COLUMNS.find((col) => col.key === columnKey);
    return column?.icon || null;
  };

  // Prepare data for export
  const prepareExportData = (customersToExport: Customer[]) => {
    return customersToExport.map((customer) => {
      const row: any = {};

      // Only include visible columns in the export
      visibleColumns.forEach((key) => {
        const column = AVAILABLE_COLUMNS.find((col) => col.key === key);
        if (!column) return;

        let value = customer[key as keyof Customer];

        // Format values based on column type
        switch (key) {
          case "datecreated":
            row[column.label] = value
              ? new Date(value as string).toLocaleDateString()
              : "-";
            break;
          case "active":
            row[column.label] = value === 1 ? "Active" : "Inactive";
            break;
          case "status":
          case "type":
          case "company":
          case "phonenumber":
          case "city":
          case "address":
          case "note":
            row[column.label] = value || "-";
            break;
          default:
            row[column.label] = value ?? "-";
        }
      });

      return row;
    });
  };

  // Export to Excel
  const exportToExcel = (dataToExport: Customer[], filename: string) => {
    try {
      const exportData = prepareExportData(dataToExport);

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Customers");

      // Save file
      XLSX.writeFile(wb, `${filename}.xlsx`);

      toast({
        title: "Success",
        description: `Exported ${dataToExport.length} customers to Excel`,
      });
    } catch (error) {
      console.error("Excel export error:", error);
      toast({
        title: "Error",
        description: "Failed to export to Excel",
        variant: "destructive",
      });
    }
  };

  // Export to PDF
  const exportToPDF = (dataToExport: Customer[], filename: string) => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text("Customers List", 14, 22);

      // Add metadata
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 36);

      // Prepare table columns and data
      const columns = visibleColumns.map((key) => {
        const column = AVAILABLE_COLUMNS.find((col) => col.key === key);
        return column?.label || key;
      });

      const rows = dataToExport.map((customer) => {
        return visibleColumns.map((key) => {
          const value = customer[key as keyof Customer];

          switch (key) {
            case "datecreated":
              return value
                ? new Date(value as string).toLocaleDateString()
                : "-";
            case "active":
              return value === 1 ? "Active" : "Inactive";
            case "status":
            case "type":
            case "company":
            case "phonenumber":
            case "city":
            case "address":
            case "note":
              return value || "-";
            default:
              return value ?? "-";
          }
        });
      });

      // Generate table
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 45,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 45 },
      });

      // Save PDF
      doc.save(`${filename}.pdf`);

      toast({
        title: "Success",
        description: `Exported ${dataToExport.length} customers to PDF`,
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Error",
        description: "Failed to export to PDF",
        variant: "destructive",
      });
    }
  };

  // Handle export options
  const handleExport = async (
    type: "excel" | "pdf",
    scope: "all" | "selected" | "current",
  ) => {
    let dataToExport: Customer[] = [];
    let filename = `customers_${new Date().toISOString().split("T")[0]}`;

    try {
      switch (scope) {
        case "selected":
          if (selectedCustomers.length === 0) {
            toast({
              title: "No customers selected",
              description: "Please select customers to export",
              variant: "destructive",
            });
            return;
          }
          dataToExport = customers.filter((c) =>
            selectedCustomers.includes(c.userid),
          );
          filename = `selected_customers_${new Date().toISOString().split("T")[0]}`;
          toast({
            title: "Exporting",
            description: `Exporting ${selectedCustomers.length} selected customers...`,
          });
          break;

        case "current":
          dataToExport = customers;
          filename = `page_${page}_customers_${new Date().toISOString().split("T")[0]}`;
          toast({
            title: "Exporting",
            description: `Exporting ${customers.length} customers from current page...`,
          });
          break;

        case "all":
          toast({
            title: "Exporting",
            description: "Fetching all customers for export...",
          });

          // Show loading state
          setLoading(true);

          // Fetch all customers using the new function
          dataToExport = await fetchAllCustomersForExport();
          filename = `all_customers_${new Date().toISOString().split("T")[0]}`;

          toast({
            title: "Exporting",
            description: `Exporting ${dataToExport.length} customers...`,
          });
          break;
      }

      if (dataToExport.length > 0) {
        if (type === "excel") {
          exportToExcel(dataToExport, filename);
        } else {
          exportToPDF(dataToExport, filename);
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customers for export",
        variant: "destructive",
      });
    } finally {
      if (scope === "all") {
        setLoading(false);
      }
    }
  };

  // Handle file selection for import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls") &&
      !file.name.endsWith(".csv")
    ) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel file (.xlsx, .xls) or CSV file",
        variant: "destructive",
      });
      return;
    }

    // Read and parse the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Preview the data
        previewImportData(jsonData);
      } catch (error) {
        console.error("File parse error:", error);
        toast({
          title: "Error",
          description: "Failed to parse the file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Preview import data
  const previewImportData = (rows: any[]) => {
    if (rows.length < 2) {
      toast({
        title: "Empty file",
        description: "The file contains no data rows",
        variant: "destructive",
      });
      return;
    }

    // Assume first row is headers
    const headers = rows[0] as string[];
    const dataRows = rows.slice(1);

    // Map headers to expected fields
    const headerMap: Record<string, keyof Customer> = {
      Company: "company",
      company: "company",
      Phone: "phonenumber",
      phone: "phonenumber",
      phonenumber: "phonenumber",
      City: "city",
      city: "city",
      Address: "address",
      address: "address",
      Note: "note",
      note: "note",
      Status: "status",
      status: "status",
      Type: "type",
      type: "type",
      Active: "active",
      active: "active",
    };

    const preview: ImportPreview[] = [];

    dataRows.forEach((row, index) => {
      const rowData: Partial<Customer> = {};
      const errors: string[] = [];

      // Map each header to the corresponding field
      headers.forEach((header, colIndex) => {
        const fieldName = headerMap[header];
        if (fieldName && row[colIndex] !== undefined) {
          let value = row[colIndex];

          // Convert active field to number
          if (fieldName === "active") {
            if (typeof value === "string") {
              const lowerValue = value.toLowerCase();
              if (
                lowerValue === "active" ||
                lowerValue === "yes" ||
                lowerValue === "1" ||
                lowerValue === "true"
              ) {
                value = 1;
              } else {
                value = 0;
              }
            } else {
              value = value ? 1 : 0;
            }
          }

          (rowData as Record<keyof Customer, any>)[fieldName] = value;
        }
      });

      // Validate required fields
      if (!rowData.company || String(rowData.company).trim() === "") {
        errors.push("Company name is required");
      }

      // Validate status if present
      if (rowData.status) {
        const validStatuses = statusOptions.map((opt) => opt.value);
        if (!validStatuses.includes(rowData.status.toLowerCase())) {
          errors.push(
            `Invalid status. Valid values: ${validStatuses.join(", ")}`,
          );
        }
      }

      // Validate type if present
      if (rowData.type) {
        const validTypes = typeOptions.map((opt) => opt.value);
        if (!validTypes.includes(rowData.type.toLowerCase())) {
          errors.push(`Invalid type. Valid values: ${validTypes.join(", ")}`);
        }
      }

      preview.push({
        rowNumber: index + 2, // +2 because row 1 is header
        data: rowData,
        errors,
        isValid: errors.length === 0,
      });
    });

    setImportPreview(preview);
    setImportDialogOpen(true);
  };

  // Handle import
  const handleImport = async () => {
    const validRows = importPreview.filter((row) => row.isValid);

    if (validRows.length === 0) {
      toast({
        title: "No valid data",
        description: "No valid rows found to import",
        variant: "destructive",
      });
      return;
    }

    setImportLoading(true);
    setImportProgress(0);
    setImportSuccess(0);
    setImportErrors(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      try {
        const row = validRows[i];
        await customersApi.create(row.data);
        successCount++;
      } catch (error) {
        console.error("Import error:", error);
        errorCount++;
      }

      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
      setImportSuccess(successCount);
      setImportErrors(errorCount);
    }

    setImportLoading(false);

    toast({
      title: "Import completed",
      description: `Successfully imported ${successCount} customers. ${errorCount} failed.`,
      variant: errorCount > 0 ? "destructive" : "default",
    });

    // Refresh the customer list
    fetchCustomers();

    // Close dialog after a short delay
    setTimeout(() => {
      setImportDialogOpen(false);
      setImportPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 2000);
  };

  // Download template for import
  const downloadTemplate = () => {
    const template = [
      [
        "Company",
        "Phone",
        "City",
        "Address",
        "Status",
        "Type",
        "Active",
        "Note",
      ],
      [
        "Example Company",
        "+1234567890",
        "New York",
        "123 Main St",
        "active",
        "business",
        "Yes",
        "Sample note",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "customer_import_template.xlsx");

    toast({
      title: "Template downloaded",
      description: "Use this template to format your import file",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage and view all your customer relationships
          </p>
        </div>
        <div className="flex items-center gap-4">
          {selectedCustomers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedCustomers.length} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}

          <Button onClick={handleCreateClick}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Customer
          </Button>

          {/* Import Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileSelect}
            ref={fileInputRef}
          />

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Excel Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  <span>Excel</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => handleExport("excel", "current")}
                    >
                      Current Page
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("excel", "selected")}
                      disabled={selectedCustomers.length === 0}
                    >
                      Selected ({selectedCustomers.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("excel", "all")}
                    >
                      All Customers
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* PDF Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  <span>PDF</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => handleExport("pdf", "current")}
                    >
                      Current Page
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("pdf", "selected")}
                      disabled={selectedCustomers.length === 0}
                    >
                      Selected ({selectedCustomers.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("pdf", "all")}
                    >
                      All Customers
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {visibleColumns.length} columns visible
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters Card */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input with Icon */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by company, phone, city, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>

          {/* Column Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {AVAILABLE_COLUMNS.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns.includes(column.key)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setVisibleColumns([...visibleColumns, column.key]);
                    } else {
                      // Prevent hiding all columns (keep at least one)
                      if (visibleColumns.length > 1) {
                        setVisibleColumns(
                          visibleColumns.filter((id) => id !== column.key),
                        );
                      } else {
                        toast({
                          title: "Cannot hide",
                          description:
                            "At least one column must remain visible",
                          variant: "default",
                        });
                      }
                    }
                  }}
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-2">
                    {column.icon && <column.icon className="h-4 w-4" />}
                    {column.label}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  const defaultColumns = AVAILABLE_COLUMNS.filter(
                    (col) => col.defaultVisible,
                  ).map((col) => col.key);
                  setVisibleColumns(defaultColumns);
                }}
                onSelect={(e) => e.preventDefault()}
                className="justify-center text-primary cursor-pointer"
              >
                Reset to Default
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Limit Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Show:
            </span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setLimit(parseInt(value));
                setPage(1); // Reset to first page when changing limit
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100, 500].map((l) => (
                  <SelectItem key={l} value={l.toString()}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Stats */}
        {debouncedSearch && (
          <div className="mt-2 text-sm text-muted-foreground">
            Showing results for "{debouncedSearch}"
            {customers.length === 0 && " - No matches found"}
          </div>
        )}
      </Card>

      {/* Results Summary */}
      {!loading && customers.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1} to{" "}
          {Math.min(page * limit, totalCustomers)} of {totalCustomers} customers
        </div>
      )}

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {/* Selection Checkbox - First column */}
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectAll && customers.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>

                {/* Dynamic Columns from Selector */}
                {visibleColumns.map((columnKey) => {
                  const column = AVAILABLE_COLUMNS.find(
                    (col) => col.key === columnKey,
                  );
                  return (
                    <TableHead
                      key={columnKey}
                      className={
                        columnKey === "datecreated"
                          ? "whitespace-nowrap min-w-[120px]"
                          : "min-w-[100px]"
                      }
                    >
                      <div className="flex items-center gap-1">
                        {column?.icon && (
                          <column.icon className="h-4 w-4 shrink-0" />
                        )}
                        <span
                          className={
                            columnKey === "datecreated"
                              ? "whitespace-nowrap"
                              : ""
                          }
                        >
                          {column?.label || columnKey}
                        </span>
                      </div>
                    </TableHead>
                  );
                })}

                {/* Mandatory Columns at the end */}
                <TableHead className="w-24 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <MoreHorizontal className="h-4 w-4" />
                    Actions
                  </div>
                </TableHead>
                <TableHead className="w-24 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Contact
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + 3} // +3 for checkbox and 2 mandatory columns
                    className="h-32 text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Loading customers...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + 3}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.userid} className="hover:bg-muted/50">
                    {/* Selection Checkbox - First column */}
                    <TableCell>
                      <Checkbox
                        checked={selectedCustomers.includes(customer.userid)}
                        onCheckedChange={() =>
                          handleSelectCustomer(customer.userid)
                        }
                        aria-label={`Select customer ${customer.userid}`}
                      />
                    </TableCell>

                    {/* Dynamic Columns */}
                    {visibleColumns.map((columnKey) => {
                      const Icon = getColumnIcon(columnKey);
                      return (
                        <TableCell key={`${customer.userid}-${columnKey}`}>
                          <div className="flex items-center gap-2">
                            {renderCellContent(customer, columnKey)}
                          </div>
                        </TableCell>
                      );
                    })}

                    {/* Actions Column - At the end */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEditClick(customer)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(customer.userid)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    {/* Contact Column - At the end */}
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContactClick(customer.userid)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {!loading && customers.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFirstPage}
              disabled={page === 1}
              className="hidden sm:inline-flex"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = page;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={i}
                    variant={pageNum === page ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 hidden sm:inline-flex"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLastPage}
              disabled={page === totalPages}
              className="hidden sm:inline-flex"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Import Preview Dialog */}
      <Dialog
        open={importDialogOpen}
        onOpenChange={(open) => {
          setImportDialogOpen(open);
          if (!open) {
            // Clear the file input when dialog closes
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            // Optional: Clear preview data
            setImportPreview([]);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Import Customers</DialogTitle>
            <DialogDescription>
              Preview your data before importing. Valid rows will be imported.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Download Template Link */}
            <div className="flex justify-end">
              <Button
                variant="link"
                onClick={downloadTemplate}
                className="text-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Import Template
              </Button>
            </div>

            {/* Import Progress */}
            {importLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">
                    Success: {importSuccess}
                  </span>
                  <span className="text-red-600">Errors: {importErrors}</span>
                </div>
              </div>
            )}

            {/* Preview Table */}
            {!importLoading && (
              <>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">
                      Valid: {importPreview.filter((r) => r.isValid).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm">
                      Invalid: {importPreview.filter((r) => !r.isValid).length}
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importPreview.map((row) => (
                        <TableRow
                          key={row.rowNumber}
                          className={!row.isValid ? "bg-red-50" : ""}
                        >
                          <TableCell className="font-mono">
                            {row.rowNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {!row.data.company && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span
                                className={
                                  !row.data.company ? "text-red-600" : ""
                                }
                              >
                                {row.data.company || "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{row.data.phonenumber || "-"}</TableCell>
                          <TableCell>{row.data.city || "-"}</TableCell>
                          <TableCell>{row.data.address || "-"}</TableCell>
                          <TableCell>
                            {row.data.status ? (
                              <Badge variant="outline">{row.data.status}</Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {row.data.type ? (
                              <Badge variant="outline">{row.data.type}</Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {row.data.active !== undefined
                              ? row.data.active === 1
                                ? "Active"
                                : "Inactive"
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div
                              className="max-w-[150px] truncate"
                              title={row.data.note}
                            >
                              {row.data.note || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {row.errors.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-xs text-red-600">
                                  {row.errors[0]}
                                </span>
                              </div>
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" disabled={importLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleImport}
              disabled={
                importLoading ||
                importPreview.filter((r) => r.isValid).length === 0
              }
            >
              {importLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {importPreview.filter((r) => r.isValid).length} Valid
                  Rows
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Comprehensive Form */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information. All fields except ID can be modified.
            </DialogDescription>
          </DialogHeader>

          {editingCustomer && (
            <div className="space-y-6 py-4">
              {/* Customer ID (Read-only) */}
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <Label className="text-sm font-medium text-muted-foreground">
                  Customer ID
                </Label>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{editingCustomer.userid}</span>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Company Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    value={editFormData.company}
                    onChange={handleFormChange}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Customer Type
                  </Label>
                  <Select
                    value={editFormData.type || "none"}
                    onValueChange={(value) =>
                      handleSelectChange("type", value === "none" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Contact Information
                </h3>

                <div className="space-y-2">
                  <Label
                    htmlFor="phonenumber"
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phonenumber"
                    name="phonenumber"
                    value={editFormData.phonenumber}
                    onChange={handleFormChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Location Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={editFormData.city}
                    onChange={handleFormChange}
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPinned className="h-4 w-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={editFormData.address}
                    onChange={handleFormChange}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              {/* Status Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Status Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="status" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Status
                  </Label>
                  <Select
                    value={editFormData.status || "none"}
                    onValueChange={(value) =>
                      handleSelectChange(
                        "status",
                        value === "none" ? "" : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${option.color}`}
                            />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={editFormData.active === 1}
                    onCheckedChange={handleActiveChange}
                  />
                  <Label htmlFor="active" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Active Customer
                  </Label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Additional Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="note" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </Label>
                  <Textarea
                    id="note"
                    name="note"
                    value={editFormData.note}
                    onChange={handleFormChange}
                    placeholder="Enter any additional notes..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit} className="min-w-[100px]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Customer Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to your database. Fill in the information
              below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Company Information
              </h3>

              <div className="space-y-2">
                <Label
                  htmlFor="create-company"
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="create-company"
                  name="company"
                  value={createFormData.company}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="create-type"
                  className="flex items-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  Customer Type
                </Label>
                <Select
                  value={createFormData.type || "none"}
                  onValueChange={(value) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      type: value === "none" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Contact Information
              </h3>

              <div className="space-y-2">
                <Label
                  htmlFor="create-phonenumber"
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="create-phonenumber"
                  name="phonenumber"
                  value={createFormData.phonenumber}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      phonenumber: e.target.value,
                    }))
                  }
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Location Information
              </h3>

              <div className="space-y-2">
                <Label
                  htmlFor="create-city"
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  City
                </Label>
                <Input
                  id="create-city"
                  name="city"
                  value={createFormData.city}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="create-address"
                  className="flex items-center gap-2"
                >
                  <MapPinned className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="create-address"
                  name="address"
                  value={createFormData.address}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Status Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Status Information
              </h3>

              <div className="space-y-2">
                <Label
                  htmlFor="create-status"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Status
                </Label>
                <Select
                  value={createFormData.status || "none"}
                  onValueChange={(value) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      status: value === "none" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${option.color}`}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-active"
                  checked={createFormData.active === 1}
                  onCheckedChange={(checked) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      active: checked ? 1 : 0,
                    }))
                  }
                />
                <Label
                  htmlFor="create-active"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Active Customer
                </Label>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Additional Information
              </h3>

              <div className="space-y-2">
                <Label
                  htmlFor="create-note"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Notes
                </Label>
                <Textarea
                  id="create-note"
                  name="note"
                  value={createFormData.note}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                  placeholder="Enter any additional notes..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveCreate} className="min-w-[100px]">
              Create Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              customer and all associated data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedCustomers.length} customers?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {selectedCustomers.length} customers and all associated data from
              the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomersPage;
