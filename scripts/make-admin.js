const mongoose = require('mongoose');

const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/make-admin.js <email>');
  process.exit(1);
}

mongoose.connect('mongodb://127.0.0.1:27017/cricket_app').then(async () => {
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: email },
    { $set: { role: 'admin' } }
  );
  
  if (result.matchedCount > 0) {
    console.log('✅ Admin role granted to:', email);
  } else {
    console.log('❌ User not found:', email);
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
