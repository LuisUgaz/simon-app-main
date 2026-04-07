import RNFS from 'react-native-fs';
import { getDatabaseConnection } from '../datasources/sqlite/database.config';

export interface OfflineFileData {
  id?: number;
  sampleId: string;
  visitAnswerId: string;
  aspectId: string;
  itemId: string;
  codigoItem: string;
  originalFilename: string;
  localFilePath: string;
  fileSize: number;
  fileExtension: string;
  mimeType: string;
  tempCode: string;
  syncStatus: 'pending' | 'synced' | 'error';
  serverDocumentCode?: string;
  createdAt: string;
  updatedAt: string;
}

class OfflineFilesService {
  private static instance: OfflineFilesService;

  public static getInstance(): OfflineFilesService {
    if (!OfflineFilesService.instance) {
      OfflineFilesService.instance = new OfflineFilesService();
    }
    return OfflineFilesService.instance;
  }

  private async getOfflineDirPath(): Promise<string> {
    const offlineDir = `${RNFS.DocumentDirectoryPath}/offline_files`;
    const dirExists = await RNFS.exists(offlineDir);
    if (!dirExists) {
      await RNFS.mkdir(offlineDir);
    }
    return offlineDir;
  }

  async saveFileOffline(
    sampleId: string,
    visitAnswerId: string,
    aspectId: string,
    itemId: string,
    codigoItem: string,
    fileUri: string,
    originalFilename: string,
    mimeType: string
  ): Promise<{ success: boolean; data?: OfflineFileData; message: string }> {
    try {
      const extension = originalFilename.split('.').pop() || '';
      const timestamp = Date.now();
      const uniqueFilename = `offline_${timestamp}_${codigoItem}.${extension}`;
      const tempCode = `OFFLINE_${timestamp}_${codigoItem}`;

      const offlineDir = await this.getOfflineDirPath();
      const localPath = `${offlineDir}/${uniqueFilename}`;

      await RNFS.copyFile(fileUri, localPath);
      const fileInfo = await RNFS.stat(localPath);

      const now = new Date().toISOString();
      const db = await getDatabaseConnection();

      const fileData = {
        sampleId,
        visitAnswerId,
        aspectId,
        itemId,
        codigoItem,
        originalFilename,
        localFilePath: localPath,
        fileSize: fileInfo.size,
        fileExtension: extension,
        mimeType,
        tempCode,
        syncStatus: 'pending' as const,
        createdAt: now,
        updatedAt: now
      };

      const query = `
        INSERT OR REPLACE INTO offline_files 
        (sample_id, visit_answer_id, aspect_id, item_id, codigo_item, 
         original_filename, local_file_path, file_size, file_extension, 
         mime_type, temp_code, sync_status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.executeSql(query, [
        fileData.sampleId,
        fileData.visitAnswerId,
        fileData.aspectId,
        fileData.itemId,
        fileData.codigoItem,
        fileData.originalFilename,
        fileData.localFilePath,
        fileData.fileSize,
        fileData.fileExtension,
        fileData.mimeType,
        fileData.tempCode,
        fileData.syncStatus,
        fileData.createdAt,
        fileData.updatedAt
      ]);

      return {
        success: true,
        data: { id: 1, ...fileData },
        message: 'Archivo guardado offline correctamente'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error guardando archivo: ${error}`
      };
    }
  }

  async getOfflineFileByTempCode(tempCode: string): Promise<OfflineFileData | null> {
    try {
      const db = await getDatabaseConnection();
      const query = `
        SELECT * FROM offline_files WHERE temp_code = ?
      `;
      const result = await db.executeSql(query, [tempCode]);

      if (result[0].rows.length === 0) {
        return null;
      }

      const row = result[0].rows.item(0);
      return {
        id: row.id,
        sampleId: row.sample_id,
        visitAnswerId: row.visit_answer_id,
        aspectId: row.aspect_id,
        itemId: row.item_id,
        codigoItem: row.codigo_item,
        originalFilename: row.original_filename,
        localFilePath: row.local_file_path,
        fileSize: row.file_size,
        fileExtension: row.file_extension,
        mimeType: row.mime_type,
        tempCode: row.temp_code,
        syncStatus: row.sync_status,
        serverDocumentCode: row.server_document_code,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      return null;
    }
  }

  async deleteOfflineFile(tempCode: string): Promise<boolean> {
    try {
      const fileData = await this.getOfflineFileByTempCode(tempCode);
      if (!fileData) return false;

      const fileExists = await RNFS.exists(fileData.localFilePath);
      if (fileExists) {
        await RNFS.unlink(fileData.localFilePath);
      }

      const db = await getDatabaseConnection();
      const query = 'DELETE FROM offline_files WHERE temp_code = ?';
      await db.executeSql(query, [tempCode]);

      return true;
    } catch (error) {
      return false;
    }
  }

  async updateFileSyncStatus(
    tempCode: string,
    status: 'synced' | 'error',
    serverDocumentCode?: string
  ): Promise<boolean> {
    try {
      const db = await getDatabaseConnection();
      const query = `
        UPDATE offline_files 
        SET sync_status = ?, server_document_code = ?, updated_at = ?
        WHERE temp_code = ?
      `;
      const now = new Date().toISOString();
      await db.executeSql(query, [status, serverDocumentCode, now, tempCode]);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getPendingSyncFiles(): Promise<OfflineFileData[]> {
    try {
      const db = await getDatabaseConnection();
      const query = `
        SELECT * FROM offline_files WHERE sync_status = ?
        ORDER BY created_at ASC
      `;
      // Se agrega [] para asegurar consistencia y evitar bind null en Android
      /* 
         ANTES: const result = await db.executeSql(query);
         DESPUÉS: const result = await db.executeSql(query, []);
      */
      const result = await db.executeSql(query, []);
      const files: OfflineFileData[] = [];

      for (let i = 0; i < result[0].rows.length; i++) {
        const row = result[0].rows.item(i);
        files.push({
          id: row.id,
          sampleId: row.sample_id,
          visitAnswerId: row.visit_answer_id,
          aspectId: row.aspect_id,
          itemId: row.item_id,
          codigoItem: row.codigo_item,
          originalFilename: row.original_filename,
          localFilePath: row.local_file_path,
          fileSize: row.file_size,
          fileExtension: row.file_extension,
          mimeType: row.mime_type,
          tempCode: row.temp_code,
          syncStatus: row.sync_status,
          serverDocumentCode: row.server_document_code,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        });
      }

      return files;
    } catch (error) {
      return [];
    }
  }

  async getSyncedFiles(): Promise<OfflineFileData[]> {
    try {
      const db = await getDatabaseConnection();
      const query = `
        SELECT * FROM offline_files WHERE sync_status = ?
        ORDER BY created_at ASC
      `;
      // Se agrega [] para asegurar consistencia y evitar bind null en Android
      /* 
         ANTES: const result = await db.executeSql(query);
         DESPUÉS: const result = await db.executeSql(query, []);
      */
      const result = await db.executeSql(query, []);
      const files: OfflineFileData[] = [];

      for (let i = 0; i < result[0].rows.length; i++) {
        const row = result[0].rows.item(i);
        files.push({
          id: row.id,
          sampleId: row.sample_id,
          visitAnswerId: row.visit_answer_id,
          aspectId: row.aspect_id,
          itemId: row.item_id,
          codigoItem: row.codigo_item,
          originalFilename: row.original_filename,
          localFilePath: row.local_file_path,
          fileSize: row.file_size,
          fileExtension: row.file_extension,
          mimeType: row.mime_type,
          tempCode: row.temp_code,
          syncStatus: row.sync_status,
          serverDocumentCode: row.server_document_code,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        });
      }

      return files;
    } catch (error) {
      return [];
    }
  }
}

export default OfflineFilesService;
