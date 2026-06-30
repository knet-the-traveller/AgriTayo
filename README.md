<div align="center">

# 🌾 Agri Tayo

> "Agreement in Action, Agriculture for All."

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC)
![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E44AD)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## 📖 Project Overview

A data-driven web marketplace that directly connects Filipino farmers and agricultural cooperatives with urban buyers and logistics drivers, eliminating predatory middlemen (viajeros) and reducing post-harvest food waste. Built for the hackathon, the platform enables real-time harvest listings, AI-powered market matching via Google Gemini, live delivery tracking via Google Maps, and a complete multi-role marketplace ecosystem.

---

## 🌍 SDG Alignment

| SDG | Goal | How Agri Tayo Addresses It |
|-----|------|---------------------------|
| 🎯 **SDG 2** | Zero Hunger | Reduces post-harvest waste by connecting supply directly to demand before spoilage. |
| 💼 **SDG 8** | Decent Work & Economic Growth | Ensures farmers receive fair market prices, eliminating exploitative middlemen. |
| 🏭 **SDG 9** | Industry, Innovation & Infrastructure | Introduces AI-powered matching and data analytics to an underserved agricultural sector. |

---

## ✨ Features by Role

<details>
<summary>🛒 Buyer</summary>

- Browse harvest marketplace with urgency indicators
- Filter by crop category, location, harvest date, and price range
- Place orders with quantity enforcement and minimum order requirements
- Select payment method (Cash on Delivery, Online Payment, Card)
- Save delivery address to profile for fast checkout
- Track orders through full status lifecycle (Pending → Confirmed → In Transit → Delivered)
- View status timeline stepper per order
</details>

<details>
<summary>🌾 Farmer</summary>

- Post harvest listings with crop details, volume, pricing, location, and certifications
- Live preview card showing exactly how buyers see the listing
- AI-powered price suggestion via Google Gemini
- Fair price floor guidance based on crop category
- Manage and edit active listings inline
- View and manage incoming buyer orders
- Accept or decline orders with styled confirmation
- Automatic stock deduction when order is accepted
- Listings auto-mark as Sold Out when volume reaches zero
</details>

<details>
<summary>🚚 Driver</summary>

- Browse all available delivery jobs with route, distance, estimated duration, and payout
- Accept delivery jobs with inline confirmation
- Update delivery status: Accepted → Picked Up → In Transit → Delivered
- Track earnings and completed deliveries
- Status updates sync to buyer's order tracker in real time via shared localStorage
</details>

<details>
<summary>👑 Superadmin</summary>

- Command Center dashboard with live sector map
- Full analytics: price fairness, waste saved, cooperative leaderboard, demand heatmap
- User management with role-based access control
- Cooperative registry with verification status
- Platform configuration: AI match sensitivity, fair price floor thresholds, urgency rules
- Notification and alert rule management
- Data export tools (CSV/PDF)
- API key management and session monitoring
</details>

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.2 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Maps** | Google Maps Platform (`@vis.gl/react-google-maps`) |
| **AI** | Google Gemini API (`gemini-1.5-flash`) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Storage** | `localStorage` (client-side persistence for MVP) |
| **Auth** | Custom role-based auth with middleware |
| **Deployment** | Vercel (recommended) |

---

## 📂 Project Structure

```text
agri-tayo/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai-match/         # Gemini match analysis endpoint
│   │   │   └── ai-price-         # Gemini price suggestion endpoint
│   │   │       suggestion/         
│   │   ├── analytics/            # Analytics dashboard
│   │   ├── available-            # Driver: job browser
│   │   │   deliveries/             
│   │   ├── live-tracking/        # Live map tracking view
│   │   ├── login/                # Auth / Registration page
│   │   ├── market/               # Harvest marketplace
│   │   ├── my-deliveries/        # Driver: active/past jobs
│   │   ├── my-orders/            # Buyer: order history
│   │   ├── post-harvest/         # Farmer: post new listing
│   │   ├── profile/              # User profile
│   │   ├── seller-orders/        # Farmer: manage incoming orders
│   │   ├── system-settings/      # Superadmin config and users
│   │   ├── globals.css           # Global Tailwind and keyframes
│   │   ├── layout.tsx            # Root layout wrapper
│   │   └── page.tsx              # Home (Dashboard Overview)
│   ├── components/
│   │   ├── Dashboard.tsx         # Main layout + interactive sidebar
│   │   ├── NotificationBell.tsx  # Dynamic unread notifications
│   │   └── Skeleton.tsx          # Pulse loading skeletons
│   ├── data/
│   │   └── mockData.tsx          # Default mock payloads
│   ├── hooks/
│   │   └── useCountUp.ts         # Stat card counter animations
│   ├── lib/
│   │   └── auth.ts               # LocalStorage auth + Dummy Accounts
│   └── middleware.ts             # Route protection middleware
├── .env.local                    # Environment variables (ignored)
├── .env.example                  # Env variable template
├── package.json                  # Dependencies
└── README.md                     # You are here!
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Maps API key (Maps JavaScript API enabled)
- Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/apikey))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/knet-the-traveller/agri-tayo.git
cd agri-tayo

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual API keys

# 4. Run the development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Google Maps Platform (client-side, requires NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key_here

# Google Gemini AI (server-side only, NO NEXT_PUBLIC_ prefix — never expose this client-side)
GEMINI_API_KEY=your_gemini_key_here
```

---

## 🎭 Demo Accounts

For hackathon judges reviewing the demo:

| Role | Username | Password |
|------|----------|----------|
| **Superadmin** | `admin` | `admin123` |
| **Farmer** | Sign up with role: **Farmer** | *any password* |
| **Buyer** | Sign up with role: **Buyer** | *any password* |
| **Driver** | Sign up with role: **Driver** | *any password* |

> **Note:** User data is stored in `localStorage`. Each browser session maintains its own data. Sign up to create a Farmer, Buyer, or Driver account to explore role-specific features. The application comes pre-hydrated with 25 diverse dummy accounts.

---

## 🔄 How It Works (Data Flow)

1. **Farmer** posts a harvest listing.
2. Listing immediately appears on the **Market** page.
3. **Buyer** browses listings, places an order.
4. **Farmer** receives order notification on the **Orders** page.
5. **Farmer** accepts order → original listing volume decreases automatically.
6. Order becomes available for drivers.
7. **Driver** accepts the delivery job via **Available Deliveries**.
8. **Driver** updates status sequentially: `Picked Up` → `In Transit` → `Delivered`.
9. **Buyer** sees the real-time status update reflected on their **My Orders** timeline.

*All state is shared via `localStorage` — no backend required for the MVP, enabling a fully functional offline-capable demo.*

---

## 🧠 AI Features

### AI Market Matchmaker (Dashboard + Market)
Powered by Google Gemini (`gemini-1.5-flash`). Analyzes current harvest listings to identify:
- Crops at risk of post-harvest waste (high volume, approaching harvest date).
- Price anomalies vs. fair market baselines.
- Supply/demand mismatches by crop category.

*Results are cached in `sessionStorage` (10-minute window) to minimize API quota usage.*

### AI Price Suggestion (Post Harvest)
When a farmer is posting a harvest, they can request an AI-generated fair price range for their specific crop, category, and province — helping them price competitively while ensuring they earn more than traditional middleman rates.

---

## 🏗️ Key Design Decisions

- **`localStorage` as MVP Database**
  For hackathon scope, all data (listings, orders, user accounts, sessions) is persisted in `localStorage`. This enables a fully functional demo without backend infrastructure. Production would replace this with PostgreSQL + FastAPI (architected in the original proposal).
- **Role-Based UI Rendering**
  The same shared layout and sidebar dynamically adjusts its navigation items based on the logged-in user's role — Farmers see Post Harvest + Orders, Buyers see My Orders, Drivers see Available Deliveries + My Deliveries, Superadmin sees System Settings.
- **Shared State = Real-Time Sync**
  Because all roles read from the same `localStorage` keys (`agritayo_orders`, `agritayo_listings`), status updates made by one role (e.g., driver marks *In Transit*) are immediately visible to other roles (e.g., buyer's My Orders shows *In Transit*) on the next page load — simulating real-time sync without WebSockets.

---

## 🗺️ Roadmap (Post-Hackathon)

- [ ] Replace `localStorage` with PostgreSQL + FastAPI backend.
- [ ] Integrate Vertex AI for predictive yield forecasting.
- [ ] Connect Google BigQuery for historical pricing analytics.
- [ ] USSD/SMS integration for farmers without smartphone access.
- [ ] Third-party logistics (3PL) API integration.
- [ ] Push notifications for order/delivery updates.
- [ ] Multi-language support (Filipino/English).
- [ ] DA (Department of Agriculture) open data integration for official price floors.

---

## 👥 Team

Built for [Hackathon Name] by **Team Agri Tayo**  
BSIT Students — Polytechnic University of the Philippines (PUP)  
College of Computer and Information Sciences (CCIS)

| Name | GitHub |
|------|--------|
| Mark Kenneth B. Galario | [@knet-the-traveller](https://github.com/knet-the-traveller) |
| Hanzel G. Guevarra | — |
| Mark Andrew J. Cruz | — |
| Nash Gieniel C. Lumaque | — |

---

## 📄 License

**MIT License** — feel free to fork, improve, and build on this for the Filipino agricultural community.
