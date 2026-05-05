import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import { useUserStore, Role, PERMISSION_MODULES } from "@/stores/userStore";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function RolesList() {
  const { roles, users, addRole, updateRole, deleteRole, setRolePermissions, getDefaultPermissions } = useUserStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [permsOpen, setPermsOpen] = useState<Role | null>(null);
  const [perms, setPerms] = useState<string[]>([]);
  const [delTarget, setDelTarget] = useState<Role | null>(null);

  const userCount = useMemo(() => {
    const m: Record<string, number> = {};
    users.forEach((u) => (m[u.roleId] = (m[u.roleId] ?? 0) + 1));
    return m;
  }, [users]);

  const openCreate = () => { setEditing(null); setName(""); setDesc(""); setOpen(true); };
  const openEdit = (r: Role) => { setEditing(r); setName(r.name); setDesc(r.description); setOpen(true); };

  const save = () => {
    if (!name.trim()) { toast.error("Role name required"); return; }
    if (editing) {
      updateRole(editing.id, { name: name.trim(), description: desc.trim() });
      toast.success("Role updated");
    } else {
      const defaults = getDefaultPermissions(name.trim());
      addRole({ name: name.trim(), description: desc.trim(), permissions: defaults });
      toast.success("Role created");
    }
    setOpen(false);
  };

  const openPerms = (r: Role) => { setPermsOpen(r); setPerms(r.permissions); };
  const togglePerm = (key: string) =>
    setPerms((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));
  const toggleModule = (mod: string, actions: string[], allOn: boolean) => {
    const keys = actions.map((a) => `${mod}.${a}`);
    setPerms((p) => (allOn ? p.filter((x) => !keys.includes(x)) : Array.from(new Set([...p, ...keys]))));
  };
  const savePerms = () => {
    if (!permsOpen) return;
    setRolePermissions(permsOpen.id, perms);
    toast.success("Permissions updated");
    setPermsOpen(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Role</Button>
      </div>

      <Card className="rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {r.name}
                    {r.isSystem && <Badge variant="outline" className="text-[10px]">system</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{r.description}</TableCell>
                <TableCell>{userCount[r.id] ?? 0}</TableCell>
                <TableCell><Badge variant="secondary">{r.permissions.length} perms</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => openPerms(r)}>
                      <Shield className="h-4 w-4" /> Permissions
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(r)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" disabled={r.isSystem || (userCount[r.id] ?? 0) > 0} onClick={() => setDelTarget(r)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Role */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Role" : "Create Role"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Role Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Supervisor" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions */}
      <Dialog open={!!permsOpen} onOpenChange={(o) => !o && setPermsOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Permissions — {permsOpen?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {PERMISSION_MODULES.map((m) => {
              const keys = m.actions.map((a) => `${m.module}.${a}`);
              const onCount = keys.filter((k) => perms.includes(k)).length;
              const allOn = onCount === keys.length;
              return (
                <div key={m.module} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{onCount}/{keys.length} enabled</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => toggleModule(m.module, m.actions, allOn)}>
                      {allOn ? "Disable all" : "Enable all"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {m.actions.map((a) => {
                      const key = `${m.module}.${a}`;
                      return (
                        <label key={key} className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer hover:bg-accent">
                          <Checkbox checked={perms.includes(key)} onCheckedChange={() => togglePerm(key)} />
                          <span className="text-sm capitalize">{a}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermsOpen(null)}>Cancel</Button>
            <Button onClick={savePerms}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delTarget} onOpenChange={(o) => !o && setDelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (delTarget) { deleteRole(delTarget.id); toast.success("Role deleted"); } setDelTarget(null); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
