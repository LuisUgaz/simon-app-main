import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

// Configuración de la base de datos
export const DATABASE_CONFIG = {
  name: 'simon_monitoring.db',
  version: '1.0',
  displayName: 'SIMON Monitoring Database',
  size: 200000, // 200KB inicial
};

// Esquemas de tablas
export const CREATE_TABLES = {
  MONITORING_DATA: `
    CREATE TABLE IF NOT EXISTS monitoring_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      sample_id TEXT NOT NULL,
      visit_answer_id TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      data_size INTEGER NOT NULL DEFAULT 0,
      session_metadata TEXT,
      last_synced_at TEXT,
      UNIQUE(sample_id, visit_answer_id)
    );
  `,

  MONITORING_DATA_INDEX: `
    CREATE INDEX IF NOT EXISTS idx_monitoring_sample_visit 
    ON monitoring_data(sample_id, visit_answer_id);
  `,

  MONITORING_DATA_SYNC_INDEX: `
    CREATE INDEX IF NOT EXISTS idx_monitoring_sync_status 
    ON monitoring_data(sync_status);
  `,

  MONITORING_DATA_DATE_INDEX: `
    CREATE INDEX IF NOT EXISTS idx_monitoring_created_at 
    ON monitoring_data(created_at);
  `,

  OFFLINE_FILES: `
    CREATE TABLE IF NOT EXISTS offline_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sample_id TEXT NOT NULL,
      visit_answer_id TEXT NOT NULL,
      aspect_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      codigo_item TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      local_file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_extension TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      temp_code TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      server_document_code TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(sample_id, visit_answer_id, aspect_id, item_id, codigo_item)
    );
  `,

  OFFLINE_FILES_INDEX: `
    CREATE INDEX IF NOT EXISTS idx_offline_files_sample_visit 
    ON offline_files(sample_id, visit_answer_id);
  `,

  OFFLINE_FILES_SYNC_INDEX: `
    CREATE INDEX IF NOT EXISTS idx_offline_files_sync_status 
    ON offline_files(sync_status);
  `,
};

// Configurar SQLite
export const configureSQLite = () => {
  SQLite.DEBUG(false);
  SQLite.enablePromise(true);
};

// Obtener conexión a la base de datos
export const getDatabaseConnection = async (): Promise<SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabase(DATABASE_CONFIG);
    console.log('✅ Conexión a base de datos SQLite establecida');
    return db;
  } catch (error) {
    console.error('❌ Error al conectar con SQLite:', error);
    throw new Error(`Error al conectar con la base de datos: ${error}`);
  }
};

// Inicializar base de datos con tablas
export const initializeDatabase = async (): Promise<SQLiteDatabase> => {
  try {
    const db = await getDatabaseConnection();

    // Crear tablas principales
    /* 
       ANTES: 
       await db.executeSql(CREATE_TABLES.MONITORING_DATA);
       await db.executeSql(CREATE_TABLES.OFFLINE_FILES);
       DESPUÉS:
       Se agrega [] como segundo argumento para evitar errores de enlace (bind) en Android cuando no hay parámetros.
    */
    await db.executeSql(CREATE_TABLES.MONITORING_DATA, []);
    await db.executeSql(CREATE_TABLES.OFFLINE_FILES, []);
    console.log('✅ Tablas principales creadas/verificadas');

    // Crear índices
    /* 
       ANTES:
       await db.executeSql(CREATE_TABLES.MONITORING_DATA_INDEX);
       ... (varias llamadas sin [])
       await db.executeSql(CREATE_TABLES.OFFLINE_FILES_SYNC_INDEX);
       await db.executeSql(CREATE_TABLES.OFFLINE_FILES_SYNC_INDEX); // Duplicado
       DESPUÉS:
       Se asegura el paso de [] para prevenir "the bind value at index 1 is null" y se elimina el duplicado.
    */
    await db.executeSql(CREATE_TABLES.MONITORING_DATA_INDEX, []);
    await db.executeSql(CREATE_TABLES.MONITORING_DATA_SYNC_INDEX, []);
    await db.executeSql(CREATE_TABLES.MONITORING_DATA_DATE_INDEX, []);
    await db.executeSql(CREATE_TABLES.OFFLINE_FILES_INDEX, []);
    await db.executeSql(CREATE_TABLES.OFFLINE_FILES_SYNC_INDEX, []);
    console.log('✅ Índices de base de datos creados/verificados');

    // MIGRACIONES
    try {
      // Verificar si existe columna last_synced_at en monitoring_data
      /* 
         ANTES: const checkColumn = await db.executeSql("PRAGMA table_info(monitoring_data)");
         DESPUÉS: Se agrega [] por consistencia.
      */
      const checkColumn = await db.executeSql("PRAGMA table_info(monitoring_data)", []);
      let hasLastSyncedAt = false;
      for (let i = 0; i < checkColumn[0].rows.length; i++) {
        if (checkColumn[0].rows.item(i).name === 'last_synced_at') {
          hasLastSyncedAt = true;
          break;
        }
      }

      if (!hasLastSyncedAt) {
        console.log('🔄 Migrando: Agregando columna last_synced_at a monitoring_data');
        /* 
           ANTES: await db.executeSql("ALTER TABLE monitoring_data ADD COLUMN last_synced_at TEXT");
           DESPUÉS: Se agrega [] para evitar el error de bind null.
        */
        await db.executeSql("ALTER TABLE monitoring_data ADD COLUMN last_synced_at TEXT", []);
        console.log('✅ Columna last_synced_at agregada correctamente');
      }
    } catch (migrationError) {
      console.error('⚠️ Error en migración de base de datos:', migrationError);
      // No lanzar error para permitir que la app continúe si la migración falla (ej. ya existe)
    }

    return db;
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    throw new Error(`Error al inicializar la base de datos: ${error}`);
  }
};
