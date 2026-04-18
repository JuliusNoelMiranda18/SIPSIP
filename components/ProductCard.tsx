'use client'
import { useState } from 'react'
import { BeverageProduct } from '@/data/products'
import { ShoppingCart, Star, X, MessageSquare, GlassWater, Coffee, CupSoda, Leaf, Droplet, FlaskConical, Zap, Send } from 'lucide-react'

const categoryIcon: Record<string, any> = {
  'Sparkling Water': GlassWater,
  'Smoothie':        CupSoda,
  'Coffee':          Coffee,
  'Tea':             Leaf,
  'Latte':           Coffee,
  'Juice':           Droplet,
  'Lemonade':        GlassWater,
  'Frappé':          CupSoda,
  'Wellness Shot':   Zap,
  'Milk Tea':        CupSoda,
  'Kombucha':        FlaskConical,
  'Soda':            CupSoda,
  'Specialty':       Star,
}

interface ProductCardProps {
  product: BeverageProduct & { averageRating?: number, _count?: { reviews: number } }
  onAddToCart?: (productId: number) => void
}

/* ── Mock reviews seeded from product id ──────────────────── */
const REVIEW_AUTHORS = ['Alex M.', 'Jamie L.', 'Sam K.', 'Taylor R.', 'Jordan P.', 'Casey W.']
const REVIEW_TEXTS = [
  'Absolutely love this! Refreshing and smooth — would definitely buy again.',
  'Good flavor but I wish it was a bit sweeter. Still enjoyed every sip.',
  'My go-to order now. The balance of sweetness and tang is perfect.',
  'Great value for the price. Very satisfying and not too heavy.',
  'Solid choice. My whole family loves it — even the picky ones!',
]
function getMockReviews(productId: number, count: number) {
  return Array.from({ length: Math.min(count, 4) }, (_, i) => ({
    id: i,
    author: REVIEW_AUTHORS[(productId + i) % REVIEW_AUTHORS.length],
    rating: 3 + ((productId + i) % 3),
    text: REVIEW_TEXTS[(productId + i) % REVIEW_TEXTS.length],
    date: `${['Jan','Feb','Mar','Apr','May','Jun'][(productId + i) % 6]} ${10 + i}, 2025`,
  }))
}

/* ── Star display ─────────────────────────────────────────── */
function Stars({ rating, size = 11 }: { rating: number, size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '1px' }}>
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
          style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#d1d5db' }}
        />
      ))}
    </span>
  )
}

/* ── Reviews Modal ────────────────────────────────────────── */
function ReviewModal({
  product,
  avgRating,
  reviewCount,
  onClose,
}: {
  product: BeverageProduct & { averageRating?: number, _count?: { reviews: number } }
  avgRating: number
  reviewCount: number
  onClose: () => void
}) {
  const [newRating, setNewRating] = useState(5)
  const [newText, setNewText] = useState('')
  const [hoverStar, setHoverStar] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const mockReviews = getMockReviews(product.id, reviewCount)
  const IconComponent = categoryIcon[product.category] ?? CupSoda

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%', maxWidth: '640px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(30,58,95,0.22)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header with product image */}
        <div style={{
          position: 'relative',
          height: '180px',
          background: 'linear-gradient(135deg, rgba(110,136,176,0.06), rgba(110,136,176,0.14))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          {product.image ? (
            <img src={product.image} alt={product.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '72px', height: '72px', background: '#fff', borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid rgba(110,136,176,0.15)',
              boxShadow: '0 4px 12px rgba(110,136,176,0.1)'
            }}>
              <IconComponent size={36} strokeWidth={1.5} style={{ color: '#6E88B0' }} />
            </div>
          )}
          {/* Overlay gradient at bottom */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(255,255,255,0.9) 0%, transparent 50%)'
          }} />
          {/* Product info over gradient */}
          <div style={{ position: 'absolute', bottom: '1rem', left: '1.25rem', right: '3.5rem' }}>
            <span style={{
              display: 'inline-block', fontSize: '0.65rem', fontWeight: 700,
              color: '#51688B', background: 'rgba(110,136,176,0.12)',
              border: '1px solid rgba(110,136,176,0.2)', borderRadius: '6px',
              padding: '0.15rem 0.5rem', marginBottom: '0.3rem',
              letterSpacing: '0.05em', textTransform: 'uppercase'
            }}>{product.category}</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a5f', lineHeight: 1.2 }}>
              {product.name}
            </div>
          </div>
          {/* Close btn */}
          <button onClick={onClose} style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(110,136,176,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <X size={15} style={{ color: '#374151' }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.25rem' }}>

          {/* Rating summary */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1rem 1.25rem', background: 'rgba(110,136,176,0.05)',
            borderRadius: '14px', marginBottom: '1.25rem',
            border: '1px solid rgba(110,136,176,0.1)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1e3a5f', lineHeight: 1 }}>
                {avgRating.toFixed(1)}
              </div>
              <Stars rating={avgRating} size={14} />
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                {reviewCount} reviews
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[5,4,3,2,1].map(s => {
                const frac = s <= Math.round(avgRating) ? 0.6 - (5 - s) * 0.1 : 0.1
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.68rem', color: '#9ca3af', width: '8px', textAlign: 'right' }}>{s}</span>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(110,136,176,0.12)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${frac * 100}%`, height: '100%', background: '#f59e0b', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reviews list */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e3a5f', marginBottom: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Customer Reviews
            </h3>
            {mockReviews.map(r => (
              <div key={r.id} style={{
                padding: '0.9rem 1rem', borderRadius: '12px',
                background: '#fafafa', border: '1px solid rgba(110,136,176,0.1)',
                marginBottom: '0.65rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>{r.author}</span>
                    <div style={{ marginTop: '0.1rem' }}><Stars rating={r.rating} size={11} /></div>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{r.date}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{r.text}</p>
              </div>
            ))}
          </div>

          {/* Add review form */}
          <div style={{
            padding: '1rem 1.25rem', borderRadius: '14px',
            border: '1.5px solid rgba(110,136,176,0.2)',
            background: 'rgba(255,255,255,0.7)'
          }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e3a5f', marginBottom: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Write a Review
            </h3>
            {submitted ? (
              <p style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 600, textAlign: 'center', padding: '0.5rem' }}>
                ✓ Thank you for your review!
              </p>
            ) : (
              <>
                {/* Star picker */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '0.75rem' }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s}
                      onMouseEnter={() => setHoverStar(s)}
                      onMouseLeave={() => setHoverStar(0)}
                      onClick={() => setNewRating(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    >
                      <Star size={22}
                        fill={(hoverStar || newRating) >= s ? 'currentColor' : 'none'}
                        style={{ color: (hoverStar || newRating) >= s ? '#f59e0b' : '#d1d5db', transition: 'color 0.15s' }}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  placeholder="Share your experience with this beverage…"
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  style={{
                    width: '100%', borderRadius: '10px', resize: 'none',
                    border: '1.5px solid rgba(110,136,176,0.22)',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.8rem', color: '#374151',
                    fontFamily: 'var(--font-inter), sans-serif',
                    outline: 'none', background: '#f9fafb',
                    lineHeight: 1.6, boxSizing: 'border-box'
                  }}
                />
                <button
                  onClick={() => { if (newText.trim()) setSubmitted(true) }}
                  style={{
                    marginTop: '0.65rem', width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    padding: '0.65rem', borderRadius: '10px',
                    background: '#1e3a5f', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    fontSize: '0.82rem', fontWeight: 700,
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#2f5a8a' }}
                  onMouseOut={e => { e.currentTarget.style.background = '#1e3a5f' }}
                >
                  <Send size={13} /> Submit Review
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Product Card ─────────────────────────────────────────── */
export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false)
  const IconComponent = categoryIcon[product.category] ?? CupSoda
  const isOutOfStock = product.stock === 0
  const isLowStock   = product.stock > 0 && product.stock < 5
  const price        = Number(product.price)
  const avgRating    = product.averageRating !== undefined ? Number(product.averageRating) : null
  const reviewCount  = product._count?.reviews ?? 0

  return (
    <>
      {showModal && avgRating !== null && (
        <ReviewModal
          product={product}
          avgRating={avgRating}
          reviewCount={reviewCount}
          onClose={() => setShowModal(false)}
        />
      )}

      <div
        className={`product-card${isOutOfStock ? ' product-card--out' : ''}`}
        id={`product-card-${product.id}`}
      >
        {/* Image area */}
        <div className="product-card-image">
          {product.image ? (
            <img src={product.image} alt={product.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="product-icon-container">
              <IconComponent size={42} strokeWidth={1.5} className="product-icon-svg" />
            </div>
          )}
          {product.isOnSale && product.salePercent && (
            <div className="sale-ribbon">−{product.salePercent}%</div>
          )}
        </div>

        {/* Tag row */}
        <div className="product-tags">
          {product.isFeatured && <span className="tag tag--featured">Featured</span>}
          {product.isOnSale   && <span className="tag tag--sale">On Sale</span>}
          {product.isNew      && <span className="tag tag--new">New Arrival</span>}
        </div>

        {/* Body */}
        <div className="product-card-body">
          {/* Category badge — always visible */}
          <span className="product-category-pill">{product.category}</span>

          <div className="product-volume">{product.volume}</div>
          <div className="product-name">{product.name}</div>

          {/* Star rating + reviews trigger */}
          {avgRating !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
              <Stars rating={avgRating} size={11} />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#374151' }}>
                {avgRating.toFixed(1)}
              </span>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                  fontSize: '0.7rem', color: '#6E88B0', fontWeight: 600,
                  textDecoration: 'underline', textUnderlineOffset: '2px',
                  fontFamily: 'var(--font-inter), sans-serif'
                }}
              >
                <MessageSquare size={11} />
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </button>
            </div>
          )}

          {/* Description — 1 line max */}
          <div className="product-desc">{product.description}</div>

          {/* Footer */}
          <div className="product-footer">
            <div>
              <div className="product-price">
                ${price.toFixed(2)}
                {product.isOnSale && product.salePercent && (
                  <span className="product-original-price">
                    ${(price / (1 - product.salePercent / 100)).toFixed(2)}
                  </span>
                )}
              </div>
              {isOutOfStock ? (
                <div className="stock-label stock-label--out">Out of stock</div>
              ) : isLowStock ? (
                <div className="stock-label stock-label--low">Only {product.stock} left!</div>
              ) : (
                <div className="stock-label">{product.stock} in stock</div>
              )}
            </div>
            <button
              id={`add-to-cart-${product.id}`}
              className="add-to-cart-btn"
              disabled={isOutOfStock}
              onClick={() => onAddToCart?.(product.id)}
            >
              <ShoppingCart />
              {isOutOfStock ? 'Sold Out' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}