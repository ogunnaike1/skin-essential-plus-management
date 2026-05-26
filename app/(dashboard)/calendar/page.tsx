"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, formatTime, formatCurrency, getInitials } from "@/lib/utils";
import { CATEGORIES, SERVICE_CATALOG } from "@/lib/service-catalog";
import {
  CalendarDays, Clock, TrendingUp, CheckCircle2,
  ChevronRight, ChevronLeft, Check, Loader2,
  XCircle, CheckCircle, User, Scissors, CreditCard,
} from "lucide-react";
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

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#D69E2E",
  CONFIRMED: "#0346A0",
  COMPLETED: "#38A169",
  CANCELLED: "#E53E3E",
  NO_SHOW: "#718096",
};

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState("");
  const [prefillTime, setPrefillTime] = useState("");
  const calendarRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendarInstanceRef = useRef<any>(null);

  const today = new Date().toDateString();
  const todayBookings = bookings.filter((b) => new Date(b.date).toDateString() === today);
  const confirmedToday = todayBookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingToday = todayBookings.filter((b) => b.status === "PENDING").length;
  const todayRevenue = todayBookings
    .filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.payment?.amount ?? b.service?.price ?? 0), 0);

  const toCalendarEvent = useCallback((b: Booking) => {
    const start = new Date(b.date);
    const end = new Date(start.getTime() + (b.service?.duration ?? 60) * 60000);
    return {
      id: b.id,
      title: `${b.client?.name ?? "Unknown"} — ${b.service?.name ?? "Service"}`,
      start: start.toISOString(),
      end: end.toISOString(),
      backgroundColor: STATUS_COLOR[b.status] ?? "#718096",
      borderColor: "transparent",
      extendedProps: { booking: b },
    };
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error();
      return (await res.json()) as Booking[];
    } catch {
      toast.error("Failed to load bookings");
      return [];
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let calendar: any = null;

    const init = async () => {
      const [{ Calendar }, dayGridPlugin, timeGridPlugin, interactionPlugin] =
        await Promise.all([
          import("@fullcalendar/core"),
          import("@fullcalendar/daygrid"),
          import("@fullcalendar/timegrid"),
          import("@fullcalendar/interaction"),
        ]);

      if (!calendarRef.current) return;

      const data = await fetchBookings();
      setBookings(data);

      calendar = new Calendar(calendarRef.current, {
        plugins: [
          dayGridPlugin.default,
          timeGridPlugin.default,
          interactionPlugin.default,
        ],
        initialView: "timeGridWeek",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        height: "auto",
        events: data.map(toCalendarEvent),
        eventClick: (info) => {
          setSelectedBooking(info.event.extendedProps.booking as Booking);
        },
        dateClick: (info) => {
          const raw = info.dateStr;
          const hasTime = raw.includes("T");
          const dateStr = raw.split("T")[0];
          let timeStr = "09:00";
          if (hasTime) {
            const parts = raw.split("T")[1].split(":");
            timeStr = `${parts[0]}:${parts[1]}`;
          }
          setPrefillDate(dateStr);
          setPrefillTime(timeStr);
          setNewOpen(true);
        },
        editable: true,
        selectable: true,
        nowIndicator: true,
        slotMinTime: "07:00:00",
        slotMaxTime: "21:00:00",
        allDaySlot: false,
        slotLabelFormat: { hour: "numeric", minute: "2-digit", meridiem: "short" },
        eventContent: (arg) => {
          const b = arg.event.extendedProps.booking as Booking;
          const el = document.createElement("div");
          el.style.cssText =
            "padding:3px 5px;height:100%;display:flex;flex-direction:column;gap:1px;overflow:hidden;";
          el.innerHTML = `
            <div style="font-weight:600;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:white">
              ${b.client?.name ?? "Unknown"}
            </div>
            <div style="font-size:10px;opacity:0.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:white">
              ${b.service?.name ?? "Service"}
            </div>
            <div style="font-size:10px;opacity:0.75;color:white">
              ${formatTime(b.date)}
            </div>
          `;
          return { domNodes: [el] };
        },
      });

      calendarInstanceRef.current = calendar;
      calendar.render();
      setLoading(false);
    };

    init();
    return () => {
      calendar?.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();

      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      setSelectedBooking((prev) => (prev?.id === id ? { ...prev, status } : prev));

      const event = calendarInstanceRef.current?.getEventById(id);
      if (event) event.setProp("backgroundColor", STATUS_COLOR[status] ?? "#718096");

      toast.success(`Booking ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleCreated = useCallback(
    (booking: Booking) => {
      setBookings((prev) => [booking, ...prev]);
      calendarInstanceRef.current?.addEvent(toCalendarEvent(booking));
      setNewOpen(false);
      setPrefillDate("");
      setPrefillTime("");
    },
    [toCalendarEvent],
  );

  return (
    <div className="space-y-5">
      {/* Daily summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          icon={<CalendarDays className="w-4 h-4" />}
          label="Today's Bookings"
          value={todayBookings.length}
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <SummaryCard
          icon={<CheckCircle2 className="w-4 h-4" />}
          label="Confirmed"
          value={confirmedToday}
          colorClass="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        />
        <SummaryCard
          icon={<Clock className="w-4 h-4" />}
          label="Pending"
          value={pendingToday}
          colorClass="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
        />
        <SummaryCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Today's Revenue"
          value={formatCurrency(todayRevenue)}
          colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        />
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-3 text-xs text-[#718096]">
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
        ))}
        <span className="ml-auto text-[#A0AEC0] hidden sm:block">
          Click a time slot to add a booking
        </span>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-4">
          {loading && (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-[560px] w-full" />
            </div>
          )}
          <div ref={calendarRef} className={loading ? "hidden" : "block"} />
        </CardContent>
      </Card>

      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={updateStatus}
      />

      <NewBookingModal
        open={newOpen}
        prefillDate={prefillDate}
        prefillTime={prefillTime}
        onClose={() => {
          setNewOpen(false);
          setPrefillDate("");
          setPrefillTime("");
        }}
        onCreated={handleCreated}
      />
    </div>
  );
}

/* ── Summary card ─────────────────────────────────────────────────────────── */

function SummaryCard({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${colorClass}`}>{icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-[#A0AEC0] truncate">{label}</p>
              <p className="text-lg font-bold text-[#1A202C] dark:text-white leading-tight">
                {value}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Booking detail modal ─────────────────────────────────────────────────── */

function BookingDetailModal({
  booking,
  onClose,
  onStatusChange,
}: {
  booking: Booking | null;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState<string | null>(null);

  const act = async (status: string) => {
    if (!booking) return;
    setUpdating(status);
    await onStatusChange(booking.id, status);
    setUpdating(null);
  };

  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>

        {booking && (
          <div className="space-y-4">
            {/* Client */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F7FA] dark:bg-[#2D3748]">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="text-sm font-semibold">
                  {getInitials(booking.client?.name ?? "?")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-[#1A202C] dark:text-white text-sm">
                  {booking.client?.name ?? "Unknown client"}
                </p>
                <StatusBadge status={booking.status} />
              </div>
            </div>

            {/* Details grid */}
            <div className="space-y-2 text-sm">
              <DetailRow
                icon={<Scissors className="w-4 h-4" />}
                label="Service"
                value={booking.service?.name ?? "—"}
              />
              <DetailRow
                icon={<User className="w-4 h-4" />}
                label="Staff"
                value={booking.staff?.name ?? "—"}
              />
              <DetailRow
                icon={<CalendarDays className="w-4 h-4" />}
                label="Date"
                value={formatDate(booking.date)}
              />
              <DetailRow
                icon={<Clock className="w-4 h-4" />}
                label="Time"
                value={`${formatTime(booking.date)}${
                  booking.service ? ` (${booking.service.duration} min)` : ""
                }`}
              />
              <DetailRow
                icon={<CreditCard className="w-4 h-4" />}
                label="Amount"
                value={
                  booking.payment
                    ? formatCurrency(booking.payment.amount)
                    : booking.service
                    ? formatCurrency(booking.service.price)
                    : "—"
                }
              />
              {booking.notes && (
                <div className="mt-2 p-3 rounded-xl bg-[#F5F7FA] dark:bg-[#2D3748] text-xs text-[#718096]">
                  {booking.notes}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#A0AEC0]/20">
              {booking.status === "PENDING" && (
                <Button
                  size="sm"
                  className="bg-[#0346A0]"
                  onClick={() => act("CONFIRMED")}
                  disabled={!!updating}
                >
                  {updating === "CONFIRMED" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  Confirm
                </Button>
              )}
              {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-200"
                  onClick={() => act("COMPLETED")}
                  disabled={!!updating}
                >
                  {updating === "COMPLETED" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  Complete
                </Button>
              )}
              {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-200 ml-auto"
                  onClick={() => act("CANCELLED")}
                  disabled={!!updating}
                >
                  {updating === "CANCELLED" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[#A0AEC0] flex-shrink-0">{icon}</span>
      <span className="text-[#A0AEC0] w-16 flex-shrink-0">{label}</span>
      <span className="font-medium text-[#1A202C] dark:text-white">{value}</span>
    </div>
  );
}

/* ── New booking modal ────────────────────────────────────────────────────── */

function NewBookingModal({
  open,
  prefillDate,
  prefillTime,
  onClose,
  onCreated,
}: {
  open: boolean;
  prefillDate: string;
  prefillTime: string;
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
  const [date, setDate] = useState(prefillDate);
  const [time, setTime] = useState(prefillTime);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setDate(prefillDate); setTime(prefillTime); }, [prefillDate, prefillTime]);

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

  const canNext = (
    [
      !!clientId,
      !!categoryName,
      isOthers ? !!customService : !!serviceId,
      !!staffId && !!date && !!time,
    ][step]
  ) ?? true;

  const progress = ((step + 1) / STEPS.length) * 100;

  const reset = () => {
    setStep(0);
    setClientId(""); setCategoryName(""); setServiceId("");
    setCustomService(""); setStaffId("");
    setDate(prefillDate); setTime(prefillTime); setNotes("");
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
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Failed"); }
      toast.success("Booking created!");
      reset();
      onCreated(await res.json());
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
          {/* Step indicators */}
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
            <Button onClick={goNext} disabled={!canNext}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
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
