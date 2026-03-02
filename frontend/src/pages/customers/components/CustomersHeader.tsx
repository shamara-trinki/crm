import React from "react";
import { Button } from "@/components/ui/button";
import { Trash, PlusCircle, Upload } from "lucide-react";
import { ExportMenu } from "./ExportMenu";
import { PermissionGate } from "@/components/PermissionGate";

interface CustomersHeaderProps {
  selectedCustomers: number[];
  onBulkDeleteClick: () => void;
  onCreateClick: () => void;
  onImportClick: () => void;
  onExport: (type: "excel" | "pdf", scope: "all" | "selected" | "current") => void;
  visibleColumnsCount: number;
}

export const CustomersHeader: React.FC<CustomersHeaderProps> = ({
  selectedCustomers,
  onBulkDeleteClick,
  onCreateClick,
  onImportClick,
  onExport,
  visibleColumnsCount,
}) => {
  return (
    
    <div className="crm-page-header flex items-center justify-between">
      <div>
        <h1 className="crm-page-title">Customers</h1>
        <p className="crm-page-subtitle">
          Manage and view all your customer relationships
        </p>
      </div>
      <div className="flex items-center gap-4">
        {selectedCustomers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedCustomers.length} selected
            </span>
            <PermissionGate permission="CUSTOMER_DELETE">
                          <Button variant="destructive" size="sm" onClick={onBulkDeleteClick}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
            </PermissionGate>

          </div>
        )}

        <PermissionGate permission="CUSTOMER_CREATE">
          <Button onClick={onCreateClick}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
          </PermissionGate>  

        <PermissionGate permission="CUSTOMER_CREATE">
                  <Button variant="outline" size="sm"         onClick={onImportClick}>
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        </PermissionGate>

        <PermissionGate permission="CUSTOMER_CREATE">
                  <ExportMenu
          selectedCount={selectedCustomers.length}
          onExport={onExport}
        />
        </PermissionGate>


        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {visibleColumnsCount} columns visible
          </span>
        </div>
      </div>
    </div>
  );
};
