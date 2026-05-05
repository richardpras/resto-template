import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { AppUser, useUserStore } from "@/stores/userStore";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: AppUser | null;
}

export function UserFormModal({ open, onOpenChange, editing }: Props) {
  const { roles, outlets, addUser, updateUser } = useUserStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [outletIds, setOutletIds] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setEmail(editing?.email ?? "");
      setPassword("");
      setRoleId(editing?.roleId ?? roles[0]?.id ?? "");
      setOutletIds(editing?.outletIds ?? []);
      setActive((editing?.status ?? "active") === "active");
    }
  }, [open, editing, roles]);

  const toggleOutlet = (id: string) =>
    setOutletIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = () => {
    if (!name.trim() || !email.trim() || !roleId) {
      toast.error("Name, email and role are required");
      return;
    }
    if (!editing && !password.trim()) {
      toast.error("Password is required for new users");
      return;
    }
    const payload = {
      name: name.trim(),
      email: email.trim(),
      roleId,
      outletIds,
      status: (active ? "active" : "inactive") as "active" | "inactive",
      ...(password ? { password } : {}),
    };
    if (editing) {
      updateUser(editing.id, payload);
      toast.success("User updated");
    } else {
      addUser(payload as any);
      toast.success("User created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Basic Info</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@email.com" />
              </div>
              {!editing && (
                <div className="space-y-1.5 col-span-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
                </div>
              )}
              <div className="col-span-2 flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-sm">Status</Label>
                  <p className="text-xs text-muted-foreground">Inactive users cannot sign in</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{active ? "Active" : "Inactive"}</span>
                  <Switch checked={active} onCheckedChange={setActive} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Role Assignment</h3>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Outlet Access</h3>
            <div className="grid grid-cols-2 gap-2">
              {outlets.map((o) => (
                <label key={o.id} className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                  <Checkbox checked={outletIds.includes(o.id)} onCheckedChange={() => toggleOutlet(o.id)} />
                  <span className="text-sm">{o.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
