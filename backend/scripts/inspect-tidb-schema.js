import dotenv from 'dotenv';
import sequelize from '../src/database/sequelize.js';

dotenv.config();

const main = async () => {
  await sequelize.authenticate();
  console.log('TiDB connection OK.');

  for (const tableName of ['Users', 'Rooms', 'Messages']) {
    const [columns] = await sequelize.query(`SHOW COLUMNS FROM \`${tableName}\``);
    console.log(`\n${tableName} columns:`);
    columns.forEach((column) => {
      console.log(
        `- ${column.Field}: ${column.Type}; key=${column.Key || '-'}; null=${column.Null}; default=${column.Default ?? 'NULL'}; extra=${column.Extra || '-'}`,
      );
    });
  }

  const [foreignKeys] = await sequelize.query(`
    SELECT
      TABLE_NAME,
      COLUMN_NAME,
      CONSTRAINT_NAME,
      REFERENCED_TABLE_NAME,
      REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY TABLE_NAME, COLUMN_NAME
  `);

  console.log('\nForeign keys:');
  foreignKeys.forEach((fk) => {
    console.log(
      `- ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} (${fk.CONSTRAINT_NAME})`,
    );
  });

  await sequelize.close();
};

main().catch(async (error) => {
  console.error('TiDB schema inspection failed:', error.message);
  await sequelize.close();
  process.exitCode = 1;
});
