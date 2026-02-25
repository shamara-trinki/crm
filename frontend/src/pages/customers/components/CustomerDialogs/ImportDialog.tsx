import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download, Upload, Loader2, AlertCircle, CheckCircle2, XCircle,
} from "lucide-react";
import type { ImportPreview } from "../../types/customer.types";
import { downloadTemplate } from "../../utils/customerHelpers";
import { PermissionGate } from "@/components/PermissionGate";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importPreview: ImportPreview[];
  importLoading: boolean;
  importProgress: number;
  importSuccess: number;
  importErrors: number;
  onImport: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onOpenChange,
  importPreview,
  importLoading,
  importProgress,
  importSuccess,
  importErrors,
  onImport,
}) => {
  return (
    <PermissionGate permission="CUSTOMER_CREATE">
          <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Import Customers</DialogTitle>
          <DialogDescription>
            Preview your data before importing. Valid rows will be imported.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="link" onClick={downloadTemplate} className="text-primary">
              <Download className="h-4 w-4 mr-2" />
              Download Import Template
            </Button>
          </div>

          {importLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">Success: {importSuccess}</span>
                <span className="text-red-600">Errors: {importErrors}</span>
              </div>
            </div>
          )}

          {!importLoading && (
            <>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">
                    Valid: {importPreview.filter((r) => r.isValid).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm">
                    Invalid: {importPreview.filter((r) => !r.isValid).length}
                  </span>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importPreview.map((row) => (
                      <TableRow key={row.rowNumber} className={!row.isValid ? "bg-red-50" : ""}>
                        <TableCell className="font-mono">{row.rowNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!row.data.company && <AlertCircle className="h-4 w-4 text-red-500" />}
                            <span className={!row.data.company ? "text-red-600" : ""}>
                              {row.data.company || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{row.data.phonenumber || "-"}</TableCell>
                        <TableCell>{row.data.city || "-"}</TableCell>
                        <TableCell>{row.data.address || "-"}</TableCell>
                        <TableCell>
                          {row.data.status ? <Badge variant="outline">{row.data.status}</Badge> : "-"}
                        </TableCell>
                        <TableCell>
                          {row.data.type ? <Badge variant="outline">{row.data.type}</Badge> : "-"}
                        </TableCell>
                        <TableCell>
                          {row.data.active !== undefined
                            ? row.data.active === 1 ? "Active" : "Inactive"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate" title={row.data.note}>
                            {row.data.note || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {row.errors.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-xs text-red-600">{row.errors[0]}</span>
                            </div>
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={importLoading}>Cancel</Button>
          </DialogClose>
          <Button
            onClick={onImport}
            disabled={importLoading || importPreview.filter((r) => r.isValid).length === 0}
          >
            {importLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {importPreview.filter((r) => r.isValid).length} Valid Rows
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </PermissionGate>

  );
};
