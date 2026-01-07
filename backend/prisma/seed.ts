import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('tammi', 10);

  const adminUser = await prisma.user.upsert({
    where: { username: 'tammi' },
    update: {
      password: hashedPassword,
    },
    create: {
      username: 'tammi',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Administrador Tammi',
    },
  });

  // Delete old admin if exists
  try {
    await prisma.user.delete({ where: { username: 'admin' } });
  } catch (e) {
    // Ignore error if admin doesn't exist
  }

  console.log('✅ Admin user created:', adminUser);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);

  const regularUser = await prisma.user.upsert({
    where: { username: 'usuario' },
    update: {},
    create: {
      username: 'usuario',
      password: userPassword,
      role: 'USER',
      name: 'Personal Médico',
    },
  });

  console.log('✅ Regular user created:', regularUser);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });