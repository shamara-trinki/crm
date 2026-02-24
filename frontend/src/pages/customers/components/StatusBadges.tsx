import React from "react";
import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/lib/api";

export const renderActiveBadge = (isActive: number) => {
  if (isActive === 1) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        Active
      </Badge>
    );
  }
  return <Badge variant="destructive">Inactive</Badge>;
};

export const renderStatusBadge = (status: string | null | undefined) => {
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
        <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">
          {status}
        </Badge>
      );
    case "not-finished":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <>{status}</>;
  }
};

export const renderCellContent = (customer: Customer, columnKey: string) => {
  switch (columnKey) {
    case "userid":
      return customer.userid;
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
      return customer.type ? <Badge variant="outline">{customer.type}</Badge> : "-";
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
