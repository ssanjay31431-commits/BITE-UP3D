import { useEffect, useMemo, useState } from 'react'
import RollScene from './components/RollScene.jsx'
import { categories, menuItems } from './data/menu.js'
import './App.css'

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    bag: <><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    close: <><path d="m18 6-12 12" /><path d="m6 6 12 12" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
}

function App() {
  const [activeCategory, setActiveCategory] = useState('Jumbo Roll Specials')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [order, setOrder] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(8 * 60)

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory
      const matchesSearch = !query || `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, search])

  const cartItems = useMemo(() => menuItems.filter((item) => cart[item.id]), [cart])
  const itemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * cart[item.id], 0)

  useEffect(() => {
    if (!order || secondsLeft <= 0) return undefined
    const timer = window.setInterval(() => setSecondsLeft((time) => Math.max(0, time - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [order, secondsLeft])

  function updateQuantity(id, change) {
    setCart((current) => {
      const nextQuantity = (current[id] || 0) + change
      if (nextQuantity <= 0) {
        const next = { ...current }
        delete next[id]
        return next
      }
      return { ...current, [id]: nextQuantity }
    })
  }

  function addToCart(id) {
    updateQuantity(id, 1)
    setCartOpen(true)
  }

  function placeOrder() {
    if (itemCount === 0) return
    const number = `BU-${Math.floor(100000 + Math.random() * 900000)}`
    setOrder({ number, items: cartItems.map((item) => ({ ...item, quantity: cart[item.id] })) })
    setSecondsLeft(8 * 60)
    setCart({})
    setCheckoutOpen(false)
    setCartOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const progress = Math.min(100, ((480 - secondsLeft) / 480) * 100)
  const activeStage = secondsLeft === 0 ? -1 : secondsLeft > 360 ? 0 : secondsLeft > 210 ? 1 : secondsLeft > 75 ? 2 : 3
  const stages = ['Order confirmed', 'Preparing', 'Heating', 'Almost ready']

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="BITE-UP home">BITE<span>-UP</span><i>.</i></a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#story">OUR STORY</a>
          <a href="#menu">THE MENU</a>
          <a href="#visit">FIND US</a>
        </nav>
        <button className="header-order" onClick={() => setCartOpen(true)}>
          <span>ORDER NOW</span><span className="header-order-icon"><Icon name="bag" size={17} /></span>
          {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-grain" />
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> THE ORIGINAL. THE ONLY. THE LEGEND.</div>
          <h1>THE LEGENDARY<br /><span>JUMBO ROLL</span></h1>
          <p className="hero-subtitle">Big Flavour. Freshly Made. <strong>BITE-UP.</strong></p>
          <div className="hero-actions">
            <a className="button button-primary" href="#menu">EXPLORE MENU <Icon name="arrow" size={17} /></a>
            <button className="button button-outline" onClick={() => setCartOpen(true)}>ORDER NOW <span className="play-dot">↗</span></button>
          </div>
          <div className="hero-footnote"><span className="footnote-dot" /> MADE HOT. MADE FRESH. MADE TO BE REMEMBERED.</div>
        </div>
        <div className="hero-art">
          <div className="art-glow" />
          <div className="art-orbit art-orbit-one" />
          <div className="art-orbit art-orbit-two" />
          <div className="art-stamp">100%<br /><span>JUMBO</span></div>
          <RollScene />
          <div className="art-caption"><span>01 / THE ORIGINAL</span><span>FIRE-KISSED · MADE TO ORDER</span></div>
        </div>
        <div className="hero-side-label">A LITTLE MESSY. A LOT LEGENDARY.</div>
        <a className="scroll-indicator" href="#story"><span /> SCROLL TO DISCOVER</a>
        <div className="hero-bottom-note">BOLD BY NATURE <b>✳</b> BITE-UP BY CHOICE</div>
      </section>

      {order ? (
        <section className="tracking-section" aria-live="polite">
          <div className="tracking-topline"><span>YOUR ORDER IS IN THE WORKS</span><span>ORDER {order.number}</span></div>
          <div className="tracking-grid">
            <div className="tracking-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> KITCHEN CAM, SORT OF</div>
              <h2>GOOD THINGS<br />TAKE <span>HEAT.</span></h2>
              <p>Your order is on its way through the BITE-UP kitchen. We’re making it fresh, just for you.</p>
              <div className="timer-wrap">
                <span className="timer-label">{secondsLeft > 0 ? 'EST. TIME LEFT' : 'KITCHEN UPDATE'}</span>
                <strong className={secondsLeft === 0 ? 'timer-checking' : ''}>{secondsLeft > 0 ? formatTime(secondsLeft) : 'CHECKING ORDER STATUS'}</strong>
              </div>
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              {secondsLeft === 0 && <p className="status-note">Your order may still be in preparation. Please check with the restaurant for the latest update.</p>}
              <button className="button button-primary" onClick={() => { setOrder(null); setActiveCategory('Jumbo Roll Specials'); window.setTimeout(() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }), 0) }}>BACK TO MENU <Icon name="arrow" size={17} /></button>
            </div>
            <div className="tracking-visual">
              <div className="tracking-heat" style={{ '--heat-progress': `${progress}%` }} />
              <RollScene progress={progress} compact />
              <div className="tracking-stages">
                {stages.map((stage, index) => (
                  <div className={`tracking-stage ${index <= activeStage && secondsLeft > 0 ? 'is-active' : ''}`} key={stage}>
                    <span className="stage-node">{index < activeStage ? '✓' : `0${index + 1}`}</span><span>{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="order-items">
            <span>ON THE TICKET</span>
            {order.items.map((item) => <div className="order-item" key={item.id}><span>{String(item.quantity).padStart(2, '0')} × {item.name}</span><strong>₹{item.price * item.quantity}</strong></div>)}
          </div>
        </section>
      ) : (
        <>
          <section className="ticker" aria-label="Bite up highlights"><div className="ticker-track">{Array.from({ length: 3 }, (_, index) => <span key={index}>BIG FLAVOUR <b>✳</b> FRESH OFF THE FLAME <b>✳</b> ALL ROLL. NO RULES. <b>✳</b> MADE FRESH EVERY TIME <b>✳</b></span>)}</div></section>

          <section className="manifesto" id="story">
            <div className="manifesto-left"><div className="eyebrow"><span className="eyebrow-line" /> NOT YOUR AVERAGE ROLL</div><h2>WE DIDN’T<br />FOLLOW THE<br /><em>RECIPE.</em></h2></div>
            <div className="manifesto-right"><div className="manifesto-mark">B<span>U</span></div><p>We rolled up everything you love, turned the flavour all the way up, and made it our own. Crispy edges. Saucy middle. A little bit of chaos in every bite.</p><a href="#menu" className="text-link">MEET YOUR NEW OBSESSION <Icon name="arrow" size={16} /></a><div className="manifesto-side-note">THE JUMBO ROLL — SINCE DAY ONE</div></div>
            <div className="manifesto-number">01<span>/03</span></div>
          </section>

          <section className="menu-section" id="menu">
            <div className="menu-heading">
              <div><div className="eyebrow"><span className="eyebrow-line" /> THE GOOD STUFF</div><h2>MAKE IT A<br /><span>BITE-UP.</span></h2></div>
              <p>Big cravings, meet your match.<br />Everything’s made fresh. Nothing’s boring.</p>
            </div>
            <div className="featured-wrap">
              <div className="featured-image">
                <img src="https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=85" alt="Freshly rolled wrap with grilled filling" />
                <span className="featured-image-label">THE ONE THAT STARTED IT ALL</span>
                <span className="featured-image-index">01 — 04</span>
              </div>
              <div className="featured-copy">
                <div className="featured-topline"><span>THE BITE-UP ORIGINAL</span><span className="heat-label">✳ HOUSE FAVOURITE</span></div>
                <h3>The Legendary<br /><em>Jumbo Roll</em></h3>
                <p>Smoky chicken, punchy sauces, a little crunch — all wrapped up in a warm, toasted roll. It’s a lot. That’s the point.</p>
                <div className="featured-details"><span><b>01</b> BIG, BOLD BITE</span><span><b>02</b> ROLLED FRESH</span><span><b>03</b> GONE TOO SOON</span></div>
                <div className="featured-buy"><strong>₹199</strong><button className="button button-primary" onClick={() => addToCart('jumbo-original')}>ADD TO CART <Icon name="plus" size={17} /></button></div>
              </div>
            </div>
            <div className="menu-toolbar">
              <div className="menu-categories" aria-label="Filter by category">
                {['All', ...categories].map((category) => <button className={activeCategory === category ? 'category-pill active' : 'category-pill'} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}
              </div>
              <label className="search-box"><Icon name="search" size={18} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find your next favourite" aria-label="Search menu" /><span>↵</span></label>
            </div>
            <div className="menu-results"><span>SHOWING {visibleItems.length} OF {menuItems.length} BITES</span><span>MADE FRESH. ALWAYS.</span></div>
            {visibleItems.length ? <div className="menu-grid">
              {visibleItems.map((item, index) => (
                <article className={`menu-card ${item.category === 'Jumbo Roll Specials' ? 'jumbo-card' : ''}`} key={item.id}>
                  <div className="menu-card-image">
                    <img src={item.image} alt={item.name} loading={index > 3 ? 'lazy' : 'eager'} />
                    <span className="card-category">{item.category}</span>
                    <button className="quick-add" onClick={() => addToCart(item.id)} aria-label={`Add ${item.name} to cart`}><Icon name="plus" size={20} /></button>
                  </div>
                  <div className="menu-card-info"><div><h3>{item.name}</h3><p>{item.description}</p></div><div className="card-buy"><strong>₹{item.price}</strong><button onClick={() => addToCart(item.id)}>ADD <Icon name="plus" size={13} /></button></div></div>
                </article>
              ))}
            </div> : <div className="empty-menu">NO BITES FOUND. TRY ANOTHER SEARCH.</div>}
          </section>

          <section className="visit-section" id="visit">
            <div className="visit-stamp">BITE<br />UP<br /><span>✳</span></div>
            <div><div className="eyebrow"><span className="eyebrow-line" /> GOOD FOOD. GOOD MOOD.</div><h2>YOUR NEXT<br /><em>FAVOURITE</em><br />IS RIGHT HERE.</h2></div>
            <div className="visit-info"><span><Icon name="pin" size={18} /> FIND YOUR NEAREST BITE-UP</span><p>Come hungry. Leave happy.<br />The roll’s on us. (Well, on you.)</p><a className="button button-primary" href="#menu">PICK YOUR BITE <Icon name="arrow" size={17} /></a></div>
          </section>
        </>
      )}

      <footer className="site-footer"><a className="wordmark" href="#home">BITE<span>-UP</span><i>.</i></a><span>MADE WITH A LITTLE MORE BITE. © 2026 BITE-UP.</span><a href="#home">BACK TO TOP ↑</a></footer>

      {cartOpen && <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false) }}>
        <aside className="cart-drawer" aria-label="Your cart">
          <div className="drawer-head"><div><span className="eyebrow"><span className="eyebrow-line" /> YOUR ORDER</span><h2>THE GOOD<br /><em>STUFF.</em></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart"><Icon name="close" /></button></div>
          {cartItems.length ? <div className="drawer-items">
            {cartItems.map((item) => <div className="drawer-item" key={item.id}><img src={item.image} alt="" /><div className="drawer-item-info"><h3>{item.name}</h3><span>₹{item.price}</span><div className="quantity-control"><button onClick={() => updateQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}><Icon name="minus" size={14} /></button><span>{cart[item.id]}</span><button onClick={() => updateQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}><Icon name="plus" size={14} /></button></div></div><strong>₹{item.price * cart[item.id]}</strong></div>)}
          </div> : <div className="cart-empty"><span>✳</span><p>Your cart’s looking a little hungry.</p><button className="text-link" onClick={() => { setCartOpen(false); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }) }}>LET’S FIX THAT <Icon name="arrow" size={16} /></button></div>}
          <div className="drawer-bottom"><div className="subtotal"><span>SUBTOTAL</span><strong>₹{subtotal}</strong></div><span className="cart-disclaimer">Sample checkout only. No payment will be taken.</span><button className="button button-primary checkout-button" disabled={!itemCount} onClick={() => { setCartOpen(false); setCheckoutOpen(true) }}>CONTINUE TO CHECKOUT <Icon name="arrow" size={17} /></button></div>
        </aside>
      </div>}

      {checkoutOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCheckoutOpen(false) }}>
        <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
          <button className="icon-button modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><Icon name="close" /></button>
          <div className="eyebrow"><span className="eyebrow-line" /> SAMPLE CHECKOUT</div><h2 id="checkout-title">ONE LAST<br /><em>THING.</em></h2>
          <p>This is a demo checkout. No payment or personal details needed — just confirm your sample order.</p>
          <div className="checkout-summary">{cartItems.map((item) => <div key={item.id}><span>{cart[item.id]} × {item.name}</span><strong>₹{item.price * cart[item.id]}</strong></div>)}<div className="checkout-total"><span>TOTAL</span><strong>₹{subtotal}</strong></div></div>
          <button className="button button-primary checkout-button" onClick={placeOrder}>PLACE SAMPLE ORDER <Icon name="arrow" size={17} /></button>
        </section>
      </div>}
    </main>
  )
}

export default App
