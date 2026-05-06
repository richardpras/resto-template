/**
 * Seed realistic interconnected sample data across all modules.
 * Runs once per browser (guarded by localStorage flag) so user-created
 * data is never overwritten on subsequent loads.
 */
import { useOrderStore, type Order, type OrderItem } from "@/stores/orderStore";
import { usePayrollStore } from "@/stores/payrollStore";
import { useSupplierStore } from "@/stores/supplierStore";
import { usePurchaseStore } from "@/stores/purchaseStore";
import { useInventoryStore } from "@/stores/inventoryStore";

const SEED_FLAG = "resto-seed-v2";

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

function makeOrder(opts: {
  outletId: string;
  source: "pos" | "qr";
  orderType: "Dine-in" | "Takeaway" | "Online";
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
  paymentMethod?: "Cash" | "QRIS" | "E-Wallet" | "Card";
  tableId?: string;
  tableLabel?: string;
  customerName?: string;
  items: OrderItem[];
  minutesAgo: number;
  prefix: string;
}): Order {
  const subtotal = opts.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;
  const createdAt = new Date(Date.now() - opts.minutesAgo * 60_000);
  const payments =
    opts.paymentStatus !== "unpaid" && opts.paymentMethod
      ? [{ method: opts.paymentMethod, amount: opts.paymentStatus === "paid" ? total : Math.round(total / 2), paidAt: createdAt }]
      : [];
  return {
    id: rid(),
    code: `${opts.prefix}-${rid().slice(0, 5).toUpperCase()}`,
    source: opts.source,
    outletId: opts.outletId,
    orderType: opts.orderType,
    items: opts.items,
    subtotal,
    tax,
    total,
    status: opts.status,
    paymentStatus: opts.paymentStatus,
    payments,
    customerName: opts.customerName ?? "",
    customerPhone: "",
    tableNumber: opts.tableLabel ?? "",
    createdAt,
    confirmedAt:
      opts.status === "confirmed" || opts.status === "cooking" || opts.status === "ready" || opts.status === "completed"
        ? new Date(createdAt.getTime() + 60_000)
        : undefined,
  };
}

// Menu items that match POS.tsx ids
const M = {
  nasiGoreng: { id: "1", name: "Nasi Goreng Special", price: 30000, emoji: "🍛" },
  ayamBakar: { id: "2", name: "Ayam Bakar", price: 40000, emoji: "🍗" },
  mieGoreng: { id: "3", name: "Mie Goreng", price: 25000, emoji: "🍝" },
  esTeh: { id: "8", name: "Es Teh Manis", price: 10000, emoji: "🧊" },
  jusJeruk: { id: "11", name: "Es Jeruk", price: 12000, emoji: "🍊" },
  jusAlpukat: { id: "9", name: "Jus Alpukat", price: 18000, emoji: "🥑" },
  kopiSusu: { id: "10", name: "Kopi Susu", price: 20000, emoji: "☕" },
  pisangGoreng: { id: "12", name: "Pisang Goreng", price: 15000, emoji: "🍌" },
} as const;

function item(m: typeof M[keyof typeof M], qty: number, notes = ""): OrderItem {
  return { id: m.id, name: m.name, price: m.price, qty, emoji: m.emoji, notes };
}

export function seedSampleData() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_FLAG)) return;

  // ─── Orders + Tables (Resto Pusat = o-main, Resto Cabang = o-branch) ───
  const orders: Order[] = [
    // ── Resto Pusat ──
    makeOrder({
      outletId: "o-main", source: "pos", orderType: "Dine-in",
      status: "cooking", paymentStatus: "unpaid",
      tableId: "table-main-3", tableLabel: "Table 3",
      customerName: "Walk-in",
      items: [item(M.nasiGoreng, 2), item(M.esTeh, 2, "less ice")],
      minutesAgo: 6, prefix: "ORD-PST",
    }),
    makeOrder({
      outletId: "o-main", source: "pos", orderType: "Dine-in",
      status: "confirmed", paymentStatus: "unpaid",
      tableId: "table-main-5", tableLabel: "Table 5",
      customerName: "Budi Santoso",
      items: [item(M.ayamBakar, 1), item(M.nasiGoreng, 1), item(M.jusAlpukat, 2)],
      minutesAgo: 2, prefix: "ORD-PST",
    }),
    makeOrder({
      outletId: "o-main", source: "qr", orderType: "Dine-in",
      status: "ready", paymentStatus: "paid", paymentMethod: "QRIS",
      tableId: "table-main-7", tableLabel: "Table 7",
      customerName: "Siti Aminah",
      items: [item(M.mieGoreng, 1), item(M.kopiSusu, 1), item(M.pisangGoreng, 1)],
      minutesAgo: 14, prefix: "ORD-PST",
    }),
    makeOrder({
      outletId: "o-main", source: "pos", orderType: "Takeaway",
      status: "completed", paymentStatus: "paid", paymentMethod: "Cash",
      customerName: "Andi Wijaya",
      items: [item(M.ayamBakar, 2), item(M.esTeh, 2)],
      minutesAgo: 35, prefix: "ORD-PST",
    }),
    makeOrder({
      outletId: "o-main", source: "pos", orderType: "Takeaway",
      status: "completed", paymentStatus: "paid", paymentMethod: "E-Wallet",
      customerName: "Dewi Lestari",
      items: [item(M.nasiGoreng, 1), item(M.jusJeruk, 1)],
      minutesAgo: 70, prefix: "ORD-PST",
    }),
    makeOrder({
      outletId: "o-main", source: "pos", orderType: "Dine-in",
      status: "completed", paymentStatus: "paid", paymentMethod: "QRIS",
      customerName: "Rizky Pratama",
      items: [item(M.mieGoreng, 2), item(M.ayamBakar, 1), item(M.jusAlpukat, 2), item(M.esTeh, 2)],
      minutesAgo: 110, prefix: "ORD-PST",
    }),

    // ── Resto Cabang ──
    makeOrder({
      outletId: "o-branch", source: "pos", orderType: "Dine-in",
      status: "cooking", paymentStatus: "unpaid",
      tableId: "table-branch-2", tableLabel: "Table 2",
      customerName: "John Doe",
      items: [item(M.ayamBakar, 1), item(M.nasiGoreng, 1), item(M.kopiSusu, 2)],
      minutesAgo: 8, prefix: "ORD-CBG",
    }),
    makeOrder({
      outletId: "o-branch", source: "qr", orderType: "Dine-in",
      status: "confirmed", paymentStatus: "paid", paymentMethod: "QRIS",
      tableId: "table-branch-4", tableLabel: "Table 4",
      customerName: "Jane Smith",
      items: [item(M.mieGoreng, 2), item(M.esTeh, 2)],
      minutesAgo: 3, prefix: "ORD-CBG",
    }),
    makeOrder({
      outletId: "o-branch", source: "pos", orderType: "Takeaway",
      status: "ready", paymentStatus: "paid", paymentMethod: "Cash",
      customerName: "Walk-in",
      items: [item(M.nasiGoreng, 3), item(M.jusJeruk, 3)],
      minutesAgo: 18, prefix: "ORD-CBG",
    }),
    makeOrder({
      outletId: "o-branch", source: "pos", orderType: "Dine-in",
      status: "completed", paymentStatus: "paid", paymentMethod: "E-Wallet",
      customerName: "Linda Wong",
      items: [item(M.ayamBakar, 2), item(M.kopiSusu, 2), item(M.pisangGoreng, 2)],
      minutesAgo: 60, prefix: "ORD-CBG",
    }),
    makeOrder({
      outletId: "o-branch", source: "pos", orderType: "Takeaway",
      status: "completed", paymentStatus: "paid", paymentMethod: "Cash",
      customerName: "Tono",
      items: [item(M.mieGoreng, 1), item(M.esTeh, 1)],
      minutesAgo: 95, prefix: "ORD-CBG",
    }),
  ];

  const orderStore = useOrderStore.getState();
  // Mark tables linked to active in-progress orders
  const tableLinks: { tableId: string; status: "occupied" | "waiting-payment"; orderId: string }[] = [];
  orders.forEach((o) => {
    orderStore.addOrder(o);
    if (o.status !== "completed" && o.status !== "cancelled") {
      // Pick the matching default table id by outlet+label
      const idx = parseInt(o.tableNumber.replace(/\D/g, "") || "0", 10);
      if (idx > 0) {
        const tableId = `${o.outletId === "o-main" ? "table-main-" : "table-branch-"}${idx}`;
        tableLinks.push({
          tableId,
          status: o.paymentStatus === "paid" ? "waiting-payment" : "occupied",
          orderId: o.id,
        });
      }
    }
  });
  tableLinks.forEach((l) => orderStore.updateTableStatus(l.tableId, l.status, l.orderId));

  // ─── Payroll: extra employees + last-7-days attendance ───
  const payroll = usePayrollStore.getState();
  // Add a couple branch employees (existing seed has 3 main-outlet)
  payroll.addEmployee({
    name: "Maya Putri", position: "Cashier", outlet: "Branch",
    joinDate: "2024-09-01", salaryType: "monthly", baseSalary: 4800000,
    overtimeRate: 28000, status: "active",
  });
  payroll.addEmployee({
    name: "Rian Hakim", position: "Waiter", outlet: "Branch",
    joinDate: "2025-01-15", salaryType: "daily", baseSalary: 140000,
    overtimeRate: 22000, status: "active",
  });

  const employees = usePayrollStore.getState().employees;
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const ymd = date.toISOString().slice(0, 10);
    const dow = date.getDay();
    if (dow === 0) continue; // Sunday off
    employees.forEach((emp, i) => {
      const isLate = (i + d) % 6 === 0;
      const isAbsent = (i + d) % 11 === 0;
      payroll.addAttendance({
        employeeId: emp.id,
        date: ymd,
        checkIn: isAbsent ? undefined : isLate ? "08:25" : "07:55",
        checkOut: isAbsent ? undefined : "17:05",
        status: isAbsent ? "absent" : isLate ? "late" : "present",
      });
    });
  }
  // Approved overtime example
  if (employees[1]) {
    payroll.addOvertime({
      employeeId: employees[1].id,
      date: today.toISOString().slice(0, 10),
      hours: 2, status: "approved", notes: "Dinner rush coverage",
    });
  }
  // Allowance example
  if (employees[0]) {
    payroll.addAdjustment({
      employeeId: employees[0].id, type: "allowance", category: "transport",
      amount: 300000, date: today.toISOString().slice(0, 10),
    });
  }

  // ─── Purchase: simple PR → PO → GRN flow at Resto Pusat ───
  const sup = useSupplierStore.getState();
  const supplier = sup.suppliers[0]; // PT Sumber Pangan
  const purchase = usePurchaseStore.getState();
  const inv = useInventoryStore.getState();
  const rice = inv.ingredients.find((x) => x.name === "Rice");
  const chicken = inv.ingredients.find((x) => x.name === "Chicken");
  const tea = inv.ingredients.find((x) => x.name === "Tea bags");

  if (rice && chicken && tea && supplier) {
    const prId = purchase.addPR({
      date: today.toISOString().slice(0, 10),
      outlet: "Resto Pusat",
      requestedBy: "Sarah Lee",
      status: "approved",
      notes: "Weekly restock",
      items: [
        { inventoryItemId: rice.id, qty: 25, unit: rice.unit },
        { inventoryItemId: chicken.id, qty: 15, unit: chicken.unit },
        { inventoryItemId: tea.id, qty: 5, unit: tea.unit },
      ],
    });
    const poId = purchase.createPOFromPR(prId, supplier.id);
    if (poId) {
      const po = usePurchaseStore.getState().purchaseOrders.find((p) => p.id === poId);
      if (po) {
        // Set prices
        purchase.updatePO(poId, {
          status: "sent",
          items: po.items.map((it) => ({
            ...it,
            price:
              it.inventoryItemId === rice.id ? 12000 :
              it.inventoryItemId === chicken.id ? 35000 : 8000,
          })),
        });
        // Receive goods
        purchase.addGRN({
          poReference: po.poNumber,
          date: today.toISOString().slice(0, 10),
          status: "pending",
          items: po.items.map((it) => ({
            inventoryItemId: it.inventoryItemId,
            orderedQty: it.qty,
            receivedQty: it.qty,
            unit: it.unit,
          })),
        });
        const grn = usePurchaseStore.getState().goodsReceipts.slice(-1)[0];
        if (grn) purchase.confirmGRN(grn.id);
      }
    }
  }

  localStorage.setItem(SEED_FLAG, "1");
}
