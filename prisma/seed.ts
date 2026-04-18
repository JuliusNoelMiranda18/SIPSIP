import { PrismaClient } from '@prisma/client'
import { products } from '../data/products'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  // Clear data
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const john = await prisma.user.create({ data: { email: 'john@shop.com', name: 'John Doe' } })
  const jane = await prisma.user.create({ data: { email: 'jane@shop.com', name: 'Jane Smith' } })

  // Create products with dummy reviews
  for (const prod of products) {
    const numReviews = Math.floor(Math.random() * 5) + 3 // 3 to 7 reviews
    let sum = 0
    const reviewsToCreate = []

    for (let i = 0; i < numReviews; i++) {
        // Bias ratings: 60% chance of 4 or 5 stars, 40% chance of 1, 2, or 3
        const rating = Math.random() > 0.4 ? (Math.floor(Math.random() * 2) + 4) : (Math.floor(Math.random() * 3) + 1)
        sum += rating
        reviewsToCreate.push({ rating, comment: 'Great beverage! Highly recommended.' })
    }

    const averageRating = sum / numReviews

    // Remove static `id` to let DB auto-increment sequence avoid conflicts later, or keep it. 
    // Usually it's safer to strip the static id.
    const { id, createdAt, ...dataWithoutId } = prod

    await prisma.product.create({
      data: {
        ...dataWithoutId,
        createdAt: new Date(createdAt), // Convert string to Date
        averageRating,
        reviews: {
          create: reviewsToCreate,
        }
      }
    })
  }

  // Create carts
  await prisma.cart.create({ data: { userId: john.id } })
  await prisma.cart.create({ data: { userId: jane.id } })

  console.log('Seeded!')
}

main().finally(() => prisma.$disconnect())


