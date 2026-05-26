"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Clock, Tag, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const categories = ["Hair", "Skin", "Nails", "Massage", "Brows & Lashes", "Packages"];

const categoryColors: Record<string, string> = {
  Hair: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Skin: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Nails: "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  Massage: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Brows & Lashes": "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Packages: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
};

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
}

const emptyForm = { name: "", description: "", duration: "", price: "", category: "" };

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const categoryRef = useRef<string>("");

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => setServices(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setFetching(false));
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    categoryRef.current = "";
    setAddOpen(true);
  };

  const openEdit = (service: Service) => {
    setForm({
      name: service.name,
      description: service.description ?? "",
      duration: String(service.duration),
      price: String(service.price),
      category: service.category,
    });
    categoryRef.current = service.category;
    setEditService(service);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const category = categoryRef.current;
    if (!category) { toast.error("Please select a category"); return; }

    const payload = {
      name: form.name,
      description: form.description || undefined,
      duration: Number(form.duration),
      price: Number(form.price),
      category,
    };

    setSaving(true);
    try {
      if (editService) {
        const res = await fetch(`/api/services/${editService.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const updated: Service = await res.json();
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast.success("Service updated");
        setEditService(null);
      } else {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const created: Service = await res.json();
        setServices((prev) => [...prev, created]);
        toast.success("Service added");
        setAddOpen(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success("Service deleted");
    } catch {
      toast.error("Failed to delete service");
    }
  };

  const isEdit = !!editService;
  const dialogOpen = addOpen || isEdit;
  const setDialogOpen = (v: boolean) => {
    if (!v) { setAddOpen(false); setEditService(null); }
  };

  const filtered = services.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || (s.description ?? "").toLowerCase().includes(q);
    const matchCat = filterCat === "ALL" || s.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
            <Input
              placeholder="Search services…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-[#1A202C] dark:text-white"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="text-sm text-[#718096]">
            {fetching ? "Loading…" : `${filtered.length} of ${services.length} service${services.length !== 1 ? "s" : ""}`}
          </p>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        </div>
      </div>

      {fetching ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#A0AEC0]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#A0AEC0]">
          {search || filterCat !== "ALL" ? "No services match your search." : "No services yet. Add your first one."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold text-[#1A202C] dark:text-white">{service.name}</h3>
                      <p className="text-xs text-[#A0AEC0] mt-0.5 line-clamp-1">{service.description}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => openEdit(service)}
                        className="p-1.5 rounded-lg hover:bg-[#F5F7FA] dark:hover:bg-[#2D3748] text-[#A0AEC0] hover:text-[#0346A0]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[#A0AEC0] hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[service.category] ?? "bg-gray-100 text-gray-600"}`}>
                      <Tag className="w-3 h-3" />
                      {service.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#A0AEC0]">
                      <Clock className="w-3 h-3" />
                      {service.duration}min
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#A0AEC0]/20 flex items-center justify-between">
                    <span className="text-lg font-bold text-[#0346A0]">{formatCurrency(service.price)}</span>
                    <span className="text-xs text-[#A0AEC0]">per session</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Service" : "Add New Service"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Service Name *</Label>
              <Input
                placeholder="e.g. Deep Conditioning"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description…"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Duration (minutes) *</Label>
                <Input
                  type="number"
                  placeholder="60"
                  min="5"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Price (₦) *</Label>
                <Input
                  type="number"
                  placeholder="15000"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                defaultValue={form.category || undefined}
                onValueChange={(v) => { categoryRef.current = v; }}
              >
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="z-[60]">
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : (isEdit ? "Update Service" : "Save Service")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
