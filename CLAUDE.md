# GN Store — Claude Project Instructions

## Project Identity
- **Store Name:** GN Store (Gonesmart Solutions)
- **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · Shadcn UI · Prisma · PostgreSQL (Neon) · Better Auth · Cloudinary · Paystack · Resend
- **Package Manager:** pnpm (always use pnpm, never npm or yarn)
- **Project Root:** `gn-store/` (inside this Ecommerce workspace)
- **Production URL:** `https://gn-store-gonesmart-s-projects.vercel.app`

---

## Skills — When to Use Each One

| Skill | Invoke When |
|---|---|
| `/frontend-design` | **Before writing ANY frontend code, every session, no exceptions** |
| `/run` | To start the dev server and preview changes in the browser |
| `/verify` | To confirm a feature or fix actually works end-to-end |
| `/code-review` | Before completing any major feature milestone |
| `/security-review` | Before deploying or after touching auth, payments, or webhooks |
| `/simplify` | After completing a feature - clean up before moving on |
| `update-config` | When changing permissions, hooks, or settings.json |

---

## Essential Commands

```bash
# Development
pnpm dev                          # Start dev server at http://localhost:3000
pnpm build                        # Production build (run before every deploy)
pnpm lint                         # ESLint check

# Database
pnpm prisma generate              # Regenerate Prisma client after schema changes
pnpm prisma db push               # Push schema to Neon dev DB (development only)
pnpm prisma migrate dev           # Create + apply migration (use in production flow)
pnpm prisma studio                # Visual DB browser at http://localhost:5555

# Shadcn UI
pnpm dlx shadcn@latest add <component>    # Add a new Shadcn component
```

---

## Brand Tokens (never deviate from these)

```css
--color-primary:    #5DC600;   /* brand green */
--color-primary-dark: #2E7D00; /* dark green */
--color-primary-light: #EBF5E9; /* light green tint */
--color-bg-dark:    #0D0D0D;   /* near black background (dark mode) */
--color-surface:    #1A1A1A;   /* elevated card surface (dark mode) */
--color-border:     #2A2A2A;   /* subtle border (dark mode) */
--color-text:       #FFFFFF;   /* primary text (dark mode) */
--color-muted:      #A3A3A3;   /* secondary text (dark mode) */
--font-family:      'Poppins', sans-serif;
```

**Logo files (must exist at `gn-store/public/brand/`):**
- `whitelogo.png` - white/light logo design, used on **dark backgrounds** (dark mode navbar/footer, admin sidebar)
- `darklogo.png` - dark/colored logo design, used on **light backgrounds** (light mode navbar/footer)
- `site_favicon.jpg` - favicon

When rendering logos conditionally by theme:
```tsx
<Image src="/brand/whitelogo.png" className="hidden dark:block" ... />
<Image src="/brand/darklogo.png"  className="block dark:hidden"  ... />
```

Admin sidebar always uses `whitelogo.png` (sidebar background is always dark `#111111`).

---

## Theme System

The site supports **dark mode (default) and light mode**, toggled via a Sun/Moon button in the navbar.

### How it works
- **Provider:** `components/providers/theme-provider.tsx` wraps the app in `app/layout.tsx`
- **Toggle:** `components/store/theme-toggle.tsx` - uses `useTheme()` from `next-themes`
- **Strategy:** `next-themes` with `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`
- **CSS:** `app/globals.css` — `:root` defines **light** theme, `.dark` defines **dark** theme
- The `@custom-variant dark (&:is(.dark *))` in globals.css makes Tailwind `dark:` variants respond to the `.dark` class on `<html>`

### Dark mode convention for all store components
Never hardcode dark-only colors. Always pair with a light fallback using `dark:`:
```tsx
// Background
className="bg-white dark:bg-[#0D0D0D]"
// Surface / card
className="bg-gray-50 dark:bg-[#1A1A1A]"
// Border
className="border-gray-200 dark:border-[#2A2A2A]"
// Primary text
className="text-gray-900 dark:text-white"
// Muted text
className="text-gray-500 dark:text-[#A3A3A3]"
// Hover backgrounds
className="hover:bg-gray-100 dark:hover:bg-[#1A1A1A]"
```
Brand green (`#5DC600`) and interactive elements like buttons stay the same in both modes.

### Do NOT use `transition-all`. Only animate `transform` and `opacity`.

---

## Architecture Rules

### Server vs Client Components
- **Default:** Server Component. No `"use client"` unless the browser must react (click, state, animation).
- **Client Components:** cart drawer, checkout form, variant picker, image upload widget, framer motion wrappers, `ThemeToggle`, admin topbar (notification polling).
- **Never** fetch data in a Client Component - pass it as props from the Server Component.
- **Exception:** polling/real-time client components (e.g. `AdminTopbar`) may fetch from API routes via `fetch()` inside `useEffect`.

### Homepage
- Lives at `app/page.tsx` (NOT inside `app/(store)/`). Both resolve to `/` in Next.js, so only one can exist.
- Uses `export const revalidate = 3600` (ISR, 1hr).
- Wraps DB queries in `withTimeout(promise, 6000)` + try/catch for Neon cold-start resilience. Always renders with fallback data if DB is unavailable.

### Server Actions (in `actions/`)
- All mutations (create, update, delete) go through Server Actions, not API routes.
- Every Server Action must validate input with Zod before touching the database.
- Always `revalidatePath()` after mutations.
- Return `{ success: true, data }` or `{ success: false, error: string }`.
- All admin actions call a `requireAdmin()` helper that checks `session.user.role === "ADMIN"`.

### API Routes (in `app/api/`)
- Primary use: external webhooks (Paystack) and Better Auth's `[...all]` handler.
- **Exception:** polling endpoints for client components that need live data without page navigation (e.g. `GET /api/admin/notifications`). These must still auth-check on every request.
- Never create an API route just to fetch data for a Server Component — use Server Components directly.

---

## Database Rules (Prisma)

- All IDs use `@default(cuid())` - never auto-increment integers.
- All tables have `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`.
- After changing `prisma/schema.prisma`, always run `pnpm prisma generate`.
- In development, use `pnpm prisma db push` (fast, no migration history).
- In production, use `pnpm prisma migrate deploy` (keeps migration history).
- Never write raw SQL. Always use Prisma Client methods.
- **DB driver:** `lib/db.ts` uses `PrismaNeon` + `@neondatabase/serverless` with the `ws` WebSocket adapter. This bypasses port-5432 TCP blocks on Vercel. Do NOT swap to `@prisma/adapter-pg`.
- Neon free tier has cold-start delays (~5-10s). Always wrap homepage DB calls in `withTimeout()`. On critical pages like checkout verify, wrap **every individual DB call** in its own try/catch.
- Prisma `Decimal` fields must be `.toString()` before passing to Client Components.

---

## Critical Bug Patterns — Do Not Repeat

### 1. `onClick` in Server Components crashes the page
Next.js cannot serialize event handlers from Server Components. The page crashes *before sending any response* — the user sees a platform-level "This page couldn't load" error, not the Next.js error UI.
```tsx
// WRONG — crashes the entire page
<button onClick={() => document.getElementById("reviews")?.scrollIntoView(...)}>

// CORRECT — use a plain anchor
<a href="#reviews">See reviews</a>
```

### 2. `redirect()` must NEVER be inside try/catch
`redirect()` in Next.js throws internally. If it's inside a try/catch, the throw is swallowed and the redirect never happens.
```ts
// WRONG — redirect is swallowed
try {
  redirect("/checkout/success");
} catch { ... }

// CORRECT — redirect at the top level, after all try/catch blocks
redirect("/checkout/success");
```

### 3. Harden every DB call on payment-critical pages
Neon cold starts can throw at any `await db.*` call. On the checkout verify page, each DB operation has its own try/catch with a meaningful fallback:
- `db.order.findUnique` failure → show "Payment received, processing" UI with reference number (customer knows money is safe)
- `db.order.update` failure → swallowed (webhook catches up), customer still redirected to success
- `redirect()` always at the top level after all try/catch

### 4. CSS toggle `overflow-hidden` required
When using `translate-x` to animate a toggle thumb, the track container must have `overflow-hidden` or the thumb visually escapes the track even if the math is correct.
```tsx
className="relative h-5 w-9 overflow-hidden rounded-full ..."
```

### 5. RHF: never combine `valueAsNumber` + `setValueAs`
`setValueAs` wins silently but leaks `NaN`. For optional numeric fields use only `setValueAs`:
```ts
setValueAs: (v) => (v === "" || isNaN(Number(v)) ? null : Number(v))
```

### 6. Admin layout renders once — notifications need client polling
The admin layout is a shared Server Component that stays mounted as you navigate between admin pages. Server-rendered props (like `notifications`) are frozen at initial render. Any data that needs to update mid-session must be polled from the client via an API route.

---

## Folder Conventions

| Path | Purpose |
|---|---|
| `app/page.tsx` | Store homepage (not inside route group) |
| `app/(store)/` | All other customer-facing pages |
| `app/(store)/layout.tsx` | Store layout - wraps non-homepage store routes with Navbar + Footer |
| `app/(store)/error.tsx` | Store-wide error boundary — shows branded "Something went wrong" UI with Try Again + Continue Shopping |
| `app/(admin)/admin/` | All admin dashboard pages |
| `app/(auth)/` | Login, register, forgot-password |
| `app/api/` | Webhooks + Better Auth handler + admin polling endpoints |
| `app/api/admin/notifications/route.ts` | GET — live notification feed, polled every 5s by AdminTopbar |
| `components/ui/` | Shadcn UI primitives (auto-generated, do not edit) |
| `components/store/` | Customer-facing reusable components |
| `components/admin/` | Admin-only reusable components |
| `components/providers/` | React context providers (ThemeProvider, etc.) |
| `lib/` | Third-party client singletons (db, auth, cloudinary, resend, paystack) |
| `actions/` | Server Actions - one file per domain |
| `lib/validations/` | Zod schemas - one file per domain |
| `emails/` | React Email templates |
| `types/index.ts` | Shared TypeScript types and enums |

---

## Admin Notification System

**Architecture:** `AdminTopbar` (Client Component) polls `/api/admin/notifications` every 5 seconds, plus an immediate fetch on mount and on every bell open.

**Notification types:**
| Type | Icon | Color | Link |
|---|---|---|---|
| `new_order` | `ShoppingBag` | green `#5DC600` | `/admin/orders/:id` |
| `new_customer` | `UserPlus` | green `#5DC600` | `/admin/customers` |
| `pending_review` | `Star` | yellow `#FACC15` | `/admin/reviews` |

**Data source:** `GET /api/admin/notifications` — queries last 7 days of orders, new customers (role=CUSTOMER), and unapproved reviews (`approved: false`). Returns sorted by `createdAt` desc. No caching (`force-dynamic`).

**Read state:** Tracked client-side in localStorage (`gn_admin_notifs_read_ids` key) as a `Set<string>` of notification IDs. Clicking a notification marks it read and navigates. "Mark all read" clears the badge without a server call.

**Initial render:** Server renders notifications once in `app/(admin)/admin/layout.tsx` via `getAdminNotifications()` and passes as props — so the first paint is instant. Client polling then takes over.

---

## Review Moderation System

Reviews require admin approval before appearing on product pages.

**Schema:** `Review.approved Boolean @default(false)` — all new reviews start hidden.

**Customer flow:**
- `actions/reviews.ts` → `submitReview()` — upserts the review with `approved: false`
- Editing an already-approved review resets it to `approved: false` (requires re-approval)
- Product page query: `where: { approved: true }` — unapproved reviews never shown to customers

**Admin flow:**
- `/admin/reviews` — three tabs: Pending (default), Approved, All
- `components/admin/review-actions.tsx` — approve (green checkmark) + delete (red trash with confirmation dialog) buttons
- `actions/reviews-admin.ts` — `approveReview(id)` and `deleteReview(id)`, both require admin role
- Both actions call `revalidatePath` on the product page and `/admin/reviews`
- Admin sidebar: Reviews link with `Star` icon, between Coupons and Media

**Notification:** Pending reviews appear in the admin bell as `pending_review` notifications. Approving or deleting a review removes it from the pending list on the next poll cycle (since the API route queries `approved: false` live).

---

## Store Components Built

### Homepage (Milestone 10)

| Component | Type | Notes |
|---|---|---|
| `components/store/navbar.tsx` | Client | Sticky, theme-aware, includes ThemeToggle, search, cart, auth links |
| `components/store/footer.tsx` | Server | 4-col grid, inline SVG social icons (lucide removed brand icons in v1.21) |
| `components/store/hero-section.tsx` | Client | Cycling word animation (Framer Motion), no underline on cycling word |
| `components/store/category-section.tsx` | Server | Fallback categories if DB empty; icons shown when no image |
| `components/store/product-card.tsx` | Client | Add to Cart button (always visible mobile, hover desktop); calls `addToCart(variantId, 1)` from `actions/cart`, then `useCartStore` setItems + openCart |
| `components/store/featured-products.tsx` | Server | Returns null if no products |
| `components/store/value-props.tsx` | Server | 4 trust badges |
| `components/store/theme-toggle.tsx` | Client | Sun/Moon toggle using next-themes |
| `components/providers/theme-provider.tsx` | Client | Wraps next-themes ThemeProvider |

### Admin Components

| Component | Type | Notes |
|---|---|---|
| `components/admin/sidebar.tsx` | Client | Collapsible, tooltip on collapsed, nav items: Dashboard, Products, Categories, Orders, Customers, Coupons, Reviews, Media, Analytics |
| `components/admin/topbar.tsx` | Client | Polls `/api/admin/notifications` every 5s; per-notification read state via localStorage; bell dropdown with ShoppingBag/UserPlus/Star icons per type |
| `components/admin/products-filter.tsx` | Client | Uses `router.push()` for instant filter navigation (no server roundtrip delay) |
| `components/admin/coupon-actions.tsx` | Client | Toggle active/inactive; track container must have `overflow-hidden` for thumb to stay inside |
| `components/admin/delete-customer-button.tsx` | Client | Confirmation dialog before delete |
| `components/admin/review-actions.tsx` | Client | Approve (green check, hidden when already approved) + Delete (red trash + confirmation dialog) |

### Pages

| Page | Notes |
|---|---|
| `app/(store)/products/[slug]/page.tsx` | Server Component — no `onClick`. Scroll-to-reviews uses `<a href="#reviews">`. Reviews query filtered `where: { approved: true }`. |
| `app/(store)/checkout/verify/page.tsx` | Every DB call wrapped in individual try/catch. `redirect()` always at top level. DB failure shows graceful "Payment received" UI with reference number. |
| `app/(store)/error.tsx` | Store-wide error boundary. Shows "Something went wrong" with Try Again + Continue Shopping. Dark/light mode aware. |
| `app/(store)/shop/loading.tsx` | Immediate skeleton shown when shop filters change |
| `app/(admin)/admin/reviews/page.tsx` | Three tabs (Pending/Approved/All) with count badges; tab nav uses `<a href>` with `?status=` query param |

**Known patterns:**
- `formatPrice` in `lib/utils.ts` uses `Intl.NumberFormat("en-NG", { currency: "NGN" })`
- `useSearchParams()` requires a `<Suspense>` boundary for static generation
- `ProductCardData` requires `variantId: string`. Every place that maps products to cards must include `variantId: p.variants[0]?.id ?? ""` — forgetting this breaks the TypeScript build.
- `dangerouslySetInnerHTML` is allowed ONLY in `app/page.tsx` for JSON-LD structured data (Schema.org). Nowhere else.
- `GradientConfig.Icon` type only accepts `{ size?, className? }` — use a wrapper `<div style={{ color: ... }}>` to apply dynamic colors to icons instead of passing `style` prop directly.
- `variantLabel` on `OrderItem` is `String` (non-nullable in schema), but the select returns `string | null` — always use `?? ""` when passing to functions expecting `string`.

---

## Auth Pages

- **No logo** on login/register/forgot-password pages (removed from `app/(auth)/layout.tsx`)
- Auth layout has a dual radial gradient backdrop (light and dark variants)
- Forms use `react-hook-form` + Zod (`lib/validations/auth.ts`) + `authClient` from `lib/auth-client`
- Checkout enforces account creation — guests must set a password via `signUp.email()` from `lib/auth-client`

---

## Copy & Text Rules

- Use regular hyphens ` - ` not em dashes `—` in all user-visible copy
- Use `&amp;` for `&` in JSX, `&copy;` for `©`, `&apos;` or `{"}"}` for apostrophes

---

## Shadcn UI Rules

- Always install via `pnpm dlx shadcn@latest add <name>` - never copy-paste manually.
- Customize in `components/ui/` only if needed - prefer composition over modification.
- Use Shadcn's `cn()` utility from `lib/utils.ts` for conditional classNames.

### @base-ui/react/dialog — IMPORTANT

This project uses `@base-ui/react/dialog`, NOT Radix UI. **`asChild` does not exist.**
- `DialogTrigger` renders as `<button>` by default — apply `className` directly to it.
- Do NOT wrap a child button inside `DialogTrigger`. Style the trigger itself.

```tsx
// WRONG — asChild does not exist, will fail TypeScript
<DialogTrigger asChild>
  <button className="...">Delete</button>
</DialogTrigger>

// CORRECT — style the trigger directly
<DialogTrigger className="flex h-7 w-7 items-center justify-center rounded-md ...">
  <Trash2 className="h-3.5 w-3.5" />
</DialogTrigger>
```

### Radix/Shadcn portals break VS Code Simple Browser
`DropdownMenu`, `Sheet`, `Popover` append to `document.body` — VS Code's webview intercepts it. Replace with inline `useState` + `useRef` + click-outside handler and absolute-positioned `<div>` dropdowns for any component previewed in VS Code.

---

## TypeScript Rules

- Strict mode is on. Zero `any` types.
- All Server Action return types must be explicitly typed.
- Prisma-generated types are the source of truth for DB models - import from `@prisma/client`.
- Zod schemas are the source of truth for form/input types - use `z.infer<typeof schema>`.

---

## Security Non-Negotiables

1. All environment variables in `.env.local`. Never hardcode keys.
2. All Server Actions check `auth()` session before performing mutations.
3. Admin Server Actions check `session.user.role === "ADMIN"` via a `requireAdmin()` helper.
4. Admin API routes also auth-check on every request (`role === "ADMIN"`).
5. Paystack webhook verifies HMAC-SHA512 signature before processing.
6. Never use `dangerouslySetInnerHTML` (exception: JSON-LD in `app/page.tsx`).
7. All user inputs validated with Zod before DB writes.

---

## Paystack Integration Notes

- **Public key** (`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`) is safe to expose to the browser.
- **Secret key** (`PAYSTACK_SECRET_KEY`) only ever used server-side.
- Test mode uses keys starting with `pk_test_` and `sk_test_`.
- Live mode uses keys starting with `pk_live_` and `sk_live_`.
- Webhook URL to register in Paystack dashboard: `https://yourdomain.com/api/webhooks/paystack`
- Checkout verify page (`app/(store)/checkout/verify/page.tsx`) is fully hardened against Neon cold-start failures — each DB call has individual try/catch, `redirect()` is always at the top level.

---

## Prisma Schema Summary

Key models and their non-obvious fields:

| Model | Notable fields |
|---|---|
| `User` | `role String @default("CUSTOMER")` — check `role === "ADMIN"` for admin access |
| `Product` | `status ProductStatus @default(DRAFT)` — only ACTIVE products shown in store |
| `ProductVariant` | `stock Int?` — `null` = unlimited, `0` = out of stock, `n` = tracked |
| `ProductVariant` | `compareAtPrice Decimal?` — optional, used for strikethrough price |
| `Order` | `paystackRef String? @unique` — used to look up order after Paystack redirect |
| `OrderItem` | `variantLabel String` — non-nullable in schema, but Prisma select may return `string \| null` — always `?? ""` |
| `Review` | `approved Boolean @default(false)` — must be approved by admin before showing |
| `Review` | `@@unique([productId, userId])` — one review per customer per product |
| `CartItem` | `sessionId String` + `@@unique([sessionId, variantId])` — guest cart tracked by cookie |
| `Coupon` | `type CouponType` — PERCENTAGE or FIXED |

---

## Milestone Order (do not skip ahead)

1. ✅ Project init + Tailwind + Shadcn + Prisma + Better Auth
2. ✅ Full Prisma schema push to Neon
3. ✅ Auth pages (login, register, forgot password)
4. ✅ Admin layout + dashboard shell
5. ✅ Admin products (CRUD + Cloudinary)
6. ✅ Admin categories
7. ✅ Admin media library
8. ✅ Admin orders
9. ✅ Admin coupons + analytics
10. ✅ Store homepage (navbar, hero, categories, featured products, value props, footer, theme toggle)
10b. ✅ Admin customers page (search, table, delete with confirmation dialog)
10c. ✅ Admin analytics page (revenue stats, monthly bar chart, order status, top products — pure CSS)
10d. ✅ Checkout mandatory account creation — guests must set a password
10e. ✅ Product form simple/variable toggle — simple shows flat price/stock; variable shows full variants table. Stock and Compare At Price are optional.
10f. ✅ Admin products filter instant navigation (client-side `router.push()`)
10g. ✅ Shop page filter instant loading skeleton
10h. ✅ Per-notification read state in admin bell (localStorage Set of read IDs)
10i. ✅ Coupon toggle fix (`overflow-hidden` on track container)
10j. ✅ Store error boundary (`app/(store)/error.tsx`)
10k. ✅ Checkout verify page hardened (per-operation try/catch, graceful DB failure UI)
10l. ✅ Product page fixed (replaced `onClick` Server Component crash with `<a href="#reviews">`)
10m. ✅ Review moderation — admin approval required; `/admin/reviews` page; `approveReview`/`deleteReview` actions
10n. ✅ Admin notification bell — `pending_review` type with yellow Star icon; client polling every 5s via `/api/admin/notifications`
11. 🔲 Store shop + filters ← **next**
12. 🔲 Store product page + reviews
13. 🔲 Cart drawer
14. 🔲 Multi-step checkout
15. 🔲 Paystack payment + webhook
16. 🔲 Customer account dashboard
17. 🔲 Email notifications (Resend)
18. 🔲 SEO (metadata, sitemap, JSON-LD)
19. 🔲 Deploy to Vercel

**Complete one milestone fully before starting the next.**
