import React from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { ColumnSelector } from "./ColumnSelector";
import { PermissionGate } from "@/components/PermissionGate";

interface CustomersSearchBarProps {
  search: string;
  setSearch: (value: string) => void;
  onClearSearch: () => void;
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
  limit: number;
  setLimit: (limit: number) => void;
  setPage: (page: number) => void;
  debouncedSearch: string;
  customersCount: number;
}

export const CustomersSearchBar: React.FC<CustomersSearchBarProps> = ({
  search,
  setSearch,
  onClearSearch,
  visibleColumns,
  setVisibleColumns,
  limit,
  setLimit,
  setPage,
  debouncedSearch,
  customersCount,
}) => {
  return (
    <PermissionGate permission="CUSTOMER_VIEW">
          <Card className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by company, phone, city, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {search && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>

        <ColumnSelector
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Show:</span>
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
          {customersCount === 0 && " - No matches found"}
        </div>
      )}
    </Card>
    </PermissionGate>

  );
};
