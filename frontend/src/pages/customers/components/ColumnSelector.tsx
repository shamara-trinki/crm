import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";
import { AVAILABLE_COLUMNS, getDefaultVisibleColumns } from "../utils/customerHelpers";
import { PermissionGate } from "@/components/PermissionGate";

interface ColumnSelectorProps {
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  visibleColumns,
  setVisibleColumns,
}) => {
  const { toast } = useToast();

  return (
    
    <PermissionGate permission="CUSTOMER_VIEW">
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
                if (visibleColumns.length > 1) {
                  setVisibleColumns(visibleColumns.filter((id) => id !== column.key));
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
          onClick={() => setVisibleColumns(getDefaultVisibleColumns())}
          onSelect={(e) => e.preventDefault()}
          className="justify-center text-primary cursor-pointer"
        >
          Reset to Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </PermissionGate>


  );
};
