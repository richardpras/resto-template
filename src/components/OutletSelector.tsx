import { Store } from "lucide-react";
import { useActiveOutlet } from "@/stores/outletStore";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function OutletSelector({ compact = false }: { compact?: boolean }) {
  const { activeOutletId, activeOutlet, accessibleOutlets, canSwitch, setActiveOutletId } =
    useActiveOutlet();

  if (!activeOutlet) return null;

  // Non-owner: read-only chip
  if (!canSwitch) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20"
        title="Your assigned outlet"
      >
        <Store className="h-3.5 w-3.5" />
        <span className={compact ? "hidden sm:inline" : ""}>{activeOutlet.name}</span>
      </div>
    );
  }

  return (
    <Select value={activeOutletId ?? ""} onValueChange={setActiveOutletId}>
      <SelectTrigger className="h-9 gap-2 px-2.5 text-xs font-medium bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 focus:ring-primary/30 w-auto min-w-[10rem]">
        <Store className="h-3.5 w-3.5" />
        <SelectValue placeholder="Select outlet" />
      </SelectTrigger>
      <SelectContent>
        {accessibleOutlets.map((o) => (
          <SelectItem key={o.id} value={o.id} className="text-xs">
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
