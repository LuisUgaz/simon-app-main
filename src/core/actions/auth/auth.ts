import { jwtDecode } from 'jwt-decode';
import { StorageAdapter } from '../../../config/adapters/storage-adapter';
import securityApi from '../../../config/api/security.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  JWTBody,
  MonitoringMapper,
  RolesListResponse,
  SitesResponse,
  StatusResponse,
} from '../../../infraestructure';
import { EndpointSecurity } from '../../constants';
import { RoleSite, Site, User } from '../../entities';
import { CryptAdapter } from '../../../config/adapters/cryp-adapter';
import { LOGIN_TOKEN_CODE, MODULE_CODE, TOKEN_CODE, REFRESH_TOKEN_CODE, NAMES_CODE } from '@env';

const returnUserToken = (data: AuthResponse) => {
  const cryptAdapter = new CryptAdapter();
  const decode = jwtDecode<JWTBody>(data.token);
  const roles = typeof decode.rolesite === 'string' ? [decode.rolesite] : decode.rolesite;
  const user: User = {
    id: cryptAdapter.dcy(decode.ID_USUARIO),
    sessionId: cryptAdapter.dcy(decode.ID_INICIO_SESION),
    names: data.dataUser?.nombres,
    firstLastName: data.dataUser?.apellidoPaterno,
    secondLastName: data.dataUser?.apellidoMaterno,
    idDocumentType: cryptAdapter.dcy(decode.USUARIO_ID_TIPO_DOCUMENTO),
    documentNumber: cryptAdapter.dcy(decode.USUARIO_NUMERO_DOCUMENTO),
    mainRole: cryptAdapter.dcy(decode.rolPrincipal),
    rolesite: roles.map(x => {
      const [code, anexo] = x.split('|');

      return {
        code,
        anexo,
      };
    }),
    lastSession: cryptAdapter.dcy(decode.ULTIMO_INICIO_SESION),
    loginDate: data.loginDate,
    fullName: data.fullName,
  };

  return {
    user: user,
    token: data.token,
    refreshToken: data.refreshToken
  };
};

export const authLogin = async (
  user: string,
  password: string,
  captcha: string,
) => {
  user = user.toLowerCase();

  try {
    const jwtTokenLogin = await StorageAdapter.getItem(
      LOGIN_TOKEN_CODE,
    );
    const resp = await securityApi.api.post<{
      success: boolean;
      value: { nombres: string; fecha: string, dataUser: { nombres: string; apellidoPaterno: string; apellidoMaterno: string; numeroDocumento: string; idTipoDocumento: string; } };
    }>(
      EndpointSecurity.Login,
      {
        user,
        password,
        captcha,
      },
      {
        headers: {
          ...securityApi.api.defaults.headers.common,
          ...securityApi.api.defaults.headers.post,
          'jwt-login': jwtTokenLogin,
        },
      },
    );

    console.log('RESP LOGIN URL', resp.data.value);
    let refreshToken = '';
    const cookies = resp.headers['set-cookie'];
    if (cookies) {
      const refreshTokenCookie = cookies.find(cookie =>
        cookie.includes('refreshToken='),
      );
      if (refreshTokenCookie) {
        refreshToken = refreshTokenCookie.split('refreshToken=')[1];
      }
    }
    return returnUserToken({
      loginDate: resp.data.value?.fecha,
      fullName: resp.data.value?.nombres,
      token: resp.headers['authorization'],
      refreshToken,
      dataUser: {
        apellidoMaterno: resp.data.value?.dataUser?.apellidoMaterno,
        apellidoPaterno: resp.data.value?.dataUser?.apellidoPaterno,
        nombres: resp.data.value?.dataUser?.nombres,
        numeroDocumento: resp.data.value?.dataUser?.numeroDocumento,
        tipoDocumento: resp.data.value?.dataUser?.idTipoDocumento,
      }
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<{ success: boolean, token: string, refreshToken: string }> => {
  try {
    const jwtToken = await StorageAdapter.getItem(TOKEN_CODE);
    console.log('isAuthenticated JWT TOKEN', jwtToken);
    if (jwtToken) {
      const decoded = jwtDecode<JWTBody>(jwtToken);
      const currentTime = Date.now() / 1000;
      if (decoded.exp > currentTime) {
        const storedRefreshToken = await StorageAdapter.getItem(REFRESH_TOKEN_CODE);
        return { success: true, token: jwtToken, refreshToken: storedRefreshToken || '' };
      }
    }

    const resp = await securityApi.api.post<StatusResponse<boolean>>(
      EndpointSecurity.RefreshToken,
    );

    let refreshToken = '';
    const cookies = resp.headers['set-cookie'];
    if (cookies) {
      const refreshTokenCookie = cookies.find(cookie =>
        cookie.includes('refreshToken='),
      );
      if (refreshTokenCookie) {
        refreshToken = refreshTokenCookie.split('refreshToken=')[1];
      }
    }

    console.log('isAuthenticated REFRESH TOKEN', { success: resp.data.success, token: resp.headers['authorization'], refreshToken: refreshToken });
    return { success: resp.data.success, token: resp.headers['authorization'], refreshToken: refreshToken };
  } catch (error) {
    console.log({ error });
    return { success: false, token: '', refreshToken: '' };
  }
};

export const authCheckStatus = async () => {
  try {
    const jwtToken = await StorageAdapter.getItem(TOKEN_CODE);
    const refreshToken = await StorageAdapter.getItem(REFRESH_TOKEN_CODE);
    const encryptedUserData = await StorageAdapter.getItem(NAMES_CODE);

    // Recuperar y desencriptar datos de usuario
    let userData = '';
    if (encryptedUserData) {
      try {
        const cryptAdapter = new CryptAdapter();
        userData = cryptAdapter.dcy(encryptedUserData);

        // Fallback simple: si tras desencriptar está vacío pero el original tenía pipes (formato antiguo)
        if (!userData && encryptedUserData.includes('|')) {
          userData = encryptedUserData;
        }
      } catch (e) {
        // Si falla, usar el valor original (por si no estaba encriptado)
        userData = encryptedUserData;
      }
    }

    const [fullName, firstLastName, secondLastName, names, documentNumber, documentType] =
      (userData?.split('|') as string[] | undefined) ?? [];
    return returnUserToken({
      loginDate: '',
      fullName: fullName!,
      token: jwtToken!,
      refreshToken: refreshToken!,
      dataUser: {
        apellidoMaterno: secondLastName,
        apellidoPaterno: firstLastName,
        nombres: names,
        numeroDocumento: documentNumber,
        tipoDocumento: documentType,
      }
    });
  } catch (error) {
    console.log({ error });
    return null;
  }
};

export const getCaptcha = async (): Promise<{
  data: string;
  jwtToken: string;
} | null> => {
  try {
    const resp = await securityApi.api.get<StatusResponse<any>>(
      EndpointSecurity.captcha,
    );
    return { data: resp.data.data, jwtToken: resp.headers['jwt-login'] };
  } catch (error) {
    console.log({ error });
    return null;
  }
};

export const getRoles = async (): Promise<RoleSite[]> => {
  try {
    const resp = await securityApi.api.post<StatusResponse<RolesListResponse>>(
      EndpointSecurity.GetMenuPrincipal,
      {},
    );
    //Decrypt roles
    const cryptAdapter = new CryptAdapter();
    const roles: RoleSite[] | undefined = resp.data?.data?.rolUsuario?.map(x => {
      const { NOMBRE_ROL, CODIGO_ROL, ID_ROL, CODIGO_SEDE } = JSON.parse(
        cryptAdapter.dcy(x.encrypt),
      );
      return {
        id: ID_ROL,
        code: CODIGO_ROL,
        name: NOMBRE_ROL,
        siteCode: CODIGO_SEDE,
      };
    });
    return roles || [];
  } catch (error) {
    console.log({ error });
    return [];
  }
};

export const getSites = async (): Promise<Site[]> => {
  try {
    const resp = await securityApi.api.post<StatusResponse<SitesResponse[]>>(
      EndpointSecurity.GetListaSedes,
    );

    const sites: Site[] = resp.data?.data?.map(
      MonitoringMapper.SitesResponseToEntity,
    ) || [];
    return sites;
  } catch (error) {
    console.log({ error });
    return [];
  }
};

export const getMenus = async (role: RoleSite): Promise<any[]> => {
  try {
    const cryptAdapter = new CryptAdapter();

    const roleData = {
      NOMBRE_ROL: role.name,
      CODIGO_ROL: role.code,
      ID_ROL: role.id,
      CODIGO_SEDE: role.siteCode,
    };
    const resp = await securityApi.api.post<StatusResponse<any[]>>(
      EndpointSecurity.GetMenus,
      {
        codigoRol: cryptAdapter.ecy(JSON.stringify(roleData)),
        codeModule: cryptAdapter.ecy(MODULE_CODE),
      },
    );
    return resp.data.data || [];
  } catch (error) {
    console.log({ error });
    return [];
  }
};

export const authLogout = async () => {
  try {
    const data = await securityApi.api.post(EndpointSecurity.Logout, {});
    console.log('authLogout', data);
  } catch (error) {
    console.error({ error });
  }
};