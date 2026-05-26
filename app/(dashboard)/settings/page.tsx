"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, User, Bell, Download, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("Settings saved successfully");
  };

  const handleExport = (type: string) => {
    toast.success(`Exporting ${type}…`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Tabs defaultValue="business">
        <TabsList className="mb-6">
          <TabsTrigger value="business">
            <Building2 className="w-4 h-4 mr-1.5" />Business
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="w-4 h-4 mr-1.5" />Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-1.5" />Notifications
          </TabsTrigger>
          <TabsTrigger value="data">
            <Download className="w-4 h-4 mr-1.5" />Data Export
          </TabsTrigger>
        </TabsList>

        {/* Business */}
        <TabsContent value="business">
          <Card>
            <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Business Name</Label>
                    <Input defaultValue="Skin Essential" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input defaultValue="08012345678" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" defaultValue="hello@skinessential.com" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Address</Label>
                    <Input defaultValue="12 Victoria Island, Lagos, Nigeria" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#0346A0] flex items-center justify-center text-white font-bold text-xl">SE</div>
                    <Button type="button" variant="outline" size="sm">Upload Logo</Button>
                  </div>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account">
          <Card>
            <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5 max-w-xl">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input defaultValue="Ada Nwosu" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" defaultValue="ada@skinessential.com" />
                </div>
                <Separator />
                <p className="text-sm font-semibold text-[#1A202C] dark:text-white">Change Password</p>
                <div className="space-y-1.5">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Confirm Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Update Account
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-6 max-w-xl">
              {[
                { label: "Email booking confirmations", description: "Send email when a booking is confirmed", defaultChecked: true },
                { label: "Email booking reminders (24h)", description: "Send reminder 24 hours before appointment", defaultChecked: true },
                { label: "SMS reminders", description: "Send SMS reminder to clients (requires Twilio)", defaultChecked: false },
                { label: "Payment receipts", description: "Send receipt when payment is recorded", defaultChecked: true },
                { label: "New client notifications", description: "Get notified when a new client is added", defaultChecked: false },
              ].map((item, i) => (
                <div key={i}>
                  {i > 0 && <Separator className="mb-6" />}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#1A202C] dark:text-white">{item.label}</p>
                      <p className="text-xs text-[#A0AEC0] mt-0.5">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                </div>
              ))}
              <Button onClick={() => toast.success("Preferences saved!")}>
                <Save className="w-4 h-4" /> Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Export */}
        <TabsContent value="data">
          <Card>
            <CardHeader><CardTitle>Export Your Data</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              {[
                { label: "Clients CSV", description: "Export all client records including contact info, status, and tags", type: "clients" },
                { label: "Bookings CSV", description: "Export all booking history with dates, services, and statuses", type: "bookings" },
                { label: "Payments CSV", description: "Export all payment records with amounts and methods", type: "payments" },
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between p-4 rounded-xl border border-[#A0AEC0]/20 bg-[#F5F7FA] dark:bg-[#1A2535]">
                  <div>
                    <p className="text-sm font-medium text-[#1A202C] dark:text-white">{item.label}</p>
                    <p className="text-xs text-[#A0AEC0] mt-0.5">{item.description}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExport(item.type)}>
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
