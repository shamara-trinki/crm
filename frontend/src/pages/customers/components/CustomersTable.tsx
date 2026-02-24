import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, MoreHorizontal, Mail } from "lucide-react";
import type { Customer } from "@/lib/api";
import { AVAILABLE_COLUMNS } from "../utils/customerHelpers";
import { CustomerRow } from "./CustomerRow";
import { PermissionGate } from "@/components/PermissionGate";

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
  visibleColumns: string[];
  selectedCustomers: number[];
  selectAll: boolean;
  onSelectAll: () => void;
  onSelectCustomer: (customerId: number) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: number) => void;
  onContact: (customerId: number) => void;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  loading,
  visibleColumns,
  selectedCustomers,
  selectAll,
  onSelectAll,
  onSelectCustomer,
  onEdit,
  onDelete,
  onContact,
}) => {
  return (

    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">

              <PermissionGate permission="CUSTOMER_DELETE">
                              <TableHead className="w-12">
                <Checkbox
                  checked={selectAll && customers.length > 0}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              </PermissionGate>


              {visibleColumns.map((columnKey) => {
                const column = AVAILABLE_COLUMNS.find((col) => col.key === columnKey);
                return (
                  <TableHead
                    key={columnKey}
                    className={columnKey === "datecreated" ? "whitespace-nowrap min-w-[120px]" : "min-w-[100px]"}
                  >
                    <div className="flex items-center gap-1">
                      {column?.icon && <column.icon className="h-4 w-4 shrink-0" />}
                      <span className={columnKey === "datecreated" ? "whitespace-nowrap" : ""}>
                        {column?.label || columnKey}
                      </span>
                    </div>
                  </TableHead>
                );
              })}

              <PermissionGate permission="CUSTOMER_UPDATE">
                              <TableHead className="w-24 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <MoreHorizontal className="h-4 w-4" />
                  Actions
                </div>
              </TableHead>
              </PermissionGate>

              <PermissionGate permission="CUSTOMER_VIEW">
                              <TableHead className="w-24 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Contact
                </div>
              </TableHead>
              </PermissionGate>

            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 3}
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
                  colSpan={visibleColumns.length + 3}
                  className="h-32 text-center text-muted-foreground"
                >
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <CustomerRow
                  key={customer.userid}
                  customer={customer}
                  visibleColumns={visibleColumns}
                  isSelected={selectedCustomers.includes(customer.userid)}
                  onSelect={onSelectCustomer}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onContact={onContact}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
