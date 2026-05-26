"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Mail, Shield, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

const mockStaff = [
  { id: "1", name: "Ada Nwosu", email: "ada@skinessential.com", role: "ADMIN", bookings: 48, joinedAt: "Jan 2024", active: true },
  { id: "2", name: "Kemi Bello", email: "kemi@skinessential.com", role: "STAFF", bookings: 32, joinedAt: "Mar 2024", active: true },
  { id: "3", name: "Tunde Adeola", email: "tunde@skinessential.com", role: "STAFF", bookings: 21, joinedAt: "Jun 2024", active: true },
  { id: "4", name: "Ngozi Obi", email: "ngozi@skinessential.com", role: "STAFF", bookings: 9, joinedAt: "Nov 2024", active: false },
];

export default function StaffPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast.success("Invitation sent successfully!");
    setInviteOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#718096]">{mockStaff.length} team members</p>
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="w-4 h-4" /> Invite Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockStaff.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <Card className={`hover:shadow-md transition-shadow ${!member.active ? "opacity-60" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14 text-lg">
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-[#1A202C] dark:text-white truncate">{member.name}</h3>
                      {member.role === "ADMIN" && (
                        <Shield className="w-4 h-4 text-[#0346A0] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#A0AEC0] flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 shrink-0" />{member.email}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#A0AEC0]/20">
                      <div>
                        <p className="text-lg font-bold text-[#0346A0]">{member.bookings}</p>
                        <p className="text-xs text-[#A0AEC0]">bookings</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${member.role === "ADMIN" ? "bg-[#0346A0]/10 text-[#0346A0]" : "bg-[#F5F7FA] text-[#718096] dark:bg-[#2D3748]"}`}>
                          {member.role}
                        </span>
                        <p className="text-xs text-[#A0AEC0] mt-1">Since {member.joinedAt}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <UserCog className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 text-xs ${member.active ? "text-red-500 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}`}
                    onClick={() => toast.success(member.active ? "Staff deactivated" : "Staff activated")}
                  >
                    {member.active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Staff Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input placeholder="Jane Doe" required />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" placeholder="jane@skinessential.com" required />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select defaultValue="STAFF">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-[#A0AEC0]">An invitation email will be sent to this address.</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Sending…" : "Send Invite"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
