import { create } from 'zustand';
import { AuthStatus, ROLE_DIRECTOR_IIEE, ROLE_TEACHER_IIEE } from '../../core/constants';
import { Institution, RoleSite, Site, User } from '../../core/entities';
import { StorageAdapter } from '../../config/adapters/storage-adapter';
import {
  authLogin,
  isAuthenticated,
  authCheckStatus,
  getCaptcha,
  getRoles,
  getSites,
  authLogout,
  getMenus as getMenusAction,
} from '../../core/actions';
import { LOGIN_TOKEN_CODE, NAMES_CODE, REFRESH_TOKEN_CODE, ROLSITE_CODE, TOKEN_CODE } from '@env';
import { LOGOUT_ATTEMPTS_CODE } from '../../core/constants/auth.types';
import { getInstitucionEducativa } from '../../core/actions/auxiliar/auxiliar';
import { CryptAdapter } from '../../config/adapters/cryp-adapter';
import { AbstractApi } from '../../config/api/abstract.api'; // Import AbstractApi

// Set up the static logout callback to trigger store logout
AbstractApi.onLogout = () => {
  useAuthStore.getState().logout();
};

// TODO: get data from memory of device when is offline
export interface AuthState {
  status: AuthStatus;
  isOffLine: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  roles: RoleSite[];
  sites: Site[];
  currentRole?: RoleSite;
  currentSite?: Site;
  currentInstitution?: Institution;

  setIsOffLine: (value: boolean) => void;
  login: (user: string, password: string, captcha: string) => Promise<boolean>;
  isAuthenticated: (routeName: string) => Promise<boolean>;
  checkStatus: () => Promise<void>;
  logout: () => Promise<void>;
  getCaptcha: () => Promise<string>;
  getRoleSites: () => Promise<RoleSite[]>;
  getMenus: (role: RoleSite) => Promise<any[]>;
  setCurrentSite: (site: Site) => Promise<void>;
  setCurrentInstitution: (institution: Institution) => Promise<void>;
  incrementLogoutAttempts: () => Promise<number>;
  resetLogoutAttempts: () => Promise<void>;
  getLogoutAttempts: () => Promise<number>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  status: 'checking',
  isOffLine: true,
  token: undefined,
  user: undefined,
  roles: [],
  sites: [],
  currentRole: undefined,
  currentSite: undefined,

  setIsOffLine: (value: boolean) => {
    set({ isOffLine: value });
  },

  login: async (user: string, password: string, captcha: string) => {
    const resp = await authLogin(user, password, captcha);
    if (!resp) {
      set({ status: 'unauthenticated', token: undefined, user: undefined });
      return false;
    }
    console.log('login resp', resp);
    await StorageAdapter.setItem(TOKEN_CODE, resp.token);
    await StorageAdapter.setItem(REFRESH_TOKEN_CODE, resp.refreshToken);

    // Encriptar datos de usuario antes de guardar
    const cryptAdapter = new CryptAdapter();
    const userData = `${resp.user.fullName}|${resp.user.firstLastName}|${resp.user.secondLastName}|${resp.user.names}|${resp.user.documentNumber}|${resp.user.idDocumentType}`;
    const encryptedUserData = cryptAdapter.ecy(userData);
    await StorageAdapter.setItem(NAMES_CODE, encryptedUserData);

    set({ status: 'authenticated', token: resp.token, refreshToken: resp.refreshToken, user: resp.user });

    // get menu after login
    const { getRoleSites } = get();
    await getRoleSites();

    return true;
  },

  isAuthenticated: async (_routeName: string): Promise<boolean> => {
    const data = await isAuthenticated();

    if (data.success) {
      await StorageAdapter.setItem(TOKEN_CODE, data.token);
      await StorageAdapter.setItem(REFRESH_TOKEN_CODE, data.refreshToken);
      const resp = await authCheckStatus();
      set({ status: 'authenticated', token: data.token, refreshToken: data.refreshToken, user: resp?.user });
    } else {
      set({ status: 'unauthenticated', token: undefined, refreshToken: undefined, user: undefined });
    }

    console.log('isAuthenticated result:', data);
    return data.success;
  },

  checkStatus: async () => {
    const resp = await authCheckStatus();
    if (!resp?.token!) {
      set({ status: 'unauthenticated', token: undefined, refreshToken: undefined, user: undefined });
      return;
    }
    set({ status: 'authenticated', token: resp.token, refreshToken: resp.refreshToken, user: resp.user });

    // get menu after check status
    const { getRoleSites } = get();
    await getRoleSites();
  },

  logout: async () => {
    await authLogout();
    await StorageAdapter.removeItem(TOKEN_CODE);
    await StorageAdapter.removeItem(LOGIN_TOKEN_CODE);
    await StorageAdapter.removeItem(REFRESH_TOKEN_CODE);
    await StorageAdapter.removeItem(ROLSITE_CODE);
    await StorageAdapter.removeItem(NAMES_CODE);

    // Resetear contador de intentos de logout al ejecutar logout exitosamente
    await StorageAdapter.removeItem(LOGOUT_ATTEMPTS_CODE);

    set({
      status: 'unauthenticated',
      token: undefined,
      refreshToken: undefined,
      user: undefined,
      currentRole: undefined,
      currentSite: undefined,
      roles: [],
      sites: [],
    });
  },

  getCaptcha: async (): Promise<string> => {
    const resp = await getCaptcha();
    // TODO: Dont get captcha when is off line
    // save jwt-login
    await StorageAdapter.setItem(
      LOGIN_TOKEN_CODE,
      resp?.jwtToken!,
    );
    return 'data:image/jpeg;base64,' + resp?.data;
  },

  getRoleSites: async (): Promise<any> => {
    const [roles, sites] = await Promise.all([getRoles(), getSites()]);
    // TODO: Save menu data in memory to off line behavior and to get from memory when is offline

    //After get from memory or api selected current role and site
    if (roles.length > 0) {
      // Obtener y desencriptar el sitio seleccionado
      const encryptedRoleSite = await StorageAdapter.getItem<string>(ROLSITE_CODE);
      let currentRoleSiteStorage: Site | null = null;

      if (encryptedRoleSite) {
        try {
          const cryptAdapter = new CryptAdapter();
          const decryptedRoleSite = cryptAdapter.dcy(encryptedRoleSite);
          if (decryptedRoleSite) {
            currentRoleSiteStorage = JSON.parse(decryptedRoleSite) as Site;
          }
        } catch (error) {
          console.error('Error decrypting role site:', error);
          // Fallback por si acaso no estaba encriptado anteriormente (retrocompatibilidad)
          // aunque idealmente se debería manejar la migración.
          // Si falla el parseo, se asume null.
        }
      }

      const fistRole = currentRoleSiteStorage
        ? roles.find(x => x.code === currentRoleSiteStorage?.roleCode)
        : roles[0];
      const firstSite = currentRoleSiteStorage
        ? currentRoleSiteStorage
        : sites.find(x => x.roleCode === fistRole?.code);

      const { setCurrentSite, setCurrentInstitution } = get();
      // Set current role and site if not exists value in current role or site && get menu by role
      set({ currentRole: fistRole });
      setCurrentSite(firstSite!);
      // await Promise.all([setCurrentSite(firstSite!), getMenus(fistRole!)]);
      if (fistRole?.code === ROLE_DIRECTOR_IIEE || fistRole?.code === ROLE_TEACHER_IIEE) {
        const institution = await getInstitucionEducativa(firstSite?.code ?? '', firstSite?.anexo ?? '0');
        if (institution.success) {
          setCurrentInstitution(institution.data!);
        }
      }
    }
    set({ roles: roles, sites: sites });
  },

  getMenus: async (role: RoleSite): Promise<any[]> => {
    await getMenusAction(role);
    return [];
  },

  setCurrentSite: async (site: Site): Promise<void> => {
    set({ currentSite: site });
    set({
      currentRole: {
        code: site.roleCode,
        name: site.roleName,
        siteCode: site.code,
        id: ''
      }
    });

    // Encriptar sitio antes de guardar
    const cryptAdapter = new CryptAdapter();
    const encryptedSite = cryptAdapter.ecy(JSON.stringify(site));
    await StorageAdapter.setItem(ROLSITE_CODE, encryptedSite);
  },

  setCurrentInstitution: async (institution: Institution): Promise<void> => {
    set({ currentInstitution: institution });
  },

  incrementLogoutAttempts: async (): Promise<number> => {
    try {
      const currentAttempts = await StorageAdapter.getItem<number>(LOGOUT_ATTEMPTS_CODE) || 0;
      const newAttempts = currentAttempts + 1;
      await StorageAdapter.setItem(LOGOUT_ATTEMPTS_CODE, newAttempts);
      console.log(`🔄 Intento de logout #${newAttempts}`);
      return newAttempts;
    } catch (error) {
      console.error('❌ Error incrementando contador de logout:', error);
      return 0;
    }
  },

  resetLogoutAttempts: async (): Promise<void> => {
    try {
      await StorageAdapter.removeItem(LOGOUT_ATTEMPTS_CODE);
      console.log('✅ Contador de intentos de logout reseteado');
    } catch (error) {
      console.error('❌ Error reseteando contador de logout:', error);
    }
  },

  getLogoutAttempts: async (): Promise<number> => {
    try {
      const attempts = await StorageAdapter.getItem<number>(LOGOUT_ATTEMPTS_CODE) || 0;
      return attempts;
    } catch (error) {
      console.error('❌ Error obteniendo contador de logout:', error);
      return 0;
    }
  },
}));
