import {CryptAdapter} from '../adapters/cryp-adapter';
import {AbstractApi} from './abstract.api';
import {FILES_API} from '@env';
class FilesApi extends AbstractApi {
  constructor(cryptAdapter: CryptAdapter) {
    super(FILES_API, cryptAdapter); // Define el baseURL específico
  }
}

const cryptAdapter = new CryptAdapter();
export default new FilesApi(cryptAdapter);
