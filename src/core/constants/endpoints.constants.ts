export class EndpointSecurity {
  public static readonly Login = '/Identity/Login';
  public static readonly captcha = '/Identity/GetCaptchaImage';
  public static readonly IsAuthorized = '/Identity/IsAuthenticated';
  public static readonly RefreshToken = '/Identity/RefreshToken';
  public static readonly GetMenuPrincipal = '/Identity/GetMenuPrincipal';
  public static readonly GetMenus = '/Identity/getmenus';
  public static readonly GetListaSedes = '/Identity/listasedes';
  public static readonly Logout = '/Identity/Logout';
  public static readonly GetMenuPrincipalByRol =
    '/Identity/GetMenuPrincipaByRol';
  public static readonly ObtenerTiposDocumento =
    '/Identity/ObtenerTiposDocumento';
  public static readonly ObtenerTokenActivacion =
    '/Identity/ObtenerTokenActivacion';
  public static readonly RestaurarContrasenia =
    '/Identity/RestaurarContrasenia';
  public static readonly UrlOlvidoConstrasenia =
    '/Identity/UrlOlvidoConstrasenia';
}

export class EndpointAuxiliar {
  public static readonly GetInstitution = '/auxiliar/padron/getinstitucioneducativa';
}

export class EndpointConfiguration {
  public static readonly DetailInstrument = '/instrumento';
}

export class EndpointMonitoring {
  public static readonly Plans = '/planmonitoreo/paginateforgrid';
  public static readonly DetailPlan = '/planmonitoreo';
  public static readonly Instruments = '/instrumento/paginate';
  public static readonly DetailInstrument = '/instrumento';
  public static readonly Samples = '/muestra/paginate';
  public static readonly Visits = '/visitamuestra/paginateforgrid';
  public static readonly AddSampleVisit = '/visitamuestra/add';
  public static readonly UpdateSampleVisit =
    '/visitamuestra/updateprogramacion';
  public static readonly GetVisitaMuestra = '/visitamuestra';
  public static readonly GetItemsByInstrumentAspect =
    '/iteminstrumento/byinstrumentoandaspecto';
  public static readonly UpdateSampleVisitExecution =
    '/visitamuestra/updateinicioejecucionsimple';
  public static readonly UpdateExecutionStartWithReplacement =
    '/visitamuestra/updateinicioejecucionconrepresentante';
  public static readonly UpdateRescheduling =
    '/visitamuestra/updatereprogramacion';
  public static readonly UpdateCompletedWithoutExecution =
    '/visitamuestra/updateculminadasinejecucion';
  public static readonly AddList = '/visitarespuesta/addlist';
  public static readonly GetByVisitaAspect = '/visitarespuesta/byvisitaandaspecto';
  public static readonly SendCommitment = '/visitamuestra/updateobservacioncompromisos';
  public static readonly SendInstrumentAnswers = '/visitamuestra/updateenprocesocierre';
  public static readonly AddSample = '/muestra/addlist';

}

export class EndpointFiles {
  public static readonly Upload = '/file/upload';
  public static readonly Download = '/file';
}
