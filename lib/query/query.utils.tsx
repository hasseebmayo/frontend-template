/** biome-ignore-all lint/suspicious/noExplicitAny: any is required for type completion */
/** biome-ignore-all lint/complexity/noBannedTypes: FUnction is used as type */
import type { UseQueryOptions } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { useFetch } from "@/hooks/use-fetch"

// Base type for search parameters
export type SearchParams = Record<
  string,
  string | number | boolean | undefined | null
>

// Static query type with proper generics
export type StaticQuery<
  TData = unknown,
  TParams = undefined,
  TSearchParams = SearchParams,
> = {
  queryKey: readonly unknown[]
  path: string
  requiresParams?: boolean
  searchParams?: TSearchParams
  _data?: TData
  _params?: TParams
  _searchParams?: TSearchParams
}

// Dynamic query type with proper generics
export type DynamicQuery<
  TData = unknown,
  TParams = undefined,
  TSearchParams = SearchParams,
> = {
  queryKey: (
    params: TParams,
    searchParams?: TSearchParams
  ) => readonly unknown[]
  path: (params: TParams, searchParams?: TSearchParams) => string
  requiresParams?: boolean
  searchParams?: TSearchParams | ((params: TParams) => TSearchParams)
  _data?: TData
  _params?: TParams
  _searchParams?: TSearchParams
}

// Query definition type combining static and dynamic
export type QueryDefinition<
  TData = unknown,
  TParams = undefined,
  TSearchParams = SearchParams,
> =
  | StaticQuery<TData, TParams, TSearchParams>
  | DynamicQuery<TData, TParams, TSearchParams>

// Utility types for type inference
export type InferQueryData<T> = T extends { _data?: infer D } ? D : never
export type InferQueryParams<T> = T extends { _params?: infer P }
  ? P
  : undefined
export type InferSearchParams<T> = T extends { _searchParams?: infer S }
  ? S
  : SearchParams

// Helper type for merging unions
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

// Define query function with proper typings
export const defineQuery = <
  TData = unknown,
  TParams = undefined,
  TSearchParams = SearchParams,
>(
  def: QueryDefinition<TData, TParams, TSearchParams>
): QueryDefinition<TData, TParams, TSearchParams> => def

// Helper function to build URL with search params
function buildUrlWithParams(
  baseUrl: string,
  searchParams?: SearchParams
): string {
  if (!searchParams) {
    return baseUrl
  }
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })
  return params.toString() ? `${baseUrl}?${params}` : baseUrl
}

// New query config type for the object-based API
export type QueryConfig<TParams = any, TSearchParams = any> = {
  query: {
    module: string
    key: string
  }
  params?: TParams
  searchParams?: TSearchParams
  options?: Partial<UseQueryOptions<any, Error>>
}

// Create typed fetch hook with proper generic constraints - supports both flat and nested structures
export function createTypedFetchHook<
  T extends Record<string, Record<string, QueryDefinition<any, any, any>>>,
>(queryKeys: T) {
  // Create flattened query object
  const flatQueries = {} as Record<string, QueryDefinition<any, any, any>>

  Object.entries(queryKeys).forEach(([moduleKey, moduleValue]) => {
    if (typeof moduleValue === "object" && moduleValue !== null) {
      // This is a nested module structure
      Object.entries(
        moduleValue as Record<string, QueryDefinition<any, any, any>>
      ).forEach(([queryKey, queryDef]) => {
        flatQueries[`${moduleKey}.${queryKey}`] = queryDef
      })
    }
  })

  // Function overloads for different call signatures
  function useTypedFetch<
    M extends ExtractModules<T>,
    K extends ExtractKeys<T, M>,
  >(config: {
    query: { module: M; key: K }
    params?: InferQueryParams<ExtractQueryDef<T, M, K>>
    searchParams?: InferSearchParams<ExtractQueryDef<T, M, K>>
    options?: Partial<
      UseQueryOptions<InferQueryData<ExtractQueryDef<T, M, K>>, Error>
    >
  }): ReturnType<typeof useFetch>
  function useTypedFetch(
    key: string,
    config?: {
      params?: any
      searchParams?: any
      options?: Partial<UseQueryOptions<any, Error>>
    }
  ): ReturnType<typeof useFetch>

  // Implementation
  function useTypedFetch(
    keyOrConfig:
      | string
      | {
          query: { module: string; key: string }
          params?: any
          searchParams?: any
          options?: any
        },
    legacyConfig?: {
      params?: any
      searchParams?: any
      options?: Partial<UseQueryOptions<any, Error>>
    }
  ) {
    let key: string
    let params: any
    let searchParams: any
    let options: Partial<UseQueryOptions<any, Error>> | undefined

    // Handle both API styles
    if (typeof keyOrConfig === "string") {
      // Legacy API: useTypedFetch("posts.getAll", { params, searchParams, options })
      key = keyOrConfig
      params = legacyConfig?.params
      searchParams = legacyConfig?.searchParams
      options = legacyConfig?.options
    } else {
      // New API: useTypedFetch({ query: { module: "posts", key: "getAll" }, params, searchParams, options })
      const config = keyOrConfig as QueryConfig
      key = `${config.query.module}.${config.query.key}`
      params = config.params
      searchParams = config.searchParams
      options = config.options
    }

    const def = flatQueries[key] as QueryDefinition<any, any, any>

    if (!def) {
      throw new Error(`Query definition not found for key: ${key}`)
    }

    if (def.requiresParams && !params) {
      console.error(`Query "${key}" requires params but none were provided`)
    }

    // Determine queryKey based on static or dynamic definition
    let queryKey: readonly unknown[]
    if (typeof def.queryKey === "function") {
      // Dynamic queryKey
      queryKey = def.queryKey(params, searchParams)
    } else {
      // Static queryKey with params and searchParams added for cache differentiation
      const baseKey = [...def.queryKey]

      // Include params in the query key if provided
      if (params) {
        baseKey.push(params)
      }

      // Include search params keys in the query key if provided
      if (searchParams && Object.keys(searchParams).length > 0) {
        baseKey.push(Object.keys(searchParams).sort().join(","))
        // Include search param values for cache differentiation
        baseKey.push(
          Object.values(searchParams)
            .filter((v) => v !== undefined && v !== null)
            .map(String)
            .sort()
            .join(",")
        )
      }

      queryKey = baseKey
    }

    // Determine basePath based on static or dynamic definition
    let basePath: string
    if (typeof def.path === "function") {
      // Dynamic path
      basePath = def.path(params, searchParams)
    } else {
      // Static path with params appended if needed
      basePath = def.path

      // Append params to path if provided
      if (params) {
        // Get all keys of the params
        const paramKeys = Object.keys(params)
        if (paramKeys.length > 0) {
          // For each param, check if it's in the path template and replace it
          // Otherwise just append the first param value to the path
          let pathModified = false

          for (const key of paramKeys) {
            const placeholder = `:${key}`
            if (basePath.includes(placeholder)) {
              basePath = basePath.replace(
                placeholder,
                String((params as Record<string, any>)[key])
              )
              pathModified = true
            }
          }

          // If path wasn't modified by replacements, append the first param value
          if (!pathModified && paramKeys.length > 0) {
            const firstKey = paramKeys[0]
            const firstValue = (params as Record<string, any>)[firstKey]
            if (firstValue !== undefined && firstValue !== null) {
              // Add the value to the path
              basePath = basePath.endsWith("/")
                ? `${basePath}${String(firstValue)}`
                : `${basePath}/${String(firstValue)}`
            }
          }
        }
      }
    }

    // Add search parameters to URL
    const path = buildUrlWithParams(
      basePath,
      searchParams as SearchParams | undefined
    )

    // Return with explicit type annotation and ensure options are properly passed
    return useFetch<any>({
      queryKey,
      path,
      ...(options || {}),
    })
  }

  return useTypedFetch
}

// Extract query keys for reuse
export function extractQueryKeys<
  T extends Record<string, QueryDefinition<any, any, any>>[],
>(...keySets: T) {
  type Merged = UnionToIntersection<T[number]>
  const merged = Object.assign({}, ...keySets) as Merged

  const result: Record<string, any> = {}

  for (const key in merged) {
    const def = merged[key] as QueryDefinition<any, any, any>
    result[key] =
      typeof def.queryKey === "function"
        ? // eslint-disable-next-line ts/no-unsafe-function-type
          (params: any, searchParams?: any) =>
            (def.queryKey as Function)(params, searchParams)
        : def.queryKey
  }

  return result as {
    [K in keyof Merged]: Merged[K] extends DynamicQuery<any, infer P, infer S>
      ? (params: P, searchParams?: S) => readonly unknown[]
      : readonly unknown[]
  }
}

// Type helpers for extracting module and key types
type ExtractModules<T> = T extends Record<string, any> ? keyof T : never

type ExtractKeys<T, M extends keyof T> = T[M] extends Record<string, any>
  ? keyof T[M]
  : never

type ExtractQueryDef<
  T,
  M extends keyof T,
  K extends keyof T[M],
> = T[M][K] extends QueryDefinition<any, any, any> ? T[M][K] : never

// Unified config type with proper typing
export type TypedQueryConfig<
  T extends Record<string, Record<string, QueryDefinition<any, any, any>>>,
  M extends ExtractModules<T> = ExtractModules<T>,
  K extends ExtractKeys<T, M> = ExtractKeys<T, M>,
> = {
  module: M
  key: K
  params?: InferQueryParams<ExtractQueryDef<T, M, K>>
  searchParams?: InferSearchParams<ExtractQueryDef<T, M, K>>
  options?: Partial<
    UseQueryOptions<InferQueryData<ExtractQueryDef<T, M, K>>, Error>
  >
}

// Create typed query client hook with full typing and autocomplete
export function createTypedQueryClientHook<
  T extends Record<string, Record<string, QueryDefinition<any, any, any>>>,
>(queryKeys: T) {
  // Create flattened query object for internal use
  const flatQueries = {} as Record<string, QueryDefinition<any, any, any>>

  Object.entries(queryKeys).forEach(([moduleKey, moduleValue]) => {
    if (typeof moduleValue === "object" && moduleValue !== null) {
      Object.entries(
        moduleValue as Record<string, QueryDefinition<any, any, any>>
      ).forEach(([queryKey, queryDef]) => {
        flatQueries[`${moduleKey}.${queryKey}`] = queryDef
      })
    }
  })

  // Helper function to generate query key from config
  function generateQueryKey<
    M extends ExtractModules<T>,
    K extends ExtractKeys<T, M>,
  >(config: {
    module: M
    key: K
    params?: any
    searchParams?: any
  }): readonly unknown[] {
    const flatKey = `${String(config.module)}.${String(config.key)}`
    const def = flatQueries[flatKey]

    if (!def) {
      throw new Error(`Query definition not found for: ${flatKey}`)
    }

    if (def.requiresParams && !config.params) {
      console.warn(`Query "${flatKey}" requires params but none were provided`)
    }

    if (typeof def.queryKey === "function") {
      return def.queryKey(config.params, config.searchParams)
    } else {
      const baseKey = [...def.queryKey]

      if (config.params) {
        baseKey.push(config.params)
      }

      if (config.searchParams && Object.keys(config.searchParams).length > 0) {
        baseKey.push(Object.keys(config.searchParams).sort().join(","))
        baseKey.push(
          Object.values(config.searchParams)
            .filter((v) => v !== undefined && v !== null)
            .map(String)
            .sort()
            .join(",")
        )
      }

      return baseKey
    }
  }

  return function useTypedQueryClient() {
    const queryClient = useQueryClient()

    return {
      // Set query data with full typing
      setQueryData: <
        M extends ExtractModules<T>,
        K extends ExtractKeys<T, M>,
      >(config: {
        config: {
          module: M
          key: K
          params?: InferQueryParams<ExtractQueryDef<T, M, K>>
          searchParams?: InferSearchParams<ExtractQueryDef<T, M, K>>
        }
        updater:
          | InferQueryData<ExtractQueryDef<T, M, K>>
          | ((
              prev: InferQueryData<ExtractQueryDef<T, M, K>> | undefined
            ) => InferQueryData<ExtractQueryDef<T, M, K>>)
      }) => {
        const queryKey = generateQueryKey(config.config)
        return queryClient.setQueryData(queryKey, config.updater)
      },

      // Get query data with full typing
      getQueryData: <
        M extends ExtractModules<T>,
        K extends ExtractKeys<T, M>,
      >(config: {
        config: {
          module: M
          key: K
          params?: InferQueryParams<ExtractQueryDef<T, M, K>>
          searchParams?: InferSearchParams<ExtractQueryDef<T, M, K>>
        }
      }): InferQueryData<ExtractQueryDef<T, M, K>> | undefined => {
        const queryKey = generateQueryKey(config.config)
        return queryClient.getQueryData(queryKey)
      },

      // Invalidate query with full typing
      invalidateQuery: <
        M extends ExtractModules<T>,
        K extends ExtractKeys<T, M>,
      >(config: {
        config: {
          module: M
          key: K
          params?: InferQueryParams<ExtractQueryDef<T, M, K>>
          searchParams?: InferSearchParams<ExtractQueryDef<T, M, K>>
        }
      }) => {
        const queryKey = generateQueryKey(config.config)
        return queryClient.invalidateQueries({ queryKey })
      },

      // Remove query with full typing
      removeQuery: <
        M extends ExtractModules<T>,
        K extends ExtractKeys<T, M>,
      >(config: {
        config: {
          module: M
          key: K
          params?: InferQueryParams<ExtractQueryDef<T, M, K>>
          searchParams?: InferSearchParams<ExtractQueryDef<T, M, K>>
        }
      }) => {
        const queryKey = generateQueryKey(config.config)
        return queryClient.removeQueries({ queryKey })
      },

      // Get query state with full typing
      getQueryState: <
        M extends ExtractModules<T>,
        K extends ExtractKeys<T, M>,
      >(config: {
        config: {
          module: M
          key: K
          params?: InferQueryParams<ExtractQueryDef<T, M, K>>
          searchParams?: InferSearchParams<ExtractQueryDef<T, M, K>>
        }
      }) => {
        const queryKey = generateQueryKey(config.config)
        return queryClient.getQueryState(queryKey)
      },

      // Access to the underlying query client for advanced use cases
      queryClient,
    }
  }
}
