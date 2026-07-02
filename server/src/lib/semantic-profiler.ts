import { ConnectorFactory, ConnectionConfig } from './connectors/factory.js';

export interface SemanticSchema {
  tables: {
    tableName: string;
    columns: { name: string; type: string; isPrimaryKey: boolean }[];
    foreignKeys: { column: string; referencesTable: string; referencesColumn: string }[];
  }[];
}

interface TableMapEntry {
  tableName: string;
  columnsMap: Map<string, { name: string; type: string; isPrimaryKey: boolean }>;
  foreignKeys: { column: string; referencesTable: string; referencesColumn: string }[];
}

/**
 * Connects to the customer's database and profiles its tables, columns, types,
 * primary keys, and foreign keys. Maps them into a clean JSON dictionary for LLM context.
 * 
 * @param config ConnectionConfig containing dialect and decrypted connection string.
 * @returns SemanticSchema payload representing the database schema.
 */
export async function profileSchema(config: ConnectionConfig): Promise<SemanticSchema> {
  const tableMap = new Map<string, TableMapEntry>();

  if (config.dialect === 'postgres') {
    // 1. Query PostgreSQL Columns and Types (including Primary Key detection)
    const columnsQuery = `
      SELECT 
        c.table_name, 
        c.column_name, 
        c.data_type,
        CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN TRUE ELSE FALSE END as is_primary_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT kcu.table_name, kcu.column_name, tc.constraint_type
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.table_constraints tc 
          ON kcu.constraint_name = tc.constraint_name 
          AND kcu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY' AND kcu.table_schema = 'public'
      ) tc ON c.table_name = tc.table_name AND c.column_name = tc.column_name
      WHERE c.table_schema = 'public'
      ORDER BY c.table_name, c.ordinal_position;
    `;

    // 2. Query PostgreSQL Foreign Keys
    const foreignKeysQuery = `
      SELECT
          kcu.table_name AS source_table,
          kcu.column_name AS source_column,
          ccu.table_name AS target_table,
          ccu.column_name AS target_column
      FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    `;

    await ConnectorFactory.runQuery(config, async (client) => {
      const colResult = await client.query(columnsQuery);
      const fkResult = await client.query(foreignKeysQuery);

      // Process columns
      for (const row of colResult.rows) {
        const tName = row.table_name;
        const colName = row.column_name;
        const colType = row.data_type;
        const isPk = row.is_primary_key === true || row.is_primary_key === 'true';

        if (!tableMap.has(tName)) {
          tableMap.set(tName, {
            tableName: tName,
            columnsMap: new Map(),
            foreignKeys: []
          });
        }

        const tableEntry = tableMap.get(tName)!;
        if (!tableEntry.columnsMap.has(colName)) {
          tableEntry.columnsMap.set(colName, {
            name: colName,
            type: colType,
            isPrimaryKey: isPk
          });
        }
      }

      // Process foreign keys
      for (const row of fkResult.rows) {
        const srcTable = row.source_table;
        const srcCol = row.source_column;
        const tgtTable = row.target_table;
        const tgtCol = row.target_column;

        if (srcTable && srcCol && tgtTable && tgtCol) {
          const tableEntry = tableMap.get(srcTable);
          if (tableEntry) {
            tableEntry.foreignKeys.push({
              column: srcCol,
              referencesTable: tgtTable,
              referencesColumn: tgtCol
            });
          }
        }
      }
    });

  } else if (config.dialect === 'mysql') {
    // 1. Query MySQL Columns and Types (including Primary Key detection)
    const columnsQuery = `
      SELECT 
        table_name, 
        column_name, 
        data_type,
        CASE WHEN column_key = 'PRI' THEN TRUE ELSE FALSE END as is_primary_key
      FROM information_schema.columns 
      WHERE table_schema = DATABASE()
      ORDER BY table_name, ordinal_position;
    `;

    // 2. Query MySQL Foreign Keys
    const foreignKeysQuery = `
      SELECT 
        table_name AS source_table,
        column_name AS source_column,
        referenced_table_name AS target_table,
        referenced_column_name AS target_column
      FROM information_schema.key_column_usage
      WHERE table_schema = DATABASE()
        AND referenced_table_name IS NOT NULL;
    `;

    await ConnectorFactory.runQuery(config, async (client) => {
      // mysql2/promise client query returns [rows, fields]
      const [colRows] = await client.query(columnsQuery);
      const [fkRows] = await client.query(foreignKeysQuery);

      const colArray = colRows as any[];
      const fkArray = fkRows as any[];

      // Process columns
      for (const row of colArray) {
        // MySQL column names might be returned uppercase depending on DB settings, but inf_schema is case-insensitive
        const tName = row.table_name || row.TABLE_NAME;
        const colName = row.column_name || row.COLUMN_NAME;
        const colType = row.data_type || row.DATA_TYPE;
        const isPk = !!(row.is_primary_key || row.IS_PRIMARY_KEY);

        if (!tableMap.has(tName)) {
          tableMap.set(tName, {
            tableName: tName,
            columnsMap: new Map(),
            foreignKeys: []
          });
        }

        const tableEntry = tableMap.get(tName)!;
        if (!tableEntry.columnsMap.has(colName)) {
          tableEntry.columnsMap.set(colName, {
            name: colName,
            type: colType,
            isPrimaryKey: isPk
          });
        }
      }

      // Process foreign keys
      for (const row of fkArray) {
        const srcTable = row.source_table || row.SOURCE_TABLE;
        const srcCol = row.source_column || row.SOURCE_COLUMN;
        const tgtTable = row.target_table || row.TARGET_TABLE;
        const tgtCol = row.target_column || row.TARGET_COLUMN;

        if (srcTable && srcCol && tgtTable && tgtCol) {
          const tableEntry = tableMap.get(srcTable);
          if (tableEntry) {
            tableEntry.foreignKeys.push({
              column: srcCol,
              referencesTable: tgtTable,
              referencesColumn: tgtCol
            });
          }
        }
      }
    });

  } else {
    throw new Error(`Unsupported profiling dialect: ${(config as any).dialect}`);
  }

  // Assemble final output
  const tables = Array.from(tableMap.values()).map(entry => ({
    tableName: entry.tableName,
    columns: Array.from(entry.columnsMap.values()),
    foreignKeys: entry.foreignKeys
  }));

  return { tables };
}
