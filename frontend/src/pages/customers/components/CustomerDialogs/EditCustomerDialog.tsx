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
  Building2, Phone, MapPin, MapPinned, Tag, Clock, CheckCircle, FileText, Hash,
} from "lucide-react";
import { STATUS_OPTIONS, TYPE_OPTIONS, type CustomerFormData } from "../../types/customer.types";
import type { Customer } from "@/lib/api";
import { PermissionGate } from "@/components/PermissionGate";

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCustomer: Customer | null;
  formData: CustomerFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onActiveChange: (checked: boolean) => void;
  onSave: () => void;
}

export const EditCustomerDialog: React.FC<EditCustomerDialogProps> = ({
  open,
  onOpenChange,
  editingCustomer,
  formData,
  onFormChange,
  onSelectChange,
  onActiveChange,
  onSave,
}) => {
  return (
    <PermissionGate permission="CUSTOMER_UPDATE">
          <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Customer</DialogTitle>
          <DialogDescription>
            Update customer information. All fields except ID can be modified.
          </DialogDescription>
        </DialogHeader>

        {editingCustomer && (
          <div className="space-y-6 py-4">
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <Label className="text-sm font-medium text-muted-foreground">Customer ID</Label>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{editingCustomer.userid}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Company Information</h3>
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Name
                </Label>
                <Input id="company" name="company" value={formData.company} onChange={onFormChange} placeholder="Enter company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Customer Type
                </Label>
                <Select value={formData.type || "none"} onValueChange={(value) => onSelectChange("type", value === "none" ? "" : value)}>
                  <SelectTrigger><SelectValue placeholder="Select customer type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
              <div className="space-y-2">
                <Label htmlFor="phonenumber" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input id="phonenumber" name="phonenumber" value={formData.phonenumber} onChange={onFormChange} placeholder="Enter phone number" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Location Information</h3>
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City
                </Label>
                <Input id="city" name="city" value={formData.city} onChange={onFormChange} placeholder="Enter city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPinned className="h-4 w-4" />
                  Address
                </Label>
                <Input id="address" name="address" value={formData.address} onChange={onFormChange} placeholder="Enter address" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Status Information</h3>
              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Status
                </Label>
                <Select value={formData.status || "none"} onValueChange={(value) => onSelectChange("status", value === "none" ? "" : value)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
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
                <Checkbox id="active" checked={formData.active === 1} onCheckedChange={onActiveChange} />
                <Label htmlFor="active" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Active Customer
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
              <div className="space-y-2">
                <Label htmlFor="note" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </Label>
                <Textarea id="note" name="note" value={formData.note} onChange={onFormChange} placeholder="Enter any additional notes..." rows={4} />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onSave} className="min-w-[100px]">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </PermissionGate>

  );
};
