## MaidHub – Solo Cleaner OS (Phase 1)

MaidHub is a SaaS web application for **solo residential and small-office cleaning business owners**. It is a back-office “command center” used only by the cleaner/owner — **there is no client-facing portal or marketplace, and no team features in the MVP**.

The long-term goal is to help an independent cleaner manage everything in one place: clients, service addresses, recurring jobs, scheduling, estimates, invoices, and automated notifications.

Phase 1 focuses on building a **secure, subscription-gated foundation** (no full CRUD product features yet).

---

## High-level concept

- **Primary user**: A single cleaner/owner per account (one account = one person running their own cleaning business).
- **Core idea**: Replace spreadsheets, paper notes, and scattered apps with one organized, subscription-based web app for solo cleaners.
- **Non-goals for now**:
  - No customer login or client-facing portal.
  - No marketplace or lead generation.
  - No team management, staff accounts, or dispatch features in Phase 1.

---

## Tech stack (implementation plan)

The app will be built with:

- **Frontend / app framework**: Next.js (App Router), deployed on Vercel.
- **Database, auth, and backend services**: Supabase (Postgres, Auth, Realtime, Row Level Security).
- **Styling**: Tailwind CSS.
- **Component library**: shadcn/ui.
- **Billing**: Square Subscriptions API (for recurring billing and webhooks).

In Phase 1, the UI will be minimal: auth screens and a basic dashboard shell. Later phases will layer on full CRUD for clients, jobs, estimates, invoices, and more.

---

## Core MVP modules (product view)

These modules describe the **full product direction** (beyond Phase 1). Phase 1 focuses mainly on auth, schema, and subscription gating; later phases will turn these into full features.

1. **Client Management**
   - Store client profiles: name, phone, email, notes (pets, entry instructions, preferences).
   - Support multiple service addresses per client.
   - Show a quick-access history of all jobs for that client.

2. **Job Scheduling**
   - Create one-time or recurring jobs (weekly, biweekly, monthly, custom).
   - Configure service type, price, duration, and notes per job.
   - Auto-generate recurring appointments in advance.
   - Support quick reschedule/cancel flows.

3. **Calendar View**
   - Day, week, and month views showing all scheduled jobs.
   - Click a job to see full details.
   - Visual indicators for job status (upcoming, completed, cancelled).

4. **Job Status Tracking**
   - Status flow: **Scheduled → In Progress → Completed → Invoiced**.
   - The cleaner updates status as they go through their day.
   - No team dispatch; all status flows are for the solo owner.

5. **Estimates**
   - Create a quote for a potential client with line items, totals, and notes.
   - Send via email.
   - Client can accept (converts to a scheduled job) or it stays as a pending estimate.
   - Support a basic contract text block.

6. **Invoicing & Receipts**
   - Auto-generate an invoice after a job is completed.
   - Send invoices via email.
   - Track status as paid/unpaid/void.
   - Generate a receipt once paid.
   - MVP: no built-in payment processing; this is a **document layer only**.

7. **Notifications & Reminders**
   - Automated reminders to the cleaner’s own phone/email before jobs.
   - Optional reminder email to the client before their appointment.
   - Job confirmation emails.

---

## Phase 1 scope – what we are building now

Phase 1 delivers a **deployed, working foundation** with:

1. **Authentication (Supabase Auth)**
   - Email/password signup and login.
   - Email verification on signup.
   - Password reset flow.
   - After login, users land on a dashboard shell.

2. **Database schema (core tables)**
   We will define and secure the following tables in Supabase:

   - **`users`**
     - Mirrors Supabase auth user.
     - Stores: display name, business name, phone, subscription status, subscription plan, trial start date, Square customer ID, Square subscription ID.
   - **`clients`**
     - Belongs to a user.
     - Stores: first name, last name, email, phone, notes (pets, entry instructions, preferences), active/archived status.
   - **`addresses`**
     - Belongs to a client.
     - A client can have multiple service addresses.
     - Stores: street, city, state, zip, address-specific notes.
   - **`jobs`**
     - Belongs to a user, a client, and an address.
     - Stores: scheduled date, start time, estimated duration, service type, price, status (scheduled, in progress, completed, invoiced, cancelled), job-level notes.
     - Also stores a reference to a recurring rule when auto-generated.
   - **`recurring_rules`**
     - Belongs to a user, a client, and an address.
     - Defines recurrence: frequency (weekly, biweekly, monthly, custom), start date, optional end date.
     - Includes base job settings: price, duration, service type.
     - When active, will be used to generate future `jobs` records automatically.
   - **`estimates`**
     - Belongs to a user and a client.
     - Stores: line items, total, notes, status (draft, sent, accepted, declined, expired), optional contract text block.
   - **`invoices`**
     - Belongs to a user, a client, and optionally a job.
     - Stores: line items, total, status (unpaid, paid, void), due date, payment date.
   - **`notifications_log`**
     - Tracks every email or SMS sent by the system.
     - Stores: recipient, type (reminder, confirmation, invoice, etc.), sent timestamp, delivery status.

   All of these tables will be protected with **row-level security policies** so that each user can only see and modify their own data.

3. **Subscription gating with Square**

   - New users receive a **30-day free trial** starting from their signup date.
   - After the trial, continued access requires an **active Square subscription**.
   - We will integrate **Square’s Subscriptions API**:
     - Our backend exposes a webhook endpoint for Square.
     - Square sends webhooks when a subscription is created, renewed, cancelled, or when a payment fails.
     - The webhook handler updates the `subscription_status` and related fields on the user record.
   - On every authenticated session, the app checks:
     - If the user is within their trial window, or
     - If they have an active, good-standing Square subscription.
   - If not, the app redirects them to an **upgrade/payment page**.
   - MVP constraint: there is **only one subscription plan**.

   Pricing is intended to **mirror or beat MaidPad’s entry plan (~$30/mo)**, with a single solo-cleaner plan for MVP.

4. **Deployment**

   - Host the Next.js app on **Vercel**.
   - Connect the app to **Supabase** for database and auth.
   - Expose and secure the **Square webhook endpoint**.

---

## What will exist at the end of Phase 1

By the end of Phase 1, we expect:

- A Next.js app deployed to Vercel.
- Supabase project with:
  - Core schema defined (`users`, `clients`, `addresses`, `jobs`, `recurring_rules`, `estimates`, `invoices`, `notifications_log`).
  - Row-level security enabled and policies written so each user only sees their own records.
- Working Supabase Auth:
  - Email/password signup, login, logout.
  - Email verification and password reset flows.
- A basic **dashboard shell** that authenticated users land on after login (no complex UI yet).
- A live **Square webhook endpoint** that:
  - Receives subscription lifecycle events.
  - Updates `subscription_status` and related fields on the `users` table.
- Correct **access gating**:
  - Users outside their trial and without an active subscription are redirected to an upgrade/payment flow.

This documentation is meant to describe **what the app is** and **what Phase 1 will deliver**, before we write any production code. Future phases will add detailed feature specs for client management, scheduling, estimates, invoices, and notifications.

---

## Build phases roadmap

This is the planned build sequence (each phase can be implemented and deployed incrementally):

1. **Phase 1** – Supabase schema, auth, and Square webhook setup.
2. **Phase 2** – Client management CRUD (clients + addresses).
3. **Phase 3** – Job scheduling, recurring logic, and calendar view.
4. **Phase 4** – Job status flow (Scheduled → In Progress → Completed → Invoiced).
5. **Phase 5** – Estimates module.
6. **Phase 6** – Invoicing and receipt generation.
7. **Phase 7** – Notifications (email via Resend and SMS via Twilio).
8. **Phase 8** – Subscription gate UI and full Square billing flow UX.

---

## Positioning vs. MaidPad

MaidHub is designed to **beat MaidPad** on:

- **UI and UX**: Modern Next.js + shadcn/ui stack enables a cleaner, faster interface.
- **Mobile experience**: Optimized layouts for solo cleaners on the go.
- **Job → invoice flow**: A more intuitive, tightly integrated flow from scheduled job to completed job to invoice and receipt.
- **Onboarding**: A sharper onboarding path aimed to get a new user to their **first scheduled job in under 5 minutes**.

