import HeroWrapper from '@/components/HeroWrapper'

export const metadata = {
  title: 'SipShop — Premium Beverages',
  description: 'Discover handcrafted beverages. Smoothies, cold brews, milk teas, kombuchas and more.',
}

export default function LandingPage() {
  return (
    <>
      {/* ── 3D HERO SCENE ─────────────────────────────────── */}
      <HeroWrapper />
    </>
  )
}