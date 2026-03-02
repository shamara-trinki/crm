// E:\SVG\crm\frontend\src\pages\Roles.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { rolesApi, permissionsApi, type Role, type Permission } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Shield,
  Key,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
  Phone,
  MapPin,
  MapPinned,
  Clock,
  Tag,
  CheckCircle,
  FileText,
  Calendar,
  UserCog,
  Lock,
  Unlock,
  Loader2,
  Save,
  X,
  Search,
  Settings,
  Globe,
  Mail,
  Briefcase,
  User,
  FolderKanban,
  LayoutGrid,
} from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";

interface PermissionAction {
  code: string;
  label: string;
  icon?: any;
  description?: string;
}

interface PermissionField {
  key: string;
  label: string;
  icon: any;
  description?: string;
  actions: {
    view?: PermissionAction;
    update?: PermissionAction;
    create?: PermissionAction;
    delete?: PermissionAction;
  };
}

interface PermissionModule {
  key: string;
  label: string;
  icon: any;
  description?: string;
  generalActions?: {
    create?: PermissionAction;
    delete?: PermissionAction;
    view?: PermissionAction;
    update?: PermissionAction;
  };
  fields: PermissionField[];
}

const PERMISSION_STRUCTURE: PermissionModule[] = [
  {
    key: 'USERS',
    label: 'User Management',
    icon: Users,
    description: 'Manage system users',
    generalActions: {
      create: { code: 'USER_CREATE', label: 'Create Users', icon: PlusCircle },
      delete: { code: 'USER_DELETE', label: 'Delete Users', icon: Trash2 },
    },
    fields: [
      {
        key: 'credentials',
        label: 'Credentials',
        icon: Key,
        actions: {
          view: { code: 'USER_VIEW', label: 'View', icon: Eye },
          update: { code: 'USER_CREDENTIAL_UPDATE', label: 'Update', icon: Edit },
        },
      },
      {
        key: 'role',
        label: 'Role Assignment',
        icon: UserCog,
        actions: {
          update: { code: 'USER_ROLE_UPDATE', label: 'Update', icon: Edit },
        },
      },
    ],
  },
  {
    key: 'ROLES',
    label: 'Role Management',
    icon: Shield,
    description: 'Manage roles',
    generalActions: {
      create: { code: 'ROLE_CREATE', label: 'Create Roles', icon: PlusCircle },
         view: { code: 'ROLE_VIEW', label: 'View', icon: Eye },
         delete: { code: 'ROLE_DELETE', label: 'Delete Roles', icon: Trash2 },
    },
    fields: [
      {
        key: 'permissions',
        label: 'Permissions',
        icon: Key,
        actions: {
          update: { code: 'ROLE_PERMISSION_UPDATE', label: 'Update', icon: Edit },
        },
      },
    ],
  },
  {
    key: 'CUSTOMERS',
    label: 'Customers',
    icon: Building2,
    description: 'Manage customers',
    generalActions: {
      create: { code: 'CUSTOMER_CREATE', label: 'Create', icon: PlusCircle },
      delete: { code: 'CUSTOMER_DELETE', label: 'Delete', icon: Trash2 },
    },
    fields: [
      {
        key: 'company',
        label: 'Company',
        icon: Building2,
        actions: {
          view: { code: 'CUSTOMER_COMPANY_VIEW', label: 'View', icon: Eye },
          update: { code: 'CUSTOMER_COMPANY_UPDATE', label: 'Update', icon: Edit },
        },
      },
      {
        key: 'phone',
        label: 'Phone',
        icon: Phone,
        actions: {
          view: { code: 'CUSTOMER_PHONENUMBER_VIEW', label: 'View', icon: Eye },
          update: { code: 'CUSTOMER_PHONENUMBER_UPDATE', label: 'Update', icon: Edit },
        },
      },
      {
        key: 'city',
        label: 'City',
        icon: MapPin,
        actions: {
          view: { code: 'CUSTOMER_CITY_VIEW', label: 'View', icon: Eye },
          update: { code: 'CUSTOMER_CITY_UPDATE', label: 'Update', icon: Edit },
        },
      },
      {
        key: 'address',
        label: 'Address',
        icon: MapPinned,
        actions: {
          view: { code: 'CUSTOMER_ADDRESS_VIEW', label: 'View', icon: Eye },
          update: { code: 'CUSTOMER_ADDRESS_UPDATE', label: 'Update', icon: Edit },
        },
      },
      {
        key: 'status',
        label: 'Status',
        icon: Clock,
        actions: {
          view: { code: 'CUSTOMER_STATUS_VIEW', label: 'View', icon: Eye },
          update: { code: 'CUSTOMER_STATUS_UPDATE', label: 'Update', icon: Edit },
        },
      },
      {
        key: 'type',
        label: 'Type',
        icon: Tag,
        actions: {
          view: { code: 'CUSTOMER_TYPE_VIEW', label: 'View', icon: Eye },
          update: { code: 'CUSTOMER_TYPE_UPDATE', label: 'Update', icon: Edit },
        },
      },
      {
        key: 'active',
        label: 'Active',
        icon: CheckCircle,
        actions: {
          view: { code: 'CUSTOMER_ACTIVE_VIEW', label: 'View', icon: Eye },
          update: { code: 'CUSTOMER_ACTIVE_UPDATE', label: 'Update', icon: Edit },
        },
      },
      {
        key: 'note',
        label: 'Notes',
        icon: FileText,
        actions: {
          view: { code: 'CUSTOMER_NOTE_VIEW', label: 'View', icon: Eye },
          update: { code: 'CUSTOMER_NOTE_UPDATE', label: 'Update', icon: Edit },
        },
      },
      {
        key: 'datecreated',
        label: 'Created At',
        icon: Calendar,
        actions: {
          view: { code: 'CUSTOMER_DATECREATED_VIEW', label: 'View', icon: Eye },
        },
      },
    ],
  },
];

const getAllPermissionCodes = (): string[] => {
  const codes: string[] = [];
  PERMISSION_STRUCTURE.forEach(module => {
    if (module.generalActions) {
      Object.values(module.generalActions).forEach(action => {
        if (action?.code) codes.push(action.code);
      });
    }
    module.fields.forEach(field => {
      Object.values(field.actions).forEach(action => {
        if (action?.code) codes.push(action.code);
      });
    });
  });
  return codes;
};

const RolesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>(['USERS', 'ROLES', 'CUSTOMERS']);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAllDialog, setSelectAllDialog] = useState(false);
  const [currentModule, setCurrentModule] = useState<PermissionModule | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        rolesApi.list(),
        permissionsApi.list(),
      ]);
      setRoles(rolesRes.data);
      setAllPermissions(permissionsRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await rolesApi.create(newRoleName);
      toast({ title: "Success", description: "Role created successfully" });
      setCreateDialogOpen(false);
      setNewRoleName("");
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    }
  };

const handleDeleteRole = async () => {
  if (!roleToDelete) return;

  try {
    await rolesApi.delete(roleToDelete.id); // ✅ ACTUALLY DELETE

    toast({
      title: "Success",
      description: "Role deleted successfully",
    });

    setDeleteDialogOpen(false);
    setRoleToDelete(null);

    fetchData(); // refresh list from backend
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to delete role",
      variant: "destructive",
    });
  }
};

  const handlePermissionToggle = (permissionCode: string, checked: boolean) => {
    setSelectedPermissions(prev =>
      checked ? [...prev, permissionCode] : prev.filter(code => code !== permissionCode)
    );
  };

  const handleSelectAllModule = (module: PermissionModule) => {
    setCurrentModule(module);
    setSelectAllDialog(true);
  };

  const confirmSelectAllModule = () => {
    if (!currentModule) return;

    const codes: string[] = [];
    if (currentModule.generalActions) {
      Object.values(currentModule.generalActions).forEach(action => {
        if (action?.code) codes.push(action.code);
      });
    }
    currentModule.fields.forEach(field => {
      Object.values(field.actions).forEach(action => {
        if (action?.code) codes.push(action.code);
      });
    });

    setSelectedPermissions(prev => {
      const newPermissions = [...prev];
      codes.forEach(code => {
        if (!newPermissions.includes(code)) newPermissions.push(code);
      });
      return newPermissions;
    });

    setSelectAllDialog(false);
    setCurrentModule(null);
  };

  const handleClearModule = (module: PermissionModule) => {
    const codes: string[] = [];
    if (module.generalActions) {
      Object.values(module.generalActions).forEach(action => {
        if (action?.code) codes.push(action.code);
      });
    }
    module.fields.forEach(field => {
      Object.values(field.actions).forEach(action => {
        if (action?.code) codes.push(action.code);
      });
    });

    setSelectedPermissions(prev => prev.filter(code => !codes.includes(code)));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      const permissionIds = allPermissions
        .filter(p => selectedPermissions.includes(p.code))
        .map(p => p.id);
      await rolesApi.assignPermissions(selectedRole.id, permissionIds);
      toast({ title: "Success", description: "Permissions updated" });
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
    }
  };

  const toggleModule = (moduleKey: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleKey)
        ? prev.filter(key => key !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const isPermissionSelected = (code: string) => selectedPermissions.includes(code);
  const getPermissionCount = (role: Role) => role.permissions?.length || 0;

  const filteredModules = searchTerm.trim()
    ? PERMISSION_STRUCTURE.filter(module =>
        module.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : PERMISSION_STRUCTURE;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
          <p className="crm-page-subtitle">
            Manage roles and permissions
          </p>
        </div>
        <PermissionGate permission="ROLE_CREATE">
                  <Button onClick={() => setCreateDialogOpen(true)} size="default" className="gap-2">
          <PlusCircle className="w-4 h-4" />
          New Role
        </Button>
        </PermissionGate>

      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles
  .filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .map((role) => (
          <Card
  key={role.id}
  className="group relative flex flex-col h-full overflow-hidden border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl"
>
  {/* Top Accent */}
  <div className="absolute top-0 left-0 w-full h-1 bg-primary/80" />

  {/* HEADER */}
  <CardHeader className="px-5 pt-5 pb-3">
    <div className="flex items-start justify-between">

      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
          <Shield className="w-5 h-5 text-primary" />
        </div>

        <div>
          <CardTitle className="text-base font-semibold tracking-tight">
            {role.name}
          </CardTitle>

          <CardDescription className="text-xs text-muted-foreground mt-1">
            {getPermissionCount(role)} permissions assigned
          </CardDescription>
        </div>
      </div>


        <PermissionGate permission="ROLE_CREATE">
                  <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => {
            setRoleToDelete(role);
            setDeleteDialogOpen(true);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        </PermissionGate>

    </div>
  </CardHeader>

  {/* CONTENT */}
  <CardContent className="px-5 pb-5 pt-2 flex flex-col flex-grow">

    {/* Permission Preview */}
    <div className="flex flex-wrap gap-2 mb-4">
      {role.permissions?.slice(0, 3).map((perm) => (
        <Badge
          key={perm.id}
          variant="secondary"
          className="text-xs px-2 py-0.5 rounded-md bg-muted/50"
        >
          {perm.code.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
        </Badge>
      ))}

      {role.permissions && role.permissions.length > 3 && (
        <Badge
          variant="outline"
          className="text-xs px-2 py-0.5 rounded-md"
        >
          +{role.permissions.length - 3} more
        </Badge>
      )}
    </div>

    {/* Push Everything Below Down */}
    <div className="mt-auto space-y-4">

      <div className="h-px bg-border/60" />

      <PermissionGate permission="ROLE_CREATE">
              <Button
        variant="default"
        size="sm"
        className="w-full h-9 text-sm font-medium rounded-lg shadow-sm"
        onClick={() => {
          setSelectedRole(role);
          setSelectedPermissions(role.permissions?.map(p => p.code) || []);
          setDialogOpen(true);
        }}
      >
        <Edit className="w-4 h-4 mr-2" />
        Edit Permissions
      </Button>
      </PermissionGate>


    </div>

  </CardContent>
</Card>
        ))}
      </div>

{/* Edit Permissions Dialog */}
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent className="max-w-2xl p-0 gap-0 rounded-2xl">

    {/* HEADER */}
    <DialogHeader className="px-6 py-5 border-b bg-muted/30">
      <DialogTitle className="text-lg font-semibold tracking-tight">
        {selectedRole?.name}
      </DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground mt-1">
        Configure permissions for this role
      </DialogDescription>
    </DialogHeader>

    {/* BODY */}
    <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-5">

      {/* QUICK ACTIONS */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </span>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-2"
            onClick={() => setSelectedPermissions(getAllPermissionCodes())}
          >
            <Unlock className="w-4 h-4" />
            Select All
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-2"
            onClick={() => setSelectedPermissions([])}
          >
            <Lock className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* MODULES */}
      <div className="space-y-4">
        {filteredModules.map((module) => {
          const isExpanded = expandedModules.includes(module.key);

          return (
            <Card
              key={module.key}
              className="border border-border rounded-2xl shadow-sm overflow-hidden"
            >
              {/* MODULE HEADER */}
              <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-b">
                <button
                  onClick={() => toggleModule(module.key)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <module.icon className="w-4 h-4 text-primary" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      {module.label}
                    </h3>
                    {module.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {module.description}
                      </p>
                    )}
                  </div>
                </button>

                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* MODULE CONTENT (SMOOTH ANIMATION) */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <CardContent className="p-5 space-y-6">

                    {/* GENERAL ACTIONS */}
                    {module.generalActions && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          General Actions
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(module.generalActions).map(
                            ([key, action]) =>
                              action && (
                                <div
                                  key={key}
                                  className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition"
                                >
                                  <Checkbox
                                    id={`${module.key}_${key}`}
                                    checked={isPermissionSelected(action.code)}
                                    onCheckedChange={(checked) =>
                                      handlePermissionToggle(
                                        action.code,
                                        checked as boolean
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`${module.key}_${key}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {action.label}
                                  </Label>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}

                    {/* FIELD PERMISSIONS */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        Field-Level Permissions
                      </h4>

                      <div className="space-y-4">
                        {module.fields.map((field) => (
                          <div
                            key={field.key}
                            className="p-4 rounded-xl border border-border bg-muted/10"
                          >
                            <div className="flex items-center gap-2 mb-4">
                              <div className="p-2 bg-primary/10 rounded-md">
                                <field.icon className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium">
                                {field.label}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {Object.entries(field.actions).map(
                                ([actionKey, action]) =>
                                  action && (
                                    <div
                                      key={actionKey}
                                      className="flex items-center gap-2 p-2 rounded-md border border-border bg-background hover:bg-muted transition"
                                    >
                                      <Checkbox
                                        id={`${module.key}_${field.key}_${actionKey}`}
                                        checked={isPermissionSelected(action.code)}
                                        onCheckedChange={(checked) =>
                                          handlePermissionToggle(
                                            action.code,
                                            checked as boolean
                                          )
                                        }
                                      />
                                      <Label
                                        htmlFor={`${module.key}_${field.key}_${actionKey}`}
                                        className="text-sm cursor-pointer truncate"
                                      >
                                        {action.label}
                                      </Label>
                                    </div>
                                  )
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </CardContent>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>

    {/* FOOTER */}
    <DialogFooter className="px-6 py-4 border-t bg-muted/30">
      <Button variant="outline" onClick={() => setDialogOpen(false)}>
        Cancel
      </Button>

      <Button onClick={handleSavePermissions}>
        <Save className="w-4 h-4 mr-2" />
        Save Changes
      </Button>
    </DialogFooter>

  </DialogContent>
</Dialog>

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Create Role</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new role to manage permissions
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name" className="text-xs font-medium">Role Name</Label>
            <Input
              id="name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g., Sales Manager"
              className="mt-1.5 h-8 text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} size="sm">
              Cancel
            </Button>
            <Button onClick={handleCreateRole} size="sm">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-medium">Delete Role</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} size="sm" className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Select All Dialog */}
      <AlertDialog open={selectAllDialog} onOpenChange={setSelectAllDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-medium">Select All Permissions</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Add all permissions for {currentModule?.label} to this role?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSelectAllModule} size="sm">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RolesPage;