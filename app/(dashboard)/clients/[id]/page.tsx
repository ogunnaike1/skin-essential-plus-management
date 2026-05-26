"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowLeft, Phone, Mail, Calendar, Edit, Plus, Loader2,
  CalendarDays, CreditCard, Sparkles, AlertCircle, ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatDate, formatTime, formatCurrency, getInitials } from "@/lib/utils";
import { toast } from "@/components/ui/custom-toast";
import { clientSchema, type ClientInput } from "@/lib/validations";

type ClientDetail = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  dateOfBirth: string | null;
  status: string;
  notes: string | null;
  tags: string[];
  joinedAt: string;
  skin_type: string | null;
  allergies: string | null;
  recommendations: string | null;
  bookings: {
    id: string;
    date: string;
    status: string;
    notes: string | null;
    service: { name: string; price: number } | null;
    staff: { name: string } | null;
  }[];
  payments: {
    id: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
  }[];
};

const SKIN_TYPES = [
  { value: "NORMAL",         label: "Normal" },
  { value: "OILY",           label: "Oily" },
  { value: "DRY",            label: "Dry" },
  { value: "COMBINATION",    label: "Combination" },
  { value: "SENSITIVE",      label: "Sensitive" },
  { value: "ACNE_PRONE",     label: "Acne-Prone" },
  { value: "MATURE",         label: "Mature / Aging" },
  { value: "HYPERPIGMENTED", label: "Hyperpigmented" },
  { value: "DEHYDRATED",     label: "Dehydrated" },
  { value: "ROSACEA",        label: "Rosacea-Prone" },
];

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setClient)
      .catch(() => {
        toast.error("Client not found");
        router.push("/clients");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#A0AEC0]" />
      </div>
    );
  }

  if (!client) return null;

  const totalSpent = client.payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amount, 0);

  const lastBooking = client.bookings
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const skinTypeLabel = SKIN_TYPES.find((s) => s.value === client.skin_type)?.label;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/clients"><ArrowLeft className="w-4 h-4" /> Back to Clients</Link>
      </Button>

      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Avatar className="w-20 h-20 text-2xl shrink-0">
                <AvatarFallback className="text-xl font-bold">{getInitials(client.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-[#1A202C] dark:text-white">{client.name}</h2>
                  <StatusBadge status={client.status} />
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-[#718096] mb-3">
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{client.phone}</span>
                  {client.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{client.email}</span>}
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Joined {formatDate(client.joinedAt)}</span>
                </div>
                {client.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full bg-[#0346A0]/10 text-[#0346A0] text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                  <Edit className="w-4 h-4" /> Edit
                </Button>
                <Button size="sm" onClick={() => router.push(`/bookings?new=true&clientId=${client.id}`)}>
                  <Plus className="w-4 h-4" /> Book
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: <CalendarDays className="w-4 h-4" />,
            label: "Total Visits",
            value: client.bookings.length,
            color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
          },
          {
            icon: <CreditCard className="w-4 h-4" />,
            label: "Total Spent",
            value: formatCurrency(totalSpent),
            color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
          },
          {
            icon: <Sparkles className="w-4 h-4" />,
            label: "Skin Type",
            value: skinTypeLabel ?? "—",
            color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
          },
          {
            icon: <Calendar className="w-4 h-4" />,
            label: "Last Visit",
            value: lastBooking ? formatDate(lastBooking.date) : "—",
            color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
          },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${s.color}`}>{s.icon}</div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#A0AEC0] truncate">{s.label}</p>
                    <p className="text-sm font-bold text-[#1A202C] dark:text-white leading-tight truncate">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({client.bookings.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({client.payments.length})</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Contact Info</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-[#A0AEC0]">Phone</span><span className="font-medium">{client.phone}</span></div>
                <Separator />
                <div className="flex justify-between"><span className="text-[#A0AEC0]">Email</span><span className="font-medium">{client.email || "—"}</span></div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-[#A0AEC0]">Date of Birth</span>
                  <span className="font-medium">{client.dateOfBirth ? formatDate(client.dateOfBirth) : "—"}</span>
                </div>
                <Separator />
                <div className="flex justify-between"><span className="text-[#A0AEC0]">Member Since</span><span className="font-medium">{formatDate(client.joinedAt)}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#0346A0]" /> Skin Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#A0AEC0]">Skin Type</span>
                  {skinTypeLabel ? (
                    <span className="font-medium px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs">
                      {skinTypeLabel}
                    </span>
                  ) : (
                    <span className="text-[#A0AEC0] text-xs italic">Not set</span>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-[#A0AEC0] mb-1">Allergies / Sensitivities</p>
                  <p className="text-[#1A202C] dark:text-white leading-relaxed">
                    {client.allergies || <span className="text-[#A0AEC0] italic text-xs">None recorded</span>}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-[#A0AEC0] mb-1">Recommendations</p>
                  <p className="text-[#1A202C] dark:text-white leading-relaxed">
                    {client.recommendations || <span className="text-[#A0AEC0] italic text-xs">None recorded</span>}
                  </p>
                </div>
              </CardContent>
            </Card>

            {client.notes && (
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-[#718096] leading-relaxed">{client.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Bookings */}
        <TabsContent value="bookings">
          <Card>
            <CardContent className="p-0">
              {client.bookings.length === 0 ? (
                <div className="text-center py-16 text-[#A0AEC0]">
                  <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No bookings yet</p>
                  <Button size="sm" className="mt-4" onClick={() => router.push(`/bookings?new=true&clientId=${client.id}`)}>
                    <Plus className="w-4 h-4" /> Create First Booking
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#A0AEC0]/20">
                        {["Service", "Staff", "Date & Time", "Status", "Amount"].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-6 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#A0AEC0]/10">
                      {client.bookings
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((b) => (
                          <tr key={b.id} className="hover:bg-[#F5F7FA] dark:hover:bg-[#1A2535]">
                            <td className="px-6 py-4 text-sm font-medium text-[#1A202C] dark:text-white">{b.service?.name ?? "—"}</td>
                            <td className="px-6 py-4 text-sm text-[#718096]">{b.staff?.name ?? "—"}</td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-[#1A202C] dark:text-white">{formatDate(b.date)}</div>
                              <div className="text-xs text-[#A0AEC0]">{formatTime(b.date)}</div>
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                            <td className="px-6 py-4 text-sm font-medium text-[#1A202C] dark:text-white">
                              {b.service ? formatCurrency(b.service.price) : "—"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              {client.payments.length === 0 ? (
                <div className="text-center py-16 text-[#A0AEC0]">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No payments recorded</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#A0AEC0]/20">
                        {["Amount", "Method", "Status", "Date"].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-6 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#A0AEC0]/10">
                      {client.payments
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-[#F5F7FA] dark:hover:bg-[#1A2535]">
                            <td className="px-6 py-4 text-sm font-bold text-[#0346A0]">{formatCurrency(p.amount)}</td>
                            <td className="px-6 py-4 text-sm text-[#718096] capitalize">{p.method.toLowerCase()}</td>
                            <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                            <td className="px-6 py-4 text-sm text-[#718096]">{formatDate(p.createdAt)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editOpen && (
        <EditClientModal
          client={client}
          onClose={() => setEditOpen(false)}
          onUpdated={(updated) => {
            setClient({ ...client, ...updated });
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}

function EditClientModal({ client, onClose, onUpdated }: {
  client: ClientDetail;
  onClose: () => void;
  onUpdated: (updated: Partial<ClientDetail>) => void;
}) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } =
    useForm<ClientInput>({
      resolver: zodResolver(clientSchema),
      defaultValues: {
        name: client.name,
        phone: client.phone,
        email: client.email ?? "",
        status: client.status as ClientInput["status"],
        skin_type: client.skin_type ?? "",
        allergies: client.allergies ?? "",
        recommendations: client.recommendations ?? "",
        notes: client.notes ?? "",
      },
    });

  const status = watch("status");
  const skinType = watch("skin_type");

  const onSubmit = async (data: ClientInput) => {
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Failed"); }
      const updated = await res.json();
      toast.success("Client updated");
      onUpdated(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update client");
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit — {client.name}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Full Name *</Label>
              <Input placeholder="Jane Doe" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input placeholder="08012345678" {...register("phone")} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input placeholder="optional" type="email" {...register("email")} />
            </div>
            <div className="space-y-1.5">
              <Label>Date of Birth</Label>
              <Input type="date" {...register("dateOfBirth")} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setValue("status", v as ClientInput["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Skin Type</Label>
              <Select value={skinType ?? ""} onValueChange={(v) => setValue("skin_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select skin type" /></SelectTrigger>
                <SelectContent>
                  {SKIN_TYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Allergies / Sensitivities</Label>
              <Textarea placeholder="e.g. Retinol, Fragrance, Nuts…" rows={2} {...register("allergies")} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Recommendations</Label>
              <Textarea placeholder="Post-treatment advice, products to use, follow-up suggestions…" rows={3} {...register("recommendations")} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Notes</Label>
              <Textarea placeholder="Any relevant notes…" rows={2} {...register("notes")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
