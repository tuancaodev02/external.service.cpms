import { prisma } from '../src/database/prisma.client';

async function main() {
    console.log('🌱 Starting seed...');

    // Create roles sample
    console.log('📝 Creating roles...');
    const adminRole = await prisma.role.upsert({
        where: { role: 1 },
        update: {},
        create: {
            id: crypto.randomUUID(),
            title: 'Administrator',
            role: 1,
            description: 'Quản trị viên hệ thống',
        },
    });

    const userRole = await prisma.role.upsert({
        where: { role: 2 },
        update: {},
        create: {
            id: crypto.randomUUID(),
            title: 'User',
            role: 2,
            description: 'Người dùng thông thường',
        },
    });

    console.log('✅ Roles created:', { adminRole, userRole });

    // Tạo school mẫu
    console.log('🏫 Creating school...');
    const school = await prisma.school.upsert({
        where: { code: 'SCHOOL001' },
        update: {},
        create: {
            id: crypto.randomUUID(),
            title: 'Trường Đại Học Mẫu',
            code: 'SCHOOL001',
            address: '123 Đường Mẫu, Quận 1, TP.HCM',
            email: 'info@school.edu.vn',
            phone: '0123456789',
            description: 'Trường đại học mẫu cho hệ thống CPMS',
        },
    });

    console.log('✅ School created:', school);

    console.log('🎉 Seed completed successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Error seeding database:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
