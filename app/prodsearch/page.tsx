'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { categories, products as staticProducts } from '@/data/products'

/* ── Types ────────────────────────────────────────────────── */
type SortKey = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'date-desc' | 'rating-desc'
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date-desc',   label: 'Newest → Oldest' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'name-asc',    label: 'Name (A → Z)' },
  { value: 'name-desc',   label: 'Name (Z → A)' },
  { value: 'price-asc',   label: 'Price (Low → High)' },
  { value: 'price-desc',  label: 'Price (High → Low)' },
  { value: 'stock-desc',  label: 'Stock (Most → Least)' },
]

type StockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
const STOCK_OPTIONS: { value: StockFilter; label: string }[] = [
  { value: 'all',          label: 'All' },
  { value: 'in-stock',     label: 'In Stock Only' },
  { value: 'low-stock',    label: 'Low Stock (< 5)' },
  { value: 'out-of-stock', label: 'Out of Stock' },
]

const PRICE_MIN = 0
const PRICE_MAX = 20
const PAGE_SIZE = 9

/* ─────────────────────────────────────────────────────────────
   PriceSlider — Keep visual representation, remove effect dependency
   ───────────────────────────────────────────────────────────── */
function PriceSlider({ draft, onDraft, onCommit }: { draft: [number, number], onDraft: (v: [number, number]) => void, onCommit: () => void }) {
  const pct = (v: number) => ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  return (
    <div className="price-slider-wrap">
      <div className="price-slider-labels">
        <span>${draft[0].toFixed(2)}</span>
        <span>${draft[1].toFixed(2)}</span>
      </div>
      <div className="dual-range-wrap">
        <input
          type="range" min={PRICE_MIN} max={PRICE_MAX} step={0.5}
          value={draft[0]}
          onChange={e => onDraft([Math.min(Number(e.target.value), draft[1] - 0.5), draft[1]])}
          onPointerUp={onCommit}
          onTouchEnd={onCommit}
          className="range-input"
          style={{ zIndex: draft[0] >= PRICE_MAX - 1 ? 5 : 3 }}
        />
        <input
          type="range" min={PRICE_MIN} max={PRICE_MAX} step={0.5}
          value={draft[1]}
          onChange={e => onDraft([draft[0], Math.max(Number(e.target.value), draft[0] + 0.5)])}
          onPointerUp={onCommit}
          onTouchEnd={onCommit}
          className="range-input"
          style={{ zIndex: 4 }}
        />
        <div
          className="range-track-fill"
          style={{ left: `${pct(draft[0])}%`, right: `${100 - pct(draft[1])}%` }}
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ProMax Dropdown — Custom React Select Replacement
   ───────────────────────────────────────────────────────────── */
function ProMaxDropdown({ 
  value, 
  options, 
  onChange 
}: { 
  value: string; 
  options: {value: string, label: string}[]; 
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || '';
  
  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const closer = () => setOpen(false);
    window.addEventListener('click', closer);
    return () => window.removeEventListener('click', closer);
  }, [open]);

  return (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <div 
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '0.7rem 1.2rem',
          borderRadius: '12px',
          border: open ? '1.5px solid #1e3a5f' : '1.5px solid rgba(110, 136, 176, 0.25)',
          backgroundColor: '#f9fafb',
          color: '#1e3a5f',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: open ? '0 4px 12px rgba(30, 58, 95, 0.1)' : 'none',
          fontFamily: 'var(--font-inter), sans-serif'
        }}
      >
        <span>{selectedLabel}</span>
        <svg 
          width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: '#6E88B0' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(110, 136, 176, 0.2)',
          borderRadius: '14px',
          boxShadow: '0 20px 40px rgba(30, 58, 95, 0.15)',
          zIndex: 100,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '0.8rem 1.2rem',
                fontSize: '0.82rem',
                fontWeight: opt.value === value ? 700 : 500,
                color: opt.value === value ? '#1e3a5f' : '#4b5563',
                backgroundColor: opt.value === value ? 'rgba(110, 136, 176, 0.1)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                borderBottom: '1px solid rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-inter), sans-serif'
              }}
              onMouseOver={(e) => { 
                if (opt.value !== value) e.currentTarget.style.backgroundColor = 'rgba(110, 136, 176, 0.04)' 
              }}
              onMouseOut={(e) => { 
                if (opt.value !== value) e.currentTarget.style.backgroundColor = 'transparent' 
              }}
            >
              {opt.label}
              {opt.value === value && (
                <svg width="14" height="14" fill="none" stroke="#1e3a5f" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────────────────────── */
export default function ProductSearchPage() {
  /* search */
  const [search,      setSearch]      = useState('')
  const [showSuggest, setShowSuggest] = useState(false)

  /* filters */
  const [sortKey,       setSortKey]       = useState<SortKey>('date-desc')
  const [selCategories, setSelCategories] = useState<string[]>([])
  const [onlyFeatured,  setOnlyFeatured]  = useState(false)
  const [onlyOnSale,    setOnlyOnSale]    = useState(false)
  const [onlyNew,       setOnlyNew]       = useState(false)
  const [minRating,     setMinRating]     = useState<number>(0)
  const [stockFilter,   setStockFilter]   = useState<StockFilter>('all')

  const [priceRange,      setPriceRange]      = useState<[number, number]>([PRICE_MIN, PRICE_MAX])
  const [draftPriceRange, setDraftPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX])

  /* pagination */
  const [page,      setPage]      = useState(1)
  const [showAll,   setShowAll]   = useState(false)
  const [inputPage, setInputPage] = useState('1')
  const [infiniteScroll, setInfiniteScroll] = useState(false)

  /* mobile pane */
  const [paneOpen, setPaneOpen] = useState(false)

  // Infinite scroll sentinel ref — observer is placed AFTER useMemo so `total` is accessible
  const observerTarget = useRef<HTMLDivElement>(null)

  const { products, total } = useMemo(() => {
    // 0. GENERATE RATINGS
    // In our fake frontend, 'staticProducts' don't have ratings. 
    // We must staple our math onto them FIRST before filtering or sorting them!
    const productsWithRatings = staticProducts.map((prod) => {
      const numReviews = 3 + (prod.id % 5)
      const sum = 12 + (prod.id % 12)
      return {
        ...prod,
        averageRating: Math.min(5, sum / numReviews),
        _count: { reviews: numReviews }
      }
    })

    // 1. FILTER BY TAGS (FEATURED, SALE, NEW, RATING)
    // We look at our fully constructed 'productsWithRatings' list now!
    let filteredProducts = productsWithRatings.filter((prod) => {
      if (onlyFeatured && !prod.isFeatured) return false
      if (onlyOnSale && !prod.isOnSale) return false
      if (onlyNew && !prod.isNew) return false
      
      // SEARCH BOX (CASE-INSENSITIVE + MULTIPLE FIELDS)
      // If the user typed something in, we force both the search query and the product details 
      // into entirely lowercase letters so capitalization doesn't break the rules!
      // Here we check BOTH the name and the description fields at the same time.
      if (search.trim() !== '') {
        const query = search.toLowerCase()
        const matchName = prod.name.toLowerCase().includes(query)
        const matchDesc = prod.description.toLowerCase().includes(query)
        if (!matchName && !matchDesc) return false // If neither naturally contained the word, kick it out!
      }

      // PRICE SLIDER
      // If the product costs less than the 'Minimum' knob, or above the 'Maximum' knob, drop it!
      if (prod.price < priceRange[0] || prod.price > priceRange[1]) return false

      // HIGH RATED FILTER
      // If the user selects a minimum rating, drop products beneath that threshold!
      if (minRating > 0 && prod.averageRating < minRating) return false
      
      // CATEGORY FILTER 
      // 'selCategories' is an array of strings (e.g. ['Tea', 'Soda']).
      if (selCategories.length > 0 && !selCategories.includes(prod.category)) return false
      
      // STOCK / AVAILABILITY FILTER
      if (stockFilter === 'in-stock' && prod.stock === 0) return false
      if (stockFilter === 'out-of-stock' && prod.stock > 0) return false
      if (stockFilter === 'low-stock') {
        const isLowStock = prod.stock > 0 && prod.stock < 5
        if (!isLowStock) return false
      }
      
      return true
    })

    // 2. CREATE A FRESH COPY FOR SORTING
    let sortedProducts = [...filteredProducts]

    // 3. APPLY OUR SORTING RULES
    if (sortKey === 'name-asc') {
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
    } 
    else if (sortKey === 'name-desc') {
      sortedProducts.sort((a, b) => b.name.localeCompare(a.name))
    }
    else if (sortKey === 'price-asc') {
      sortedProducts.sort((a, b) => a.price - b.price)
    }
    else if (sortKey === 'price-desc') {
      sortedProducts.sort((a, b) => b.price - a.price)
    }
    else if (sortKey === 'stock-desc') {
      sortedProducts.sort((a, b) => b.stock - a.stock)
    }
    else if (sortKey === 'date-desc') {
      sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    else if (sortKey === 'rating-desc') {
      // Highest rating goes first! We use the averageRating we stapled on in block 0
      sortedProducts.sort((a, b) => b.averageRating - a.averageRating)
    }

    // 4. PAGINATION SLICING
    // If infinite auto-load is ON, we show all products from page 1 up to current page.
    // If OFF, we behave like a traditional paginator and only show the 9 products for that specific page.
    const start = showAll || infiniteScroll ? 0 : (page - 1) * PAGE_SIZE
    const end = showAll ? sortedProducts.length : page * PAGE_SIZE

    // 5. PREPARE THE FINAL RENDER
    return {
      total: filteredProducts.length,
      products: sortedProducts.slice(start, end)
    }
    
  // DEPENDENCY ARRAY
  }, [page, showAll, sortKey, onlyFeatured, onlyOnSale, onlyNew, minRating, selCategories, stockFilter, search, priceRange])

  // Infinite scroll: fires AFTER useMemo so `total` is in scope
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && infiniteScroll) {
          setPage(prev => (prev * PAGE_SIZE < total ? prev + 1 : prev))
        }
      },
      { threshold: 0.1 }
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [total, infiniteScroll])


  /* ── Helpers ─────────────────────────────────────────────── */
  const toggleCategory = (cat: string) =>
    setSelCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])

  const activeFilterCount =
    selCategories.length +
    [onlyFeatured, onlyOnSale, onlyNew].filter(Boolean).length +
    (minRating > 0 ? 1 : 0) +
    (stockFilter !== 'all' ? 1 : 0) +
    (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX ? 1 : 0)

  const resetAll = () => {
    setSearch(''); setSortKey('date-desc'); setSelCategories([])
    setOnlyFeatured(false); setOnlyOnSale(false); setOnlyNew(false); setMinRating(0)
    setPriceRange([PRICE_MIN, PRICE_MAX]); setDraftPriceRange([PRICE_MIN, PRICE_MAX])
    setStockFilter('all'); setShowAll(false)
  }

  const goToPage = () => {
    // 1. Grabs the number the user typed into the box (inputPage) and converts the text into a real integer.
    const raw = parseInt(inputPage)
    // 2. If they just typed gibberish ("abc") or a negative number, just give up and stop!
    if (isNaN(raw) || raw < 1) return
    // 3. We calculate the absolute maximum pages that could exist based on the total filtered items divided by 12.
    const maxPage = Math.ceil(total / PAGE_SIZE) || 1
    // 4. If they asked for page 100 but we only have 3, we cap them at 3 using Math.min!
    const n = Math.min(raw, maxPage)
    
    // 5. Finally, sync both the text box UI and the actual state to the math-checked number!
    setInputPage(String(n))
    setPage(n)
    
    // 6. Automatically throw them back up to the top of the grid smoothly!
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="search-page-wrapper">

      {/* Mobile toggle */}
      <div className="mobile-filter-toggle">
        <button id="mobile-filter-btn" className="btn-filter-toggle" onClick={() => setPaneOpen(o => !o)}>
          <SlidersHorizontal size={15} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>
      {paneOpen && <div className="filter-overlay" onClick={() => setPaneOpen(false)} />}

      <div className="search-layout">

        {/* ── SIDE PANE (inline, not a sub-component) ───────── */}
        <aside className={`filter-pane${paneOpen ? ' filter-pane--open' : ''}`}>
          <div className="filter-pane-header">
            <span className="filter-pane-title"><SlidersHorizontal size={15} /> Filters &amp; Sort</span>
            {activeFilterCount > 0 && (
              <button className="filter-reset-btn" onClick={resetAll}><X size={12} /> Reset ({activeFilterCount})</button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="filter-group">
            <div className="filter-group-label">Sort By</div>
            <ProMaxDropdown 
              value={sortKey} 
              options={SORT_OPTIONS} 
              onChange={val => setSortKey(val as SortKey)} 
            />
          </div>

          {/* Tags */}
          <div className="filter-group">
            <div className="filter-group-label">Product Tags</div>
            {[
              { key: 'featured', label: 'Featured',    cls: 'tag--featured', val: onlyFeatured, set: setOnlyFeatured },
              { key: 'sale',     label: 'On Sale',     cls: 'tag--sale',     val: onlyOnSale,   set: setOnlyOnSale   },
              { key: 'new',      label: 'New Arrival', cls: 'tag--new',      val: onlyNew,      set: setOnlyNew      },
            ].map(t => (
              <label key={t.key} className="filter-check-row">
                <input type="checkbox" checked={t.val} onChange={e => t.set(e.target.checked)} className="filter-check" />
                <span className={`tag ${t.cls}`} style={{ fontSize: '0.72rem' }}>{t.label}</span>
              </label>
            ))}
          </div>

          {/* Rating Buttons */}
          <div className="filter-group">
            <div className="filter-group-label" style={{ marginBottom: '0.8rem' }}>Minimum Rating</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
              {[
                { val: 0, label: 'All' },
                { val: 1, label: '1★' },
                { val: 2, label: '2★' },
                { val: 3, label: '3★' },
                { val: 4, label: '4★' },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setMinRating(opt.val)}
                  style={{
                    padding: '0.45rem 0',
                    border: minRating === opt.val ? '1.5px solid #1e3a5f' : '1.5px solid rgba(110,136,176,0.15)',
                    background: minRating === opt.val ? '#1e3a5f' : '#ffffff',
                    color: minRating === opt.val ? '#ffffff' : '#4b5563',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: minRating === opt.val ? '0 4px 10px rgba(30, 58, 95, 0.2)' : 'none',
                  }}
                >
                  {opt.label}{opt.val > 0 ? '+' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="filter-group">
            <div className="filter-group-label">Category</div>
            <div className="filter-category-grid">
              {categories.map(cat => (
                <label key={cat} className="filter-check-row filter-check-row-col">
                  <input type="checkbox" checked={selCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)} className="filter-check" />
                  <span className="filter-check-text">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Slider */}
          <div className="filter-group">
            <div className="filter-group-label">Price Range</div>
            <PriceSlider
              draft={draftPriceRange}
              onDraft={setDraftPriceRange}
              onCommit={() => setPriceRange([...draftPriceRange])}
            />
          </div>

          {/* Stock */}
          <div className="filter-group" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <div className="filter-group-label">Stock Status</div>
            <ProMaxDropdown 
              value={stockFilter} 
              options={STOCK_OPTIONS} 
              onChange={val => setStockFilter(val as StockFilter)} 
            />
          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────── */}
        <div className="search-main">

          {/* Header */}
          <div className="search-header">
            <div>
              <span className="section-label"><Search size={13} /> Beverage Catalog</span>
              <h1 className="section-title" style={{ marginTop: '0.3rem' }}>Find Your Perfect Drink</h1>
            </div>

            {/* Search */}
            <div className="search-input-wrapper" style={{ marginTop: '1.25rem', position: 'relative' }}>
              <Search className="search-input-icon" />
              <input
                id="beverage-search-input"
                type="text"
                placeholder="Search by name, description, category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                className="search-input"
                autoComplete="off"
              />
              {search && (
                <button className="search-clear-btn" onClick={() => setSearch('')}><X size={14} /></button>
              )}
              
              {/* Autocomplete Dropdown Flyout */}
              {showSuggest && search.trim() !== '' && (
                <div className="autocomplete-flyout" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ccc', borderRadius: '4px', zIndex: 50, marginTop: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                  {staticProducts
                    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
                    .slice(0, 5) // We only show the top 5 suggestions so it doesn't take over the screen
                    .map(p => (
                      <div 
                        key={p.id} 
                        style={{ padding: '0.6rem 1rem', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '0.85rem' }} 
                        onMouseDown={() => {
                          // We use onMouseDown instead of onClick so it fires BEFORE the input's onBlur event!
                          setSearch(p.name)
                          setShowSuggest(false)
                        }}
                      >
                        {p.name} <span style={{ color: '#888', fontSize: '0.7rem' }}>— {p.category}</span>
                      </div>
                  ))}
                  
                  {staticProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                    <div style={{ padding: '0.6rem 1rem', color: '#888', fontSize: '0.85rem' }}>No matches found...</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results info row — above the grid */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: 500 }}>
              {total === 0 ? 'No beverages found' : `Showing ${products.length} of ${total} beverages`}
            </span>
          </div>

          {/* Grid */}
          <div className="product-grid">
            {products.map(p => (
              <ProductCard key={p.id} product={p as any} onAddToCart={id => console.log('Add cart:', id)} />
            ))}
          </div>

          {/* ── ProMax Pagination Block (below grid) ─────────── */}
          {(() => {
            const maxPage = Math.ceil(total / PAGE_SIZE) || 1
            const delta = 2
            const rangeStart = Math.max(1, page - delta)
            const rangeEnd = Math.min(maxPage, page + delta)
            const pageNums: number[] = []
            for (let i = rangeStart; i <= rangeEnd; i++) pageNums.push(i)

            // Blue Mirage flat button — no gradients
            const NavBtn = ({ label, onClick, disabled, active = false, btnKey }: { label: string, onClick: () => void, disabled: boolean, active?: boolean, btnKey: string }) => (
              <button
                key={btnKey}
                onClick={onClick}
                disabled={disabled}
                style={{
                  minWidth: '42px', height: '42px',
                  borderRadius: '12px',
                  border: active ? 'none' : disabled ? '1.5px solid rgba(110,136,176,0.15)' : '1.5px solid rgba(110,136,176,0.25)',
                  background: active ? '#1e3a5f' : disabled ? '#f8fafc' : '#ffffff',
                  color: active ? '#fff' : disabled ? '#cbd5e1' : '#1e3a5f',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.88rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: active ? '0 4px 14px rgba(30,58,95,0.22)' : disabled ? 'none' : '0 2px 6px rgba(110,136,176,0.08)',
                  transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                  fontFamily: 'var(--font-inter), sans-serif',
                  padding: '0 0.6rem'
                }}
              >{label}</button>
            )

            return (
              <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                <p style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 500, letterSpacing: '0.03em' }}>
                  Page {Math.min(page, maxPage)} of {maxPage} &mdash; {total} beverages
                </p>

                {/* Frosted pill bar */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(110,136,176,0.15)',
                  borderRadius: '18px',
                  padding: '0.6rem 1rem',
                  boxShadow: '0 12px 32px rgba(30,58,95,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <NavBtn btnKey="prev" label="←" onClick={() => { setPage(p => Math.max(1, p-1)); setInputPage(String(Math.max(1, page-1))); window.scrollTo({top:0,behavior:'smooth'}) }} disabled={page <= 1} />

                  {rangeStart > 1 && <>
                    <NavBtn btnKey="first" label="1" onClick={() => { setPage(1); setInputPage('1'); window.scrollTo({top:0,behavior:'smooth'}) }} disabled={false} />
                    {rangeStart > 2 && <span key="ellipsis-start" style={{ color:'#9ca3af', fontSize:'0.9rem', padding:'0 0.2rem' }}>…</span>}
                  </>}

                  {pageNums.map(n => (
                    <NavBtn key={`page-${n}`} btnKey={`page-${n}`} label={String(n)} onClick={() => { setPage(n); setInputPage(String(n)); window.scrollTo({top:0,behavior:'smooth'}) }} disabled={false} active={n === page} />
                  ))}

                  {rangeEnd < maxPage && <>
                    {rangeEnd < maxPage - 1 && <span key="ellipsis-end" style={{ color:'#9ca3af', fontSize:'0.9rem', padding:'0 0.2rem' }}>…</span>}
                    <NavBtn btnKey="last" label={String(maxPage)} onClick={() => { setPage(maxPage); setInputPage(String(maxPage)); window.scrollTo({top:0,behavior:'smooth'}) }} disabled={false} />
                  </>}

                  <NavBtn btnKey="next" label="→" onClick={() => { setPage(p => Math.min(maxPage, p+1)); setInputPage(String(Math.min(maxPage, page+1))); window.scrollTo({top:0,behavior:'smooth'}) }} disabled={page >= maxPage} />

                  <div style={{ width: '1px', height: '24px', background: 'rgba(110,136,176,0.18)', margin: '0 0.3rem' }} />

                  <span style={{ fontSize: '0.73rem', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Go</span>
                  <input
                    type="text" inputMode="numeric" pattern="[0-9]*"
                    value={inputPage}
                    onChange={e => setInputPage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && goToPage()}
                    style={{
                      width: '52px', height: '42px', textAlign: 'center',
                      border: '1.5px solid rgba(110,136,176,0.22)', borderRadius: '12px',
                      fontSize: '0.88rem', fontWeight: 700, color: '#1e3a5f',
                      background: '#f8fafc', outline: 'none',
                      fontFamily: 'var(--font-inter), sans-serif'
                    } as React.CSSProperties}
                  />
                  <button
                    onClick={goToPage}
                    style={{
                      height: '42px', padding: '0 1.1rem',
                      borderRadius: '12px',
                      background: '#1e3a5f',
                      color: '#fff', border: 'none', cursor: 'pointer',
                      fontSize: '0.82rem', fontWeight: 800,
                      letterSpacing: '0.04em',
                      boxShadow: '0 4px 14px rgba(30,58,95,0.2)',
                      transition: 'all 0.2s',
                      fontFamily: 'var(--font-inter), sans-serif'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background='#2f5a8a'; e.currentTarget.style.transform='translateY(-1px)' }}
                    onMouseOut={e => { e.currentTarget.style.background='#1e3a5f'; e.currentTarget.style.transform='translateY(0)' }}
                  >GO</button>

                  <div style={{ width: '1px', height: '24px', background: 'rgba(110,136,176,0.18)', margin: '0 0.3rem' }} />

                  {/* Infinite Scroll Toggle */}
                  <button
                    onClick={() => setInfiniteScroll(!infiniteScroll)}
                    title="Toggle Auto-Load"
                    style={{
                      height: '42px', padding: '0 0.95rem',
                      borderRadius: '12px',
                      background: infiniteScroll ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#f8fafc',
                      color: infiniteScroll ? '#fff' : '#64748b',
                      border: infiniteScroll ? 'none' : '1.5px solid rgba(110,136,176,0.22)',
                      cursor: 'pointer',
                      fontSize: '0.78rem', fontWeight: 700,
                      letterSpacing: '0.02em',
                      boxShadow: infiniteScroll ? '0 4px 14px rgba(16,185,129,0.25)' : 'none',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      fontFamily: 'var(--font-inter), sans-serif'
                    }}
                    onMouseOver={e => { if (!infiniteScroll) e.currentTarget.style.background='#f1f5f9' }}
                    onMouseOut={e => { if (!infiniteScroll) e.currentTarget.style.background='#f8fafc' }}
                  >
                    ∞ {infiniteScroll ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Infinite scroll sentinel */}
                {page * PAGE_SIZE < total && (
                  <div ref={observerTarget} style={{ height: '40px', width: '100%' }} />
                )}

                {page * PAGE_SIZE >= total && products.length > 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', letterSpacing: '0.02em' }}>✓ You&apos;ve seen all {total} beverages</p>
                )}

                <div style={{ height: '2rem' }} />
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}