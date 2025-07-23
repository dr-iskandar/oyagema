import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  try {
    console.log('🔐 Creating Admin User for Oyagema');
    console.log('=====================================\n');

    const name = await askQuestion('Enter admin name: ');
    const email = await askQuestion('Enter admin email: ');
    const password = await askQuestion('Enter admin password: ');

    // Validate input
    if (!name || !email || !password) {
      console.error('❌ All fields are required!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters long!');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error('❌ User with this email already exists!');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      }
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`🆔 ID: ${admin.id}`);
    console.log('\n🎉 You can now login to the admin panel!');
    console.log('🌐 Admin Login URL: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

createAdmin();