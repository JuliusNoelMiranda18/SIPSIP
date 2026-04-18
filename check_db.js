const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.count().then(c => {
  console.log('Product count:', c);
  return prisma.$disconnect();
}).catch(e => {
  console.error(e);
  return prisma.$disconnect();
});
