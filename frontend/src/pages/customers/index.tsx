import React from "react";
import { useCustomerData } from "./hooks/useCustomerData";
import { CustomersHeader } from "./components/CustomersHeader";
import { CustomersSearchBar } from "./components/CustomersSearchBar";
import { CustomersTable } from "./components/CustomersTable";
import { PaginationControls } from "./components/PaginationControls";
import { CreateCustomerDialog } from "./components/CustomerDialogs/CreateCustomerDialog";
import { EditCustomerDialog } from "./components/CustomerDialogs/EditCustomerDialog";
import { DeleteCustomerDialog } from "./components/CustomerDialogs/DeleteCustomerDialog";
import { BulkDeleteDialog } from "./components/CustomerDialogs/BulkDeleteDialog";
import { ImportDialog } from "./components/CustomerDialogs/ImportDialog";

const CustomersPage = () => {
  const data = useCustomerData();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <CustomersHeader
        selectedCustomers={data.selectedCustomers}
        onBulkDeleteClick={() => data.setBulkDeleteDialogOpen(true)}
        onCreateClick={data.handleCreateClick}
        onImportClick={() => document.getElementById("file-upload")?.click()}
        onExport={data.handleExport}
        visibleColumnsCount={data.visibleColumns.length}
      />

      <input
        id="file-upload"
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={data.handleFileSelect}
        ref={data.fileInputRef}
      />

      <CustomersSearchBar
        search={data.search}
        setSearch={data.setSearch}
        onClearSearch={data.handleClearSearch}
        visibleColumns={data.visibleColumns}
        setVisibleColumns={data.setVisibleColumns}
        limit={data.limit}
        setLimit={data.setLimit}
        setPage={data.setPage}
        debouncedSearch={data.debouncedSearch}
        customersCount={data.customers.length}
      />

      {!data.loading && data.customers.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {(data.page - 1) * data.limit + 1} to{" "}
          {Math.min(data.page * data.limit, data.totalCustomers)} of {data.totalCustomers} customers
        </div>
      )}

      <CustomersTable
        customers={data.customers}
        loading={data.loading}
        visibleColumns={data.visibleColumns}
        selectedCustomers={data.selectedCustomers}
        selectAll={data.selectAll}
        onSelectAll={data.handleSelectAll}
        onSelectCustomer={data.handleSelectCustomer}
        onEdit={data.handleEditClick}
        onDelete={data.handleDeleteClick}
        onContact={data.handleContactClick}
      />

      {!data.loading && data.customers.length > 0 && (
        <PaginationControls
          page={data.page}
          totalPages={data.totalPages}
          onFirstPage={data.handleFirstPage}
          onPrevPage={data.handlePrevPage}
          onNextPage={data.handleNextPage}
          onLastPage={data.handleLastPage}
          setPage={data.setPage}
        />
      )}

      <CreateCustomerDialog
        open={data.createDialogOpen}
        onOpenChange={data.setCreateDialogOpen}
        formData={data.createFormData}
        setFormData={data.setCreateFormData}
        onSave={data.handleSaveCreate}
      />

      <EditCustomerDialog
        open={data.editDialogOpen}
        onOpenChange={data.setEditDialogOpen}
        editingCustomer={data.editingCustomer}
        formData={data.editFormData}
        onFormChange={data.handleFormChange}
        onSelectChange={data.handleSelectChange}
        onActiveChange={data.handleActiveChange}
        onSave={data.handleSaveEdit}
      />

      <DeleteCustomerDialog
        open={data.deleteDialogOpen}
        onOpenChange={data.setDeleteDialogOpen}
        onConfirm={data.handleConfirmDelete}
      />

      <BulkDeleteDialog
        open={data.bulkDeleteDialogOpen}
        onOpenChange={data.setBulkDeleteDialogOpen}
        selectedCount={data.selectedCustomers.length}
        onConfirm={data.handleBulkDelete}
      />

      <ImportDialog
        open={data.importDialogOpen}
        onOpenChange={(open) => {
          data.setImportDialogOpen(open);
          if (!open) {
            if (data.fileInputRef.current) data.fileInputRef.current.value = "";
            data.setImportPreview([]);
          }
        }}
        importPreview={data.importPreview}
        importLoading={data.importLoading}
        importProgress={data.importProgress}
        importSuccess={data.importSuccess}
        importErrors={data.importErrors}
        onImport={data.handleImport}
      />
    </div>
  );
};

export default CustomersPage;
