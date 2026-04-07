import {CryptAdapter} from '../adapters/cryp-adapter';
import {AbstractApi} from './abstract.api';
import {EXECUTION_API} from '@env';
class MonitoringApi extends AbstractApi {
  constructor(cryptAdapter: CryptAdapter) {
    super(EXECUTION_API, cryptAdapter); // Define el baseURL específico
  }
}

const cryptAdapter = new CryptAdapter();
export default new MonitoringApi(cryptAdapter);
