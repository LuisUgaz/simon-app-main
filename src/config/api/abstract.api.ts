import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { CryptAdapter } from './../adapters/cryp-adapter'; // Tu servicio de encriptación
import { StorageAdapter } from '../adapters/storage-adapter';
import { APIKEY, REFRESH_TOKEN_CODE, SECURITY_API, TOKEN_CODE } from '@env';
import { EndpointSecurity } from '../../core/constants/endpoints.constants';

// Queue for concurrent requests during refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};



export abstract class AbstractApi {
  public api: AxiosInstance;
  private cryptAdapter: CryptAdapter;
  public static onLogout: (() => void) | null = null;


  constructor(baseURL: string, cryptAdapter: CryptAdapter) {
    this.cryptAdapter = cryptAdapter;
    // Crear la instancia de Axios con baseURL proporcionada por la clase hija
    this.api = axios.create({
      baseURL,
      timeout: 10000, // Configuración de tiempo de espera
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ApiKey: APIKEY,
      },
    });

    //   console.log(
    //     'DECRYPT FILTER',
    //     this.cryptAdapter.dcy(
    //       ""
    //     )
    // )
    // Configura los interceptores
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor para encriptar las solicitudes y agregar el header Authorization
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Obtén el token de manera asíncrona
        const tokenCode = await StorageAdapter.getItem(TOKEN_CODE);
        const refreshToken = await StorageAdapter.getItem(REFRESH_TOKEN_CODE);

        // Agregar el header Authorization si existe el token
        if (tokenCode) {
          config.headers['Authorization'] = `Bearer ${tokenCode}`;
          config.headers['Cookie'] = `refreshToken=${refreshToken}`;
          console.log('HEADERS TO REQUEST', config.headers)
        }

        // Encriptar el body de la solicitud, si existe y no es multipart/form-data
        if (config.data) {
          const contentType = config.headers['Content-Type'] || config.headers['content-type'];
          const isMultipartFormData = contentType && contentType.includes('multipart/form-data');
          const isFileDownload = config.baseURL?.includes('simon-files');

          if (!isMultipartFormData && !isFileDownload) {
            const encryptedBody = this.cryptAdapter.ecy(
              JSON.stringify(config.data),
            );
            config.data = { Request: encryptedBody }; // Reemplaza el body con la versión encriptada
            console.log('🔐 Encrypted body:', config.data);
          }
          console.log('🔐 url:', config.baseURL, config.url);
        }
        console.log('🚀 request config:', config.baseURL, config.url);

        // --- Generar y loguear cURL ---
        try {
          const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
          const method = config.method?.toUpperCase() || 'GET';
          let curl = `curl -X ${method} '${fullUrl}`;

          if (config.params) {
            // Manejar parámetros de consulta
            const params = new URLSearchParams();
            for (const key in config.params) {
              if (Object.prototype.hasOwnProperty.call(config.params, key)) {
                params.append(key, String(config.params[key]));
              }
            }
            const queryString = params.toString();
            if (queryString) {
              curl += (fullUrl.includes('?') ? '&' : '?') + queryString;
            }
          }
          curl += "'"; // Cerrar comilla de la URL

          // Headers
          if (config.headers) {
            Object.entries(config.headers).forEach(([key, value]) => {
              if (
                value !== undefined &&
                value !== null &&
                ['string', 'number', 'boolean'].includes(typeof value)
              ) {
                curl += ` \\\n  -H '${key}: ${value}'`;
              }
            });
          }

          // Body
          if (config.data) {
            let bodyData = config.data;
            // Si es FormData no lo intentamos stringify de manera simple (se vería vacío o [object FormData])
            // Pero si es objeto JSON o string:
            if (typeof bodyData === 'object' && !(bodyData instanceof FormData)) {
              bodyData = JSON.stringify(bodyData);
            }

            if (typeof bodyData === 'string') {
              // Escapar comillas simples para bash
              // bodyData = bodyData.replace(/'/g, "'\\''"); 
              curl += ` \\\n  -d '${bodyData}'`;
            }
          }

          console.log('\n--- cURL Request ---');
          console.log(curl);
          console.log('--------------------\n');
        } catch (err) {
          console.warn('Error generating cURL log:', err);
        }
        // -----------------------------

        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // Interceptor para desencriptar las respuestas
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.data) {
          // No desencriptar si el responseType no es JSON (como blob, arraybuffer, etc.)
          const responseType = response.config.responseType;
          const isJsonResponse = !responseType || responseType === 'json';

          if (isJsonResponse && response.data.result) {
            try {
              const decryptedData = this.cryptAdapter.dcy(response.data.result);
              response.data = JSON.parse(decryptedData); // Parsea el JSON desencriptado
            } catch (error) {
              throw new Error('Invalid decrypted data format');
            }
          }
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (!originalRequest) {
          return Promise.reject(error);
        }

        // Handle 401: Unauthorized (Token Expired)
        // @ts-ignore
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise(function(resolve, reject) {
              failedQueue.push({resolve, reject});
            }).then(token => {
              // @ts-ignore
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return this.api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          // @ts-ignore
          originalRequest._retry = true;
          isRefreshing = true;

          try {
            console.log('🔄 Refreshing token...');
            const refreshToken = await StorageAdapter.getItem(REFRESH_TOKEN_CODE);
            
            // Use raw axios to avoid interceptors
            const response = await axios.post(
              `${SECURITY_API}${EndpointSecurity.RefreshToken}`,
              {},
              {
                headers: {
                  Cookie: `refreshToken=${refreshToken}`,
                  ApiKey: APIKEY,
                },
              }
            );

            // Decrypt response if needed (similar to response interceptor)
            let responseData = response.data;
            // The existing decrypt logic wrapper
            if (responseData && typeof responseData === 'object' && 'result' in responseData) {
                 try {
                    const decryptedData = this.cryptAdapter.dcy(responseData.result);
                    responseData = JSON.parse(decryptedData);
                 } catch (e) {
                     console.log('Error decrypting refresh token response', e);
                 }
            }

            // Check either local success or decrypted success
            if (responseData?.success) {
                const newToken = response.headers['authorization'];
                const newRefreshToken = responseData.value?.refreshToken || 
                                      (response.headers['set-cookie']?.find((c: string) => c.includes('refreshToken='))?.split('refreshToken=')[1]?.split(';')[0]);

                console.log('✅ Token refreshed successfully');
                await StorageAdapter.setItem(TOKEN_CODE, newToken);
                if (newRefreshToken) {
                   await StorageAdapter.setItem(REFRESH_TOKEN_CODE, newRefreshToken);
                }

                // Update default headers
                this.api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
                // Update original request headers
                // @ts-ignore
                originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
                
                processQueue(null, newToken);
                return this.api(originalRequest);
            } else {
                 throw new Error('Refresh token invalid');
            }

          } catch (err) {
            console.log('❌ Token refresh failed, logging out...', err);
            processQueue(err, null);
            if (AbstractApi.onLogout) {
                AbstractApi.onLogout();
            }
            return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }
}
