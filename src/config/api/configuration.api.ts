import {CryptAdapter} from '../adapters/cryp-adapter';
import {AbstractApi} from './abstract.api';
import {CONFIGURATION_API} from '@env';
class ConfigurationApi extends AbstractApi {
  constructor(cryptAdapter: CryptAdapter) {
    super(CONFIGURATION_API, cryptAdapter); // Define el baseURL específico
  }
}

const cryptAdapter = new CryptAdapter();
export default new ConfigurationApi(cryptAdapter);
