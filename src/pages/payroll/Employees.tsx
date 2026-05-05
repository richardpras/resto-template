import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { usePayrollStore, formatIDR, type Employee, type SalaryType } from "@/stores/payrollStore";
import { toast } from "sonner";

const empty: Omit<Employee, "id"> = {
  name: "",
  position: "",
  outlet: "Main",
  joinDate: new Date().toISOString().slice(0, 10),
  salaryType: "monthly",
  baseSalary: 0,
  overtimeRate: 0,
  status: "active",
};

export default function Employees() {
  const { employees, addEmployee, updateEmployee, removeEmployee } = usePayrollStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Employee, "id">>(empty);

  const openCreate = () => {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (e: Employee) => {
    setEditId(e.id);
    const { id, ...rest } = e;
    setForm(rest);
    setOpen(true);
  };

  const submit = () => {
    if (!form.name || !form.position) {
      toast.error("Name and position required");
      return;
    }
    if (editId) {
      updateEmployee(editId, form);
      toast.success("Employee updated");
    } else {
      addEmployee(form);
      toast.success("Employee added");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Employees</h2>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4" />Add Employee</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Outlet</TableHead>
              <TableHead>Salary Type</TableHead>
              <TableHead>Base Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell>{e.position}</TableCell>
                <TableCell>{e.outlet}</TableCell>
                <TableCell className="capitalize">{e.salaryType}</TableCell>
                <TableCell>{formatIDR(e.baseSalary)}</TableCell>
                <TableCell>
                  <Badge variant={e.status === "active" ? "default" : "secondary"}>{e.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => removeEmployee(e.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {employees.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No employees yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit" : "Add"} Employee</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Outlet</Label>
              <Input value={form.outlet} onChange={(e) => setForm({ ...form, outlet: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Join Date</Label>
              <Input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Salary Type</Label>
              <Select value={form.salaryType} onValueChange={(v) => setForm({ ...form, salaryType: v as SalaryType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "active" | "inactive" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Base Salary</Label>
              <Input type="number" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Overtime Rate (per hour)</Label>
              <Input type="number" value={form.overtimeRate} onChange={(e) => setForm({ ...form, overtimeRate: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
