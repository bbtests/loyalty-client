import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../lib/api-client";

type EntityApiOptions<T, CreateT = Partial<T>, UpdateT = Partial<T>> = {
  reducerPath: string;
  entityEndpoint: string;
  tagTypes?: string[];
};

/**
 * Substitutes URL parameters in an endpoint string
 * @param endpoint - The endpoint with parameters (e.g., "users/:id/orders")
 * @param params - Object containing parameter values
 * @returns The endpoint with parameters substituted
 */
const substituteUrlParams = (
  endpoint: string,
  params: Record<string, any> = {},
): string => {
  return endpoint.replace(/:(\w+)/g, (match, paramName) => {
    return params[paramName] || match;
  });
};

/**
 * Extracts URL parameter names from an endpoint
 * @param endpoint - The endpoint string
 * @returns Array of parameter names
 */
const getUrlParamNames = (endpoint: string): string[] => {
  const matches = endpoint.match(/:(\w+)/g);
  return matches ? matches.map((match) => match.substring(1)) : [];
};

/**
 * Filters out URL parameters from query parameters
 * @param params - All parameters
 * @param urlParamNames - Names of URL parameters to exclude
 * @returns Filtered query parameters
 */
const filterQueryParams = (
  params: Record<string, any>,
  urlParamNames: string[],
): Record<string, string> => {
  return Object.entries(params)
    .filter(
      ([key, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !urlParamNames.includes(key),
    )
    .reduce(
      (acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>,
    );
};

export function createEntity<T, CreateT = Partial<T>, UpdateT = Partial<T>>(
  options: EntityApiOptions<T, CreateT, UpdateT>,
) {
  const { reducerPath, entityEndpoint, tagTypes } = options;

  const customBaseQuery = async ({
    url,
    method,
    body,
  }: {
    url: string;
    method?: string;
    body?: any;
  }): Promise<
    | { data: any }
    | {
        error: {
          status: string | number;
          error: string;
          data?: any;
        };
      }
  > => {
    try {
      let result: any;
      switch ((method || "GET").toUpperCase()) {
        case "GET_ALL":
          result = await apiClient.get(url);
          return {
            data: result,
          };
        case "GET_SINGLE":
          result = await apiClient.get(url);
          return {
            data: result?.data?.items,
          };
        case "GET_BY_ID":
        case "GET":
          result = await apiClient.get(url);
          return {
            data: result?.data?.item,
          };
        case "POST":
          result = await apiClient.post(url, body);
          return { data: result?.data?.item };
        case "PUT":
          result = await apiClient.put(url, body);
          return { data: result?.data?.item };
        case "DELETE":
          result = await apiClient.delete(url);
          return { data: result?.data || { success: true } };
        default:
          return {
            error: {
              status: "METHOD_NOT_SUPPORTED",
              error: "Method not supported",
            },
          };
      }
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

  const api = createApi({
    reducerPath,
    baseQuery: customBaseQuery,
    tagTypes,
    endpoints: (builder) => ({
      getAll: builder.query<T[], Record<string, any> | void>({
        query: (params) => {
          const safeParams = params || {};

          // Build URL with substituted parameters
          let url = `/${substituteUrlParams(entityEndpoint, safeParams)}`;

          // Add query parameters (excluding URL parameters)
          const urlParamNames = getUrlParamNames(entityEndpoint);
          const queryParams = filterQueryParams(safeParams, urlParamNames);

          if (Object.keys(queryParams).length > 0) {
            const queryString = new URLSearchParams(queryParams).toString();
            url += `?${queryString}`;
          }

          return { url, method: "GET_ALL" };
        },
      }),
      getById: builder.query<T, string>({
        query: (id: string) => ({
          url: `/${entityEndpoint}/${id}`,
          method: "GET_BY_ID",
        }),
      }),
      create: builder.mutation<T, CreateT>({
        query: (body: CreateT) => ({
          url: `/${entityEndpoint}`,
          method: "POST",
          body,
        }),
      }),
      update: builder.mutation<T, { id: string; data: UpdateT }>({
        query: ({ id, data }: { id: string; data: UpdateT }) => ({
          url: `/${entityEndpoint}/${id}`,
          method: "PUT",
          body: data,
        }),
      }),
      delete: builder.mutation<{ success: boolean }, string>({
        query: (id: string) => ({
          url: `/${entityEndpoint}/${id}`,
          method: "DELETE",
        }),
      }),
      getSingle: builder.query<T, Record<string, any> | void>({
        query: (params) => {
          const safeParams = params || {};
          let url = `/${substituteUrlParams(entityEndpoint, safeParams)}`;
          const urlParamNames = getUrlParamNames(entityEndpoint);
          const queryParams = filterQueryParams(safeParams, urlParamNames);
          if (Object.keys(queryParams).length > 0) {
            const queryString = new URLSearchParams(queryParams).toString();
            url += `?${queryString}`;
          }
          return { url, method: "GET_SINGLE" };
        },
      }),
    }),
  });

  (api as any).entityEndpoint = entityEndpoint;

  return api;
}
