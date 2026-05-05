import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RoleName = "Owner" | "Manager" | "Cashier" | "Kitchen";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  outletIds: string[];
  pin: string; // 4-digit pin for POS unlock
  permissions: string[];
}

// Permission keys used across the app
export const PERMISSIONS = {
  DASHBOARD_ALL: "dashboard.view_all_outlets",
  DASHBOARD_OWN: "dashboard.view_own_outlet",
  POS: "pos.use",
  KITCHEN: "kitchen.use",
  MENU: "menu.manage",
  INVENTORY: "inventory.manage",
  PURCHASE: "purchase.manage",
  PROMOTIONS: "promotions.manage",
  PAYROLL: "payroll.manage",
  ACCOUNTING: "accounting.manage",
  USERS: "users.manage",
  REPORTS: "reports.view",
  SETTINGS: "settings.manage",
  SUPPLIERS: "suppliers.manage",
  MEMBERS: "members.manage",
  TABLES: "tables.view",
  QR_ORDERS: "qr_orders.view",
} as const;

const ROLE_PERMS: Record<RoleName, string[]> = {
  Owner: Object.values(PERMISSIONS),
  Manager: [
    PERMISSIONS.DASHBOARD_OWN,
    PERMISSIONS.POS,
    PERMISSIONS.KITCHEN,
    PERMISSIONS.MENU,
    PERMISSIONS.INVENTORY,
    PERMISSIONS.PURCHASE,
    PERMISSIONS.PROMOTIONS,
    PERMISSIONS.SUPPLIERS,
    PERMISSIONS.MEMBERS,
    PERMISSIONS.TABLES,
    PERMISSIONS.QR_ORDERS,
    PERMISSIONS.REPORTS,
  ],
  Cashier: [PERMISSIONS.POS, PERMISSIONS.MEMBERS, PERMISSIONS.TABLES],
  Kitchen: [PERMISSIONS.KITCHEN],
};

const DEMO_USERS: (AuthUser & { password: string })[] = [
  {
    id: "u-1", name: "John Doe", email: "owner@resto.com", role: "Owner",
    outletIds: ["o-main", "o-branch"], pin: "1234", password: "owner",
    permissions: ROLE_PERMS.Owner,
  },
  {
    id: "u-2", name: "Sarah Lee", email: "manager@resto.com", role: "Manager",
    outletIds: ["o-main"], pin: "2345", password: "manager",
    permissions: ROLE_PERMS.Manager,
  },
  {
    id: "u-3", name: "Mike Tan", email: "cashier@resto.com", role: "Cashier",
    outletIds: ["o-main"], pin: "3456", password: "cashier",
    permissions: ROLE_PERMS.Cashier,
  },
  {
    id: "u-4", name: "Anna Kitchen", email: "kitchen@resto.com", role: "Kitchen",
    outletIds: ["o-main"], pin: "4567", password: "kitchen",
    permissions: ROLE_PERMS.Kitchen,
  },
];

interface AuthStore {
  user: AuthUser | null;
  locked: boolean;
  autoLock: boolean;
  idleMinutes: number;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  lock: () => void;
  unlock: (pin: string) => boolean;
  setAutoLock: (v: boolean) => void;
  setIdleMinutes: (n: number) => void;
  hasPermission: (perm: string) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      locked: false,
      autoLock: true,
      idleMinutes: 5,

      login: (email, password) => {
        const u = DEMO_USERS.find(
          (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password,
        );
        if (!u) return { ok: false, error: "Invalid email or password" };
        const { password: _, ...user } = u;
        set({ user, locked: false });
        return { ok: true };
      },
      logout: () => set({ user: null, locked: false }),
      lock: () => {
        if (get().user) set({ locked: true });
      },
      unlock: (pin) => {
        const u = get().user;
        if (u && u.pin === pin) {
          set({ locked: false });
          return true;
        }
        return false;
      },
      setAutoLock: (v) => set({ autoLock: v }),
      setIdleMinutes: (n) => set({ idleMinutes: Math.max(1, n) }),
      hasPermission: (perm) => {
        const u = get().user;
        if (!u) return false;
        return u.permissions.includes(perm);
      },
    }),
    { name: "resto-auth" },
  ),
);

export const DEMO_CREDENTIALS = DEMO_USERS.map((u) => ({
  email: u.email, password: u.password, role: u.role,
}));
