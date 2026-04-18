'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home', Icon: Home },
    { href: '/prodsearch', label: 'Products', Icon: Search },
  ]

  return (
    <nav className="navbar" style={{ width: 'fit-content', padding: '0.5rem', display: 'inline-flex', isolation: 'isolate' }}>
      <div className="navbar-inner" style={{ display: 'flex', gap: '3rem', width: 'fit-content' }}>

        {/* ── Left: Logo ─────────────────────────────── */}
        <Link href="/" className="navbar-brand" id="nav-brand">
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            {/* 
              This advanced SVG matrix algorithm calculates the brightness of each pixel in the PNG.
              If the pixel is dark (the background), its Alpha opacity drops to 0.0 (transparent).
              If the pixel is bright (your 'SIPSIP' text), its Alpha locks to 1.0 (opaque) and sets the color to pure white.
              This entirely bypasses browser mix-blend-mode bugs!
            */}
            <filter id="delete-dark-bg">
              <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.5 1.5 1.5 0 -1.5" />
            </filter>
          </svg>
          <img
            src="/logo.png"
            alt="SipShop Logo"
            style={{
              height: '55px',
              objectFit: 'contain',
              filter: 'url(#delete-dark-bg)'
            }}
          />
        </Link>

        {/* ── Center: Nav links (Expanding Hover Logic) ── */}
        <ul className="flex gap-4 relative" style={{ margin: '0 2rem' }}>
          {links.map(({ href, label, Icon }) => {
            const isActive = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  id={`nav-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`relative flex items-center justify-center rounded-full transition-all duration-500 hover:shadow-none group cursor-pointer w-[45px] h-[45px] hover:w-[140px] ${isActive
                    ? 'bg-[rgba(255,255,255,0.20)]' /* Highlighted circle when clicked/active */
                    : 'bg-transparent hover:bg-[rgba(255,255,255,0.08)]'
                    }`}
                >
                  {/* The Icon (Visible by default, scales to 0 on hover) */}
                  <span className="relative z-10 transition-all duration-500 delay-0 group-hover:scale-0">
                    <Icon size={20} strokeWidth={2.5} style={{ color: '#F2E0D0' }} />
                  </span>

                  {/* The Text Label (Hidden by default, swells to scale-100 on hover) */}
                  <span className="absolute text-[#F2E0D0] font-medium tracking-wide text-[0.95rem] transition-all duration-500 delay-150 scale-0 group-hover:scale-100 group-hover:text-white">
                    {label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* ── Right: CTA button ──────────────────────── */}
        <div className="navbar-cta">
          <Link href="/prodsearch" className="btn-cta" id="nav-shop-now" style={{ backgroundColor: '#F2E0D0', color: '#7A93B7', fontSize: '0.95rem', padding: '0.7rem 1.8rem', boxShadow: 'none' }}>
            Shop Now
          </Link>
        </div>

      </div>
    </nav>
  )
}
