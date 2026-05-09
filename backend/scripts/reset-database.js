import sequelize from '../src/database/sequelize.js';
import models from '../src/database/index.js';

const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting TiDB database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Drop all tables and recreate them
    console.log('💥 Dropping existing tables...');
    await sequelize.sync({ force: true });
    console.log('✅ Database reset complete - all tables recreated');

    // List all tables
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('📋 Available tables:', results.map(row => Object.values(row)[0]));

    console.log('🎉 Database reset complete!');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Run reset
if (import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase();
}

export default resetDatabase;
