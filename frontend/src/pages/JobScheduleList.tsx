import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Calendar, Clock, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion"; // Animation සඳහා
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import NaviBar from "@/components/ui/NaviBar";
// 1. මුලින්ම Interface එක (Data structure එක)
interface JobScheduleEntry {
  id: string;
  scheduleNo: string;
  customer: string;
  date: string;
  time: string;
  reason: string;
  user: string;
  status: string;
}

// 2. දෙවනුව Sample Data එක (මෙය Component එකට පිටතින් ඉහළින් තිබිය යුතුයි)
const sampleData: JobScheduleEntry[] = [
  { 
    id: "1", 
    scheduleNo: "JS-1001", 
    customer: "Acme Corporation", 
    date: "2026-02-20", 
    time: "09:00", 
    reason: "Server maintenance", 
    user: "John Smith", 
    status: "Open" 
  },
  { 
    id: "2", 
    scheduleNo: "JS-1002", 
    customer: "Global Tech Solutions", 
    date: "2026-02-22", 
    time: "14:30", 
    reason: "Network setup", 
    user: "Sarah Johnson", 
    status: "Open" 
  }
];

const JobScheduleList = () => {
  const navigate = useNavigate();
  const [schedules] = useState<JobScheduleEntry[]>(sampleData);

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <NaviBar />

    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 space-y-6">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          {/* <Button
            variant="ghost"
            size="sm"
            className="mb-3 hover:bg-slate-200"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button> */}

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Job Schedule
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage and track all technician onsite visits
            </p>
          </motion.div>
        </div>

        <Button
          onClick={() => navigate("/job-schedule/new")}
          className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 shadow-lg shadow-blue-500/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      {/* Search Section */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm rounded-2xl p-5">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search schedules..."
            className="pl-10 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm h-11 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Table Container */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
              <TableRow className="border-b border-slate-200">
                <TableHead className="font-bold text-slate-700 py-5">
                  Schedule No
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Customer
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Date & Time
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Reason
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Assigned To
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-right">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center text-slate-400">
                      <Calendar className="h-12 w-12 mb-3 opacity-20" />
                      <p className="font-medium">
                        No job schedules found.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((s) => (
                  <TableRow
                    key={s.id}
                    className="group hover:bg-blue-50/40 transition-colors"
                  >
                    <TableCell className="font-bold text-blue-600">
                      {s.scheduleNo}
                    </TableCell>

                    <TableCell className="font-semibold text-slate-700">
                      {s.customer}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="flex items-center text-slate-600 font-medium">
                          <Calendar className="mr-1 h-3 w-3" />
                          {s.date}
                        </span>
                        <span className="flex items-center text-slate-400">
                          <Clock className="mr-1 h-3 w-3" />
                          {s.time}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="max-w-[250px]">
                      <p className="text-sm text-slate-600 truncate">
                        {s.reason}
                      </p>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                          <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {s.user}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Badge
                        className={`px-3 py-1 rounded-lg ${
                          s.status === "Open"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-rose-100 text-rose-700 border-rose-200"
                        }`}
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-slate-500 font-medium">
        <p>
          Showing <span className="font-bold">{schedules.length}</span> schedules
        </p>
        <div className="flex gap-4 font-semibold text-blue-600 cursor-pointer">
          <span className="hover:underline">Previous</span>
          <span className="hover:underline">Next</span>
        </div>
      </div>
    </div>
  </div>
);
};

export default JobScheduleList;