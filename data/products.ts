export interface BeverageProduct {
  id: number
  name: string
  description: string
  price: number
  stock: number
  image: string
  category: string
  volume: string
  isFeatured: boolean
  isOnSale: boolean
  isNew: boolean
  salePercent?: number
  createdAt: string
}

const raw: Omit<BeverageProduct, 'id'>[] = [
  // ── 1-20 (original) ────────────────────────────────────────
  { name: 'Sparkling Citrus Burst', description: 'Refreshing sparkling water infused with natural citrus extracts and a hint of lemon zest.', price: 3.99, stock: 120, image: '', category: 'Sparkling Water', volume: '330ml', isFeatured: true,  isOnSale: false, isNew: false, createdAt: '2026-04-10' },
  { name: 'Tropical Mango Smoothie', description: 'Creamy blend of ripe Carabao mangoes, banana, and passionfruit — no added sugar.', price: 5.49, stock: 80, image: '', category: 'Smoothie', volume: '500ml', isFeatured: true,  isOnSale: true,  isNew: false, salePercent: 15, createdAt: '2026-04-08' },
  { name: 'Cold Brew Coffee Classic', description: 'Slow-steeped Arabica beans brewed cold for 18 hours for a silky, bold flavor.', price: 6.99, stock: 60, image: '', category: 'Coffee', volume: '350ml', isFeatured: false, isOnSale: false, isNew: false, createdAt: '2026-03-20' },
  { name: 'Hibiscus Iced Tea', description: 'Brewed hibiscus flowers with a touch of honey and lime — perfectly chilled.', price: 4.29, stock: 95, image: '', category: 'Tea', volume: '400ml', isFeatured: false, isOnSale: true,  isNew: false, salePercent: 10, createdAt: '2026-03-15' },
  { name: 'Green Matcha Latte', description: 'Premium Japanese ceremonial grade matcha blended with oat milk and light agave.', price: 7.49, stock: 55, image: '', category: 'Latte', volume: '350ml', isFeatured: true,  isOnSale: false, isNew: true,  createdAt: '2026-04-14' },
  { name: 'Pineapple Coconut Refresher', description: 'Fresh pineapple juice mixed with young coconut water — tropical paradise in a bottle.', price: 5.99, stock: 70, image: '', category: 'Juice', volume: '450ml', isFeatured: false, isOnSale: false, isNew: false, createdAt: '2026-02-28' },
  { name: 'Strawberry Basil Lemonade', description: 'Hand-squeezed lemonade muddled with fresh strawberries and aromatic basil leaves.', price: 4.79, stock: 88, image: '', category: 'Lemonade', volume: '400ml', isFeatured: false, isOnSale: true,  isNew: false, salePercent: 20, createdAt: '2026-03-05' },
  { name: 'Espresso Tonic Fizz', description: 'Double-shot espresso poured over premium tonic water with a citrus twist.', price: 6.49, stock: 45, image: '', category: 'Coffee', volume: '300ml', isFeatured: false, isOnSale: false, isNew: true,  createdAt: '2026-04-15' },
  { name: 'Blue Butterfly Pea Tea', description: 'Stunning color-changing butterfly pea flower tea with hints of vanilla and pandan.', price: 5.29, stock: 3,  image: '', category: 'Tea', volume: '350ml', isFeatured: true,  isOnSale: false, isNew: true,  createdAt: '2026-04-16' },
  { name: 'Watermelon Mint Cooler', description: 'Freshly pressed watermelon juice with cooling spearmint and a squeeze of lime.', price: 4.99, stock: 90, image: '', category: 'Juice', volume: '450ml', isFeatured: false, isOnSale: false, isNew: false, createdAt: '2026-02-14' },
  { name: 'Caramel Oat Frappé', description: 'Blended cold coffee with creamy oat milk, house caramel syrup, and whipped foam.', price: 8.49, stock: 40, image: '', category: 'Frappé', volume: '500ml', isFeatured: true,  isOnSale: true,  isNew: false, salePercent: 12, createdAt: '2026-03-28' },
  { name: 'Ginger Turmeric Tonic', description: 'Immunity-boosting blend of fresh ginger, turmeric, black pepper, lemon, and honey.', price: 5.99, stock: 2,  image: '', category: 'Wellness Shot', volume: '250ml', isFeatured: false, isOnSale: false, isNew: false, createdAt: '2026-01-30' },
  { name: 'Ube Milk Tea', description: 'Creamy ube-flavored milk tea with chewy tapioca pearls — Filipino-inspired boba.', price: 6.29, stock: 100, image: '', category: 'Milk Tea', volume: '500ml', isFeatured: true,  isOnSale: false, isNew: true,  createdAt: '2026-04-12' },
  { name: 'Raspberry Rose Sparkling', description: 'Naturally carbonated water with real raspberry puree and delicate rose water.', price: 4.49, stock: 85, image: '', category: 'Sparkling Water', volume: '330ml', isFeatured: false, isOnSale: true,  isNew: false, salePercent: 8,  createdAt: '2026-03-10' },
  { name: 'Avocado Cacao Shake', description: 'Rich and indulgent creamy avocado blended with dark cacao and almond milk.', price: 7.99, stock: 35, image: '', category: 'Smoothie', volume: '450ml', isFeatured: false, isOnSale: false, isNew: false, createdAt: '2026-02-10' },
  { name: 'Salted Caramel Cold Brew', description: 'Signature cold brew topped with silky salted caramel cream and sea salt flakes.', price: 7.49, stock: 50, image: '', category: 'Coffee', volume: '400ml', isFeatured: true,  isOnSale: true,  isNew: false, salePercent: 18, createdAt: '2026-04-01' },
  { name: 'Coca-Cola Classic', description: 'The original refreshing cola. Crisp, cold, and a classic taste.', price: 1.99, stock: 350, image: '', category: 'Soda', volume: '330ml', isFeatured: true,  isOnSale: false, isNew: false, createdAt: '2026-04-10' },
  { name: 'Pepsi Cola', description: 'Bold and refreshing cola with a sweet citrus flavor finish.', price: 1.89, stock: 420, image: '', category: 'Soda', volume: '330ml', isFeatured: true,  isOnSale: true,  isNew: false, salePercent: 10, createdAt: '2026-04-09' },
  { name: 'Sprite', description: 'Crisp, refreshing, and clean-tasting lemon-lime soda.', price: 1.79, stock: 280, image: '', category: 'Soda', volume: '330ml', isFeatured: false, isOnSale: false, isNew: false, createdAt: '2026-03-25' },
  { name: 'Dr. Pepper', description: 'A signature blend of 23 iconic flavors in a chillingly cold can.', price: 2.19, stock: 150, image: '', category: 'Soda', volume: '330ml', isFeatured: true,  isOnSale: false, isNew: false, createdAt: '2026-03-20' },
  { name: 'Mountain Dew', description: 'Citrus-flavored electric soda charged for extreme energy.', price: 1.99, stock: 310, image: '', category: 'Soda', volume: '330ml', isFeatured: false, isOnSale: true,  isNew: false, salePercent: 15, createdAt: '2026-03-15' },
  { name: '7-Up', description: 'Clear, caffeine-free lemon-lime soda, perfectly crisp and clean.', price: 1.79, stock: 200, image: '', category: 'Soda', volume: '330ml', isFeatured: false, isOnSale: false, isNew: false, createdAt: '2026-02-28' },
  { name: 'Fanta Orange', description: 'Bright, bubbly, and instantly refreshing fruit-flavored orange soda.', price: 1.89, stock: 215, image: '', category: 'Soda', volume: '330ml', isFeatured: true,  isOnSale: false, isNew: false, createdAt: '2026-04-05' },
  { name: 'A&W Root Beer', description: 'Rich and creamy draft-style root beer made with aged vanilla.', price: 2.29, stock: 175, image: '', category: 'Soda', volume: '330ml', isFeatured: false, isOnSale: true,  isNew: false, salePercent: 10, createdAt: '2026-03-01' },
  { name: 'Canada Dry Ginger Ale', description: 'Made with real ginger for a soothing, crisp ginger flavor.', price: 2.09, stock: 260, image: '', category: 'Soda', volume: '330ml', isFeatured: false, isOnSale: false, isNew: false, createdAt: '2026-02-14' },
  { name: 'Crush Grape', description: 'Intense burst of fruity grape flavor in a sweet, fizzy soda.', price: 1.89, stock: 140, image: '', category: 'Soda', volume: '330ml', isFeatured: false, isOnSale: false, isNew: true,  createdAt: '2026-04-15' },
  { name: 'Mug Root Beer', description: 'Classic draft flavor with a rich, foamy head and sweet vanilla finish.', price: 1.99, stock: 190, image: '', category: 'Soda', volume: '330ml', isFeatured: false, isOnSale: false, isNew: true,  createdAt: '2026-04-12' },

]

export const products: BeverageProduct[] = raw.map((b, i) => ({ 
  ...b, 
  id: i + 1,
  image: `/${b.name}.jpg`
}))

export const categories = Array.from(new Set(products.map(p => p.category))).sort()