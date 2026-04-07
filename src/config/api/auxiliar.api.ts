import {CryptAdapter} from '../adapters/cryp-adapter';
import {AbstractApi} from './abstract.api';
import {AUXILIAR_API} from '@env';
class AuxiliarApi extends AbstractApi {
  constructor(cryptAdapter: CryptAdapter) {
    super(AUXILIAR_API, cryptAdapter); // Define el baseURL específico
  }
}

const cryptAdapter = new CryptAdapter();
export default new AuxiliarApi(cryptAdapter);
