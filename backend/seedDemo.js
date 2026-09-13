import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import User from './models/userModel.js';
import Income from './models/incomeModel.js';
import Expense from './models/expenseModel.js';

const DEMO_USERS = [
  {
    name: 'ArthSetu Demo User',
    email: 'demo@arthsetu.ai',
    password: 'demoPassword123',
  },
  {
    name: 'Demo User (Legacy)',
    email: 'demo@expenseai.com',
    password: 'demoPassword123',
  },
];

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is missing in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    for (const demoUser of DEMO_USERS) {
      let user = await User.findOne({ email: demoUser.email });
      const hashedPassword = await bcrypt.hash(demoUser.password, 10);

      if (user) {
        user.password = hashedPassword;
        user.name = demoUser.name;
        await user.save();
        console.log(`User ${demoUser.email} updated.`);
      } else {
        user = await User.create({
          name: demoUser.name,
          email: demoUser.email,
          password: hashedPassword,
        });
        console.log(`User ${demoUser.email} created.`);
      }

      // Check if sample data exists for this user
      const incomeCount = await Income.countDocuments({ userId: user._id });
      const expenseCount = await Expense.countDocuments({ userId: user._id });

      if (incomeCount === 0) {
        const sampleIncomes = [
          {
            description: 'Monthly Salary',
            amount: 85000,
            category: 'Salary',
            date: new Date(),
            userId: user._id,
          },
          {
            description: 'Freelance Advisory & Consulting',
            amount: 24000,
            category: 'Freelance',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            userId: user._id,
          },
          {
            description: 'Mutual Fund & Stock Dividends',
            amount: 6500,
            category: 'Investment',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            userId: user._id,
          },
        ];
        await Income.insertMany(sampleIncomes);
        console.log(`Sample income records added for ${demoUser.email}.`);
      }

      if (expenseCount === 0) {
        const sampleExpenses = [
          {
            description: 'Apartment Lease & Maintenance',
            amount: 24000,
            category: 'Housing & Rent',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            userId: user._id,
          },
          {
            description: 'Organic Groceries & Produce',
            amount: 7200,
            category: 'Groceries',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            userId: user._id,
          },
          {
            description: 'High-speed Fiber & Cloud Utilities',
            amount: 2800,
            category: 'Utilities',
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            userId: user._id,
          },
          {
            description: 'Weekend Dining & Gatherings',
            amount: 4500,
            category: 'Food & Dining',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            userId: user._id,
          },
          {
            description: 'Fuel & EV Charging',
            amount: 3100,
            category: 'Transportation',
            date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            userId: user._id,
          },
        ];
        await Expense.insertMany(sampleExpenses);
        console.log(`Sample expense records added for ${demoUser.email}.`);
      }
    }

    console.log('\n=======================================');
    console.log('ARTHSETU AI DEMO CREDENTIALS:');
    console.log('Email:    demo@arthsetu.ai');
    console.log('Password: demoPassword123');
    console.log('=======================================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo user:', error);
    process.exit(1);
  }
}

seed();
