import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load environment variables
dotenv.config();

const addGoogleIdField = async () => {
  try {
    console.log('🔧 Adding googleId field to Users table...');

    // Parse DATABASE_URL
    const parseDbUrl = (url) => {
      const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (!match) {
        throw new Error('Invalid DATABASE_URL format');
      }
      return {
        username: match[1],
        password: match[2],
        host: match[3],
        port: parseInt(match[4], 10),
        database: match[5],
      };
    };

    const dbConfig = parseDbUrl(process.env.DATABASE_URL);

    // Create Sequelize instance
    const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: 'mysql',
      logging: console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });

    await sequelize.authenticate();

    // Check if googleId column already exists
    const [columns] = await sequelize.query("SHOW COLUMNS FROM Users LIKE 'googleId'");
    
    if (columns.length > 0) {
      console.log('✅ googleId field already exists in Users table');
      await sequelize.close();
      return;
    }

    // Add googleId column
    console.log('📝 Adding googleId column to Users table...');
    await sequelize.query(`
      ALTER TABLE Users 
      ADD COLUMN googleId VARCHAR(100) AFTER email
    `);

    console.log('✅ googleId field added successfully!');

    // Add UNIQUE index separately
    console.log('📝 Adding UNIQUE index to googleId column...');
    await sequelize.query(`
      CREATE UNIQUE INDEX idx_googleId ON Users (googleId)
    `);

    console.log('✅ UNIQUE index added to googleId field!');

    // Verify the column was added
    const [updatedColumns] = await sequelize.query("SHOW COLUMNS FROM Users");
    console.log('📋 Updated Users table structure:');
    updatedColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    await sequelize.close();
    console.log('🎉 Database schema update complete!');

  } catch (error) {
    console.error('❌ Error adding googleId field:', error);
    process.exit(1);
  }
};

addGoogleIdField();
