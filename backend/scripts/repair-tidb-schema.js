import dotenv from 'dotenv';
import sequelize from '../src/database/sequelize.js';
import { ensureRoomsIdCompatible, findExistingTable, runStartupMigrations } from '../src/database/migrations.js';

dotenv.config();

const showColumn = (column) => ({
  field: column.Field,
  type: column.Type,
  null: column.Null,
  key: column.Key,
  default: column.Default,
  extra: column.Extra,
});

const main = async () => {
  console.log('Checking TiDB schema for meeting creation...');

  await sequelize.authenticate();
  console.log('TiDB connection OK.');

  const queryInterface = sequelize.getQueryInterface();
  const { tableName } = await findExistingTable(queryInterface, ['Rooms', 'rooms']);

  if (!tableName) {
    throw new Error('Rooms table was not found.');
  }

  const [beforeColumns] = await sequelize.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE 'id'`);
  console.log('Rooms.id before:', showColumn(beforeColumns[0]));

  const result = await ensureRoomsIdCompatible(sequelize, tableName);
  console.log(result.changed ? 'Repair applied.' : 'Repair not needed.', result.reason);

  await runStartupMigrations(sequelize);

  const [afterColumns] = await sequelize.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE 'id'`);
  console.log('Rooms.id after:', showColumn(afterColumns[0]));

  const type = String(afterColumns[0]?.Type || '').toLowerCase();
  const extra = String(afterColumns[0]?.Extra || '').toLowerCase();
  const isCompatible = type.includes('char') || type.includes('varchar') || extra.includes('auto_increment');

  if (!isCompatible) {
    throw new Error('Rooms.id is neither UUID-compatible nor AUTO_INCREMENT.');
  }

  console.log('TiDB Rooms table is ready for meeting creation.');
};

main()
  .catch((error) => {
    console.error('TiDB schema repair failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
