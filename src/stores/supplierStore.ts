import { create } from "zustand";

export type SupplierStatus = "active" | "inactive";

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  notes?: string;
  status: SupplierStatus;
  createdAt: string;
}

interface SupplierStore {
  suppliers: Supplier[];
  addSupplier: (s: Omit<Supplier, "id" | "createdAt">) => void;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  toggleStatus: (id: string) => void;
  removeSupplier: (id: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const seed: Supplier[] = [
  { id: "s-1", name: "PT Sumber Pangan", contact: "08123456789", email: "info@sumberpangan.id", address: "Jl. Merdeka 12, Jakarta", status: "active", createdAt: now() },
  { id: "s-2", name: "CV Maju Bersama", contact: "08198765432", email: "order@majubersama.id", address: "Jl. Sudirman 88, Bandung", status: "active", createdAt: now() },
  { id: "s-3", name: "UD Tani Makmur", contact: "08111222333", email: "sales@tanimakmur.id", address: "Jl. Diponegoro 5, Surabaya", status: "active", createdAt: now() },
  { id: "s-4", name: "Fresh Daily Co", contact: "08144556677", email: "hello@freshdaily.id", address: "Jl. Gatot Subroto 21, Jakarta", status: "inactive", createdAt: now() },
];

export const useSupplierStore = create<SupplierStore>((set) => ({
  suppliers: seed,
  addSupplier: (s) => set((st) => ({ suppliers: [...st.suppliers, { ...s, id: uid(), createdAt: now() }] })),
  updateSupplier: (id, s) => set((st) => ({ suppliers: st.suppliers.map((x) => (x.id === id ? { ...x, ...s } : x)) })),
  toggleStatus: (id) => set((st) => ({
    suppliers: st.suppliers.map((x) => x.id === id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x),
  })),
  removeSupplier: (id) => set((st) => ({ suppliers: st.suppliers.filter((x) => x.id !== id) })),
}));
