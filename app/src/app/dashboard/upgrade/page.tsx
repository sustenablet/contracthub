"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const features = [
  "Unlimited clients & service addresses",
  "Job scheduling + recurring rules",
  "Calendar view — day, week, month",
  "Estimates with contract text blocks",
  "Invoicing & receipt generation",
  "Automated email reminders",
  "Mobile-optimized interface",
  "Secure cloud backup",
];

export default function UpgradePage() {
  function handleSubscribe() {
    // Phase 8 will redirect to Square checkout
    alert(
      "Square checkout integration coming soon. For now, your trial access continues."
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Badge className="mx-auto mb-2 w-fit">Solo Cleaner Plan</Badge>
          <CardTitle className="text-2xl font-bold">
            Your trial has expired
          </CardTitle>
          <CardDescription>
            Subscribe to keep managing your cleaning business with MaidHub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <span className="text-4xl font-bold">$29</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" size="lg" onClick={handleSubscribe}>
            Subscribe — $29/month
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Powered by Square. Cancel anytime.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
