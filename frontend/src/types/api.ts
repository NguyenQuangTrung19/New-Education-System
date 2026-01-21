export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string | string[];
  statusCode?: number;
};

export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PageResponse<T> = {
  items: T[];
  meta: PageMeta;
};
