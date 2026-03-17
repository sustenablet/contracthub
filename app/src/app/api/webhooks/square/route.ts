import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

function verifySquareSignature(
  body: string,
  signature: string | null,
  signatureKey: string,
  notificationUrl: string
): boolean {
  if (!signature || !signatureKey) return false;
  const combined = notificationUrl + body;
  const expected = crypto
    .createHmac("sha256", signatureKey)
    .update(combined)
    .digest("base64");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature");
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "";
  const notificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/webhooks/square`;

  if (signatureKey && !verifySquareSignature(body, signature, signatureKey, notificationUrl)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType: string = event.type || "";
  const subscriptionData = event.data?.object?.subscription;

  if (!subscriptionData) {
    return NextResponse.json({ received: true });
  }

  const squareCustomerId: string = subscriptionData.customer_id;
  const squareSubscriptionId: string = subscriptionData.id;

  let newStatus: string | null = null;

  switch (eventType) {
    case "subscription.created":
    case "subscription.updated":
      if (subscriptionData.status === "ACTIVE") {
        newStatus = "active";
      } else if (subscriptionData.status === "DEACTIVATED") {
        newStatus = "cancelled";
      } else if (subscriptionData.status === "PAUSED") {
        newStatus = "past_due";
      }
      break;
    case "subscription.canceled":
      newStatus = "cancelled";
      break;
    default:
      break;
  }

  if (newStatus && squareCustomerId) {
    await supabaseAdmin
      .from("users")
      .update({
        subscription_status: newStatus,
        square_subscription_id: squareSubscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq("square_customer_id", squareCustomerId);
  }

  return NextResponse.json({ received: true });
}
