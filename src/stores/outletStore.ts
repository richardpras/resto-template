import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import { useSettingsStore } from "./settingsStore";

interface OutletContextStore {
  currentOutletId: string | null;
  setCurrentOutletId: (id: string) => void;
}

export const useOutletContext = create<OutletContextStore>()(
  persist(
    (set) => ({
      currentOutletId: null,
      setCurrentOutletId: (id) => set({ currentOutletId: id }),
    }),
    { name: "resto-outlet-context" },
  ),
);

/**
 * Resolve the active outlet id and the list of outlets the user is allowed to see.
 * - Owners can view all outlets and switch.
 * - Non-owners are pinned to their assigned outlet.
 */
export function useActiveOutlet() {
  const user = useAuthStore((s) => s.user);
  const outlets = useSettingsStore((s) => s.outlets);
  const { currentOutletId, setCurrentOutletId } = useOutletContext();

  const isOwner = user?.role === "Owner";
  const accessibleOutlets = isOwner
    ? outlets
    : outlets.filter((o) => user?.outletIds.includes(o.id));

  // Resolve current outlet id with sensible fallbacks
  let activeId = currentOutletId;
  if (!isOwner) {
    // Non-owners are pinned to their first allowed outlet
    activeId = accessibleOutlets[0]?.id ?? null;
  } else if (!activeId || !accessibleOutlets.find((o) => o.id === activeId)) {
    activeId = accessibleOutlets[0]?.id ?? null;
  }

  const activeOutlet = accessibleOutlets.find((o) => o.id === activeId) ?? null;

  return {
    isOwner,
    activeOutletId: activeId,
    activeOutlet,
    accessibleOutlets,
    canSwitch: isOwner && accessibleOutlets.length > 1,
    setActiveOutletId: setCurrentOutletId,
  };
}
