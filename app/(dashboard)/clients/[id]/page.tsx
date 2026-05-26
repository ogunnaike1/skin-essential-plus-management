"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Mail, Calendar, Edit, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatCurrency, getInitials } from "@/lib/utils";
import { toast } from "sonner";

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

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/clients"><ArrowLeft className="w-4 h-4" /> Back to Clients</Link>
      </Button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Avatar className="w-20 h-20 text-2xl">
                <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-[#1A202C] dark:text-white">{client.name}</h2>
                  <StatusBadge status={client.status} />
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-[#718096] mb-3">
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{client.phone}</span>
                  {client.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{client.email}</span>}
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Joined {formatDate(client.joinedAt)}</span>
                </div>
                {client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full bg-[#0346A0]/10 text-[#0346A0] text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Edit className="w-4 h-4" /> Edit</Button>
                <Button size="sm"><Plus className="w-4 h-4" /> Book</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({client.bookings.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({client.payments.length})</TabsTrigger>
        </TabsList>

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
              <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-[#718096] leading-relaxed">{client.notes || "No notes added."}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardContent className="p-0">
              {client.bookings.length === 0 ? (
                <p className="text-center py-12 text-sm text-[#A0AEC0]">No bookings yet</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#A0AEC0]/20">
                      {["Service", "Staff", "Date", "Status", "Amount"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-6 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#A0AEC0]/10">
                    {client.bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#F5F7FA] dark:hover:bg-[#1A2535]">
                        <td className="px-6 py-4 text-sm font-medium text-[#1A202C] dark:text-white">{b.service?.name ?? "—"}</td>
                        <td className="px-6 py-4 text-sm text-[#718096]">{b.staff?.name ?? "—"}</td>
                        <td className="px-6 py-4 text-sm text-[#718096]">{formatDate(b.date)}</td>
                        <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                        <td className="px-6 py-4 text-sm font-medium text-[#1A202C] dark:text-white">{b.service ? formatCurrency(b.service.price) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              {client.payments.length === 0 ? (
                <p className="text-center py-12 text-sm text-[#A0AEC0]">No payments yet</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#A0AEC0]/20">
                      {["Amount", "Method", "Status", "Date"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider px-6 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#A0AEC0]/10">
                    {client.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F5F7FA] dark:hover:bg-[#1A2535]">
                        <td className="px-6 py-4 text-sm font-semibold text-[#0346A0]">{formatCurrency(p.amount)}</td>
                        <td className="px-6 py-4 text-sm text-[#718096]">{p.method}</td>
                        <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                        <td className="px-6 py-4 text-sm text-[#718096]">{formatDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
