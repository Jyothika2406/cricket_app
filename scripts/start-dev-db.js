const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

async function startDatabase() {
    console.log('🚀 Starting MongoDB Memory Server...');
    
    const mongod = await MongoMemoryServer.create({
        instance: {
            port: 27017,
            dbName: 'cricket_app',
        },
    });

    const uri = mongod.getUri();
    console.log('✅ MongoDB Memory Server started!');
    console.log(`📦 Connection URI: ${uri}`);
    console.log('\n💡 Update your .env.local with:');
    console.log(`MONGODB_URI=${uri}cricket_app`);
    
    // Update .env.local automatically
    const envPath = path.join(__dirname, '..', '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(
        /MONGODB_URI=.*/,
        `MONGODB_URI=${uri}cricket_app`
    );
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env.local updated automatically!');
    console.log('\n⚠️  Keep this terminal running while developing.');
    console.log('Press Ctrl+C to stop the database.\n');

    // Keep the process running
    process.on('SIGINT', async () => {
        console.log('\n🛑 Stopping MongoDB Memory Server...');
        await mongod.stop();
        console.log('👋 Goodbye!');
        process.exit(0);
    });
}

startDatabase().catch(console.error);
