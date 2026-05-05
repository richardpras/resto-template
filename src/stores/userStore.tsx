import { create } from "zustand";

export type UserStatus = "active" | "inactive";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  roleId: string;
  outletIds: string[];
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // permission keys, e.g. "pos.create"
  isSystem?: boolean;
}

export interface Outlet {
  id: string;
  name: string;
}

export interface AuditLog {
  id: string;
  action: "create" | "update" | "deactivate" | "activate" | "delete";
  entity: "user" | "role";
  targetId: string;
  targetName: string;
  actor: string;
  timestamp: string;
  detail?: string;
}

export const PERMISSION_MODULES: { module: string; label: string; actions: string[] }[] = [
  { module: "pos", label: "POS", actions: ["create", "view", "update", "delete"] },
  { module: "inventory", label: "Inventory", actions: ["create", "view", "update", "delete"] },
  { module: "purchase", label: "Purchase", actions: ["create", "view", "update", "delete"] },
  { module: "payroll", label: "Payroll", actions: ["create", "view", "update", "delete"] },
  { module: "reports", label: "Reports", actions: ["view"] },
  { module: "users", label: "User Management", actions: ["create", "view", "update", "delete"] },
];

export const ALL_PERMISSIONS = PERMISSION_MODULES.flatMap((m) =>
  m.actions.map((a) => `${m.module}.${a}`),
);

const DEFAULT_ROLE_PERMS: Record<string, string[]> = {
  Owner: ALL_PERMISSIONS,
  Manager: ALL_PERMISSIONS.filter((p) => !p.startsWith("users.delete") && !p.endsWith(".delete") || p === "pos.delete"),
  Cashier: ["pos.create", "pos.view", "pos.update"],
  Kitchen: ["pos.view"],
};

interface UserStore {
  users: AppUser[];
  roles: Role[];
  outlets: Outlet[];
  logs: AuditLog[];

  addUser: (u: Omit<AppUser, "id" | "createdAt" | "updatedAt">) => void;
  updateUser: (id: string, u: Partial<AppUser>) => void;
  setUserStatus: (id: string, status: UserStatus) => void;

  addRole: (r: Omit<Role, "id">) => void;
  updateRole: (id: string, r: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  setRolePermissions: (id: string, permissions: string[]) => void;

  getDefaultPermissions: (roleName: string) => string[];
}

const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

const seedRoles: Role[] = [
  { id: "r-owner", name: "Owner", description: "Full access to all modules", permissions: DEFAULT_ROLE_PERMS.Owner, isSystem: true },
  { id: "r-manager", name: "Manager", description: "Manage outlet operations", permissions: DEFAULT_ROLE_PERMS.Manager, isSystem: true },
  { id: "r-cashier", name: "Cashier", description: "POS operations only", permissions: DEFAULT_ROLE_PERMS.Cashier, isSystem: true },
  { id: "r-kitchen", name: "Kitchen", description: "Kitchen display access", permissions: DEFAULT_ROLE_PERMS.Kitchen, isSystem: true },
];

const seedOutlets: Outlet[] = [
  { id: "o-main", name: "Main Outlet" },
  { id: "o-branch", name: "Branch - Downtown" },
];

const seedUsers: AppUser[] = [
  {
    id: "u-1",
    name: "John Doe",
    email: "john@restohub.com",
    roleId: "r-owner",
    outletIds: ["o-main", "o-branch"],
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "u-2",
    name: "Sarah Lee",
    email: "sarah@restohub.com",
    roleId: "r-manager",
    outletIds: ["o-main"],
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "u-3",
    name: "Mike Tan",
    email: "mike@restohub.com",
    roleId: "r-cashier",
    outletIds: ["o-main"],
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
];

export const useUserStore = create<UserStore>((set, get) => ({
  users: seedUsers,
  roles: seedRoles,
  outlets: seedOutlets,
  logs: [],

  addUser: (u) => {
    const user: AppUser = { ...u, id: uid(), createdAt: now(), updatedAt: now() };
    set((s) => ({
      users: [...s.users, user],
      logs: [
        { id: uid(), action: "create", entity: "user", targetId: user.id, targetName: user.name, actor: "John Doe", timestamp: now() },
        ...s.logs,
      ],
    }));
  },

  updateUser: (id, patch) =>
    set((s) => {
      const target = s.users.find((u) => u.id === id);
      if (!target) return s;
      return {
        users: s.users.map((u) => (u.id === id ? { ...u, ...patch, updatedAt: now() } : u)),
        logs: [
          { id: uid(), action: "update", entity: "user", targetId: id, targetName: target.name, actor: "John Doe", timestamp: now() },
          ...s.logs,
        ],
      };
    }),

  setUserStatus: (id, status) =>
    set((s) => {
      const target = s.users.find((u) => u.id === id);
      if (!target) return s;
      return {
        users: s.users.map((u) => (u.id === id ? { ...u, status, updatedAt: now() } : u)),
        logs: [
          {
            id: uid(),
            action: status === "active" ? "activate" : "deactivate",
            entity: "user",
            targetId: id,
            targetName: target.name,
            actor: "John Doe",
            timestamp: now(),
          },
          ...s.logs,
        ],
      };
    }),

  addRole: (r) => {
    const role: Role = { ...r, id: uid() };
    set((s) => ({
      roles: [...s.roles, role],
      logs: [
        { id: uid(), action: "create", entity: "role", targetId: role.id, targetName: role.name, actor: "John Doe", timestamp: now() },
        ...s.logs,
      ],
    }));
  },

  updateRole: (id, patch) =>
    set((s) => {
      const target = s.roles.find((r) => r.id === id);
      if (!target) return s;
      return {
        roles: s.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        logs: [
          { id: uid(), action: "update", entity: "role", targetId: id, targetName: target.name, actor: "John Doe", timestamp: now() },
          ...s.logs,
        ],
      };
    }),

  deleteRole: (id) =>
    set((s) => {
      const target = s.roles.find((r) => r.id === id);
      if (!target || target.isSystem) return s;
      return {
        roles: s.roles.filter((r) => r.id !== id),
        logs: [
          { id: uid(), action: "delete", entity: "role", targetId: id, targetName: target.name, actor: "John Doe", timestamp: now() },
          ...s.logs,
        ],
      };
    }),

  setRolePermissions: (id, permissions) =>
    set((s) => ({
      roles: s.roles.map((r) => (r.id === id ? { ...r, permissions } : r)),
    })),

  getDefaultPermissions: (roleName) => DEFAULT_ROLE_PERMS[roleName] ?? [],
}));
