import { useState, useEffect } from "react";
import { usersApi, rolesApi, type User, type Role } from "@/lib/api";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, UserPlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  // Create form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRoleId, setNewRoleId] = useState("");

  // Edit form
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
const [editRoleId, setEditRoleId] = useState("");  

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        usersApi.list(),
        rolesApi.list(),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersApi.create({
        username: newUsername,
        password: newPassword,
        roleId: parseInt(newRoleId),
      });
      toast({ title: "Success", description: "User created successfully" });
      setCreateOpen(false);
      setNewUsername("");
      setNewPassword("");
      setNewRoleId("");
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
    }
  };

const handleEdit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editUser) return;

  try {
    const data: { username?: string; password?: string } = {};
    if (editUsername && editUsername !== editUser.username) data.username = editUsername;
    if (editPassword) data.password = editPassword;

    // Update credentials
    if (Object.keys(data).length > 0) {
      await usersApi.update(editUser.id, data);
    }

    // Update role (only if permission)
    if (editRoleId && editRoleId !== String(editUser.roleId)) {
      await usersApi.updateRole(editUser.id, parseInt(editRoleId));
    }

    toast({ title: "Success", description: "User updated successfully" });
    setEditOpen(false);
    setEditUser(null);
    fetchData();
  } catch {
    toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
  }
};


const handleDelete = (id: number) => {
  // Create a unique ID for this toast
  const toastId = Math.random().toString(36).substring(7);
  
  // Store the toast ID in a ref or variable that persists
  const toastRef = { current: null as any };
  
  toastRef.current = toast({
    variant: "destructive",
    className: "bg-transparent shadow-none border-none p-0",
    description: (
      <div className="
        fixed top-6 left-1/2 -translate-x-1/2
        w-[300px]
        bg-red-600 text-white
        rounded-lg p-4 shadow-lg
        z-[9999]
      ">
        <div className="font-semibold mb-2">Delete user?</div>

        <div className="text-sm mb-3">
          This action cannot be undone.
        </div>

        <div className="flex justify-end gap-2">
          {/* Cancel button */}
          <button
            onClick={() => {
              toast({
                duration: 1, // Very short duration
                className: "hidden", // Hide it
              });
            }}
            className="bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>

          {/* Delete button */}
          <button
            onClick={async () => {
              try {
                await usersApi.delete(id);

                toast({
                  title: "Success",
                  description: "User deleted"
                });

                fetchData();

              } catch (err: any) {
                const message =
                  err?.response?.data?.message ||
                  err?.response?.data?.error ||
                  "Failed to delete user";

                toast({
                  title: "Error",
                  description: message,
                  variant: "destructive"
                });
              }
            }}
            className="bg-white text-red-600 px-3 py-1 rounded font-semibold hover:bg-gray-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ),
  });
};




  const openEdit = (user: User) => {
    setEditUser(user);
    setEditUsername(user.username);
    setEditPassword("");
    setEditRoleId(user.roleId ? String(user.roleId) : ""); 
    setEditOpen(true);
  };

  return (
    <div>
      <div className="crm-page-header flex items-center justify-between">
        <div>
          <h1 className="crm-page-title">Users</h1>
          <p className="crm-page-subtitle">Manage system users and their roles</p>
        </div>
        <PermissionGate permission="USER_CREATE">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newRoleId} onValueChange={setNewRoleId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Create User</Button>
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
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {u.id}
                  </TableCell>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.is_active ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-1">

  <PermissionGate permission="USER_CREDENTIAL_UPDATE">
    <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
      <Pencil className="w-4 h-4" />
    </Button>
  </PermissionGate>

  <PermissionGate permission="USER_DELETE">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleDelete(u.id)}
    >
      <Trash2 className="w-4 h-4 text-red-600" />
    </Button>
  </PermissionGate>

</TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {editUser?.username}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Username"
              />
            </div>
            <div className="space-y-2">
              <Label>New Password (leave blank to keep current)</Label>
              <Input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="New password"
              />
            </div>
              <PermissionGate     permission="USER_ROLE_UPDATE">
    <div className="space-y-2">
      <Label>Role</Label>
      <Select value={editRoleId} onValueChange={setEditRoleId}>
        <SelectTrigger>
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((r) => (
            <SelectItem key={r.id} value={String(r.id)}>
              {r.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </PermissionGate>

            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
