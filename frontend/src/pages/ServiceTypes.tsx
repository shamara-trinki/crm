// E:\SVG\crm\frontend\src\pages\ServiceTypes.tsx
import React, { useState, useEffect } from "react";
import { serviceTypesApi, type ServiceType } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
import { Card } from "@/components/ui/card";
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
import {
  CreditCard,
  Edit,
  Trash2,
  PlusCircle,
  MoreHorizontal,
  Calendar,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const ServiceTypesPage = () => {
  // State
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ServiceType | null>(null);
  const [editName, setEditName] = useState("");

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<number | null>(null);

  const { toast } = useToast();

  // Columns definition
  const columns = [
    { key: "id", label: "ID", icon: CreditCard },
    { key: "name", label: "Name", icon: CreditCard },
    { key: "created_at", label: "Created At", icon: Calendar },
    { key: "created_by_name", label: "Created By", icon: User },
    { key: "updated_at", label: "Updated At", icon: Calendar },
    { key: "updated_by_name", label: "Updated By", icon: User },
  ];

  // Fetch all Service types
  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    setLoading(true);
    try {
      const response = await serviceTypesApi.getAll();
      setServiceTypes(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Service types",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create handlers
  const handleCreateClick = () => {
    setCreateName("");
    setCreateDialogOpen(true);
  };

  const handleSaveCreate = async () => {
    if (!createName.trim()) {
      toast({
        title: "Validation Error",
        description: "Service type name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await serviceTypesApi.create({ name: createName.trim() });
      toast({
        title: "Success",
        description: "Service type created successfully",
      });
      setCreateDialogOpen(false);
      fetchServiceTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create Service type",
        variant: "destructive",
      });
    }
  };

  // Edit handlers
  const handleEditClick = (method: ServiceType) => {
    setEditingMethod(method);
    setEditName(method.name);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMethod) return;

    if (!editName.trim()) {
      toast({
        title: "Validation Error",
        description: "Service type name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await serviceTypesApi.update(editingMethod.id, { name: editName.trim() });
      toast({
        title: "Success",
        description: "Service type updated successfully",
      });
      setEditDialogOpen(false);
      fetchServiceTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update Service type",
        variant: "destructive",
      });
    }
  };

  // Delete handlers
  const handleDeleteClick = (methodId: number) => {
    setMethodToDelete(methodId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!methodToDelete) return;

    try {
      await serviceTypesApi.delete(methodToDelete);
      toast({
        title: "Success",
        description: "Service type deleted successfully",
      });
      setDeleteDialogOpen(false);
      setMethodToDelete(null);
      fetchServiceTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete Service type",
        variant: "destructive",
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header flex items-center justify-between">
        <div>
          <h1 className="crm-page-title">Service types</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Service types for transactions
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Service type
        </Button>
      </div>

      {/* Results count */}
      {!loading && serviceTypes.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Total {serviceTypes.length} Service types
        </div>
      )}

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((column) => (
                  <TableHead key={column.key}>
                    <div className="flex items-center gap-1">
                      <column.icon className="h-4 w-4 shrink-0" />
                      <span>{column.label}</span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-32 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <span className="text-muted-foreground">
                        Loading Service types...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : serviceTypes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No Service types found
                  </TableCell>
                </TableRow>
              ) : (
                serviceTypes.map((method) => (
                  <TableRow key={method.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Badge variant="outline">{method.id}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>{formatDate(method.created_at)}</TableCell>
                    <TableCell>{method.created_by_name || "-"}</TableCell>
                    <TableCell>{formatDate(method.updated_at)}</TableCell>
                    <TableCell>{method.updated_by_name || "-"}</TableCell>

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
                            onClick={() => handleEditClick(method)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(method.id)}
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

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Service type</DialogTitle>
            <DialogDescription>
              Add a new Service type to the system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Enter Service type name"
                onKeyDown={(e) => e.key === "Enter" && handleSaveCreate()}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service type</DialogTitle>
            <DialogDescription>
              Update Service type information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter Service type name"
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
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
              Service type from the database.
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
    </div>
  );
};

export default ServiceTypesPage;
