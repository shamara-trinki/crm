import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Mail } from "lucide-react";
import type { Customer } from "@/lib/api";
import { renderCellContent } from "./StatusBadges";
import { PermissionGate } from "@/components/PermissionGate";

interface CustomerRowProps {
  customer: Customer;
  visibleColumns: string[];
  isSelected: boolean;
  onSelect: (customerId: number) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: number) => void;
  onContact: (customerId: number) => void;
}

export const CustomerRow: React.FC<CustomerRowProps> = ({
  customer,
  visibleColumns,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onContact,
}) => {
  return (
    <PermissionGate permission="CUSTOMER_VIEW">
 
       <TableRow className="hover:bg-muted/50">
     
              <PermissionGate permission="CUSTOMER_DELETE">
                 <TableCell>
                        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(customer.userid)}
          aria-label={`Select customer ${customer.userid}`}
        />
          </TableCell>
              </PermissionGate>


      {visibleColumns.map((columnKey) => (
        <TableCell key={`${customer.userid}-${columnKey}`}>
          <div className="flex items-center gap-2">
            {renderCellContent(customer, columnKey)}
          </div>
        </TableCell>
      ))}

        <PermissionGate permission="CUSTOMER_UPDATE">
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

            <DropdownMenuItem onClick={() => onEdit(customer)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Customer
            </DropdownMenuItem>

            <PermissionGate permission="CUSTOMER_DELETE">
              <DropdownMenuItem
              onClick={() => onDelete(customer.userid)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
            </PermissionGate>
            

          </DropdownMenuContent>
        </DropdownMenu>
          </TableCell>
         </PermissionGate>  

      <PermissionGate permission="CUSTOMER_VIEW">     
              <TableCell>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onContact(customer.userid)}
        >
          <Mail className="h-4 w-4 mr-2" />
          Contact
        </Button>
       </TableCell>
      </PermissionGate>

    </TableRow>
    </PermissionGate>
 
  );
};
