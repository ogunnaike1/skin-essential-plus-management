"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Search, Filter, MoreHorizontal, Eye, Pencil, Trash2, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, getInitials } from "@/lib/utils";
import { toast } from "@/components/ui/custom-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { clientSchema, type ClientInput } from "@/lib/validations";

type Client = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  joinedAt: string;
  skin_type: string | null;
  allergies: string | null;
  recommendations: string | null;
  _count: { bookings: number };
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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filter !== "ALL") params.set("status", filter);
      const res = await fetch(`/api/clients?${params}`);
      if (!res.ok) throw new Error();
      setClients(await res.json());
    } catch {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/clients/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success("Client deleted");
      setClients((prev) => prev.filter((c) => c.id !== deleteId));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete client");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
            <Input
              placeholder="Search clients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36">
              <Filter className="w-4 h-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Clients</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#A0AEC0]/20">
                  <th className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-6 py-3">Client</th>
                  <th className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Phone</th>
                  <th className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Visits</th>
                  <th className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#A0AEC0]/10">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-4 bg-[#A0AEC0]/10 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-[#A0AEC0]">
                      <UsersIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No clients found</p>
                    </td>
                  </tr>
                ) : (
                  clients.map((client, i) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className="hover:bg-[#F5F7FA] dark:hover:bg-[#1A2535] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="text-xs">{getInitials(client.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-[#1A202C] dark:text-white">{client.name}</p>
                            <p className="text-xs text-[#A0AEC0]">{client.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#718096] hidden sm:table-cell">{client.phone}</td>
                      <td className="px-4 py-4"><StatusBadge status={client.status} /></td>
                      <td className="px-4 py-4 text-sm text-[#718096] hidden md:table-cell">{client._count.bookings}</td>
                      <td className="px-4 py-4 text-sm text-[#718096] hidden lg:table-cell">{formatDate(client.joinedAt)}</td>
                      <td className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-[#A0AEC0] hover:text-[#1A202C] dark:hover:text-white">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/clients/${client.id}`}>
                                <Eye className="w-4 h-4" /> View Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setEditClient(client)}>
                              <Pencil className="w-4 h-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onSelect={() => setDeleteId(client.id)}
                            >
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

      <AddClientModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={(client) => {
          setClients((prev) => [client, ...prev]);
          setAddOpen(false);
        }}
      />

      {editClient && (
        <EditClientModal
          client={editClient}
          onClose={() => setEditClient(null)}
          onUpdated={(updated) => {
            setClients((prev) => prev.map((c) => c.id === updated.id ? updated : c));
            setEditClient(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Client"
        message="This will permanently delete the client and all associated records. This action cannot be undone."
        confirmLabel="Delete Client"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function AddClientModal({ open, onClose, onAdded }: {
  open: boolean;
  onClose: () => void;
  onAdded: (client: Client) => void;
}) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } =
    useForm<ClientInput>({ resolver: zodResolver(clientSchema), defaultValues: { status: "ACTIVE" } });

  const status = watch("status");
  const skinType = watch("skin_type");

  const onSubmit = async (data: ClientInput) => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Failed"); }
      const client = await res.json();
      toast.success(`${client.name} added`);
      reset();
      onAdded(client);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add client");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add New Client</DialogTitle></DialogHeader>
        <ClientForm
          register={register} errors={errors}
          status={status} onStatusChange={(v) => setValue("status", v as ClientInput["status"])}
          skinType={skinType ?? ""} onSkinTypeChange={(v) => setValue("skin_type", v)}
          onSubmit={handleSubmit(onSubmit)} isSubmitting={isSubmitting}
          onCancel={() => { reset(); onClose(); }} submitLabel="Add Client"
        />
      </DialogContent>
    </Dialog>
  );
}

function EditClientModal({ client, onClose, onUpdated }: {
  client: Client;
  onClose: () => void;
  onUpdated: (client: Client) => void;
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
      onUpdated({ ...client, ...updated, joinedAt: client.joinedAt, _count: client._count });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update client");
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
        <ClientForm
          register={register} errors={errors}
          status={status} onStatusChange={(v) => setValue("status", v as ClientInput["status"])}
          skinType={skinType ?? ""} onSkinTypeChange={(v) => setValue("skin_type", v)}
          onSubmit={handleSubmit(onSubmit)} isSubmitting={isSubmitting}
          onCancel={() => { reset(); onClose(); }} submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}

function ClientForm({ register, errors, status, onStatusChange, skinType, onSkinTypeChange, onSubmit, isSubmitting, onCancel, submitLabel }: {
  register: ReturnType<typeof useForm<ClientInput>>["register"];
  errors: ReturnType<typeof useForm<ClientInput>>["formState"]["errors"];
  status: string;
  onStatusChange: (v: string) => void;
  skinType: string;
  onSkinTypeChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
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
          <Select value={skinType} onValueChange={onSkinTypeChange}>
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
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
