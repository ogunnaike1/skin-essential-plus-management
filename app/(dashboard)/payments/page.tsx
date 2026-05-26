"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, CreditCard, Plus, MoreHorizontal, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDate, formatCurrency, getInitials } from "@/lib/utils";
import { toast } from "@/components/ui/custom-toast";
import { StatCard } from "@/components/dashboard/StatCard";

const methodColors: Record<string, string> = {
  CASH: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  TRANSFER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  CARD: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  POS: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  bookingId: string;
  clientId: string;
  paidAt: string | null;
  createdAt: string;
  client?: { id: string; name: string };
  booking?: { id: string; date: string; service?: { name: string } };
}

interface Booking {
  id: string;
  date: string;
  client?: { id: string; name: string };
  service?: { id: string; name: string; price: number };
}

const emptyForm = { bookingId: "", amount: "", method: "", status: "PAID" };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [recordOpen, setRecordOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formBookingId, setFormBookingId] = useState("");
  const [formMethod, setFormMethod] = useState("");
  const [formStatus, setFormStatus] = useState("PAID");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ])
      .then(([p, b]) => {
        setPayments(Array.isArray(p) ? p : []);
        setBookings(Array.isArray(b) ? b : []);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setFetching(false));
  }, []);

  const selectedBooking = bookings.find((b) => b.id === formBookingId);

  const openRecord = () => {
    setFormBookingId("");
    setFormMethod("");
    setFormStatus("PAID");
    setForm(emptyForm);
    setRecordOpen(true);
  };

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBookingId) { toast.error("Please select a booking"); return; }
    if (!formMethod) { toast.error("Please select a payment method"); return; }
    if (!selectedBooking?.client) { toast.error("Booking client not found"); return; }

    const payload = {
      bookingId: formBookingId,
      clientId: selectedBooking.client.id,
      amount: Number(form.amount) || selectedBooking.service?.price || 0,
      method: formMethod,
      status: formStatus,
    };

    setSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const created: Payment = await res.json();
      // Attach client + booking from local state for immediate display
      const enriched: Payment = {
        ...created,
        client: selectedBooking.client,
        booking: selectedBooking,
      };
      setPayments((prev) => [enriched, ...prev]);
      toast.success("Payment recorded!");
      setRecordOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (payment: Payment) => {
    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated: Payment = await res.json();
      setPayments((prev) =>
        prev.map((p) =>
          p.id === updated.id
            ? { ...updated, client: p.client, booking: p.booking }
            : p
        )
      );
      toast.success("Payment marked as paid");
    } catch {
      toast.error("Failed to update payment");
    }
  };

  const filtered = payments.filter((p) => {
    const clientName = p.client?.name ?? "";
    const serviceName = p.booking?.service?.name ?? "";
    const q = search.toLowerCase();
    return clientName.toLowerCase().includes(q) || serviceName.toLowerCase().includes(q);
  });

  const totalPaid = payments.filter((p) => p.status === "PAID").reduce((a, p) => a + p.amount, 0);
  const totalPending = payments.filter((p) => p.status !== "PAID").reduce((a, p) => a + p.amount, 0);
  const totalRevenue = payments.reduce((a, p) => a + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Collected" value={totalPaid} prefix="₦" icon={TrendingUp} color="green" />
        <StatCard title="Outstanding" value={totalPending} prefix="₦" icon={CreditCard} color="orange" delay={0.05} />
        <StatCard title="Total Revenue" value={totalRevenue} prefix="₦" icon={TrendingUp} color="blue" delay={0.1} />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>Payment Records</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <Button onClick={openRecord}>
              <Plus className="w-4 h-4" /> Record
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {fetching ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#A0AEC0]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#A0AEC0]/20">
                    {["Client", "Service", "Amount", "Method", "Status", "Date", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#A0AEC0]/10">
                  {filtered.map((payment, i) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className="hover:bg-[#F5F7FA] dark:hover:bg-[#1A2535] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{getInitials(payment.client?.name ?? "?")}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-[#1A202C] dark:text-white">
                            {payment.client?.name ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#718096]">
                        {payment.booking?.service?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#0346A0]">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${methodColors[payment.method] ?? ""}`}>
                          {payment.method}
                        </span>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={payment.status} /></td>
                      <td className="px-6 py-4 text-sm text-[#718096]">
                        {payment.paidAt
                          ? formatDate(new Date(payment.paidAt))
                          : formatDate(new Date(payment.createdAt))}
                      </td>
                      <td className="px-4 py-4">
                        {payment.status !== "PAID" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-[#A0AEC0] hover:text-[#1A202C] dark:hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleMarkPaid(payment)}>
                                Mark as Paid
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-16 text-[#A0AEC0]">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">{search ? "No payments match your search" : "No payments recorded yet"}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Modal */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecord} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Booking *</Label>
              <Select value={formBookingId} onValueChange={setFormBookingId}>
                <SelectTrigger><SelectValue placeholder="Select booking" /></SelectTrigger>
                <SelectContent className="z-[60]">
                  {bookings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.client?.name ?? "Unknown"} — {b.service?.name ?? "Service"} ({formatDate(new Date(b.date))})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBooking && (
              <div className="rounded-lg bg-[#F5F7FA] dark:bg-[#1A2535] px-4 py-3 text-sm space-y-1">
                <p className="text-[#718096]">Client: <span className="text-[#1A202C] dark:text-white font-medium">{selectedBooking.client?.name}</span></p>
                <p className="text-[#718096]">Service: <span className="text-[#1A202C] dark:text-white font-medium">{selectedBooking.service?.name}</span></p>
                {selectedBooking.service?.price != null && (
                  <p className="text-[#718096]">Service price: <span className="text-[#0346A0] font-semibold">{formatCurrency(selectedBooking.service.price)}</span></p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount (₦) *</Label>
                <Input
                  type="number"
                  placeholder={selectedBooking?.service?.price ? String(selectedBooking.service.price) : "25000"}
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Method *</Label>
                <Select value={formMethod} onValueChange={setFormMethod}>
                  <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                  <SelectContent className="z-[60]">
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="POS">POS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="PAID">Fully Paid</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRecordOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
