import { useState, useEffect } from "react";
import { rolesApi, permissionsApi, type Role, type Permission } from "@/lib/api";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Shield, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]); // This was missing!
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<number[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const { toast } = useToast();

  const fetchRoles = async () => {
    try {
      const { data } = await rolesApi.list();
      setRoles(data);
    } catch {
      toast({ title: "Error", description: "Failed to load roles", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data } = await permissionsApi.list();
      setPermissions(data);
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      toast({ title: "Error", description: "Failed to load permissions", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions(); // Add this to load permissions
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rolesApi.create(newRoleName);
      toast({ title: "Success", description: "Role created" });
      setCreateOpen(false);
      setNewRoleName("");
      fetchRoles();
    } catch {
      toast({ title: "Error", description: "Failed to create role", variant: "destructive" });
    }
  };

  const openPermissions = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermIds(role.permissions.map((p) => p.id));
    setPermOpen(true);
  };

  const togglePerm = (id: number) => {
    setSelectedPermIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      // Filter to only include valid permission IDs that exist in the permissions list
      const validPermissionIds = selectedPermIds.filter(id => 
        permissions.some(p => p.id === id)
      );
      
      if (validPermissionIds.length !== selectedPermIds.length) {
        toast({ 
          title: "Warning", 
          description: "Some permissions were invalid and have been filtered out", 
          variant: "default" 
        });
      }
      
      await rolesApi.assignPermissions(selectedRole.id, validPermissionIds);
      toast({ title: "Success", description: "Permissions updated" });
      setPermOpen(false);
      fetchRoles();
    } catch (error) {
      console.error("Failed to update permissions:", error);
      toast({ 
        title: "Error", 
        description: "Failed to update permissions", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div>
      <div className="crm-page-header flex items-center justify-between">
        <div>
          <h1 className="crm-page-title">Roles</h1>
          <p className="crm-page-subtitle">Manage roles and their permissions</p>
        </div>
        <PermissionGate permission="ROLE_CREATE">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Role Name</Label>
                  <Input
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    required
                    placeholder="e.g. Sales Manager"
                  />
                </div>
                <Button type="submit" className="w-full">Create Role</Button>
              </form>
            </DialogContent>
          </Dialog>
        </PermissionGate>
      </div>

      <div className="crm-table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {role.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((p) => (
                        <Badge key={p.id} variant="outline" className="text-xs">
                          {p.code}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <PermissionGate permission="ROLE_PERMISSION_UPDATE">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPermissions(role)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </PermissionGate>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Permissions Dialog */}
      <Dialog open={permOpen} onOpenChange={setPermOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Permissions: {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2 max-h-80 overflow-y-auto">
            {permissions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading permissions...
              </div>
            ) : (
              permissions.map((perm) => (
                <label
                  key={perm.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={selectedPermIds.includes(perm.id)}
                    onCheckedChange={() => togglePerm(perm.id)}
                  />
                  <div>
                    <div className="text-sm font-medium">{perm.code}</div>
                    <div className="text-xs text-muted-foreground">{perm.description}</div>
                  </div>
                </label>
              ))
            )}
          </div>
          <Button 
            onClick={handleSavePermissions} 
            className="w-full mt-2"
            disabled={permissions.length === 0}
          >
            Save Permissions
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPage;