import { Sequelize } from 'sequelize';
import config from '../config/config.js';

let sequelize;

// Determine if we're in test mode or development without MySQL
const isTestMode = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
const useSQLite = process.env.USE_SQLITE === 'true' || process.env.NODE_ENV === 'development';

if (isTestMode || useSQLite) {
  // Use SQLite for testing or development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: config.nodeEnv === 'development' ? console.log : false,
  });
} else {
  // Parse DATABASE_URL for MySQL connection
  // Format: mysql://user:password@host:port/database
  const parseDbUrl = (url) => {
    const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) {
      throw new Error('Invalid DATABASE_URL format. Use mysql://user:password@host:port/database');
    }
    return {
      username: match[1],
      password: match[2],
      host: match[3],
      port: parseInt(match[4], 10),
      database: match[5],
    };
  };

  const dbConfig = parseDbUrl(config.database.url);

  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: config.nodeEnv === 'development' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
}

export default sequelize;
