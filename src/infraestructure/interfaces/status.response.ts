import {BaseStatusResponse} from './base.response';

export interface StatusResponse<T> extends BaseStatusResponse {
  data?: T;
}

export interface StatusPageResponse<T> {
  data: T;
  status: {
    statusCode: number;
    messages: string[];
    success: boolean;
  };
  totalPages: number;
  totalRows: number;
}
