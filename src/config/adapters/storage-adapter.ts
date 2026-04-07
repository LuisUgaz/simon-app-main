import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageAdapter {
  // Obtener un valor de almacenamiento
  static async getItem<T = string>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        // Intentar parsear JSON, si falla devolver el valor como string
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      }
      return null;
    } catch (error) {
      console.error(`Error getting item ${key}`, error);
      return null;
    }
  }

  // Guardar un valor en almacenamiento
  static async setItem(key: string, value: unknown): Promise<void> {
    try {
      // Convertir a string si es un objeto
      const valueToStore =
        typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting item ${key} with value`, value, error);
      throw new Error(`Error setting item ${key}`);
    }
  }

  // Eliminar un valor de almacenamiento
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}`, error);
      throw new Error(`Error removing item ${key}`);
    }
  }
}
