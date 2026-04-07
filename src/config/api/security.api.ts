import {CryptAdapter} from '../adapters/cryp-adapter';
import {AbstractApi} from './abstract.api';
import {SECURITY_API} from '@env';
class SecurityApi extends AbstractApi {
  constructor(cryptAdapter: CryptAdapter) {
    super(SECURITY_API, cryptAdapter); // Define el baseURL específico
  }
}

const cryptAdapter = new CryptAdapter();
export default new SecurityApi(cryptAdapter);
