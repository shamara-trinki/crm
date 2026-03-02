import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "@/hooks/use-toast";

const customers = [
  { value: "cust-001", label: "Acme Corporation" },
  { value: "cust-002", label: "Global Tech Solutions" },
  { value: "cust-003", label: "Sunrise Industries" },
  { value: "cust-004", label: "Blue Ocean Enterprises" },
  { value: "cust-005", label: "Peak Performance Ltd" },
  { value: "cust-006", label: "Nova Systems" },
  { value: "cust-007", label: "Quantum Dynamics" },
];

const users = [
  { value: "user-001", label: "John Smith" },
  { value: "user-002", label: "Sarah Johnson" },
  { value: "user-003", label: "Mike Williams" },
  { value: "user-004", label: "Emily Davis" },
  { value: "user-005", label: "Robert Brown" },
];

let scheduleCounter = 1001;

const JobSchedule = () => {
  const navigate = useNavigate();
  const [scheduleNo] = useState(() => `JS-${scheduleCounter++}`);
  const [customer, setCustomer] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [user, setUser] = useState("");
  const [userOpen, setUserOpen] = useState(false);
  const status = "Open";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !date || !time || !reason || !user) {
      toast({ title: "Validation Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
     }
    toast({ title: "Job Scheduled", description: `Schedule ${scheduleNo} created successfully.` });
    navigate("/");
    navigate("/job-schedule");
  };

  return (
     <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard </Button>
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/job-schedule")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Job Schedules
        </Button>

        <div className="crm-page-header">
          <h1 className="crm-page-title">Job Schedule</h1>
          <p className="crm-page-subtitle">Create a new job schedule entry</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
          {/* Schedule No */}
          <div className="space-y-2">
            <Label>Job Schedule No</Label>
            <Input value={scheduleNo} readOnly className="bg-muted" />
          </div>

          {/* Customer Dropdown with Search */}
          <div className="space-y-2">
            <Label>Customer <span className="text-destructive">*</span></Label>
            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={customerOpen} className="w-full justify-between font-normal">
                  {customer ? customers.find(c => c.value === customer)?.label : "Select customer..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search customer..." />
                  <CommandList>
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      {customers.map(c => (
                        <CommandItem key={c.value} value={c.label} onSelect={() => { setCustomer(c.value); setCustomerOpen(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", customer === c.value ? "opacity-100" : "opacity-0")} />
                          {c.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Customer Call Date <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Job Schedule Date <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time <span className="text-destructive">*</span></Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason <span className="text-destructive">*</span></Label>
            <Textarea placeholder="Enter reason for job schedule..." value={reason} onChange={e => setReason(e.target.value)} rows={3} />
          </div>

          {/* User Dropdown with Search */}
          <div className="space-y-2">
            <Label>Assigned User <span className="text-destructive">*</span></Label>
            <Popover open={userOpen} onOpenChange={setUserOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={userOpen} className="w-full justify-between font-normal">
                  {user ? users.find(u => u.value === user)?.label : "Select user..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search user..." />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {users.map(u => (
                        <CommandItem key={u.value} value={u.label} onSelect={() => { setUser(u.value); setUserOpen(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", user === u.value ? "opacity-100" : "opacity-0")} />
                          {u.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success">
                {status}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Save Schedule</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/")}>Cancel</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/job-schedule")}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobSchedule;
