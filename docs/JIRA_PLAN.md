# A-Track Atelier — Jira Project Plan

> **Project Key:** `ATRK`  
> **Sprint cadence:** 2 weeks  
> **Status legend:** ✅ Done · 🔵 To Do · 🟡 In Progress

---

## Epic 1: Core Order Management `ATRK-E1`

| Key | Type | Summary | Priority | SP | Status |
|-----|------|---------|----------|---:|--------|
| ATRK-101 | Story | Create new order with customer, item, materials, gemstones | High | 5 | ✅ |
| ATRK-102 | Story | Order detail page with full info, notes, weights | High | 3 | ✅ |
| ATRK-103 | Story | Update order stage (Kanban drag-and-drop) | High | 5 | ✅ |
| ATRK-104 | Story | Delete order with confirmation | Medium | 1 | ✅ |
| ATRK-105 | Story | Orders list with search, filter by stage/material/item/due | High | 5 | ✅ |
| ATRK-106 | Story | Sortable table columns (order #, customer, stage, due, price) | Medium | 2 | ✅ |
| ATRK-107 | Story | Stale order reminder banner (7+ days in same stage) | Medium | 3 | ✅ |
| ATRK-108 | Story | Overdue & urgent order banners on Dashboard | High | 2 | ✅ |
| ATRK-109 | Story | Mark order ready for pickup + pickup banner | Medium | 2 | ✅ |

---

## Epic 2: Customer Management `ATRK-E2`

| Key | Type | Summary | Priority | SP | Status |
|-----|------|---------|----------|---:|--------|
| ATRK-201 | Story | Customer directory with search and add | High | 3 | ✅ |
| ATRK-202 | Story | Customer detail page (profile, order history, lifetime spend) | High | 3 | ✅ |
| ATRK-203 | Story | Inline customer creation from New Order form | Medium | 2 | ✅ |
| ATRK-204 | Story | Edit / delete customer | Medium | 2 | ✅ |

---

## Epic 3: Supplier Management `ATRK-E3`

| Key | Type | Summary | Priority | SP | Status |
|-----|------|---------|----------|---:|--------|
| ATRK-301 | Story | Supplier list with inline add / edit / delete | High | 3 | ✅ |
| ATRK-302 | Story | Supplier detail page (profile, assigned orders, stats) | Medium | 3 | ✅ |
| ATRK-303 | Story | Assign supplier to order (casting/setting stages) | Medium | 2 | ✅ |

---

## Epic 4: Deals / CRM Pipeline `ATRK-E4`

| Key | Type | Summary | Priority | SP | Status |
|-----|------|---------|----------|---:|--------|
| ATRK-401 | Story | Kanban deal pipeline (Ongoing → Partial → Won → Lost) | High | 5 | ✅ |
| ATRK-402 | Story | Add / delete deals with customer + value | High | 2 | ✅ |
| ATRK-403 | Story | Convert won deal to new order (pre-fill customer) | Medium | 2 | ✅ |

---

## Epic 5: Analytics & Reporting `ATRK-E5`

| Key | Type | Summary | Priority | SP | Status |
|-----|------|---------|----------|---:|--------|
| ATRK-501 | Story | KPI cards (revenue, orders, avg price, turnaround) | High | 3 | ✅ |
| ATRK-502 | Story | Charts: stage distribution, material mix, monthly revenue | High | 5 | ✅ |
| ATRK-503 | Story | Top customers leaderboard | Medium | 2 | ✅ |
| ATRK-504 | Story | Avg time per production stage (from QR data) | Medium | 3 | ✅ |
| ATRK-505 | Story | Export orders to CSV | Medium | 2 | ✅ |
| ATRK-506 | Story | Dashboard activity log (last 8 events, relative time) | Medium | 2 | ✅ |

---

## Epic 6: Production Tracking `ATRK-E6`

| Key | Type | Summary | Priority | SP | Status |
|-----|------|---------|----------|---:|--------|
| ATRK-601 | Story | QR code generation per order | High | 2 | ✅ |
| ATRK-602 | Story | QR scan page to start/stop stage timer | High | 3 | ✅ |
| ATRK-603 | Story | Stage time log with durations on order detail | Medium | 2 | ✅ |

---

## Epic 7: Invoicing & Documents `ATRK-E7`

| Key | Type | Summary | Priority | SP | Status |
|-----|------|---------|----------|---:|--------|
| ATRK-701 | Story | Generate printable invoice from order detail | High | 3 | ✅ |
| ATRK-702 | Story | Print-optimized CSS (@media print) | Medium | 2 | ✅ |

---

## Epic 8: UI / Design System `ATRK-E8`

| Key | Type | Summary | Priority | SP | Status |
|-----|------|---------|----------|---:|--------|
| ATRK-801 | Story | Soften neobrutalist theme to modern minimal | Medium | 3 | ✅ |
| ATRK-802 | Story | Consistent border/shadow treatment across all pages | Medium | 2 | ✅ |
| ATRK-803 | Story | App shell with nav, footer, urgent indicator | High | 2 | ✅ |

---

## Epic 9: Auth & Infrastructure `ATRK-E9`

| Key | Type | Summary | Priority | SP | Status |
|-----|------|---------|----------|---:|--------|
| ATRK-901 | Story | Login / Register with auto-login for POC | High | 2 | ✅ |
| ATRK-902 | Story | Zustand persisted store with seed data | High | 3 | ✅ |
| ATRK-903 | Story | Connect to Supabase (replace local store) | High | 8 | 🔵 |
| ATRK-904 | Story | Role-based access control (admin vs artisan) | Medium | 5 | 🔵 |
| ATRK-905 | Story | Deploy to Vercel with env vars | Medium | 2 | 🔵 |

---

## Backlog (Post-MVP)

| Key | Type | Summary | Priority | SP | Status |
|-----|------|---------|----------|---:|--------|
| ATRK-1001 | Story | Real-time notifications (toast on stage change) | Low | 3 | 🔵 |
| ATRK-1002 | Story | Image upload for orders (design sketches) | Low | 5 | 🔵 |
| ATRK-1003 | Story | PDF export of analytics report | Low | 3 | 🔵 |
| ATRK-1004 | Story | Multi-language support (EN/IT/FR) | Low | 8 | 🔵 |
| ATRK-1005 | Story | Dark mode toggle | Low | 3 | 🔵 |
