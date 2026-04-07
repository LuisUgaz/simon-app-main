import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { Sample, VisitAnswer } from '../../../core/entities';
import {
  MonitoringLocalDataSource,
  MonitoringLocalData,
  MonitoringDataFilter,
} from '../../interfaces/datasources/monitoring.datasource';
import { configureSQLite, initializeDatabase, getDatabaseConnection } from './database.config';

export class SQLiteMonitoringDataSource implements MonitoringLocalDataSource {
  private db: SQLiteDatabase | null = null;
  private isInitialized = false;

  constructor() {
    configureSQLite();
  }

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized && this.db) {
        return;
      }

      this.db = await initializeDatabase();
      this.isInitialized = true;
      console.log('✅ SQLiteMonitoringDataSource inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando SQLiteMonitoringDataSource:', error);
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized || !this.db) {
      await this.initialize();
    }
  }

  async saveMonitoringData(
    userId: string,
    sample: Sample,
    visitAnswer: VisitAnswer,
    data: any,
    sessionMetadata: any
  ): Promise<{ success: boolean; id?: number; message: string }> {
    try {
      await this.ensureInitialized();

      const dataString = JSON.stringify(data);
      const metadataString = JSON.stringify(sessionMetadata);
      const dataSizeInBytes = new Blob([dataString]).size;
      const dataSizeInKB = Math.round(dataSizeInBytes / 1024 * 100) / 100;

      const now = new Date().toISOString();

      const checkQuery = `
        SELECT id, sample_id FROM monitoring_data 
        WHERE visit_answer_id = ?
      `;

      // Se valida que el ID de la visita no sea null o undefined para evitar "the bind value at index 1 is null"
      /* 
         ANTES:
         const checkResult = await this.db!.executeSql(checkQuery, [visitAnswer.id || visitAnswer.visitAnswerId]);
         DESPUÉS:
         Se valida que visitIdToSearch sea válido antes de ejecutar executeSql.
      */
      const visitIdToSearch = visitAnswer.id || visitAnswer.visitAnswerId;
      if (!visitIdToSearch) {
        throw new Error('No se puede guardar: El ID de la visita es nulo o indefinido');
      }

      const checkResult = await this.db!.executeSql(checkQuery, [visitIdToSearch]);

      if (checkResult[0].rows.length > 0) {
        const existingRecord = checkResult[0].rows.item(0);
        console.log(`🔄 Registro existente encontrado para visitAnswerId: ${visitIdToSearch}, eliminando registro anterior...`);

        // Eliminar el registro existente
        const deleteQuery = `DELETE FROM monitoring_data WHERE visit_answer_id = ?`;
        await this.db!.executeSql(deleteQuery, [visitIdToSearch]);

        console.log(`🗑️ Registro anterior eliminado. ID: ${existingRecord.id}, SampleId: ${existingRecord.sample_id}`);
      }

      // Insertar el nuevo registro
      const insertQuery = `
        INSERT INTO monitoring_data 
        (user_id, sample_id, visit_answer_id, data, created_at, updated_at, sync_status, data_size, session_metadata)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `;

      // Validación de parámetros obligatorios para la inserción
      /* 
         ANTES: 
         const insertResult = await this.db!.executeSql(insertQuery, [userId, sample.id, ...]);
         DESPUÉS: 
         Se valida cada parámetro para evitar que el driver SQLite de Android reciba undefined/null.
      */
      if (!userId || !sample.id || !visitIdToSearch) {
        throw new Error(`Datos incompletos para la inserción: userId=${userId}, sampleId=${sample.id}, visitId=${visitIdToSearch}`);
      }

      console.log('🔄 Insertando nuevo registro en SQLite...', dataString);
      const insertResult = await this.db!.executeSql(insertQuery, [
        userId,
        sample.id,
        visitIdToSearch,
        dataString,
        now,
        now,
        dataSizeInKB,
        metadataString,
      ]);

      const insertId = insertResult[0].insertId;

      console.log(`✅ Datos de monitoreo guardados en SQLite. ID: ${insertId}, Tamaño: ${dataSizeInKB} KB`);

      return {
        success: true,
        id: insertId,
        message: `Acción realizada correctamente. ${dataSizeInKB} KB`,
      };
    } catch (error) {
      console.error('❌ Error guardando datos en SQLite:', error);
      return {
        success: false,
        message: `Error al guardar datos: ${error}`,
      };
    }
  }

  async getMonitoringDataById(id: number): Promise<MonitoringLocalData | null> {
    try {
      await this.ensureInitialized();

      const query = `
        SELECT id, user_id, sample_id, visit_answer_id, data, created_at, updated_at, 
               sync_status, data_size, session_metadata, last_synced_at
        FROM monitoring_data 
        WHERE id = ?
      `;

      // Validación de ID para evitar error de bind nulo
      /* 
         ANTES: const result = await this.db!.executeSql(query, [id]);
         DESPUÉS: Se valida id antes para evitar que llegue undefined/null al driver.
      */
      if (id === null || id === undefined) {
        console.error('❌ getMonitoringDataById: ID es nulo o indefinido');
        return null;
      }

      const result = await this.db!.executeSql(query, [id]);

      if (result[0].rows.length === 0) {
        return null;
      }

      const row = result[0].rows.item(0);
      return this.mapRowToMonitoringData(row);
    } catch (error) {
      console.error('❌ Error obteniendo datos por ID:', error);
      return null;
    }
  }

  async getMonitoringData(
    sampleId: string,
    visitAnswerId: string
  ): Promise<MonitoringLocalData | null> {
    try {
      await this.ensureInitialized();

      const query = `
        SELECT id, sample_id, visit_answer_id, data, created_at, updated_at, 
               sync_status, data_size, session_metadata, last_synced_at
        FROM monitoring_data 
        WHERE sample_id = ? AND visit_answer_id = ?
      `;

      // Validación de parámetros para evitar error de bind nulo
      /* 
         ANTES: const result = await this.db!.executeSql(query, [sampleId, visitAnswerId]);
         DESPUÉS: Se validan sampleId y visitAnswerId para evitar que el driver reciba nulos.
      */
      if (!sampleId || !visitAnswerId) {
        console.warn('⚠️ getMonitoringData: sampleId o visitAnswerId nulos/indefinidos');
        return null;
      }

      const result = await this.db!.executeSql(query, [sampleId, visitAnswerId]);

      if (result[0].rows.length === 0) {
        return null;
      }

      const row = result[0].rows.item(0);
      return this.mapRowToMonitoringData(row);
    } catch (error) {
      console.error('❌ Error obteniendo datos de monitoreo:', error);
      return null;
    }
  }

  async getAllMonitoringData(filter?: MonitoringDataFilter): Promise<MonitoringLocalData[]> {
    try {
      await this.ensureInitialized();

      let query = `
        SELECT id, sample_id, visit_answer_id, data, created_at, updated_at, 
               sync_status, data_size, session_metadata, last_synced_at
        FROM monitoring_data
      `;

      const params: any[] = [];
      const conditions: string[] = [];

      if (filter) {
        if (filter.userId) {
          conditions.push('user_id = ?');
          params.push(filter.userId);
        }
        if (filter.sampleId) {
          conditions.push('sample_id = ?');
          params.push(filter.sampleId);
        }
        if (filter.visitAnswerId) {
          conditions.push('visit_answer_id = ?');
          params.push(filter.visitAnswerId);
        }
        if (filter.syncStatus) {
          conditions.push('sync_status = ?');
          params.push(filter.syncStatus);
        }
        if (filter.createdAfter) {
          conditions.push('created_at >= ?');
          params.push(filter.createdAfter);
        }
        if (filter.createdBefore) {
          conditions.push('created_at <= ?');
          params.push(filter.createdBefore);
        }
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';
      const result = await this.db!.executeSql(query, params);
      const data: MonitoringLocalData[] = [];

      for (let i = 0; i < result[0].rows.length; i++) {
        const row = result[0].rows.item(i);
        data.push(this.mapRowToMonitoringData(row));
      }

      return data;
    } catch (error) {
      console.error('❌ Error obteniendo todos los datos:', error);
      return [];
    }
  }

  async updateSyncStatus(
    id: number,
    status: 'pending' | 'synced' | 'error',
    lastSyncedAt?: string
  ): Promise<boolean> {
    try {
      await this.ensureInitialized();

      // Validación de ID para evitar error de bind nulo
      /* 
         ANTES: (se ejecutaba directo sin validar id)
         DESPUÉS: Se valida id antes de la consulta SQL.
      */
      if (id === null || id === undefined) {
        console.error('❌ updateSyncStatus: ID es nulo o indefinido');
        return false;
      }

      let query = `
        UPDATE monitoring_data 
        SET sync_status = ?
      `;
      const params: any[] = [status];

      if (lastSyncedAt) {
        query += `, last_synced_at = ?`;
        params.push(lastSyncedAt);
      }

      query += ` WHERE id = ?`;
      params.push(id);

      const result = await this.db!.executeSql(query, params);

      return result[0].rowsAffected > 0;
    } catch (error) {
      console.error('❌ Error actualizando estado de sincronización:', error);
      return false;
    }
  }

  async deleteMonitoringData(id: number): Promise<boolean> {
    try {
      await this.ensureInitialized();

      // Validación de ID para evitar error de bind nulo
      /* 
         ANTES: (se ejecutaba directo sin validar id)
         DESPUÉS: Se valida id antes de la consulta SQL.
      */
      if (id === null || id === undefined) {
        console.error('❌ deleteMonitoringData: ID es nulo o indefinido');
        return false;
      }

      const query = 'DELETE FROM monitoring_data WHERE id = ?';
      const result = await this.db!.executeSql(query, [id]);

      return result[0].rowsAffected > 0;
    } catch (error) {
      console.error('❌ Error eliminando datos:', error);
      return false;
    }
  }

  async cleanOldSyncedData(daysOld: number): Promise<number> {
    try {
      await this.ensureInitialized();

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      const cutoffIsoString = cutoffDate.toISOString();

      const query = `
        DELETE FROM monitoring_data 
        WHERE sync_status = 'synced' AND created_at < ?
      `;

      const result = await this.db!.executeSql(query, [cutoffIsoString]);

      console.log(`🧹 Eliminados ${result[0].rowsAffected} registros antiguos sincronizados`);
      return result[0].rowsAffected;
    } catch (error) {
      console.error('❌ Error limpiando datos antiguos:', error);
      return 0;
    }
  }

  async getStorageStats(): Promise<{
    totalRecords: number;
    pendingSync: number;
    syncedRecords: number;
    errorRecords: number;
    totalSizeKB: number;
  }> {
    try {
      await this.ensureInitialized();

      const queries = [
        'SELECT COUNT(*) as count FROM monitoring_data',
        'SELECT COUNT(*) as count FROM monitoring_data WHERE sync_status = "pending"',
        'SELECT COUNT(*) as count FROM monitoring_data WHERE sync_status = "synced"',
        'SELECT COUNT(*) as count FROM monitoring_data WHERE sync_status = "error"',
        'SELECT SUM(data_size) as total_size FROM monitoring_data',
      ];

      const results = await Promise.all(
        // Se agrega [] para evitar el error de bind nulo en Android cuando no hay parámetros
        /* 
           ANTES: queries.map(query => this.db!.executeSql(query))
           DESPUÉS: queries.map(query => this.db!.executeSql(query, []))
        */
        queries.map(query => this.db!.executeSql(query, []))
      );

      return {
        totalRecords: results[0][0].rows.item(0).count,
        pendingSync: results[1][0].rows.item(0).count,
        syncedRecords: results[2][0].rows.item(0).count,
        errorRecords: results[3][0].rows.item(0).count,
        totalSizeKB: results[4][0].rows.item(0).total_size || 0,
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        totalRecords: 0,
        pendingSync: 0,
        syncedRecords: 0,
        errorRecords: 0,
        totalSizeKB: 0,
      };
    }
  }

  async close(): Promise<void> {
    try {
      if (this.db) {
        await this.db.close();
        this.db = null;
        this.isInitialized = false;
        console.log('✅ Conexión SQLite cerrada correctamente');
      }
    } catch (error) {
      console.error('❌ Error cerrando conexión SQLite:', error);
    }
  }

  private mapRowToMonitoringData(row: any): MonitoringLocalData {
    return {
      id: row.id,
      userId: row.user_id,
      sampleId: row.sample_id,
      visitAnswerId: row.visit_answer_id,
      data: row.data,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncStatus: row.sync_status,
      dataSize: row.data_size,
      sessionMetadata: row.session_metadata,
      lastSyncedAt: row.last_synced_at,
    };
  }
}
