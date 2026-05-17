import { DataTypes } from 'sequelize';

const quoteIdentifier = (value) => `\`${String(value).replace(/`/g, '``')}\``;

export const findExistingTable = async (queryInterface, tableNames) => {
  for (const tableName of tableNames) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const columns = await queryInterface.describeTable(tableName);
      return { tableName, columns };
    } catch {
      // Try the next candidate; production databases may vary in casing.
    }
  }

  return { tableName: null, columns: null };
};

export const ensureRoomsIdCompatible = async (sequelize, tableName = 'Rooms') => {
  // SQLite doesn't support SHOW COLUMNS; skip ID migration for SQLite databases
  if (sequelize.options.dialect === 'sqlite') {
    return {
      changed: false,
      reason: `${tableName} skipped ID check (SQLite uses PRAGMA instead)`,
    };
  }

  const quotedTableName = quoteIdentifier(tableName);
  const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${quotedTableName} LIKE 'id'`);
  const idColumn = columns?.[0];

  if (!idColumn) {
    return {
      changed: false,
      reason: `${tableName}.id does not exist`,
    };
  }

  const rawType = String(idColumn.Type || '').toLowerCase();
  if (rawType.includes('char') || rawType.includes('varchar')) {
    return {
      changed: false,
      reason: `${tableName}.id uses UUID-compatible ${idColumn.Type}; the application will provide UUID values`,
    };
  }

  const extra = String(idColumn.Extra || '').toLowerCase();
  if (extra.includes('auto_increment')) {
    return {
      changed: false,
      reason: `${tableName}.id already has AUTO_INCREMENT`,
    };
  }

  const integerType = rawType.includes('bigint') ? 'BIGINT' : 'INT';
  const unsigned = rawType.includes('unsigned') ? ' UNSIGNED' : '';

  await sequelize.query(
    `ALTER TABLE ${quotedTableName} MODIFY COLUMN \`id\` ${integerType}${unsigned} NOT NULL AUTO_INCREMENT`,
  );

  return {
    changed: true,
    reason: `${tableName}.id was updated to AUTO_INCREMENT`,
  };
};

export const runStartupMigrations = async (sequelize) => {
  const queryInterface = sequelize.getQueryInterface();
  const isSQLite = sequelize.options.dialect === 'sqlite';
  const userResult = await findExistingTable(queryInterface, ['Users', 'users']);

  if (userResult.tableName && userResult.columns) {
    const { tableName, columns } = userResult;
    const hasGoogleId = Boolean(columns.googleId || columns.googleid);
    const hasGoogleIdd = Boolean(columns.googleIdd || columns.googleidd);

    if (!hasGoogleId) {
      try {
        // SQLite cannot add UNIQUE constraint to existing columns with NULL values
        // Only add the constraint for non-SQLite databases
        await queryInterface.addColumn(tableName, 'googleId', {
          type: DataTypes.STRING,
          allowNull: true,
          unique: !isSQLite, // Skip UNIQUE for SQLite migrations
        });
      } catch (error) {
        if (!error.message.includes('duplicate column name')) {
          throw error;
        }
      }
    }

    if (!hasGoogleIdd) {
      try {
        // SQLite cannot add UNIQUE constraint to existing columns with NULL values
        // Only add the constraint for non-SQLite databases
        await queryInterface.addColumn(tableName, 'googleIdd', {
          type: DataTypes.STRING,
          allowNull: true,
          unique: !isSQLite, // Skip UNIQUE for SQLite migrations
        });
      } catch (error) {
        if (!error.message.includes('duplicate column name')) {
          throw error;
        }
      }
    }

    if (!columns.avatar && !columns.Avatar) {
      try {
        await queryInterface.addColumn(tableName, 'avatar', {
          type: DataTypes.STRING,
          allowNull: true,
        });
      } catch (error) {
        if (!error.message.includes('duplicate column name')) {
          throw error;
        }
      }
    }

    if (!columns.plan && !columns.Plan) {
      try {
        await queryInterface.addColumn(tableName, 'plan', {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: 'free',
        });
      } catch (error) {
        if (!error.message.includes('duplicate column name')) {
          throw error;
        }
      }
    }
  }

  // Skip Rooms migrations for SQLite to avoid compatibility issues
  if (isSQLite) {
    return;
  }

  const roomResult = await findExistingTable(queryInterface, ['Rooms', 'rooms']);

  if (roomResult.tableName && roomResult.columns) {
    const { tableName, columns } = roomResult;

    await ensureRoomsIdCompatible(sequelize, tableName);

    if (!columns.title) {
      try {
        await queryInterface.addColumn(tableName, 'title', {
          type: DataTypes.STRING(100),
          allowNull: true,
        });
      } catch (error) {
        if (!error.message.includes('duplicate column name')) {
          throw error;
        }
      }
    }

    if (!columns.isActive) {
      try {
        await queryInterface.addColumn(tableName, 'isActive', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        });
      } catch (error) {
        if (!error.message.includes('duplicate column name')) {
          throw error;
        }
      }
    }

    if (!columns.maxParticipants) {
      try {
        await queryInterface.addColumn(tableName, 'maxParticipants', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 50,
        });
      } catch (error) {
        if (!error.message.includes('duplicate column name')) {
          throw error;
        }
      }
    }
  }
};
