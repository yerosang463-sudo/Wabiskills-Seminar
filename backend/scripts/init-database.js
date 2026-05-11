import sequelize from '../src/database/sequelize.js';
import models from '../src/database/index.js';

const initializeDatabase = async () => {
  try {
    console.log('🔌 Connecting to TiDB database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Sync all models (create tables)
    console.log('🏗️  Creating database tables...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database tables created/updated successfully');

    // List all tables
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('📋 Available tables:', results.map(row => Object.values(row)[0]));

    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Run initialization
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export default initializeDatabase;
