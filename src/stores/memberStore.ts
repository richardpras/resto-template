import { create } from "zustand";

export type MemberStatus = "active" | "inactive";

export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  notes?: string;
  points: number;
  status: MemberStatus;
  createdAt: string;
}

interface MemberStore {
  members: Member[];
  addMember: (m: Omit<Member, "id" | "createdAt" | "points"> & { points?: number }) => void;
  updateMember: (id: string, m: Partial<Member>) => void;
  toggleStatus: (id: string) => void;
  removeMember: (id: string) => void;
  addPoints: (id: string, points: number) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const seed: Member[] = [
  { id: "m-1", name: "Budi Santoso", phone: "081234560001", email: "budi@email.com", points: 1250, status: "active", createdAt: now(), birthday: "1990-05-12" },
  { id: "m-2", name: "Siti Aminah", phone: "081234560002", email: "siti@email.com", points: 480, status: "active", createdAt: now() },
  { id: "m-3", name: "Andi Wijaya", phone: "081234560003", points: 2300, status: "active", createdAt: now(), birthday: "1985-11-03" },
  { id: "m-4", name: "Dewi Lestari", phone: "081234560004", email: "dewi@email.com", points: 0, status: "inactive", createdAt: now() },
  { id: "m-5", name: "Rizky Pratama", phone: "081234560005", points: 850, status: "active", createdAt: now() },
];

export const useMemberStore = create<MemberStore>((set) => ({
  members: seed,
  addMember: (m) => set((st) => ({ members: [...st.members, { ...m, points: m.points ?? 0, id: uid(), createdAt: now() }] })),
  updateMember: (id, m) => set((st) => ({ members: st.members.map((x) => (x.id === id ? { ...x, ...m } : x)) })),
  toggleStatus: (id) => set((st) => ({
    members: st.members.map((x) => x.id === id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x),
  })),
  removeMember: (id) => set((st) => ({ members: st.members.filter((x) => x.id !== id) })),
  addPoints: (id, points) => set((st) => ({
    members: st.members.map((x) => x.id === id ? { ...x, points: x.points + points } : x),
  })),
}));
