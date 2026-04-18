# SipShop (SIPSIP) 🥤

Discover handcrafted, premium beverages including smoothies, cold brews, milk teas, kombuchas, and more! SipShop is a beautifully designed, modern web application that provides users with an immersive browsing and shopping experience for buying artisanal drinks.

---

## 📖 Product Intro

SipShop is designed to be the ultimate premium beverage directory and storefront. At first glance, users are greeted with a stunning 3D interactive hero scene that reacts to scroll events. Once past the hero section, users enter a robust and lightning-fast product search interface packed with "ProMax" level filters, sorting, and pagination logic to quickly find the perfect drink matching their mood, budget, or dietary needs.

---

## ✨ Features

- **Interactive 3D Hero Scene**: Immersive landing page built using `react-three-fiber` and Three.js with smooth transitions powered by Framer Motion and GSAP.
- **Advanced Product Search**: Case-insensitive, multi-field search logic to easily pinpoint products by name or description.
- **ProMax Filtering System**:
  - Dual-thumb Price Range Sliders
  - Minimum Rating constraint selections
  - "Stock Status" filtering (In Stock, Low Stock, Out of Stock)
  - Categories and Tags (Featured, New Arrivals, On Sale)
- **Advanced Sorting**: Sort items by rating, price, stock availability, date, and alphabetical order.
- **Hybrid Pagination**: A fully custom "ProMax" frosted pill pagination bar that includes an **Infinite Scroll Toggle**, allowing users to freely switch between traditional page-by-page viewing or smooth auto-loading. 
- **Modern Authentication**: User authentication backed by Supabase and NextAuth (Credentials & OAuth flows supported).

---

## 🛠 UI/UX Technologies 

The application uses a bleeding-edge technology stack focusing heavily on design aesthetics, animation, and performance:

- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS v4 for utility-first responsive design
- **3D Graphics**: Three.js, `@react-three/fiber`, and `@react-three/drei` for the interactive 3D hero experience
- **Animations**: GSAP (`@gsap/react`) & Framer Motion (`motion`) for intricate scroll reveals, text-splitting, and layout animations
- **Icons**: Lucide React for clean, consistent SVG iconography
- **Database / ORM**: Prisma Client with continuous synchronization using Neon Serverless Postgres
- **Auth**: NextAuth & `@supabase/supabase-js`

---

## 🚀 How to Download and Run

### 1. Clone the repository

```bash
git clone https://github.com/JuliusNoelMiranda18/SIPSIP.git
cd SIPSIP
```

### 2. Install dependencies

You can use npm, yarn, pnpm, or bun:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory and ensure you configure the following keys:
- `DATABASE_URL` (Your Neon Postgres connection string)
- NextAuth variables (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
- Supabase endpoints and keys (if utilized beyond NextAuth)

*(Consult `.env.example` if available in the repository)*

### 4. Initialize Database & Prisma

Generate the Prisma Client and push the schema/seed data to your database:

```bash
npx prisma generate
npm run db:push
npm run db:seed    # Optional: if you have default beverages to load
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience SipShop!
