"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function SettingsPage() {
  const supabase = createClient();
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("display_name, business_name, phone")
        .eq("id", user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || "");
        setBusinessName(data.business_name || "");
        setPhone(data.phone || "");
      }
    }
    load();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({
        display_name: displayName,
        business_name: businessName,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Settings saved");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your personal and business information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Sparkling Clean Co."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
