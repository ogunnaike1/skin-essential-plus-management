"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Search, Package, Tag,
  AlertTriangle, Loader2, ShoppingBag, ImageOff, AlertCircle,
} from "lucide-react";
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface Product {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  price: number;
  stock?: number | null;
  sku?: string | null;
  image_url?: string | null;
  created_at: string;
}

type FormState = {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  sku: string;
  image_url: string;
};

const EMPTY_FORM: FormState = {
  name: "", description: "", category: "", price: "", stock: "", sku: "", image_url: "",
};

const CATEGORIES = [
  "Skincare", "Haircare", "Body Care", "Nails", "Makeup",
  "Tools & Equipment", "Supplements", "Wellness", "Fragrance", "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Skincare:          "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Haircare:          "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Body Care":       "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  Nails:             "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  Makeup:            "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "Tools & Equipment":"bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Supplements:       "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Wellness:          "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Fragrance:         "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  Other:             "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const LOW_STOCK = 5;

function stockBadge(stock?: number | null) {
  if (stock == null) return null;
  if (stock === 0)        return { label: "Out of stock",       cls: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" };
  if (stock <= LOW_STOCK) return { label: `Low · ${stock} left`, cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
  return                         { label: `${stock} in stock`,  cls: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  /* ── Helpers ── */

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      category: p.category ?? "",
      price: String(p.price),
      stock: p.stock != null ? String(p.stock) : "",
      sku: p.sku ?? "",
      image_url: p.image_url ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim())  { toast.error("Product name is required"); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error("Valid price is required"); return; }

    const payload = {
      name:        form.name.trim(),
      description: form.description.trim() || null,
      category:    form.category || null,
      price:       Number(form.price),
      stock:       form.stock !== "" ? Number(form.stock) : null,
      sku:         form.sku.trim() || null,
      image_url:   form.image_url.trim() || null,
    };

    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/products/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const updated: Product = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Product updated");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const created: Product = await res.json();
        setProducts((prev) => [created, ...prev]);
        toast.success("Product added");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  /* ── Derived stats ── */

  const totalValue    = products.reduce((s, p) => s + p.price * (p.stock ?? 1), 0);
  const outOfStock    = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock != null && p.stock > 0 && p.stock <= LOW_STOCK).length;

  const allCategories = ["ALL", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q);
    const matchCat    = filterCat === "ALL" || p.category === filterCat;
    const matchStock  =
      stockFilter === "out" ? p.stock === 0 :
      stockFilter === "low" ? (p.stock != null && p.stock > 0 && p.stock <= LOW_STOCK) : true;
    return matchSearch && matchCat && matchStock;
  });

  /* ── Render ── */

  return (
    <div className="space-y-5">

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Products",   value: products.length,         icon: <ShoppingBag className="w-4 h-4" />, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
          { label: "Inventory Value",  value: formatCurrency(totalValue), icon: <Tag className="w-4 h-4" />,         color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" },
          { label: "Low Stock",        value: lowStockCount,            icon: <AlertTriangle className="w-4 h-4" />, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
          { label: "Out of Stock",     value: outOfStock,               icon: <Package className="w-4 h-4" />,       color: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#A0AEC0] truncate">{s.label}</p>
                    <p className="text-lg font-bold text-[#1A202C] dark:text-white leading-tight">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
            <Input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {allCategories.map((c) => (
                <SelectItem key={c} value={c}>{c === "ALL" ? "All categories" : c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(lowStockCount > 0 || outOfStock > 0) && (
            <div className="flex gap-1.5">
              {lowStockCount > 0 && (
                <button
                  onClick={() => setStockFilter((f) => f === "low" ? "all" : "low")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    stockFilter === "low"
                      ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700"
                      : "bg-white text-amber-700 border-amber-200 dark:bg-[#1A2535] dark:text-amber-400 dark:border-amber-800"
                  }`}
                >
                  <AlertCircle className="w-3 h-3" /> {lowStockCount} low
                </button>
              )}
              {outOfStock > 0 && (
                <button
                  onClick={() => setStockFilter((f) => f === "out" ? "all" : "out")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    stockFilter === "out"
                      ? "bg-red-100 text-red-600 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700"
                      : "bg-white text-red-600 border-red-200 dark:bg-[#1A2535] dark:text-red-400 dark:border-red-800"
                  }`}
                >
                  <Package className="w-3 h-3" /> {outOfStock} out
                </button>
              )}
            </div>
          )}
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#A0AEC0]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#A0AEC0]">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            {search || filterCat !== "ALL" || stockFilter !== "all"
              ? "No products match your filters."
              : "No products yet. Add your first one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((product, i) => {
              const stock = stockBadge(product.stock);
              const catColor = CATEGORY_COLORS[product.category ?? ""] ?? "bg-gray-100 text-gray-600";
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <Card className="group hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-44 bg-[#F5F7FA] dark:bg-[#1A2535] overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#A0AEC0]/50">
                          <ImageOff className="w-8 h-8" />
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                      {/* Action button */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-lg bg-white/90 dark:bg-[#1A2535]/90 shadow text-[#718096] hover:text-[#1A202C] dark:hover:text-white backdrop-blur-sm">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openEdit(product)}>
                              <Pencil className="w-4 h-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDelete(product.id)} className="text-red-500 focus:text-red-500">
                              <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {/* Category */}
                      {product.category && (
                        <div className="absolute bottom-2 left-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-sm ${catColor}`}>
                            {product.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <CardContent className="p-4 flex flex-col gap-1.5 flex-1">
                      <h3 className="font-semibold text-[#1A202C] dark:text-white leading-tight line-clamp-1">
                        {product.name}
                      </h3>
                      {product.sku && (
                        <p className="text-[10px] text-[#A0AEC0] font-mono">SKU: {product.sku}</p>
                      )}
                      {product.description && (
                        <p className="text-xs text-[#A0AEC0] line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#A0AEC0]/20">
                        <span className="text-base font-bold text-[#0346A0]">
                          {formatCurrency(product.price)}
                        </span>
                        {stock && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${stock.cls}`}>
                            {stock.label}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) setDialogOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Product Name *</Label>
              <Input
                placeholder="e.g. Vitamin C Serum"
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

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category || undefined}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Price (₦) *</Label>
                <Input
                  type="number" placeholder="5000" min="0" step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Stock qty</Label>
                <Input
                  type="number" placeholder="—" min="0"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>SKU / Code</Label>
              <Input
                placeholder="e.g. SKN-001"
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input
                placeholder="https://…"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              />
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="preview"
                  className="mt-1.5 h-24 w-full object-cover rounded-lg border border-[#A0AEC0]/20"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                  : editing ? "Update Product" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
