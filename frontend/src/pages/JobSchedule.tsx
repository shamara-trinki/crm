import React, { useState, useEffect } from "react";
import { jobsApi } from "@/lib/api";
import {
  CalendarIcon, Clock, Search,
  Edit2, Trash2, RefreshCcw, Plus
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { toast } from "@/hooks/use-toast";

// ----------------------- Types -----------------------
type JobStatus = "Open" | "Done" | "Cancelled" | "Rescheduled";

interface JobSchedules {
  id: string;
  scheduleNo: string;
  parentJobNo?: string;
  customer: string;
  requestedDate: Date;
  scheduleDate: Date;
  time: string;
  reason: string;
  assignedUser: string;
  status: JobStatus;
}

interface Option {
  value: string;
  label: string;
}

// ----------------------- Component -----------------------
export default function JobSchedule() {
  // --- 1. CORE LIST STATE ---
  const [schedules, setSchedules] = useState<JobSchedules[]>([]);

  // --- 2. UI CONTROL STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobSchedules | null>(null);

  // --- 3. FORM STATE (ADD NEW) ---
  const [scheduleCounter, setScheduleCounter] = useState(1001);
  const [customer, setCustomer] = useState("");
  const [reqDate, setReqDate] = useState<Date | undefined>(new Date());
  const [schDate, setSchDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("09:00");
  const [assignedUser, setAssignedUser] = useState("");
  const [reason, setReason] = useState("");

  // --- 4. UPDATE/RESCHEDULE STATE ---
  const [updateStatus, setUpdateStatus] = useState<JobStatus>("Open");
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleUser, setRescheduleUser] = useState("");

  // --- 5. DYNAMIC DROPDOWNS ---
  const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([]);
const [filteredCustomerOptions, setFilteredCustomerOptions] = useState<{ value: string; label: string }[]>([]);
const [staffOptions, setStaffOptions] = useState<{ value: string; label: string }[]>([]);


  // ------------------- Fetch Jobs, Customers, Staff -------------------
  const fetchJobs = async () => {
    try {
      const res = await jobsApi.list();
      setSchedules(res.data.data.map((job: any) => ({
        id: job.id.toString(),
        scheduleNo: job.jobno,
        customer: job.customer_name,
        requestedDate: new Date(job.req_date),
        scheduleDate: new Date(job.schedule_date),
        time: format(new Date(job.schedule_date), "HH:mm"),
        assignedUser: job.staff_name,
        status: job.status as JobStatus,
        reason: job.reason || "",
      })));
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch jobs", variant: "destructive" });
    }
  };


// --- 2️⃣ Effect to fetch jobs, customers, staff ---
useEffect(() => {
  // Fetch jobs
  fetchJobs();

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await jobsApi.listCustomers();
      const options = res.data.data.map((c: any) => ({
        value: c.userid.toString(),
        label: c.company,
      }));
      setCustomerOptions(options);

      // Initialize filtered list
      setFilteredCustomerOptions(options);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  // Fetch staff
  const fetchStaff = async () => {
    try {
      const res = await jobsApi.listStaff();
      const options = res.data.data.map((s: any) => ({
        value: s.staff_id.toString(),
        label: s.staff_name,
      }));
      setStaffOptions(options);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  };

  fetchCustomers();
  fetchStaff();
}, []);
  // ------------------- Handlers -------------------
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !assignedUser) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    try {
      await jobsApi.create({
        customer_id: parseInt(customer),               // selected customer ID
        jobno: `JS-${scheduleCounter}`,               // generated job number
        req_date: reqDate?.toISOString(),             // requested date
        schedule_date: schDate?.toISOString(),       // scheduled date
        staff_id: parseInt(assignedUser),            // selected staff ID
        reason: reason || "",                         // optional reason
      });

      toast({ title: "Success", description: "Job created successfully." });

      // Close modal and reset form
      setIsAddModalOpen(false);
      setCustomer("");
      setAssignedUser("");
      setReqDate(new Date());
      setSchDate(new Date());
      setReason("");

      // Refresh job list
      fetchJobs();

      // Increment schedule counter
      setScheduleCounter(prev => prev + 1);

    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to create job.", variant: "destructive" });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedJob) return;
    try {
      if (updateStatus === "Rescheduled") {
        await jobsApi.reschedule(parseInt(selectedJob.id), {
          new_schedule_date: rescheduleDate?.toISOString(),
          staff_id: parseInt(rescheduleUser),
          reason,
        });
      } else {
        await jobsApi.updateStatus(parseInt(selectedJob.id), updateStatus);
      }

      toast({ title: "Updated", description: `Job ${selectedJob.scheduleNo} updated.` });
      setIsUpdateModalOpen(false);
      setSelectedJob(null);
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update job.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await jobsApi.delete(parseInt(id));
      toast({ title: "Deleted", description: "Job removed from schedule.", variant: "destructive" });
      setSchedules(prev => prev.filter(j => j.id !== id));
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete job.", variant: "destructive" });
    }
  };

  const filteredSchedules = schedules.filter(job =>
    job.scheduleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ------------------- JSX -------------------
  return (
    <div className="w-full h-full space-y-2 p-1">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border-b">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800">Job Schedules</h1>
          <p className="text-xs text-muted-foreground">Manage and track technician visits</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="pl-8 h-8 text-xs bg-slate-50/50 border-none ring-1 ring-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="h-8 gap-1.5 px-3 text-xs">
            <Plus className="h-3.5 w-3.5" /> New Job
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border-x border-b shadow-sm overflow-hidden mx-1">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="h-10 text-xs font-semibold uppercase text-slate-500 pl-4">Job No</TableHead>
              <TableHead className="h-10 text-xs font-semibold uppercase text-slate-500">Customer</TableHead>
              <TableHead className="h-10 text-xs font-semibold uppercase text-slate-500">Schedule Info</TableHead>
              <TableHead className="h-10 text-xs font-semibold uppercase text-slate-500">Staff</TableHead>
              <TableHead className="h-10 text-xs font-semibold uppercase text-slate-500">Status</TableHead>
              <TableHead className="h-10 text-xs font-semibold uppercase text-slate-500 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.map((job) => (
              <TableRow key={job.id} className="group border-b last:border-0">
                <TableCell className="py-2 pl-4">
                  <span className="font-bold text-blue-600 text-sm">{job.scheduleNo}</span>
                </TableCell>
                <TableCell className="py-2 text-sm text-slate-700 font-medium">{job.customer}</TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3 text-slate-400" />
                      {format(job.scheduleDate, "MMM dd, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {job.time}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border uppercase">
                      {job.assignedUser.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs">{job.assignedUser}</span>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <Badge className={cn(
                    "shadow-none px-2 py-0 text-[10px] font-medium border capitalize",
                    job.status === "Open" && "bg-blue-50 text-blue-700 border-blue-200",
                    job.status === "Done" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                    job.status === "Rescheduled" && "bg-amber-50 text-amber-700 border-amber-200",
                    job.status === "Cancelled" && "bg-red-50 text-red-700 border-red-200",
                  )}>
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-2 text-right pr-4">
                  <div className="flex justify-end gap-0.5">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => { setSelectedJob(job); setUpdateStatus(job.status); setIsUpdateModalOpen(true); }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                      onClick={() => { setSelectedJob(job); setUpdateStatus("Rescheduled"); setIsUpdateModalOpen(true); }}
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MODAL ADD NEW --- */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">New Job Schedule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSchedule} className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Label>Job No</Label>
              <Input value={`JS-${scheduleCounter}`} disabled className="bg-slate-50" />
            </div>
            {/* --- Customer Searchable Dropdown --- */}
            <div className="space-y-2">
              <Label>Customer</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left"
                  >
                    {customerOptions.find(c => c.value === customer)?.label || "Select Customer"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2 w-64">
                  {/* Search Input */}
                  <Input
                    placeholder="Search customer..."
                    // size="sm"
                    className="mb-2"
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      setFilteredCustomerOptions(
                        customerOptions.filter(c =>
                          c.label.toLowerCase().includes(searchTerm)
                        )
                      );
                    }}
                  />

                  {/* Customer List */}
                  <div className="max-h-40 overflow-y-auto">
                    {filteredCustomerOptions.map(c => (
                      <Button
                        key={c.value}
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={() => {
                          setCustomer(c.value);
                        }}
                      >
                        {c.label}
                      </Button>
                    ))}

                    {filteredCustomerOptions.length === 0 && (
                      <span className="text-xs text-muted-foreground block p-2">No customers found</span>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Requested Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" /> {reqDate ? format(reqDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto">
                  <Calendar mode="single" selected={reqDate} onSelect={setReqDate} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Schedule Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" /> {schDate ? format(schDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto">
                  <Calendar mode="single" selected={schDate} onSelect={setSchDate} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Assign Staff</Label>
              <Select onValueChange={setAssignedUser} value={assignedUser}>
                <SelectTrigger><SelectValue placeholder="Select Staff" /></SelectTrigger>
                <SelectContent>{staffOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Reason / Note</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter job description..." />
            </div>
            <div className="col-span-2 pt-4 flex gap-3">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Create Schedule</Button>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL UPDATE STATUS / RESCHEDULE --- */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Update: {selectedJob?.scheduleNo}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Update Current Status</Label>
              <Select value={updateStatus} onValueChange={(v) => setUpdateStatus(v as JobStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Stay Open</SelectItem>
                  <SelectItem value="Done">Complete (Done)</SelectItem>
                  <SelectItem value="Cancelled">Cancel Job</SelectItem>
                  <SelectItem value="Rescheduled">Reschedule / Re-assign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AnimatePresence>
              {updateStatus === "Rescheduled" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 p-4 bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
                  <div className="space-y-2">
                    <Label className="text-amber-800 font-semibold">Assign New Staff</Label>
                    <Select onValueChange={setRescheduleUser}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Select Staff" /></SelectTrigger>
                      <SelectContent>{staffOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-amber-800 font-semibold">New Schedule Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-white">
                          <CalendarIcon className="mr-2 h-4 w-4" /> {rescheduleDate ? format(rescheduleDate, "PPP") : "Select new date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-auto">
                        <Calendar mode="single" selected={rescheduleDate} onSelect={setRescheduleDate} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateStatus} className="flex-1 bg-slate-800 hover:bg-slate-900">Confirm Update</Button>
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}