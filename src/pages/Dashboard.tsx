import { TrendingUp, DollarSign, ShoppingBag, Users, ArrowUpRight, Store, Package, AlertTriangle, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from "recharts";
import { useAuthStore, PERMISSIONS } from "@/stores/authStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useOrderStore } from "@/stores/orderStore";
import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const outletsData = [
  { id: "o-main", name: "Main Outlet" },
  { id: "o-branch", name: "Branch - Downtown" },
];

const hourlyData = [
  { hour: "8AM", orders: 4 }, { hour: "9AM", orders: 8 }, { hour: "10AM", orders: 12 },
  { hour: "11AM", orders: 22 }, { hour: "12PM", orders: 35 }, { hour: "1PM", orders: 28 },
  { hour: "2PM", orders: 18 }, { hour: "3PM", orders: 14 }, { hour: "4PM", orders: 10 },
  { hour: "5PM", orders: 16 }, { hour: "6PM", orders: 30 }, { hour: "7PM", orders: 38 },
  { hour: "8PM", orders: 32 }, { hour: "9PM", orders: 20 },
];

const crossOutletMenu = [
  { menu: "Nasi Goreng", "Main Outlet": 42, "Branch - Downtown": 28 },
  { menu: "Ayam Bakar", "Main Outlet": 38, "Branch - Downtown": 35 },
  { menu: "Es Teh Manis", "Main Outlet": 65, "Branch - Downtown": 50 },
  { menu: "Mie Goreng", "Main Outlet": 28, "Branch - Downtown": 22 },
  { menu: "Sate Ayam", "Main Outlet": 25, "Branch - Downtown": 30 },
];

const recentTx = [
  { id: "#ORD-148", type: "Dine-in", total: "Rp 156,000", status: "Paid", time: "2 min ago" },
  { id: "#ORD-147", type: "Takeaway", total: "Rp 84,000", status: "Paid", time: "8 min ago" },
  { id: "#ORD-146", type: "Online", total: "Rp 210,000", status: "Cooking", time: "12 min ago" },
  { id: "#ORD-145", type: "Dine-in", total: "Rp 95,000", status: "Paid", time: "15 min ago" },
];

const notifications = [
  { id: 1, kind: "warn", title: "Low stock alert", body: "Chicken below minimum threshold", time: "5m" },
  { id: 2, kind: "info", title: "New QR order", body: "Table 7 placed an order", time: "12m" },
  { id: 3, kind: "success", title: "Payment received", body: "Order #ORD-147 paid via QRIS", time: "20m" },
];

export default function Dashboard() {
  const { user, hasPermission } = useAuthStore();
  const { ingredients } = useInventoryStore();
  const { orders } = useOrderStore();
  const [outletFilter, setOutletFilter] = useState<string>("all");
  const [range, setRange] = useState<string>("today");

  const canViewAll = hasPermission(PERMISSIONS.DASHBOARD_ALL);
  const visibleOutlets = canViewAll ? outletsData : outletsData.filter((o) => user?.outletIds.includes(o.id));

  const stats = canViewAll
    ? [
        { label: "Total Sales (All)", value: "Rp 28,950,000", change: "+12%", icon: DollarSign },
        { label: "Total Orders", value: "287", change: "+8%", icon: ShoppingBag },
        { label: "Active Outlets", value: `${visibleOutlets.length}`, change: "100%", icon: Store },
        { label: "Top Menu", value: "Es Teh Manis", change: "115 sold", icon: TrendingUp },
      ]
    : [
        { label: "Today's Revenue", value: "Rp 12,450,000", change: "+12%", icon: DollarSign },
        { label: "Total Orders", value: "148", change: "+8%", icon: ShoppingBag },
        { label: "Avg Order Value", value: "Rp 84,100", change: "+3%", icon: TrendingUp },
        { label: "Customers", value: "112", change: "+15%", icon: Users },
      ];

  const lowStock = ingredients.filter((i) => i.stock < i.min).slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {canViewAll ? "Overview across all outlets" : `Overview for ${visibleOutlets[0]?.name ?? "your outlet"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-32 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          {canViewAll && (
            <Select value={outletFilter} onValueChange={setOutletFilter}>
              <SelectTrigger className="w-44 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All outlets</SelectItem>
                {outletsData.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl p-4 pos-shadow-md border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-success flex items-center gap-0.5">
                {s.change} <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <p className="text-lg md:text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-2xl p-5 pos-shadow-md border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Peak Hours</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(147, 16%, 19%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(147, 16%, 19%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(140, 12%, 90%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="hsl(147, 8%, 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(147, 8%, 46%)" />
              <Tooltip />
              <Area type="monotone" dataKey="orders" stroke="hsl(147, 16%, 19%)" fill="url(#colorOrders)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl p-5 pos-shadow-md border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Low Stock
            </h3>
            <span className="text-xs text-muted-foreground">{lowStock.length} items</span>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">All stock levels OK ✓</p>
          ) : (
            <div className="space-y-2.5">
              {lowStock.map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{i.name}</p>
                    <p className="text-xs text-muted-foreground">Min {i.min} {i.unit}</p>
                  </div>
                  <span className="text-sm font-semibold text-destructive">{i.stock} {i.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {canViewAll && (
        <div className="bg-card rounded-2xl p-5 pos-shadow-md border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Favorite Menu — Cross Outlet</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={crossOutletMenu}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(140, 12%, 90%)" />
              <XAxis dataKey="menu" tick={{ fontSize: 11 }} stroke="hsl(147, 8%, 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(147, 8%, 46%)" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Main Outlet" fill="hsl(147, 16%, 19%)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Branch - Downtown" fill="hsl(145, 40%, 60%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-2xl p-5 pos-shadow-md border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium text-foreground">{tx.id}</td>
                    <td className="py-3 text-muted-foreground">{tx.type}</td>
                    <td className="py-3 font-medium text-foreground">{tx.total}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === "Paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}>{tx.status}</span>
                    </td>
                    <td className="py-3 text-muted-foreground">{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 pos-shadow-md border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </h3>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex gap-3">
                <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${
                  n.kind === "warn" ? "bg-warning" : n.kind === "success" ? "bg-success" : "bg-info"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
