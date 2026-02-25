import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText as FileTextIcon } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";

interface ExportMenuProps {
  selectedCount: number;
  onExport: (type: "excel" | "pdf", scope: "all" | "selected" | "current") => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ selectedCount, onExport }) => {
  return (
    <PermissionGate permission="CUSTOMER_VIEW">
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
              <DropdownMenuItem onClick={() => onExport("excel", "current")}>
                Current Page
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onExport("excel", "selected")}
                disabled={selectedCount === 0}
              >
                Selected ({selectedCount})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("excel", "all")}>
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
              <DropdownMenuItem onClick={() => onExport("pdf", "current")}>
                Current Page
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onExport("pdf", "selected")}
                disabled={selectedCount === 0}
              >
                Selected ({selectedCount})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("pdf", "all")}>
                All Customers
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
    </PermissionGate>

  );
};
