import { useState, useEffect, useRef } from "react";
import { customersApi, type Customer } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import {
  type ImportPreview,
  type CustomerFormData,
  INITIAL_FORM_DATA,
} from "../types/customer.types";
import {
  AVAILABLE_COLUMNS,
  getDefaultVisibleColumns,
  exportToExcel,
  exportToPDF,
  fetchAllCustomersForExport,
  parseImportFile,
  previewImportRows,
} from "../utils/customerHelpers";

export const useCustomerData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Core data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Selection state
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState<CustomerFormData>(INITIAL_FORM_DATA);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CustomerFormData>(INITIAL_FORM_DATA);
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

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem("customerColumns");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultVisibleColumns();
      }
    }
    return getDefaultVisibleColumns();
  });

  const debouncedSearch = useDebounce(search, 500);

  // Save columns to localStorage
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

  // Reset page on search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customersApi.list({ page, limit, search: debouncedSearch });
      setCustomers(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalCustomers(response.data.total);
    } catch {
      toast({ title: "Error", description: "Failed to load customers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // CRUD handlers
  const handleCreateClick = () => {
    setCreateFormData(INITIAL_FORM_DATA);
    setCreateDialogOpen(true);
  };

  const handleSaveCreate = async () => {
    if (!createFormData.company.trim()) {
      toast({ title: "Validation Error", description: "Company name is required", variant: "destructive" });
      return;
    }
    try {
      await customersApi.create(createFormData);
      toast({ title: "Success", description: "Customer created successfully" });
      setCreateDialogOpen(false);
      fetchCustomers();
    } catch {
      toast({ title: "Error", description: "Failed to create customer", variant: "destructive" });
    }
  };

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

  const handleSaveEdit = async () => {
    if (!editingCustomer) return;
    try {
      await customersApi.update(editingCustomer.userid, editFormData);
      toast({ title: "Success", description: "Customer updated successfully" });
      setEditDialogOpen(false);
      fetchCustomers();
    } catch {
      toast({ title: "Error", description: "Failed to update customer", variant: "destructive" });
    }
  };

  const handleDeleteClick = (customerId: number) => {
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await customersApi.delete(customerToDelete);
      toast({ title: "Success", description: "Customer deleted successfully" });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch {
      toast({ title: "Error", description: "Failed to delete customer", variant: "destructive" });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;
    try {
      await Promise.all(selectedCustomers.map((id) => customersApi.delete(id)));
      toast({ title: "Success", description: `${selectedCustomers.length} customers deleted successfully` });
      setBulkDeleteDialogOpen(false);
      setSelectedCustomers([]);
      setSelectAll(false);
      fetchCustomers();
    } catch {
      toast({ title: "Error", description: "Failed to delete customers", variant: "destructive" });
    }
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((c) => c.userid));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCustomer = (customerId: number) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
      setSelectAll(false);
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  // Navigation
  const handleContactClick = (customerId: number) => {
    navigate(`/contacts/${customerId}`);
  };

  // Pagination
  const handleFirstPage = () => setPage(1);
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleLastPage = () => setPage(totalPages);
  const handleClearSearch = () => setSearch("");

  // Form handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleActiveChange = (checked: boolean) => {
    setEditFormData((prev) => ({ ...prev, active: checked ? 1 : 0 }));
  };

  // Export
  const handleExport = async (type: "excel" | "pdf", scope: "all" | "selected" | "current") => {
    let dataToExport: Customer[] = [];
    let filename = `customers_${new Date().toISOString().split("T")[0]}`;

    try {
      switch (scope) {
        case "selected":
          if (selectedCustomers.length === 0) {
            toast({ title: "No customers selected", description: "Please select customers to export", variant: "destructive" });
            return;
          }
          dataToExport = customers.filter((c) => selectedCustomers.includes(c.userid));
          filename = `selected_customers_${new Date().toISOString().split("T")[0]}`;
          break;
        case "current":
          dataToExport = customers;
          filename = `page_${page}_customers_${new Date().toISOString().split("T")[0]}`;
          break;
        case "all":
          toast({ title: "Exporting", description: "Fetching all customers for export..." });
          setLoading(true);
          dataToExport = await fetchAllCustomersForExport(debouncedSearch);
          filename = `all_customers_${new Date().toISOString().split("T")[0]}`;
          break;
      }

      if (dataToExport.length > 0) {
        const count = type === "excel"
          ? exportToExcel(dataToExport, filename, visibleColumns)
          : exportToPDF(dataToExport, filename, visibleColumns);
        toast({ title: "Success", description: `Exported ${count} customers to ${type === "excel" ? "Excel" : "PDF"}` });
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch customers for export", variant: "destructive" });
    } finally {
      if (scope === "all") setLoading(false);
    }
  };

  // Import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls") && !file.name.endsWith(".csv")) {
      toast({ title: "Invalid file type", description: "Please upload an Excel file (.xlsx, .xls) or CSV file", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const rows = parseImportFile(data);
        const preview = previewImportRows(rows);
        if (preview.length === 0) {
          toast({ title: "Empty file", description: "The file contains no data rows", variant: "destructive" });
          return;
        }
        setImportPreview(preview);
        setImportDialogOpen(true);
      } catch {
        toast({ title: "Error", description: "Failed to parse the file. Please check the format.", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    const validRows = importPreview.filter((row) => row.isValid);
    if (validRows.length === 0) {
      toast({ title: "No valid data", description: "No valid rows found to import", variant: "destructive" });
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
      } catch {
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

  return {
    // Data
    customers, loading, page, limit, search, totalPages, totalCustomers,
    selectedCustomers, selectAll,
    visibleColumns, setVisibleColumns,
    debouncedSearch,

    // Dialog states
    editDialogOpen, setEditDialogOpen, editingCustomer, editFormData,
    createDialogOpen, setCreateDialogOpen, createFormData, setCreateFormData,
    deleteDialogOpen, setDeleteDialogOpen, customerToDelete,
    bulkDeleteDialogOpen, setBulkDeleteDialogOpen,
    importDialogOpen, setImportDialogOpen, importPreview, setImportPreview,
    importLoading, importProgress, importSuccess, importErrors,
    fileInputRef,

    // Actions
    setSearch, setLimit, setPage,
    handleCreateClick, handleSaveCreate,
    handleEditClick, handleSaveEdit,
    handleDeleteClick, handleConfirmDelete,
    handleBulkDelete,
    handleSelectAll, handleSelectCustomer,
    handleContactClick,
    handleFirstPage, handlePrevPage, handleNextPage, handleLastPage,
    handleClearSearch,
    handleFormChange, handleSelectChange, handleActiveChange,
    handleExport, handleFileSelect, handleImport,
    fetchCustomers,
  };
};
