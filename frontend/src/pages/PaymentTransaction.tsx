import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronsUpDown,
  Check,
  User,
  CreditCard,
  DollarSign,
  Package,
  Plus,
  X,
  Eye,
  Save,
  Search,
  Building2,
  Mail,
  Phone,
  ChevronLeft,
  Layers,
  PlusCircle,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Control } from "react-hook-form";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Types
interface Customer {
  userid: number;
  company: string;
  email?: string;
  phone?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: "AMC" | "BLS" | "Cloud" | "Whatsapp";
}

const mockCustomers: Customer[] = [
  { userid: 1, company: "Acme Corporation", email: "contact@acme.com", phone: "+1234567890" },
  { userid: 2, company: "TechStart Inc", email: "info@techstart.com", phone: "+1987654321" },
  { userid: 3, company: "Global Solutions Ltd", email: "hello@globalsolutions.com", phone: "+1122334455" },
  { userid: 4, company: "InnovateTech", email: "support@innovatetech.com", phone: "+1555666777" },
  { userid: 5, company: "Digital Dynamics", email: "contact@digitaldynamics.com", phone: "+1999888777" },
];

const mockPaymentMethods: PaymentMethod[] = [
  { id: "1", name: "AMC", type: "AMC" },
  { id: "2", name: "BLS", type: "BLS" },
  { id: "3", name: "Cloud", type: "Cloud" },
  { id: "4", name: "Whatsapp", type: "Whatsapp" },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const serviceItemSchema = z.object({
  id: z.string().optional(),
  paymentMethodId: z.string().optional(),
  softwareName: z.string().optional(),
  users: z.string().optional(),
  version: z.string().optional(),
  paymentStatus: z.enum(["paid", "not_paid"]).default("not_paid"),
  renewalMonth: z.string().optional(),
  renewalDate: z.date().optional(),
  lastPaidDate: z.date().optional(),
  units: z.number().positive("Units must be positive").int("Units must be a whole number").optional(),
  amount: z.number().positive("Amount must be positive").optional(),
});

const paymentFormSchema = z.object({
  customerId: z.number({ required_error: "Please select a customer" }),
  services: z.array(serviceItemSchema).min(1, "At least one service is required"),
});

type ServiceItem = z.infer<typeof serviceItemSchema>;
type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface ServiceCardProps {
  index: number;
  control: Control<PaymentFormValues>;
  onRemove?: () => void;
  isRemovable: boolean;
  onAddService?: () => void;
  isLastCard: boolean;
  
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  index,
  control,
  onRemove,
  isRemovable,
  onAddService,
  isLastCard,
}) => {
  const [paymentMethodSearchOpen, setPaymentMethodSearchOpen] = useState(false);
  const [renewalDateOpen, setRenewalDateOpen] = useState(false);
  const [lastPaidDateOpen, setLastPaidDateOpen] = useState(false);

  return (
    <Card className="relative border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200 bg-card">
      {isRemovable && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute top-3 right-3 h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {isLastCard && onAddService && (
        <Button
  type="button"
  variant="default"
  size="icon"
  onClick={onAddService}
  className="absolute top-3 right-12 h-7 w-7 rounded-full bg-primary hover:bg-primary/80 text-primary-foreground p-0 z-10"
>
  <PlusCircle className="h-4 w-4" />
</Button>
      )}

      <CardHeader className="pb-4 pt-5 px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
            {index + 1}
          </div>
          <CardTitle className="text-base font-semibold text-foreground">
            Service {index + 1}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-5">
        {/* Row 1: Service Type + Software + Users + Version */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={control}
            name={`services.${index}.paymentMethodId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Service Type
                </FormLabel>
                <Popover open={paymentMethodSearchOpen} onOpenChange={setPaymentMethodSearchOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between h-10 font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? mockPaymentMethods.find((m) => m.id === field.value)?.name
                          : "Select..."}
                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search..." />
                      <CommandList>
                        <CommandEmpty>No results.</CommandEmpty>
                        <CommandGroup>
                          {mockPaymentMethods.map((method) => (
                            <CommandItem
                              key={method.id}
                              value={method.name}
                              onSelect={() => {
                                field.onChange(method.id);
                                setPaymentMethodSearchOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3.5 w-3.5",
                                  field.value === method.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {method.name}
                              <Badge variant="outline" className="ml-auto text-[10px] px-1.5">
                                {method.type}
                              </Badge>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`services.${index}.softwareName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Software Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Tally Prime" {...field} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`services.${index}.users`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Users
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 5" {...field} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`services.${index}.version`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Version
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. v4.1" {...field} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="bg-border/40" />

        {/* Row 2: Payment Status + Renewal Month + Renewal Date + Last Paid Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={control}
            name={`services.${index}.paymentStatus`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Payment Status
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex gap-4 pt-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="paid" id={`paid-${index}`} />
                      <label htmlFor={`paid-${index}`} className="text-sm cursor-pointer">Paid</label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="not_paid" id={`notpaid-${index}`} />
                      <label htmlFor={`notpaid-${index}`} className="text-sm cursor-pointer">Not Paid</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`services.${index}.renewalMonth`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Renewal Month
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`services.${index}.renewalDate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Renewal Date
                </FormLabel>
                <Popover open={renewalDateOpen} onOpenChange={setRenewalDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start h-10 font-normal text-left",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-60" />
                        {field.value ? format(field.value, "PP") : "Pick date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => { field.onChange(date); setRenewalDateOpen(false); }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`services.${index}.lastPaidDate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Last Paid Date
                </FormLabel>
                <Popover open={lastPaidDateOpen} onOpenChange={setLastPaidDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start h-10 font-normal text-left",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-60" />
                        {field.value ? format(field.value, "PP") : "Pick date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => { field.onChange(date); setLastPaidDateOpen(false); }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="bg-border/40" />

        {/* Row 3: Units + Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={control}
            name={`services.${index}.units`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Units
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 1"
                      className="h-10 pl-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
                        field.onChange(value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
  control={control}
  name={`services.${index}.amount`}
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Amount (LKR)
      </FormLabel>
      <FormControl>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-sm font-medium text-muted-foreground flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </span>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className="h-10 pl-10 pr-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={field.value ?? ""}
            onChange={(e) => {
              const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
              field.onChange(value);
            }}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
        </div>
      </CardContent>
    </Card>
  );
};

// Review Dialog with Table
interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: ServiceItem[];
  customerName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({
  open,
  onOpenChange,
  services,
  customerName,
  onConfirm,
  onCancel,
}) => {
  const getServiceTypeName = (id?: string) =>
    mockPaymentMethods.find((m) => m.id === id)?.name || "—";

  const formatDateVal = (date?: Date) => (date ? format(date, "PP") : "—");

  const formatCurrency = (amount?: number) => {
    if (amount == null) return "—";
    return `LKR ${amount.toFixed(2)}`;
  };

  const totalAmount = services.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalUnits = services.reduce((sum, s) => sum + (s.units || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Review Transaction</DialogTitle>
              <DialogDescription className="mt-0.5">
                Confirm the details for <span className="font-semibold text-foreground">{customerName || "selected customer"}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-xs uppercase tracking-wider w-8">#</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Service</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Software</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-center">Users</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Version</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-center">Units</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-center">Status</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Renewal</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Last Paid</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">Amount (LKR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service, index) => (
                  <TableRow key={index} className="text-sm">
                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">{getServiceTypeName(service.paymentMethodId)}</TableCell>
                    <TableCell>{service.softwareName || "—"}</TableCell>
                    <TableCell className="text-center">{service.users || "—"}</TableCell>
                    <TableCell>{service.version || "—"}</TableCell>
                    <TableCell className="text-center font-medium">{service.units || "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={service.paymentStatus === "paid" ? "default" : "secondary"}
                        className="text-[11px] px-2 py-0.5"
                      >
                        {service.paymentStatus === "paid" ? "Paid" : "Not Paid"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="text-xs">{service.renewalMonth || "—"}</div>
                        <div className="text-xs text-muted-foreground">{formatDateVal(service.renewalDate)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{formatDateVal(service.lastPaidDate)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(service.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary row */}
          <div className="flex justify-end gap-4 mt-3">
            <div className="bg-muted/50 rounded-lg px-5 py-3 border border-border/60">
              <span className="text-sm text-muted-foreground mr-4">Total Units</span>
              <span className="text-lg font-bold text-foreground">
                {totalUnits}
              </span>
            </div>
            <div className="bg-muted/50 rounded-lg px-5 py-3 border border-border/60">
              <span className="text-sm text-muted-foreground mr-4">Total Amount (LKR)</span>
              <span className="text-lg font-bold text-foreground">
                {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-border/40 gap-2">
          <Button variant="outline" onClick={onCancel} className="min-w-[100px]">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="min-w-[140px] gap-2">
            <Save className="h-4 w-4" />
            Confirm & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
const PaymentTransaction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const customerSearchRef = useRef<HTMLInputElement>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      customerId: undefined,
      services: [
        {
          paymentMethodId: "",
          softwareName: "Busy",
          users: "",
          version: "V.22.6.2",
          paymentStatus: "not_paid",
          renewalMonth: "",
          renewalDate: undefined,
          lastPaidDate: undefined,
          units: undefined,
          amount: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter(
      (customer) =>
        customer.company.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.phone?.includes(customerSearch)
    );
  }, [customerSearch]);

  const addNewService = () => {
    append({
      paymentMethodId: "",
      softwareName: "Busy",
      users: "",
      version: "V.22.6.2",
      paymentStatus: "not_paid",
      renewalMonth: "",
      renewalDate: undefined,
      lastPaidDate: undefined,
      units: undefined,
      amount: undefined,
    });
    toast({ title: "Service added", description: "New service card has been added." });
  };

  const removeService = (index: number) => {
    remove(index);
    toast({ title: "Service removed", description: "Service card has been removed." });
  };

  const handleReview = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }
    setReviewOpen(true);
  };

  const handleConfirmSave = async () => {
    setReviewOpen(false);
    setLoading(true);
    try {
      const data = form.getValues();
      const selectedCustomer = mockCustomers.find((c) => c.userid === data.customerId);
      console.log("Payment Transaction Data:", {
        customer: selectedCustomer,
        services: data.services.map((service) => ({
          ...service,
          paymentMethodName: mockPaymentMethods.find((m) => m.id === service.paymentMethodId)?.name,
        })),
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({ title: "Success", description: "Payment transaction created successfully" });
      form.reset();
      setCustomerSearch("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment transaction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (form.formState.isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  }, [form.formState.isDirty, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty]);

  const selectedCustomer = mockCustomers.find((c) => c.userid === form.watch("customerId"));

  return (
    <div>
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="crm-page-title">
                New Payment Transaction
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Select a customer and configure services below.
              </p>
            </div>
            <Badge variant="outline" className="text-xs mt-1">
              {fields.length} {fields.length === 1 ? "Service" : "Services"}
            </Badge>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Customer Selection Card */}
            <Card className="border border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">Customer</CardTitle>
                  <span className="text-destructive text-sm">*</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Selected customer info bar */}
                {selectedCustomer && (
                  <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary/70" />
                      <span className="text-sm font-medium text-foreground">{selectedCustomer.company}</span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-sm">{selectedCustomer.email}</span>
                      </div>
                    )}
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="text-sm">{selectedCustomer.phone}</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        form.setValue("customerId", undefined as any);
                        setCustomerSearch("");
                      }}
                    >
                      Change
                    </Button>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between h-11 font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Search className="h-4 w-4 opacity-50" />
                                {field.value
                                  ? mockCustomers.find((c) => c.userid === field.value)?.company
                                  : "Search by name, email, or phone..."}
                              </div>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput
                              ref={customerSearchRef}
                              placeholder="Search customers..."
                              value={customerSearch}
                              onValueChange={setCustomerSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No customers found.</CommandEmpty>
                              <CommandGroup>
                                {filteredCustomers.map((customer) => (
                                  <CommandItem
                                    key={customer.userid}
                                    value={customer.company}
                                    onSelect={() => {
                                      form.setValue("customerId", customer.userid);
                                      setCustomerSearchOpen(false);
                                      setCustomerSearch("");
                                    }}
                                    className="cursor-pointer py-3"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 shrink-0",
                                        field.value === customer.userid ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-medium text-sm truncate">{customer.company}</span>
                                      <span className="text-xs text-muted-foreground truncate">
                                        {customer.email}{customer.phone ? ` · ${customer.phone}` : ""}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Services Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">Services</h2>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <ServiceCard
                    key={field.id}
                    index={index}
                    control={form.control}
                    onRemove={index > 0 ? () => removeService(index) : undefined}
                    isRemovable={index > 0}
                    onAddService={index === fields.length - 1 ? addNewService : undefined}
                    isLastCard={index === fields.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2 pb-4">
              <Button type="button" variant="outline" onClick={handleCancel} className="min-w-[100px]">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleReview}
                disabled={loading}
                className="min-w-[160px] gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Review & Save
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <ReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        services={form.getValues("services")}
        customerName={selectedCustomer?.company}
        onConfirm={handleConfirmSave}
        onCancel={() => setReviewOpen(false)}
      />
    </div>
  );
};

export default PaymentTransaction;