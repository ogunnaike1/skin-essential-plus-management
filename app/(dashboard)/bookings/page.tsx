"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Filter, ChevronRight, ChevronLeft, Check,
  MoreHorizontal, CheckCircle, XCircle, Clock, Loader2, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatTime, formatCurrency, getInitials } from "@/lib/utils";
import { CATEGORIES } from "@/lib/service-catalog";
import { toast } from "sonner";

type Booking = {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  clientId: string;
  serviceId: string;
  staffId: string;
  client: { id: string; name: string } | null;
  service: { id: string; name: string; price: number; duration: number } | null;
  staff: { id: string; name: string } | null;
  payment: { amount: number } | null;
};

type Client = { id: string; name: string };
type Service = { id: string; name: string; price: number; duration: number; category: string };
type Staff = { id: string; name: string; role: string };

const STEPS = ["Client", "Category", "Service", "Schedule", "Confirm"];

function BookingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setNewOpen(true);
      router.replace("/bookings", { scroll: false });
    }
  }, [searchParams, router]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "ALL") params.set("status", filter);
      const res = await fetch(`/api/bookings?${params}`);
      if (!res.ok) throw new Error();
      setBookings(await res.json());
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      toast.success(`Booking ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update booking");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success("Booking deleted");
    } catch {
      toast.error("Failed to delete booking");
    }
  };

  const filtered = bookings.filter((b) => {
    const clientName = b.client?.name ?? "";
    const serviceName = b.service?.name ?? "";
    const matchSearch = clientName.toLowerCase().includes(search.toLowerCase()) ||
      serviceName.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
            <Input placeholder="Search bookings…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36">
              <Filter className="w-4 h-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="w-4 h-4" /> New Booking
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#A0AEC0]/20">
                  <th className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-6 py-3">Client</th>
                  <th className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Service</th>
                  <th className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Staff</th>
                  <th className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-4 py-3">Date & Time</th>
                  <th className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Amount</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#A0AEC0]/10">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-4 bg-[#A0AEC0]/10 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-[#A0AEC0]">
                      <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No bookings found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((booking, i) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className="hover:bg-[#F5F7FA] dark:hover:bg-[#1A2535] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{getInitials(booking.client?.name ?? "?")}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-[#1A202C] dark:text-white">{booking.client?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#718096] hidden sm:table-cell">{booking.service?.name ?? "—"}</td>
                      <td className="px-4 py-4 text-sm text-[#718096] hidden md:table-cell">{booking.staff?.name ?? "—"}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-[#1A202C] dark:text-white">{formatDate(booking.date)}</div>
                        <div className="text-xs text-[#A0AEC0]">{formatTime(booking.date)}</div>
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={booking.status} /></td>
                      <td className="px-4 py-4 text-sm font-medium text-[#1A202C] dark:text-white hidden md:table-cell">
                        {booking.payment ? formatCurrency(booking.payment.amount) : booking.service ? formatCurrency(booking.service.price) : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {booking.status === "PENDING" && (
                              <DropdownMenuItem onSelect={() => updateStatus(booking.id, "CONFIRMED")}>
                                <Check className="w-4 h-4 text-green-600" /> Confirm
                              </DropdownMenuItem>
                            )}
                            {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
                              <DropdownMenuItem onSelect={() => updateStatus(booking.id, "COMPLETED")}>
                                <CheckCircle className="w-4 h-4 text-blue-600" /> Complete
                              </DropdownMenuItem>
                            )}
                            {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                              <DropdownMenuItem onSelect={() => updateStatus(booking.id, "CANCELLED")} className="text-red-500 focus:text-red-500">
                                <XCircle className="w-4 h-4" /> Cancel
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onSelect={() => handleDelete(booking.id)} className="text-red-500 focus:text-red-500">
                              <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <NewBookingModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(booking) => {
          setBookings((prev) => [booking, ...prev]);
          setNewOpen(false);
        }}
      />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense>
      <BookingsContent />
    </Suspense>
  );
}

function NewBookingModal({ open, onClose, onCreated }: {
  open: boolean;
  onClose: () => void;
  onCreated: (booking: Booking) => void;
}) {
  const [step, setStep] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [clientId, setClientId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [customService, setCustomService] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
    ]).then(([c, s, st]) => { setClients(c); setServices(s); setStaff(st); });
  }, [open]);

  const isOthers = categoryName === "Others";
  const filteredServices = services.filter((s) => s.category === categoryName);
  const othersServiceId = services.find((s) => s.name === "Others")?.id ?? "";

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedService = services.find((s) => s.id === serviceId);
  const selectedStaff = staff.find((s) => s.id === staffId);
  const displayServiceName = isOthers ? customService : (selectedService?.name ?? "");

  const canNext = ([
    !!clientId,
    !!categoryName,
    isOthers ? !!customService : !!serviceId,
    !!staffId && !!date && !!time,
  ][step]) ?? true;

  const progress = ((step + 1) / STEPS.length) * 100;

  const reset = () => {
    setStep(0);
    setClientId(""); setCategoryName(""); setServiceId("");
    setCustomService(""); setStaffId("");
    setDate(""); setTime(""); setNotes("");
  };

  const goNext = () => setStep((s) => s + 1);
  const goPrev = () => {
    if (step === 2) { setServiceId(""); setCustomService(""); }
    setStep((s) => s - 1);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const resolvedServiceId = isOthers ? othersServiceId : serviceId;
      const resolvedNotes = isOthers && customService
        ? `Service: ${customService}${notes ? `\n${notes}` : ""}`
        : notes || undefined;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          serviceId: resolvedServiceId,
          staffId,
          date: new Date(`${date}T${time}`).toISOString(),
          notes: resolvedNotes,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      const booking = await res.json();
      toast.success("Booking created!");
      reset();
      onCreated(booking);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                  i <= step ? "bg-[#0346A0] text-white" : "bg-[#F5F7FA] dark:bg-[#2D3748] text-[#A0AEC0]"
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? "text-[#0346A0] font-medium" : "text-[#A0AEC0]"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className="w-4 h-px bg-[#A0AEC0]/30" />}
              </div>
            ))}
          </div>
          <Progress value={progress} className="mt-2 h-1" />
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="py-2"
          >
            {/* ── Step 0: Client ── */}
            {step === 0 && (
              <div className="space-y-1.5">
                <Label>Select Client *</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Choose a client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ── Step 1: Category grid ── */}
            {step === 1 && (
              <div className="space-y-2">
                <Label>Service Category *</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setCategoryName(cat); setServiceId(""); setCustomService(""); }}
                      className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                        categoryName === cat
                          ? "border-[#0346A0] bg-[#EBF1FB] text-[#0346A0] font-medium dark:bg-[#1a2e4a] dark:border-[#0346A0]"
                          : "border-[#A0AEC0]/30 text-[#1A202C] dark:text-white hover:border-[#0346A0]/40 hover:bg-[#F5F7FA] dark:hover:bg-[#2D3748]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Specific service ── */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-[#EBF1FB] text-[#0346A0] font-medium dark:bg-[#1a2e4a]">
                    {categoryName}
                  </span>
                </div>

                {isOthers ? (
                  <div className="space-y-1.5">
                    <Label>Describe the service *</Label>
                    <Input
                      placeholder="e.g. Scalp treatment, Ear candling…"
                      value={customService}
                      onChange={(e) => setCustomService(e.target.value)}
                      autoFocus
                    />
                    <p className="text-xs text-[#A0AEC0]">
                      Type any service not listed in our catalog.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label>Select Service *</Label>
                    {filteredServices.length === 0 ? (
                      <p className="text-sm text-[#A0AEC0] py-4 text-center">
                        No services found. Run <code className="text-xs bg-[#F5F7FA] px-1 rounded">npm run seed</code> to populate.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                        {filteredServices.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setServiceId(s.id)}
                            className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                              serviceId === s.id
                                ? "border-[#0346A0] bg-[#EBF1FB] text-[#0346A0] font-medium dark:bg-[#1a2e4a] dark:border-[#0346A0]"
                                : "border-[#A0AEC0]/30 text-[#1A202C] dark:text-white hover:border-[#0346A0]/40 hover:bg-[#F5F7FA] dark:hover:bg-[#2D3748]"
                            }`}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 3: Schedule ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Assigned Staff *</Label>
                  <Select value={staffId} onValueChange={setStaffId}>
                    <SelectTrigger><SelectValue placeholder="Choose staff member" /></SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Date *</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Time *</Label>
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Notes (optional)</Label>
                  <Textarea placeholder="Any special instructions…" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
            )}

            {/* ── Step 4: Confirm ── */}
            {step === 4 && (
              <div className="rounded-xl bg-[#F5F7FA] dark:bg-[#2D3748] p-4 space-y-2 text-sm">
                {[
                  ["Client", selectedClient?.name],
                  ["Category", categoryName],
                  ["Service", displayServiceName],
                  ["Staff", selectedStaff?.name],
                  ["Date & Time", `${date} at ${time}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[#A0AEC0]">{label}</span>
                    <span className="font-medium text-right max-w-[60%]">{val}</span>
                  </div>
                ))}
                {notes && (
                  <div className="pt-1 border-t border-[#A0AEC0]/20 text-[#718096] text-xs">{notes}</div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <DialogFooter>
          {step > 0 && (
            <Button variant="outline" onClick={goPrev}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={goNext} disabled={!canNext}>Next <ChevronRight className="w-4 h-4" /></Button>
          ) : (
            <Button onClick={handleConfirm} disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : "Confirm Booking"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
