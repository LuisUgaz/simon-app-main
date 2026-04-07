# Persistencia SQLite para Datos de Monitoreo

Este documento describe la implementación de persistencia local usando SQLite para los datos de monitoreo en la aplicación SIMON.

## Arquitectura

La implementación sigue una arquitectura limpia con las siguientes capas:

### 1. Interfaces
- `MonitoringLocalDataSource`: Interface para el acceso a datos SQLite
- `MonitoringOfflineRepository`: Interface para la lógica de negocio

### 2. DataSource (src/infraestructure/datasources/sqlite/)
- `database.config.ts`: Configuración de la base de datos y esquemas
- `monitoring.datasource.impl.ts`: Implementación del datasource SQLite

### 3. Repository (src/infraestructure/repositories/)
- `monitoring.repository.impl.ts`: Implementación del repositorio que usa el datasource

### 4. Servicio (src/infraestructure/services/)
- `offline-monitoring.service.ts`: Servicio singleton para gestionar la persistencia

## Estructura de la Base de Datos

### Tabla: monitoring_data
```sql
CREATE TABLE monitoring_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sample_id TEXT NOT NULL,
  visit_answer_id TEXT NOT NULL,
  data TEXT NOT NULL,                    -- JSON con todos los datos
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'synced', 'error'
  data_size INTEGER NOT NULL DEFAULT 0,         -- Tamaño en KB
  session_metadata TEXT,                        -- JSON con metadata
  UNIQUE(sample_id, visit_answer_id)
);
```

### Índices
- `idx_monitoring_sample_visit`: Para búsquedas por sample_id y visit_answer_id
- `idx_monitoring_sync_status`: Para filtros por estado de sincronización
- `idx_monitoring_created_at`: Para ordenamiento temporal

## Uso

### 1. Guardar Datos Offline
El método `saveMonitoringDataToLocal` del store ahora usa SQLite automáticamente:

```typescript
const result = await saveMonitoringDataToLocal(currentSample, currentVisitAnswer);
if (result.success) {
  console.log(`Datos guardados. Tamaño: ${result.dataSize} KB`);
}
```

### 2. Obtener Datos Offline
```typescript
// Obtener datos específicos
const data = await getOfflineMonitoringData(sampleId, visitAnswerId);

// Obtener todos los datos offline
const allData = await getAllOfflineMonitoringData();

// Obtener datos pendientes de sincronización
const pendingData = await getPendingSyncData();
```

### 3. Gestión de Sincronización
```typescript
// Marcar como sincronizado
await markOfflineDataAsSynced(dataId);

// Eliminar datos offline
await deleteOfflineData(dataId);

// Limpiar datos antiguos sincronizados
await cleanOldOfflineData(30); // 30 días
```

### 4. Estadísticas de Almacenamiento
```typescript
const stats = await getOfflineStorageStats();
console.log(`Total registros: ${stats.stats.totalRecords}`);
console.log(`Pendientes: ${stats.stats.pendingSync}`);
console.log(`Tamaño total: ${stats.stats.totalSizeKB} KB`);
```

## Estados de Sincronización

- **pending**: Datos guardados localmente, pendientes de envío al servidor
- **synced**: Datos ya sincronizados con el servidor
- **error**: Datos que tuvieron error al sincronizar

## Manejo de Errores

La implementación incluye un sistema de fallback:

1. **Principal**: Intenta guardar en SQLite
2. **Respaldo**: Si SQLite falla, usa el método original con StorageAdapter
3. **Logging**: Registra todos los errores para debugging

## Beneficios

1. **Persistencia Robusta**: SQLite es más confiable que el almacenamiento en memoria
2. **Consultas Complejas**: Permite filtros y búsquedas avanzadas
3. **Gestión de Estado**: Tracking del estado de sincronización
4. **Limpieza Automática**: Puede eliminar datos antiguos automáticamente
5. **Estadísticas**: Proporciona métricas del uso de almacenamiento

## Configuración Requerida

Asegúrate de que `react-native-sqlite-storage` esté instalado:

```bash
npm install react-native-sqlite-storage
```

Para iOS, es posible que necesites ejecutar:
```bash
cd ios && pod install
```

## Inicialización

El sistema se inicializa automáticamente cuando se usa por primera vez. No requiere configuración adicional.

## Consideraciones de Rendimiento

- Los datos se almacenan como JSON comprimido
- Los índices optimizan las consultas comunes
- La limpieza automática previene el crecimiento excesivo de la base de datos
- El tamaño se monitorea en KB para facilitar el debugging

## Testing

Para probar la funcionalidad:

1. Guarda datos offline usando el botón de guardar en la interfaz
2. Verifica que aparezcan en la base de datos
3. Simula pérdida de conexión y verifica que los datos persistan
4. Prueba la sincronización cuando se restablezca la conexión
