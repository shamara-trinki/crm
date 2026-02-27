// E:\SVG\crm\frontend\src\pages\Contact.tsx
import React, { useState, useEffect, useRef } from "react";
import { contactsApi, type Contact, type ContactsResponse } from "@/lib/api";
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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Loader2,
  Building2,
  Phone,
  Mail,
  User,
  Calendar,
  CheckCircle,
  Tag,
  FileText,
  Settings2,
  MoreHorizontal,
  Edit,
  Trash2,
  Trash,
  Download,
  Upload,
  FileSpreadsheet,
  FileText as FileTextIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Briefcase,
  Star,
  Users,
  ArrowLeft,
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
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Progress } from "@/components/ui/progress";

const ContactsPage = () => {
  const navigate = useNavigate();
  const { userid } = useParams<{ userid: string }>(); // Get company ID from URL
  const companyId = parseInt(userid || "0");

  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [company, setCompany] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);

  // Selection state for bulk delete
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    title: "",
    is_primary: 0,
    active: 1,
  });

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    title: "",
    is_primary: 0,
    active: 1,
  });

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);

  // Bulk delete confirmation dialog state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const { toast } = useToast();

  // Debounce search
  const debouncedSearch = useDebounce(search, 500);

  // Define all available columns
  const AVAILABLE_COLUMNS = [
    { key: "id", label: "ID", defaultVisible: true, icon: Tag },
    { key: "firstname", label: "First Name", defaultVisible: true, icon: User },
    { key: "lastname", label: "Last Name", defaultVisible: true, icon: User },
    { key: "email", label: "Email", defaultVisible: true, icon: Mail },
    { key: "phonenumber", label: "Phone", defaultVisible: true, icon: Phone },
    { key: "title", label: "Title", defaultVisible: true, icon: Briefcase },
    {
      key: "is_primary",
      label: "Primary",
      defaultVisible: true,
      icon: Star,
    },
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
  ];



  // State to track which columns are visible
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem("contactColumns");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return AVAILABLE_COLUMNS.filter((col) => col.defaultVisible).map(
          (col) => col.key
        );
      }
    }
    return AVAILABLE_COLUMNS.filter((col) => col.defaultVisible).map(
      (col) => col.key
    );
  });

  // Save to localStorage whenever visible columns change
  useEffect(() => {
    localStorage.setItem("contactColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Fetch company details
  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  // Fetch contacts when page, limit, or debounced search changes
  useEffect(() => {
    if (companyId) {
      fetchContacts();
    }
  }, [companyId, page, limit, debouncedSearch]);

  // Reset selection when contacts change
  useEffect(() => {
    setSelectedContacts([]);
    setSelectAll(false);
  }, [contacts]);

  const fetchCompanyDetails = async () => {
    try {
      const response = await customersApi.getById(companyId);
      setCompany(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load company details",
        variant: "destructive",
      });
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await contactsApi.listForCompany(companyId, {
        page,
        limit,
        search: debouncedSearch,
      });

      setContacts(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalContacts(response.data.total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle create button click
  const handleCreateClick = () => {
    setCreateFormData({
      firstname: "",
      lastname: "",
      email: "",
      phonenumber: "",
      title: "",
      is_primary: 0,
      active: 1,
    });
    setCreateDialogOpen(true);
  };

  // Handle save new contact
  const handleSaveCreate = async () => {

    try {
      await contactsApi.create({
        ...createFormData,
        userid: companyId,
      });

      toast({
        title: "Success",
        description: "Contact created successfully",
      });

      setCreateDialogOpen(false);
      fetchContacts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create contact",
        variant: "destructive",
      });
    }
  };

  // Fetch all contacts for export
  const fetchAllContactsForExport = async (): Promise<Contact[]> => {
    try {
      const initialResponse = await contactsApi.listForCompany(companyId, {
        page: 1,
        limit: 1,
      });
      const totalCount = initialResponse.data.total;

      const response = await contactsApi.listForCompany(companyId, {
        page: 1,
        limit: totalCount,
        search: debouncedSearch,
      });

      return response.data.data;
    } catch (error) {
      console.error("Error fetching all contacts:", error);
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

  // Handle select all contacts
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle select single contact
  const handleSelectContact = (contactId: number) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId));
      setSelectAll(false);
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  // Handle edit button click
  const handleEditClick = (contact: Contact) => {
    setEditingContact(contact);
    setEditFormData({
      firstname: contact.firstname,
      lastname: contact.lastname,
      email: contact.email,
      phonenumber: contact.phonenumber || "",
      title: contact.title || "",
      is_primary: contact.is_primary,
      active: contact.active,
    });
    setEditDialogOpen(true);
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle primary checkbox change
  const handlePrimaryChange = (checked: boolean) => {
    setEditFormData((prev) => ({
      ...prev,
      is_primary: checked ? 1 : 0,
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
    if (!editingContact) return;

    try {
      await contactsApi.update(editingContact.id, {
        ...editFormData,
        userid: companyId,
      });

      toast({
        title: "Success",
        description: "Contact updated successfully",
      });

      setEditDialogOpen(false);
      fetchContacts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
    }
  };

  // Handle delete button click
  const handleDeleteClick = (contactId: number) => {
    setContactToDelete(contactId);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;

    try {
      await contactsApi.delete(contactToDelete);

      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });

      setDeleteDialogOpen(false);
      setContactToDelete(null);
      fetchContacts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;

    try {
      await Promise.all(selectedContacts.map((id) => contactsApi.delete(id)));

      toast({
        title: "Success",
        description: `${selectedContacts.length} contacts deleted successfully`,
      });

      setBulkDeleteDialogOpen(false);
      setSelectedContacts([]);
      setSelectAll(false);
      fetchContacts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contacts",
        variant: "destructive",
      });
    }
  };

  // Handle delete all contacts of company
  const handleDeleteAllContacts = async () => {
    try {
      await contactsApi.deleteAllForCompany(companyId);

      toast({
        title: "Success",
        description: "All contacts deleted successfully",
      });

      fetchContacts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete all contacts",
        variant: "destructive",
      });
    }
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

  // Helper function to render primary badge
  const renderPrimaryBadge = (isPrimary: number) => {
    if (isPrimary === 1) {
      return (
        <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
          <Star className="h-3 w-3 mr-1" />
          Primary
        </Badge>
      );
    } else {
      return <Badge variant="outline">Secondary</Badge>;
    }
  };

  // Helper function to render cell content
  const renderCellContent = (contact: Contact, columnKey: string) => {
    switch (columnKey) {
      case "id":
        return contact.id;
      case "firstname":
        return contact.firstname || "-";
      case "lastname":
        return contact.lastname || "-";
      case "email":
        return contact.email || "-";
      case "phonenumber":
        return contact.phonenumber || "-";
      case "title":
        return contact.title || "-";
      case "is_primary":
        return renderPrimaryBadge(contact.is_primary);
      case "datecreated":
        return contact.datecreated
          ? new Date(contact.datecreated).toLocaleDateString()
          : "-";
      case "active":
        return renderActiveBadge(contact.active);
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
  const prepareExportData = (contactsToExport: Contact[]) => {
    return contactsToExport.map((contact) => {
      const row: any = {};

      visibleColumns.forEach((key) => {
        const column = AVAILABLE_COLUMNS.find((col) => col.key === key);
        if (!column) return;

        let value = contact[key as keyof Contact];

        switch (key) {
          case "datecreated":
            row[column.label] = value
              ? new Date(value as string).toLocaleDateString()
              : "-";
            break;
          case "active":
            row[column.label] = value === 1 ? "Active" : "Inactive";
            break;
          case "is_primary":
            row[column.label] = value === 1 ? "Primary" : "Secondary";
            break;
          default:
            row[column.label] = value ?? "-";
        }
      });

      return row;
    });
  };

  // Export to Excel
  const exportToExcel = (dataToExport: Contact[], filename: string) => {
    try {
      const exportData = prepareExportData(dataToExport);
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Contacts");
      XLSX.writeFile(wb, `${filename}.xlsx`);

      toast({
        title: "Success",
        description: `Exported ${dataToExport.length} contacts to Excel`,
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
  const exportToPDF = (dataToExport: Contact[], filename: string) => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text(`Contacts List - ${company?.company || "Company"}`, 14, 22);

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 36);

      const columns = visibleColumns.map((key) => {
        const column = AVAILABLE_COLUMNS.find((col) => col.key === key);
        return column?.label || key;
      });

      const rows = dataToExport.map((contact) => {
        return visibleColumns.map((key) => {
          const value = contact[key as keyof Contact];

          switch (key) {
            case "datecreated":
              return value
                ? new Date(value as string).toLocaleDateString()
                : "-";
            case "active":
              return value === 1 ? "Active" : "Inactive";
            case "is_primary":
              return value === 1 ? "Primary" : "Secondary";
            default:
              return value ?? "-";
          }
        });
      });

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

      toast({
        title: "Success",
        description: `Exported ${dataToExport.length} contacts to PDF`,
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
    scope: "all" | "selected" | "current"
  ) => {
    let dataToExport: Contact[] = [];
    let filename = `contacts_${company?.company || "company"}_${
      new Date().toISOString().split("T")[0]
    }`;

    try {
      switch (scope) {
        case "selected":
          if (selectedContacts.length === 0) {
            toast({
              title: "No contacts selected",
              description: "Please select contacts to export",
              variant: "destructive",
            });
            return;
          }
          dataToExport = contacts.filter((c) => selectedContacts.includes(c.id));
          filename = `selected_contacts_${new Date().toISOString().split("T")[0]}`;
          break;

        case "current":
          dataToExport = contacts;
          filename = `page_${page}_contacts_${new Date().toISOString().split("T")[0]}`;
          break;

        case "all":
          toast({
            title: "Exporting",
            description: "Fetching all contacts for export...",
          });
          setLoading(true);
          dataToExport = await fetchAllContactsForExport();
          filename = `all_contacts_${new Date().toISOString().split("T")[0]}`;
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
        description: "Failed to fetch contacts for export",
        variant: "destructive",
      });
    } finally {
      if (scope === "all") {
        setLoading(false);
      }
    }
  };

useEffect(() => {
  console.log(totalContacts, totalPages, limit, page);
}, [totalContacts, totalPages, limit, page]); // Runs whenever any of these values change

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header flex items-center justify-between">
        <div>  
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Contacts - {company?.company || "Loading..."}
            </h1>
            <p className="crm-page-subtitle">
              Manage contacts for this customer
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {selectedContacts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedContacts.length} selected
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
            Add Contact
          </Button>


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
                      disabled={selectedContacts.length === 0}
                    >
                      Selected ({selectedContacts.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("excel", "all")}
                    >
                      All Contacts
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
                    <DropdownMenuItem
                      onClick={() => handleExport("pdf", "current")}
                    >
                      Current Page
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("pdf", "selected")}
                      disabled={selectedContacts.length === 0}
                    >
                      Selected ({selectedContacts.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("pdf", "all")}
                    >
                      All Contacts
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteAllContacts}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Contacts
              </DropdownMenuItem>
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
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, email, phone, or title..."
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
                        setVisibleColumns(
                          visibleColumns.filter((id) => id !== column.key)
                        );
                      } else {
                        toast({
                          title: "Cannot hide",
                          description: "At least one column must remain visible",
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
                    (col) => col.defaultVisible
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
                {[10, 20, 50, 100, 500].map((l) => (
                  <SelectItem key={l} value={l.toString()}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {debouncedSearch && (
          <div className="mt-2 text-sm text-muted-foreground">
            Showing results for "{debouncedSearch}"
            {contacts.length === 0 && " - No matches found"}
          </div>
        )}
      </Card>

      {/* Results Summary */}
      {!loading && contacts.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1} to{" "}
          {Math.min(page * limit, totalContacts)} of {totalContacts} contacts
        </div>
      )}

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectAll && contacts.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>

                {visibleColumns.map((columnKey) => {
                  const column = AVAILABLE_COLUMNS.find(
                    (col) => col.key === columnKey
                  );
                  return (
                    <TableHead key={columnKey}>
                      <div className="flex items-center gap-1">
                        {column?.icon && (
                          <column.icon className="h-4 w-4 shrink-0" />
                        )}
                        <span>{column?.label || columnKey}</span>
                      </div>
                    </TableHead>
                  );
                })}

                <TableHead className="w-24">
                  <div className="flex items-center gap-1">
                    <MoreHorizontal className="h-4 w-4" />
                    Actions
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + 2}
                    className="h-32 text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Loading contacts...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + 2}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No contacts found
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => handleSelectContact(contact.id)}
                        aria-label={`Select contact ${contact.id}`}
                      />
                    </TableCell>

                    {visibleColumns.map((columnKey) => (
                      <TableCell key={`${contact.id}-${columnKey}`}>
                        {renderCellContent(contact, columnKey)}
                      </TableCell>
                    ))}

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
                            onClick={() => handleEditClick(contact)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Contact
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(contact.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {!loading && contacts.length > 0 && (
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information for {editingContact?.firstname}{" "}
              {editingContact?.lastname}
            </DialogDescription>
          </DialogHeader>

          {editingContact && (
            <div className="space-y-6 py-4">
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <Label className="text-sm font-medium text-muted-foreground">
                  Contact ID
                </Label>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{editingContact.id}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstname" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      First Name
                    </Label>
                    <Input
                      id="firstname"
                      name="firstname"
                      value={editFormData.firstname}
                      onChange={handleFormChange}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastname" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Last Name
                    </Label>
                    <Input
                      id="lastname"
                      name="lastname"
                      value={editFormData.lastname}
                      onChange={handleFormChange}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editFormData.email}
                    onChange={handleFormChange}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phonenumber" className="flex items-center gap-2">
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

                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Job Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={editFormData.title}
                    onChange={handleFormChange}
                    placeholder="Enter job title"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Status Information
                </h3>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-primary"
                      checked={editFormData.is_primary === 1}
                      onCheckedChange={handlePrimaryChange}
                    />
                    <Label htmlFor="edit-primary" className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Primary Contact
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-active"
                      checked={editFormData.active === 1}
                      onCheckedChange={handleActiveChange}
                    />
                    <Label htmlFor="edit-active" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Active
                    </Label>
                  </div>
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

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact for {company?.company}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-firstname" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    First Name
                  </Label>
                  <Input
                    id="create-firstname"
                    name="firstname"
                    value={createFormData.firstname}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        firstname: e.target.value,
                      }))
                    }
                    placeholder="Enter first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-lastname" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Last Name
                  </Label>
                  <Input
                    id="create-lastname"
                    name="lastname"
                    value={createFormData.lastname}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        lastname: e.target.value,
                      }))
                    }
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="create-email"
                  name="email"
                  type="email"
                  value={createFormData.email}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-phonenumber" className="flex items-center gap-2">
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

              <div className="space-y-2">
                <Label htmlFor="create-title" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Title
                </Label>
                <Input
                  id="create-title"
                  name="title"
                  value={createFormData.title}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter job title"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Status Information
              </h3>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-primary"
                    checked={createFormData.is_primary === 1}
                    onCheckedChange={(checked) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        is_primary: checked ? 1 : 0,
                      }))
                    }
                  />
                  <Label htmlFor="create-primary" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Primary Contact
                  </Label>
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
                  <Label htmlFor="create-active" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Active
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveCreate} className="min-w-[100px]">
              Create Contact
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
              contact from the database.
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
              Delete {selectedContacts.length} contacts?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {selectedContacts.length} contacts from the database.
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

export default ContactsPage;