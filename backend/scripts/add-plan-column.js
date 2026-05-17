import sequelize from '../src/database/sequelize.js';

async function addPlanColumn() {
  try {
    console.log('🔧 Adding plan column to Users table...');

    const queryInterface = sequelize.getQueryInterface();
    
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('Users');
    
    if (tableDescription.plan) {
      console.log('✅ Plan column already exists!');
      process.exit(0);
    }

    // Add the plan column
    await sequelize.query(`
      ALTER TABLE Users 
      ADD COLUMN plan VARCHAR(255) NULL DEFAULT 'free'
    `);

    console.log('✅ Successfully added plan column to Users table!');
    
    // Verify the column was added
    const updatedDescription = await queryInterface.describeTable('Users');
    console.log('\n📋 Updated Users table structure:');
    Object.keys(updatedDescription).forEach(column => {
      console.log(`  - ${column}: ${updatedDescription[column].type}`);
    });

  } catch (error) {
    console.error('❌ Error adding plan column:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addPlanColumn();
