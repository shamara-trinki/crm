import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2, Phone, MapPin, MapPinned, Tag, Clock, CheckCircle, FileText,
} from "lucide-react";
import { STATUS_OPTIONS, TYPE_OPTIONS, type CustomerFormData } from "../../types/customer.types";
import { PermissionGate } from "@/components/PermissionGate";

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CustomerFormData;
  setFormData: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  onSave: () => void;
}

export const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSave,
}) => {
  const updateField = (field: keyof CustomerFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
     <PermissionGate permission="CUSTOMER_CREATE">
          <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your database. Fill in the information below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Company Information</h3>
            <div className="space-y-2">
              <Label htmlFor="create-company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-company"
                value={formData.company}
                onChange={(e) => updateField("company", e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-type" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Customer Type
              </Label>
              <Select
                value={formData.type || "none"}
                onValueChange={(value) => updateField("type", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
            <div className="space-y-2">
              <Label htmlFor="create-phonenumber" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="create-phonenumber"
                value={formData.phonenumber}
                onChange={(e) => updateField("phonenumber", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Location Information</h3>
            <div className="space-y-2">
              <Label htmlFor="create-city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                City
              </Label>
              <Input
                id="create-city"
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-address" className="flex items-center gap-2">
                <MapPinned className="h-4 w-4" />
                Address
              </Label>
              <Input
                id="create-address"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Status Information</h3>
            <div className="space-y-2">
              <Label htmlFor="create-status" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Status
              </Label>
              <Select
                value={formData.status || "none"}
                onValueChange={(value) => updateField("status", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-active"
                checked={formData.active === 1}
                onCheckedChange={(checked) => updateField("active", checked ? 1 : 0)}
              />
              <Label htmlFor="create-active" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Active Customer
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="create-note" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </Label>
              <Textarea
                id="create-note"
                value={formData.note}
                onChange={(e) => updateField("note", e.target.value)}
                placeholder="Enter any additional notes..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onSave} className="min-w-[100px]">
            Create Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     </PermissionGate>

  );
};
