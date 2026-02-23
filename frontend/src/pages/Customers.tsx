import { useState, useEffect } from "react";
import { customersApi, type Customer } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Loader2,
  Building2,
  Phone,
  MapPin,
  Hash
} from "lucide-react";

const CustomersPage = () => {
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
  const { toast } = useToast();
  
  // Debounce search (wait 500ms after user stops typing)
  const debouncedSearch = useDebounce(search, 500);

  // Fetch customers when page, limit, or debounced search changes
  useEffect(() => {
    fetchCustomers();
  }, [page, limit, debouncedSearch]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customersApi.list({ 
        page, 
        limit, 
        search: debouncedSearch // Use debounced search value
      });
      
      setCustomers(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalCustomers(response.data.total);
      
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load customers", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage and view all your customer relationships
          </p>
        </div>
      </div>

      {/* Search and Filters Card */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input with Icon */}
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
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>

          {/* Limit Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Show:
            </span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => setLimit(parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((l) => (
                  <SelectItem key={l} value={l.toString()}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Stats */}
        {debouncedSearch && (
          <div className="mt-2 text-sm text-muted-foreground">
            Showing results for "{debouncedSearch}"
            {customers.length === 0 && " - No matches found"}
          </div>
        )}
      </Card>

      {/* Results Summary */}
      {!loading && customers.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCustomers)} of {totalCustomers} customers
        </div>
      )}

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16">
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    ID
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    Company
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    City
                  </div>
                </TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Loading customers...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.userid} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {customer.userid}
                    </TableCell>
                    <TableCell className="font-medium">
                      {customer.company || '-'}
                    </TableCell>
                    <TableCell>
                      {customer.phonenumber || '-'}
                    </TableCell>
                    <TableCell>
                      {customer.city || '-'}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {customer.address || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {!loading && customers.length > 0 && (
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
            
            {/* Page Numbers */}
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
    </div>
  );
};

export default CustomersPage;