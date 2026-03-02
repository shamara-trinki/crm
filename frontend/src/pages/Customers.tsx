// E:\SVG\crm\frontend\src\pages\Customers.tsx

import React, { useState, useEffect, useRef } from "react";
import { customersApi, type Customer } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useFieldPermissions } from "@/hooks/useFieldPermissions";
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
import { Progress } from "@/components/ui/progress";
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
  PlusCircle,
  Eye,
  EyeOff,
  Lock,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Interface for import preview data
interface ImportPreview {
  rowNumber: number;
  data: Partial<Customer>;
  errors: string[];
  isValid: boolean;
}

// Interface for column visibility
interface ColumnConfig {
  key: string;
  label: string;
  defaultVisible: boolean;
  icon: any;
  description?: string;
}

const CustomersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    canViewField, 
    canUpdateField, 
    canCreate, 
    canDelete,
  } = useFieldPermissions('CUSTOMER');

  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [updateableFields, setUpdateableFields] = useState<string[]>([]);

  // Selection state
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Customer>>({});

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<Partial<Customer>>({
    company: "",
    phonenumber: "",
    city: "",
    address: "",
    note: "",
    status: "",
    type: "",
    active: 1,
  });

  // View details dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Import state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importSuccess, setImportSuccess] = useState(0);
  const [importErrors, setImportErrors] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPaginationRef = useRef(false);

  // Column visibility state
  const [columnHelpOpen, setColumnHelpOpen] = useState(false);

  // Define all available columns with icons and descriptions
  const ALL_COLUMNS: ColumnConfig[] = [
    { 
      key: "userid", 
      label: "ID", 
      defaultVisible: true, 
      icon: Hash,
      description: "Unique customer identifier" 
    },
    { 
      key: "company", 
      label: "Company", 
      defaultVisible: true, 
      icon: Building2,
      description: "Customer company or organization name" 
    },
    { 
      key: "phonenumber", 
      label: "Phone", 
      defaultVisible: true, 
      icon: Phone,
      description: "Primary contact phone number" 
    },
    { 
      key: "city", 
      label: "City", 
      defaultVisible: true, 
      icon: MapPin,
      description: "Customer city location" 
    },
    { 
      key: "address", 
      label: "Address", 
      defaultVisible: true, 
      icon: MapPinned,
      description: "Street address" 
    },
    { 
      key: "datecreated", 
      label: "Date Created", 
      defaultVisible: false, 
      icon: Calendar,
      description: "Customer registration date" 
    },
    { 
      key: "active", 
      label: "Active", 
      defaultVisible: false, 
      icon: CheckCircle,
      description: "Whether customer is active" 
    },
    { 
      key: "type", 
      label: "Type", 
      defaultVisible: false, 
      icon: Tag,
      description: "Customer type (business/individual)" 
    },
    { 
      key: "note", 
      label: "Note", 
      defaultVisible: false, 
      icon: FileText,
      description: "Additional notes about customer" 
    },
    { 
      key: "status", 
      label: "Status", 
      defaultVisible: false, 
      icon: Clock,
      description: "Current customer status" 
    },
  ];

  // Filter columns based on view permissions
  const AVAILABLE_COLUMNS = ALL_COLUMNS.filter(col => canViewField(col.key));

  // Status options
  const statusOptions = [
    { value: "finished", label: "Finished", color: "bg-green-500" },
    { value: "implementation", label: "Implementation", color: "bg-yellow-500" },
    { value: "not finished", label: "Not Finished", color: "bg-red-500" },
  ];

  // Type options
  const typeOptions = [
    { value: "amc", label: "AMC" },
    { value: "visit", label: "Visit" },
  ];

  // Column visibility state with permission filtering
const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
  // Get default visible columns based on permissions
  const defaultColumns = AVAILABLE_COLUMNS
    .filter(col => col.defaultVisible)
    .map(col => col.key);
  
  try {
    const saved = localStorage.getItem("customerColumns");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only keep saved columns that user still has permission to view
      const filteredSaved = parsed.filter((key: string) => 
        AVAILABLE_COLUMNS.some(col => col.key === key)
      );
      
      // If after filtering we have columns, use them
      if (filteredSaved.length > 0) {
        return filteredSaved;
      }
    }
  } catch (error) {
    console.error("Error parsing saved columns:", error);
  }
  
  // Always fall back to default columns if no valid saved columns exist
  return defaultColumns;
});

  // Debounce search
  const debouncedSearch = useDebounce(search, 500);

  // Save column visibility
  useEffect(() => {
    localStorage.setItem("customerColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Fetch customers
  useEffect(() => {
    fetchCustomers();
  }, [page, limit, debouncedSearch]);

  // Reset selection when customers change
  useEffect(() => {
    setSelectedCustomers([]);
    setSelectAll(false);
  }, [customers]);

  const fetchCustomers = async () => {
  const scrollY = window.scrollY; // Save scroll position
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
    
    if (response.data.permissions?.updateableFields) {
      setUpdateableFields(response.data.permissions.updateableFields);
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to load customers",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
    setTimeout(() => window.scrollTo(0, scrollY), 0);
    isPaginationRef.current = false;
  }
};
  // Get visible columns based on permissions
  const getVisibleColumns = () => {
    return AVAILABLE_COLUMNS.filter(col => 
      visibleColumns.includes(col.key)
    );
  };

  // Handle create
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

  const handleSaveCreate = async () => {
    if (!createFormData.company?.trim()) {
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
      fetchCustomers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      });
    }
  };

  // Handle view
  const handleViewClick = (customer: Customer) => {
    setViewingCustomer(customer);
    setViewDialogOpen(true);
  };

  // Handle edit
  const handleEditClick = (customer: Customer) => {
    // Only include fields user can view
    const formData: Partial<Customer> = {};
    AVAILABLE_COLUMNS.forEach(col => {
      if (customer[col.key as keyof Customer] !== undefined) {
        formData[col.key as keyof Customer] = customer[col.key as keyof Customer];
      }
    });
    
    setEditingCustomer(customer);
    setEditFormData(formData);
    setEditDialogOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (!canUpdateField(name)) {
      toast({
        title: "Permission Denied",
        description: `You don't have permission to update the ${name} field`,
        variant: "destructive",
      });
      return;
    }

    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!canUpdateField(name)) {
      toast({
        title: "Permission Denied",
        description: `You don't have permission to update the ${name} field`,
        variant: "destructive",
      });
      return;
    }

    setEditFormData(prev => ({
      ...prev,
      [name]: value === "none" ? "" : value,
    }));
  };

  const handleActiveChange = (checked: boolean) => {
    if (!canUpdateField("active")) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to update the active status",
        variant: "destructive",
      });
      return;
    }

    setEditFormData(prev => ({
      ...prev,
      active: checked ? 1 : 0,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingCustomer) return;

    try {
      await customersApi.update(editingCustomer.userid, editFormData);
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      setEditDialogOpen(false);
      fetchCustomers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDeleteClick = (customerId: number) => {
    if (!canDelete()) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete customers",
        variant: "destructive",
      });
      return;
    }
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };

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
      fetchCustomers();
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
    if (!canDelete()) return;

    try {
      await Promise.all(selectedCustomers.map(id => customersApi.delete(id)));
      toast({
        title: "Success",
        description: `${selectedCustomers.length} customers deleted successfully`,
      });
      setBulkDeleteDialogOpen(false);
      setSelectedCustomers([]);
      setSelectAll(false);
      fetchCustomers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customers",
        variant: "destructive",
      });
    }
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.userid));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCustomer = (customerId: number) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
      setSelectAll(false);
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  // Handle contact
  const handleContactClick = (customerId: number) => {
    navigate(`/contacts/${customerId}`);
  };

  // Render helpers
  const renderActiveBadge = (isActive: number) => {
    return isActive === 1 ? (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        Active
      </Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );
  };

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
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            {status}
          </Badge>
        );
      case "not finished":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return status;
    }
  };

  const renderCellContent = (customer: Customer, columnKey: string) => {
    switch (columnKey) {
      case "userid":
        return (
          <span className="font-mono text-sm">{customer.userid}</span>
        );
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
        ) : "-";
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

  // Export functions
  const fetchAllCustomersForExport = async (): Promise<Customer[]> => {
    try {
      const initialResponse = await customersApi.list({ page: 1, limit: 1 });
      const totalCount = initialResponse.data.total;
      const response = await customersApi.list({
        page: 1,
        limit: totalCount,
        search: debouncedSearch,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all customers:", error);
      throw error;
    }
  };

  const prepareExportData = (customersToExport: Customer[]) => {
    return customersToExport.map((customer) => {
      const row: any = {};
      getVisibleColumns().forEach(col => {
        let value = customer[col.key as keyof Customer];
        switch (col.key) {
          case "datecreated":
            row[col.label] = value ? new Date(value as string).toLocaleDateString() : "-";
            break;
          case "active":
            row[col.label] = value === 1 ? "Active" : "Inactive";
            break;
          default:
            row[col.label] = value ?? "-";
        }
      });
      return row;
    });
  };

  const exportToExcel = (dataToExport: Customer[], filename: string) => {
    try {
      const exportData = prepareExportData(dataToExport);
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Customers");
      XLSX.writeFile(wb, `${filename}.xlsx`);
      toast({
        title: "Success",
        description: `Exported ${dataToExport.length} customers to Excel`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export to Excel",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = (dataToExport: Customer[], filename: string) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Customers List", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 36);

      const columns = getVisibleColumns().map(col => col.label);
      const rows = dataToExport.map(customer => 
        getVisibleColumns().map(col => {
          const value = customer[col.key as keyof Customer];
          switch (col.key) {
            case "datecreated":
              return value ? new Date(value as string).toLocaleDateString() : "-";
            case "active":
              return value === 1 ? "Active" : "Inactive";
            default:
              return value ?? "-";
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
      });

      doc.save(`${filename}.pdf`);
      toast({
        title: "Success",
        description: `Exported ${dataToExport.length} customers to PDF`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export to PDF",
        variant: "destructive",
      });
    }
  };

  const handleExport = async (type: "excel" | "pdf", scope: "all" | "selected" | "current") => {
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
          dataToExport = customers.filter(c => selectedCustomers.includes(c.userid));
          filename = `selected_customers_${new Date().toISOString().split("T")[0]}`;
          break;
        case "current":
          dataToExport = customers;
          filename = `page_${page}_customers_${new Date().toISOString().split("T")[0]}`;
          break;
        case "all":
          setLoading(true);
          dataToExport = await fetchAllCustomersForExport();
          filename = `all_customers_${new Date().toISOString().split("T")[0]}`;
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

  // Import functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        previewImportData(jsonData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse the file",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const previewImportData = (rows: any[]) => {
    if (rows.length < 2) {
      toast({
        title: "Empty file",
        description: "The file contains no data rows",
        variant: "destructive",
      });
      return;
    }

    const headers = rows[0] as string[];
    const dataRows = rows.slice(1);
    const preview: ImportPreview[] = [];

    dataRows.forEach((row, index) => {
      const rowData: Partial<Customer> = {};
      const errors: string[] = [];

      headers.forEach((header, colIndex) => {
        const fieldMap: Record<string, keyof Customer> = {
          Company: "company",
          company: "company",
          Phone: "phonenumber",
          phone: "phonenumber",
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

        const fieldName = fieldMap[header];
        if (fieldName && row[colIndex] !== undefined) {
          let value = row[colIndex];
          if (fieldName === "active") {
            if (typeof value === "string") {
              value = ["active", "yes", "1", "true"].includes(value.toLowerCase()) ? 1 : 0;
            } else {
              value = value ? 1 : 0;
            }
          }
          (rowData as any)[fieldName] = value;
        }
      });

      if (!rowData.company?.toString().trim()) {
        errors.push("Company name is required");
      }

      preview.push({
        rowNumber: index + 2,
        data: rowData,
        errors,
        isValid: errors.length === 0 && canCreate(),
      });
    });

    setImportPreview(preview);
    setImportDialogOpen(true);
  };

  const handleImport = async () => {
    if (!canCreate()) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create customers",
        variant: "destructive",
      });
      return;
    }

    const validRows = importPreview.filter(row => row.isValid);
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
        await customersApi.create(validRows[i].data);
        successCount++;
      } catch (error) {
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

    fetchCustomers();
    setTimeout(() => {
      setImportDialogOpen(false);
      setImportPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 2000);
  };

  const downloadTemplate = () => {
    const template = [
      ["Company", "Phone", "City", "Address", "Status", "Type", "Active", "Note"],
      ["Example Company", "+1234567890", "New York", "123 Main St", "finished", "amc", "Yes", "Sample note"],
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

  const visibleColumnsList = getVisibleColumns();

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and view all your customer relationships
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Permission Summary */}
          <DropdownMenu open={columnHelpOpen} onOpenChange={setColumnHelpOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Your Permissions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Create Customers:</span>
                  {canCreate() ? (
                    <Badge variant="default" className="bg-green-500">Allowed</Badge>
                  ) : (
                    <Badge variant="destructive">Not Allowed</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Delete Customers:</span>
                  {canDelete() ? (
                    <Badge variant="default" className="bg-green-500">Allowed</Badge>
                  ) : (
                    <Badge variant="destructive">Not Allowed</Badge>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="text-sm font-medium mb-2">Field Access:</div>
                {AVAILABLE_COLUMNS.map(col => (
                  <div key={col.key} className="flex items-center justify-between text-xs">
                    <span>{col.label}:</span>
                    <div className="flex gap-2">
                      <Eye className="h-3 w-3 text-green-500" />
                      {canUpdateField(col.key) ? (
                        <Edit className="h-3 w-3 text-green-500" />
                      ) : (
                        <Lock className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedCustomers.length > 0 && canDelete() && (
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

          {canCreate() && (
            <Button onClick={handleCreateClick}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          )}

          {canCreate() && (
            <>
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
            </>
          )}

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
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  <span>Excel</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExport("excel", "current")}>
                      Current Page
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExport("excel", "selected")}
                      disabled={selectedCustomers.length === 0}
                    >
                      Selected ({selectedCustomers.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("excel", "all")}>
                      All Customers
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  <span>PDF</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExport("pdf", "current")}>
                      Current Page
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExport("pdf", "selected")}
                      disabled={selectedCustomers.length === 0}
                    >
                      Selected ({selectedCustomers.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf", "all")}>
                      All Customers
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Only show columns dropdown if there are visible columns */}
          {AVAILABLE_COLUMNS.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Columns ({visibleColumnsList.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
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
                        if (visibleColumns.length > 1) {
                          setVisibleColumns(visibleColumns.filter(id => id !== column.key));
                        } else {
                          toast({
                            title: "Cannot hide",
                            description: "At least one column must remain visible",
                          });
                        }
                      }
                    }}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-2">
                      <column.icon className="h-4 w-4" />
                      <span>{column.label}</span>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    const defaultColumns = AVAILABLE_COLUMNS
                      .filter(col => col.defaultVisible)
                      .map(col => col.key);
                    setVisibleColumns(defaultColumns);
                  }}
                  className="justify-center text-primary"
                >
                  Reset to Default
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Show:
            </span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setLimit(parseInt(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100, 500].map(l => (
                  <SelectItem key={l} value={l.toString()}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {debouncedSearch && (
          <div className="text-sm text-muted-foreground">
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

      {/* Table - Only show if there are visible columns */}
      {visibleColumnsList.length > 0 && (
        <Card className="overflow-hidden mt-2">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {/* Only show checkbox column if user has delete permission */}
                  {canDelete() && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll && customers.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}

                  {visibleColumnsList.map((column) => (
                    <TableHead key={column.key} className="whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <column.icon className="h-4 w-4 shrink-0" />
                        <span>{column.label}</span>
                      </div>
                    </TableHead>
                  ))}

                  <TableHead className="w-24">Actions</TableHead>
                  <TableHead className="w-24">Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell 
                      colSpan={visibleColumnsList.length + (canDelete() ? 3 : 2)} 
                      className="h-32 text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground">Loading customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={visibleColumnsList.length + (canDelete() ? 3 : 2)} 
                      className="h-32 text-center text-muted-foreground"
                    >
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.userid} className="hover:bg-muted/50">
                      {/* Only show checkbox column if user has delete permission */}
                      {canDelete() && (
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomers.includes(customer.userid)}
                            onCheckedChange={() => handleSelectCustomer(customer.userid)}
                          />
                        </TableCell>
                      )}

                      {visibleColumnsList.map((column) => (
                        <TableCell key={`${customer.userid}-${column.key}`}>
                          {renderCellContent(customer, column.key)}
                        </TableCell>
                      ))}

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewClick(customer)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* Only show edit button if user has update permission for at least one field */}
                          {updateableFields.length > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(customer)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {/* Only show delete button if user has delete permission */}
                          {canDelete() && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(customer.userid)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>

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
      )}

      {/* Show message if no columns are visible */}
      {visibleColumnsList.length === 0 && !loading && (
        <Card className="p-8 text-center text-muted-foreground">
          <EyeOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Columns Visible</h3>
          <p>You don't have permission to view any customer fields.</p>
        </Card>
      )}

      {/* Pagination - Only show if there are customers */}
      {!loading && customers.length > 0 && (
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                isPaginationRef.current = true;
                setPage(1);
              }}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                isPaginationRef.current = true;
                setPage(p => Math.max(1, p - 1));
              }}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 text-sm">
              {page}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                isPaginationRef.current = true;
                setPage(p => Math.min(totalPages, p + 1));
              }}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                isPaginationRef.current = true;
                setPage(totalPages);
              }}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Customer Details</DialogTitle>
            <DialogDescription>
              View detailed customer information
            </DialogDescription>
          </DialogHeader>

          {viewingCustomer && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {canViewField("userid") && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Customer ID</Label>
                      <p className="font-mono">{viewingCustomer.userid}</p>
                    </div>
                  )}
                  {canViewField("company") && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Company Name</Label>
                      <p>{viewingCustomer.company || "-"}</p>
                    </div>
                  )}
                  {canViewField("type") && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Type</Label>
                      <p>{viewingCustomer.type || "-"}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              {canViewField("phonenumber") && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                  <div>
                    <Label className="text-sm text-muted-foreground">Phone Number</Label>
                    <p>{viewingCustomer.phonenumber || "-"}</p>
                  </div>
                </div>
              )}

              {/* Location Information */}
              {(canViewField("city") || canViewField("address")) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Location Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {canViewField("city") && (
                      <div>
                        <Label className="text-sm text-muted-foreground">City</Label>
                        <p>{viewingCustomer.city || "-"}</p>
                      </div>
                    )}
                    {canViewField("address") && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Address</Label>
                        <p>{viewingCustomer.address || "-"}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Information */}
              {(canViewField("status") || canViewField("active")) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Status Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {canViewField("status") && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Status</Label>
                        <div className="mt-1">{renderStatusBadge(viewingCustomer.status)}</div>
                      </div>
                    )}
                    {canViewField("active") && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Active Status</Label>
                        <div className="mt-1">{renderActiveBadge(viewingCustomer.active)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {canViewField("note") && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
                  <div>
                    <Label className="text-sm text-muted-foreground">Notes</Label>
                    <p className="whitespace-pre-wrap">{viewingCustomer.note || "-"}</p>
                  </div>
                </div>
              )}

              {/* System Information */}
              {canViewField("datecreated") && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">System Information</h3>
                  <div>
                    <Label className="text-sm text-muted-foreground">Date Created</Label>
                    <p>{new Date(viewingCustomer.datecreated).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information. Fields you don't have permission to edit will be disabled.
            </DialogDescription>
          </DialogHeader>

          {editingCustomer && (
            <div className="space-y-6 py-4">
              {/* Read-only ID */}
              {canViewField("userid") && (
                <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Customer ID
                  </Label>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{editingCustomer.userid}</span>
                  </div>
                </div>
              )}

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Company Information</h3>
                
                {canViewField("company") && (
                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Name
                      {!canUpdateField("company") && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      value={editFormData.company || ""}
                      onChange={handleFormChange}
                      placeholder="Enter company name"
                      disabled={!canUpdateField("company")}
                    />
                  </div>
                )}

                {canViewField("type") && (
                  <div className="space-y-2">
                    <Label htmlFor="type" className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Customer Type
                      {!canUpdateField("type") && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </Label>
                    <Select
                      value={editFormData.type || "none"}
                      onValueChange={(value) => handleSelectChange("type", value)}
                      disabled={!canUpdateField("type")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {typeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              {canViewField("phonenumber") && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="phonenumber" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                      {!canUpdateField("phonenumber") && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </Label>
                    <Input
                      id="phonenumber"
                      name="phonenumber"
                      value={editFormData.phonenumber || ""}
                      onChange={handleFormChange}
                      placeholder="Enter phone number"
                      disabled={!canUpdateField("phonenumber")}
                    />
                  </div>
                </div>
              )}

              {/* Location Information */}
              {(canViewField("city") || canViewField("address")) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Location Information</h3>
                  
                  {canViewField("city") && (
                    <div className="space-y-2">
                      <Label htmlFor="city" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        City
                        {!canUpdateField("city") && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={editFormData.city || ""}
                        onChange={handleFormChange}
                        placeholder="Enter city"
                        disabled={!canUpdateField("city")}
                      />
                    </div>
                  )}

                  {canViewField("address") && (
                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPinned className="h-4 w-4" />
                        Address
                        {!canUpdateField("address") && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={editFormData.address || ""}
                        onChange={handleFormChange}
                        placeholder="Enter address"
                        disabled={!canUpdateField("address")}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Status Information */}
              {(canViewField("status") || canViewField("active")) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Status Information</h3>
                  
                  {canViewField("status") && (
                    <div className="space-y-2">
                      <Label htmlFor="status" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Status
                        {!canUpdateField("status") && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Label>
                      <Select
                        value={editFormData.status || "none"}
                        onValueChange={(value) => handleSelectChange("status", value)}
                        disabled={!canUpdateField("status")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {statusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${option.color}`} />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {canViewField("active") && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="active"
                        checked={editFormData.active === 1}
                        onCheckedChange={handleActiveChange}
                        disabled={!canUpdateField("active")}
                      />
                      <Label htmlFor="active" className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Active Customer
                        {!canUpdateField("active") && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Label>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {canViewField("note") && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="note" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notes
                      {!canUpdateField("note") && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </Label>
                    <Textarea
                      id="note"
                      name="note"
                      value={editFormData.note || ""}
                      onChange={handleFormChange}
                      placeholder="Enter any additional notes..."
                      rows={4}
                      disabled={!canUpdateField("note")}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSaveEdit} 
              disabled={updateableFields.length === 0}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to your database. Fill in the information below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Company Information</h3>
              
              {canViewField("company") && (
                <div className="space-y-2">
                  <Label htmlFor="create-company" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="create-company"
                    name="company"
                    value={createFormData.company}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
              )}

              {canViewField("type") && (
                <div className="space-y-2">
                  <Label htmlFor="create-type" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Customer Type
                  </Label>
                  <Select
                    value={createFormData.type || "none"}
                    onValueChange={(value) => setCreateFormData(prev => ({ 
                      ...prev, 
                      type: value === "none" ? "" : value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {typeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Contact Information */}
            {canViewField("phonenumber") && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="create-phonenumber" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="create-phonenumber"
                    name="phonenumber"
                    value={createFormData.phonenumber}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, phonenumber: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            )}

            {/* Location Information */}
            {(canViewField("city") || canViewField("address")) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Location Information</h3>
                
                {canViewField("city") && (
                  <div className="space-y-2">
                    <Label htmlFor="create-city" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      City
                    </Label>
                    <Input
                      id="create-city"
                      name="city"
                      value={createFormData.city}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Enter city"
                    />
                  </div>
                )}

                {canViewField("address") && (
                  <div className="space-y-2">
                    <Label htmlFor="create-address" className="flex items-center gap-2">
                      <MapPinned className="h-4 w-4" />
                      Address
                    </Label>
                    <Input
                      id="create-address"
                      name="address"
                      value={createFormData.address}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter address"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Status Information */}
            {(canViewField("status") || canViewField("active")) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Status Information</h3>
                
                {canViewField("status") && (
                  <div className="space-y-2">
                    <Label htmlFor="create-status" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Status
                    </Label>
                    <Select
                      value={createFormData.status || "none"}
                      onValueChange={(value) => setCreateFormData(prev => ({ 
                        ...prev, 
                        status: value === "none" ? "" : value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${option.color}`} />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {canViewField("active") && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="create-active"
                      checked={createFormData.active === 1}
                      onCheckedChange={(checked) => setCreateFormData(prev => ({ 
                        ...prev, 
                        active: checked ? 1 : 0 
                      }))}
                    />
                    <Label htmlFor="create-active" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Active Customer
                    </Label>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {canViewField("note") && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="create-note" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </Label>
                  <Textarea
                    id="create-note"
                    name="note"
                    value={createFormData.note}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Enter any additional notes..."
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveCreate}>Create Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Preview Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Import Customers</DialogTitle>
            <DialogDescription>
              Preview your data before importing. Valid rows will be imported.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="link" onClick={downloadTemplate} className="text-primary">
                <Download className="h-4 w-4 mr-2" />
                Download Import Template
              </Button>
            </div>

            {importLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">Success: {importSuccess}</span>
                  <span className="text-red-600">Errors: {importErrors}</span>
                </div>
              </div>
            )}

            {!importLoading && (
              <>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">
                      Valid: {importPreview.filter(r => r.isValid).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm">
                      Invalid: {importPreview.filter(r => !r.isValid).length}
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
                      {importPreview.map(row => (
                        <TableRow key={row.rowNumber} className={!row.isValid ? "bg-red-50" : ""}>
                          <TableCell className="font-mono">{row.rowNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {!row.data.company && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className={!row.data.company ? "text-red-600" : ""}>
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
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            {row.data.type ? (
                              <Badge variant="outline">{row.data.type}</Badge>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            {row.data.active !== undefined
                              ? row.data.active === 1 ? "Active" : "Inactive"
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[150px] truncate" title={row.data.note}>
                              {row.data.note || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {row.errors.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-xs text-red-600">{row.errors[0]}</span>
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
              disabled={importLoading || importPreview.filter(r => r.isValid).length === 0}
            >
              {importLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {importPreview.filter(r => r.isValid).length} Valid Rows
                </>
              )}
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
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
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