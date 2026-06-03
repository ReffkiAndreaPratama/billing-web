import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create branch
  const branch = await prisma.branch.upsert({
    where: { id: 'branch-1' },
    update: {},
    create: {
      id: 'branch-1',
      name: 'Main Branch',
      address: 'Jl. Gaming No. 1',
      phone: '08123456789',
      city: 'Jakarta',
    },
  });

  // Create users
  const password = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password,
      name: 'Admin Utama',
      role: 'SUPERADMIN',
      branchId: branch.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'kasir1' },
    update: {},
    create: {
      username: 'kasir1',
      password,
      name: 'Kasir Satu',
      role: 'KASIR',
      branchId: branch.id,
    },
  });

  // Create units
  const units = [
    { name: 'PC-01', code: 'PC01', type: 'PC', hourlyRate: 5000, positionX: 0, positionY: 0 },
    { name: 'PC-02', code: 'PC02', type: 'PC', hourlyRate: 5000, positionX: 1, positionY: 0 },
    { name: 'PC-03', code: 'PC03', type: 'PC', hourlyRate: 5000, positionX: 2, positionY: 0 },
    { name: 'PC-04', code: 'PC04', type: 'PC', hourlyRate: 5000, positionX: 3, positionY: 0 },
    { name: 'PC-05', code: 'PC05', type: 'PC', hourlyRate: 7000, positionX: 0, positionY: 1 },
    { name: 'PC-06', code: 'PC06', type: 'PC', hourlyRate: 7000, positionX: 1, positionY: 1 },
    { name: 'PS5-01', code: 'PS501', type: 'PS5', hourlyRate: 15000, positionX: 2, positionY: 1 },
    { name: 'PS5-02', code: 'PS502', type: 'PS5', hourlyRate: 15000, positionX: 3, positionY: 1 },
    { name: 'VIP-01', code: 'VIP01', type: 'ROOM_VIP', hourlyRate: 25000, vipRate: 25000, positionX: 0, positionY: 2, width: 2 },
    { name: 'VIP-02', code: 'VIP02', type: 'ROOM_VVIP', hourlyRate: 40000, vipRate: 40000, positionX: 2, positionY: 2, width: 2 },
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: {},
      create: {
        ...unit,
        branchId: branch.id,
        status: 'AVAILABLE',
      },
    });
  }

  // Create packages
  const packages = [
    { name: '1 Jam', duration: 60, price: 5000, type: 'PC' },
    { name: '2 Jam', duration: 120, price: 9000, type: 'PC' },
    { name: '3 Jam', duration: 180, price: 12000, type: 'PC' },
    { name: '5 Jam', duration: 300, price: 20000, type: 'PC' },
    { name: 'Midnight (22-06)', duration: 480, price: 25000, type: 'PC' },
    { name: 'PS5 1 Jam', duration: 60, price: 15000, type: 'PS5' },
    { name: 'PS5 2 Jam', duration: 120, price: 25000, type: 'PS5' },
    { name: 'VIP 1 Jam', duration: 60, price: 25000, type: 'ROOM_VIP' },
    { name: 'VIP 3 Jam', duration: 180, price: 60000, type: 'ROOM_VIP' },
  ];

  for (const pkg of packages) {
    await prisma.package.create({ data: pkg });
  }

  // Create sample member
  await prisma.member.upsert({
    where: { phone: '081234567890' },
    update: {},
    create: {
      code: 'MBR-00001',
      name: 'Budi Santoso',
      phone: '081234567890',
      balance: 100000,
      tier: 'GOLD',
      branchId: branch.id,
    },
  });

  // Create branch settings
  await prisma.branchSetting.upsert({
    where: { branchId: branch.id },
    update: {},
    create: {
      branchId: branch.id,
      taxRate: 11,
      currency: 'IDR',
      timezone: 'Asia/Jakarta',
    },
  });

  console.log('✅ Seed completed!');
  console.log('   Login: admin / admin123');
  console.log('   Units: 10 unit created');
  console.log('   Packages: 9 package created');
  console.log('   Member: Budi Santoso (balance: Rp100,000)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
