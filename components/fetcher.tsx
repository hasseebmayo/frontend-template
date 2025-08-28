import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query"
import type React from "react"
import QueryStatus from "@/components/match-query-status"
import type { QUERY_KEYS } from "@/lib/query"
import { useTypedFetch } from "@/lib/query"
import type {
  InferQueryData,
  InferQueryParams,
  InferSearchParams,
} from "@/lib/query/query.utils"

// Type helpers for the modular structure
type ExtractModules<T> = T extends Record<string, unknown> ? keyof T : never
type ExtractKeys<T, M extends keyof T> = T[M] extends Record<string, unknown>
  ? keyof T[M]
  : never

// Helper to extract the query definition from the nested structure
type ExtractQueryDef<T, M extends keyof T, K extends keyof T[M]> = T[M][K]

// Props for the Fetcher component with proper type safety
type FetcherProps<
  M extends ExtractModules<typeof QUERY_KEYS> = ExtractModules<
    typeof QUERY_KEYS
  >,
  K extends ExtractKeys<typeof QUERY_KEYS, M> = ExtractKeys<
    typeof QUERY_KEYS,
    M
  >,
> = {
  // Query configuration with full typing
  query: {
    module: M
    key: K
  }
  // Type-safe parameters based on the specific query definition
  params?: InferQueryParams<ExtractQueryDef<typeof QUERY_KEYS, M, K>>
  searchParams?: InferSearchParams<ExtractQueryDef<typeof QUERY_KEYS, M, K>>
  options?: Partial<
    UseQueryOptions<
      InferQueryData<ExtractQueryDef<typeof QUERY_KEYS, M, K>>,
      Error
    >
  >
} & (
  | {
      // Unified mode: onWithLoadingState is required
      onWithLoadingState: (
        data: InferQueryData<ExtractQueryDef<typeof QUERY_KEYS, M, K>>,
        isLoading: boolean
      ) => React.JSX.Element
      onError?:
        | React.JSX.Element
        | ((
            error: unknown,
            refetch: () => void,
            isLoading: boolean
          ) => React.JSX.Element)
      // Disallow separate handlers in unified mode
      onLoading?: never
      onEmpty?: never
      onSuccess?: never
    }
  | {
      // Separate handlers mode: onSuccess is required
      onLoading?:
        | React.JSX.Element
        | ((className?: string, loaderClassName?: string) => React.JSX.Element)
      onError?:
        | React.JSX.Element
        | ((
            error: unknown,
            refetch: () => void,
            isLoading: boolean
          ) => React.JSX.Element)
      onEmpty?: React.JSX.Element
      onSuccess: (
        data: NonNullable<
          InferQueryData<ExtractQueryDef<typeof QUERY_KEYS, M, K>>
        >
      ) => React.JSX.Element
      // Disallow unified mode
      onWithLoadingState?: never
    }
)

/**
 * Fetcher component that combines useTypedFetch with QueryStatus
 * Provides a clean API for data fetching with automatic status handling
 */
export default function Fetcher<
  M extends ExtractModules<typeof QUERY_KEYS>,
  K extends ExtractKeys<typeof QUERY_KEYS, M>,
>(props: FetcherProps<M, K>) {
  const {
    query: queryConfig,
    params,
    searchParams,
    options,
    ...statusProps
  } = props

  // Use the typed fetch hook with the new config pattern
  const queryKeyString = `${String(queryConfig.module)}.${String(queryConfig.key)}`
  const query = useTypedFetch(queryKeyString, {
    params,
    searchParams,
    options,
  })

  // Pass the query result to QueryStatus with the status props
  type Data = InferQueryData<ExtractQueryDef<typeof QUERY_KEYS, M, K>>
  const typedQuery = query as UseQueryResult<Data, Error>
  return <QueryStatus query={typedQuery} {...statusProps} />
}
