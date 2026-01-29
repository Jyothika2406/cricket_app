/**
 * One-time setup script to create the first admin user
 * 
 * Usage:
 * 1. Set the ADMIN_EMAIL environment variable or modify the email below
 * 2. Run: node scripts/create-first-admin.js
 * 
 * SECURITY NOTE: Delete this script after creating the first admin
 */

const mongoose = require('mongoose');
const readline = require('readline');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cricket_app';

// User Schema (minimal version for this script)
const UserSchema = new mongoose.Schema({
    email: String,
    role: String,
});

async function createFirstAdmin() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

    console.log('\n🔐 First Admin Setup\n');
    console.log('⚠️  WARNING: This script should only be run once to create the first admin.');
    console.log('⚠️  Delete this script after use for security!\n');

    const email = await question('Enter the email of the user to make admin: ');
    
    if (!email || !email.includes('@')) {
        console.log('❌ Invalid email address');
        rl.close();
        process.exit(1);
    }

    const confirm = await question(`\nMake "${email}" an admin? (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ Cancelled');
        rl.close();
        process.exit(0);
    }

    try {
        console.log('\n📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            console.log(`❌ User with email "${email}" not found.`);
            console.log('   Please register this user first, then run this script again.');
            rl.close();
            await mongoose.disconnect();
            process.exit(1);
        }

        // Check if already admin
        if (user.role === 'admin') {
            console.log(`ℹ️  User "${email}" is already an admin.`);
            rl.close();
            await mongoose.disconnect();
            process.exit(0);
        }

        // Update to admin
        await User.findByIdAndUpdate(user._id, { role: 'admin' });
        
        console.log(`\n✅ Success! "${email}" is now an admin.`);
        console.log('\n🔒 SECURITY REMINDER:');
        console.log('   1. Delete this script now: rm scripts/create-first-admin.js');
        console.log('   2. Future admins should be promoted via the admin panel.\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
        await mongoose.disconnect();
        process.exit(0);
    }
}

createFirstAdmin();
