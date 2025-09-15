import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient, ApiRequestConfig } from "@/lib/api-client";

// Types
type EntityApiOptions<T, CreateT = Partial<T>, UpdateT = Partial<T>> = {
  reducerPath: string;
  entityEndpoint: string;
  tagTypes?: string[];
};

type QueryArg<T = any> = T | { params?: T; config?: ApiRequestConfig; extraPath?: string };
type MutationArg<T = any> = { data: T; config?: ApiRequestConfig; extraPath?: string } | T;
type IdArg = { id: string | number; config?: ApiRequestConfig; extraPath?: string } | string | number;

// URL utilities
const substituteUrlParams = (endpoint: string, params: Record<string, any> = {}): string => {
  return endpoint.replace(/:(\w+)/g, (_, paramName) => params[paramName] || `:${paramName}`);
};

const getUrlParamNames = (endpoint: string): string[] => {
  return endpoint.match(/:(\w+)/g)?.map(match => match.substring(1)) || [];
};

// Helper function to build URLs with extra path segments
const buildUrl = (baseUrl: string, extraPath?: string): string => {
  if (!extraPath) return baseUrl;
  const normalizedExtraPath = extraPath.startsWith('/') ? extraPath : `/${extraPath}`;
  return `${baseUrl}${normalizedExtraPath}`;
};

// Helper function to build URLs with parameters and extra path segments
const buildUrlWithParams = (endpoint: string, params: Record<string, any> = {}, extraPath?: string): string => {
  const urlParamNames = getUrlParamNames(endpoint);
  const queryParams = Object.entries(params)
    .filter(([key, value]) => 
      value != null && 
      value !== "" && 
      !urlParamNames.includes(key)
    )
    .reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>);
  
  let url = `/${substituteUrlParams(endpoint, params)}`;
  
  // Append extra path if provided
  if (extraPath) {
    // Ensure extraPath starts with / if it doesn't already
    const normalizedExtraPath = extraPath.startsWith('/') ? extraPath : `/${extraPath}`;
    url += normalizedExtraPath;
  }
  
  if (Object.keys(queryParams).length > 0) {
    url += `?${new URLSearchParams(queryParams).toString()}`;
  }
  
  return url;
};

// Argument extractors
const extractQueryArgs = <T>(arg: QueryArg<T> | void): { params: T; config?: ApiRequestConfig; extraPath?: string } => {
  if (!arg) return { params: {} as T };
  
  if (typeof arg === 'object' && 'params' in arg) {
    return { params: arg.params || ({} as T), config: arg.config, extraPath: arg.extraPath };
  }
  
  // Handle case where extraPath is passed directly in the object
  if (typeof arg === 'object' && 'extraPath' in arg) {
    const { extraPath, config, ...params } = arg as any;
    return { params: params as T, config, extraPath };
  }
  
  return { params: arg as T, config: undefined, extraPath: undefined };
};

const extractIdArgs = (arg: IdArg): { id: string; config?: ApiRequestConfig; extraPath?: string } => {
  if (typeof arg === 'string' || typeof arg === 'number') {
    return { id: String(arg), config: undefined, extraPath: undefined };
  }
  return { id: String(arg.id), config: arg.config, extraPath: arg.extraPath };
};

const extractMutationArgs = <T>(arg: MutationArg<T>): { data: T; config?: ApiRequestConfig; extraPath?: string } => {
  if (typeof arg === 'object' && arg !== null && 'data' in arg) {
    return { data: arg.data, config: arg.config, extraPath: arg.extraPath };
  }
  
  return { data: arg as T, config: undefined, extraPath: undefined };
};

// API method handlers
const createApiHandler = (method: 'get' | 'post' | 'put' | 'patch' | 'delete', dataExtractor: (result: any) => any) => {
  return (url: string, bodyOrConfig?: any, config?: ApiRequestConfig) => {
    const actualConfig = bodyOrConfig && typeof bodyOrConfig === 'object' && 'showToast' in bodyOrConfig 
      ? bodyOrConfig 
      : config;
    const actualBody = method === 'get' || method === 'delete' ? undefined : bodyOrConfig;
    
    return apiClient[method](url, actualBody, actualConfig).then(result => ({ 
      data: dataExtractor(result) 
    }));
  };
};

const apiHandlers = {
  GET_ALL: createApiHandler('get', (result) => result),
  GET_SINGLE: createApiHandler('get', (result) => result?.data?.items),
  GET_BY_ID: createApiHandler('get', (result) => result?.data?.item),
  POST: createApiHandler('post', (result) => result?.data?.item),
  PUT: createApiHandler('put', (result) => result?.data?.item),
  PATCH: createApiHandler('patch', (result) => result?.data?.item),
  DELETE: createApiHandler('delete', (result) => result?.data || { success: true })
} as const;

type ApiMethod = keyof typeof apiHandlers;

const customBaseQuery = async ({
  url,
  method,
  body,
  config,
}: {
  url: string;
  method?: ApiMethod;
  body?: any;
  config?: ApiRequestConfig;
}) => {
  try {
    const methodKey = method || 'GET_BY_ID';
    const handler = apiHandlers[methodKey];
    
    if (!handler) {
      return {
        error: {
          status: "METHOD_NOT_SUPPORTED",
          error: "Method not supported",
        },
      };
    }
    
    // Handle different method signatures
    const needsBody = ['POST', 'PUT', 'PATCH'].includes(methodKey);
    return needsBody 
      ? await handler(url, body, config)
      : await handler(url, config);
      
  } catch (error: any) {
    return {
      error: {
        status: error?.code || "CUSTOM_ERROR",
        error: error?.message || "Unknown error",
        data: error?.errors,
      },
    };
  }
};

export function createEntity<T, CreateT = Partial<T>, UpdateT = Partial<T>>(
  options: EntityApiOptions<T, CreateT, UpdateT>
) {
  const { reducerPath, entityEndpoint, tagTypes } = options;

  const api = createApi({
    reducerPath,
    baseQuery: customBaseQuery,
    tagTypes,
    endpoints: (builder) => ({
      getAll: builder.query<T[], QueryArg<Record<string, any>> | void>({
        query: (arg) => {
          const { params, config, extraPath } = extractQueryArgs(arg);
          return {
            url: buildUrlWithParams(entityEndpoint, params, extraPath),
            method: "GET_ALL",
            config,
          };
        },
      }),
      
      getById: builder.query<T, IdArg>({
        query: (arg) => {
          const { id, config, extraPath } = extractIdArgs(arg);
          const baseUrl = `/${entityEndpoint}/${id}`;
          return {
            url: buildUrl(baseUrl, extraPath),
            method: "GET_BY_ID",
            config,
          };
        },
      }),
      
      getSingle: builder.query<T, QueryArg<Record<string, any>> | void>({
        query: (arg) => {
          const { params, config, extraPath } = extractQueryArgs(arg);
          return {
            url: buildUrlWithParams(entityEndpoint, params, extraPath),
            method: "GET_SINGLE",
            config,
          };
        },
      }),
      
      create: builder.mutation<T, MutationArg<CreateT>>({
        query: (arg) => {
          const { data, config, extraPath } = extractMutationArgs(arg);
          const baseUrl = `/${entityEndpoint}`;
          return {
            url: buildUrl(baseUrl, extraPath),
            method: "POST",
            body: data,
            config,
          };
        },
      }),
      
      update: builder.mutation<T, { id: string | number; data: UpdateT; config?: ApiRequestConfig; extraPath?: string }>({
        query: ({ id, data, config, extraPath }) => {
          const baseUrl = `/${entityEndpoint}/${id}`;
          return {
            url: buildUrl(baseUrl, extraPath),
            method: "PUT",
            body: data,
            config,
          };
        },
      }),
      
      patch: builder.mutation<T, { id: string | number; data: UpdateT; config?: ApiRequestConfig; extraPath?: string }>({
        query: ({ id, data, config, extraPath }) => {
          const baseUrl = `/${entityEndpoint}/${id}`;
          return {
            url: buildUrl(baseUrl, extraPath),
            method: "PATCH",
            body: data,
            config,
          };
        },
      }),
      
      delete: builder.mutation<{ success: boolean }, IdArg>({
        query: (arg) => {
          const { id, config, extraPath } = extractIdArgs(arg);
          const baseUrl = `/${entityEndpoint}/${id}`;
          return {
            url: buildUrl(baseUrl, extraPath),
            method: "DELETE",
            config,
          };
        },
      }),
    }),
  });

  // Add entityEndpoint to the API instance for external access
  (api as any).entityEndpoint = entityEndpoint;

  return api;
}