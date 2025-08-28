import type { UseQueryResult } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import type { JSX } from "react"
// React default import is unnecessary with the new JSX transform
import { cn } from "../lib/utils"
import EmptyCard from "./empty-card"
import ErrorCard from "./error-card"

/**
 * Loader component displays a spinning loader.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional additional classes for the container.
 * @param {string} [props.loaderClassName] - Optional additional classes for the loader icon.
 * @returns {JSX.Element} Loader element.
 */
function Loader({
  className,
  loaderClassName,
}: {
  className?: string
  loaderClassName?: string
}) {
  return (
    <div
      className={cn("flex h-10 w-full items-center justify-center", className)}
    >
      <Loader2
        className={cn("size-5 animate-spin text-primary", loaderClassName)}
      />
    </div>
  )
}

/**
 * Props for the QueryStatus component.
 *
 * This component supports two modes:
 *
 * 1. **Unified Mode (onWithLoadingState)**
 *    - Use this mode when you want a single callback to handle both loading and success states.
 *
 *    @property {UseQueryResult<T>} query - The query result from react-query.
 *    @property {(data: T, isLoading: boolean) => JSX.Element} onWithLoadingState - Callback invoked with query data and loading state.
 *    @property {JSX.Element | ((error: unknown, refetch: () => void, isLoading: boolean) => JSX.Element)} [onError] - Optional custom error renderer.
 *
 * 2. **Separate Handlers Mode**
 *    - Use separate renderers for each state: loading, error, empty, and success.
 *
 *    @property {UseQueryResult<T>} query - The query result from react-query.
 *    @property {JSX.Element | ((className?: string, loaderClassName?: string) => JSX.Element)} [onLoading] - Optional custom loading renderer. Defaults to a Loader.
 *    @property {JSX.Element | ((error: unknown, refetch: () => void, isLoading: boolean) => JSX.Element)} [onError] - Optional custom error renderer. Defaults to an ErrorCard.
 *    @property {JSX.Element} [onEmpty] - Optional renderer when the query returns empty data. Defaults to an EmptyCard.
 *    @property {(data: NonNullable<T>) => JSX.Element} onSuccess - Callback invoked when the query successfully returns non-empty data.
 *
 * Note: You cannot mix modes; if `onWithLoadingState` is provided, the separate handlers must not be provided.
 *
 * @template T - The type of data returned by the query.
 */
export type QueryStatusProps<T> =
  | {
      query: UseQueryResult<T>
      onWithLoadingState: (data: T, isLoading: boolean) => JSX.Element
      onError?:
        | JSX.Element
        | ((
            error: unknown,
            refetch: () => void,
            isLoading: boolean
          ) => JSX.Element)
      // These props are disallowed in this branch
      onLoading?: never
      onEmpty?: never
      onSuccess?: never
    }
  | {
      query: UseQueryResult<T>
      onLoading?:
        | JSX.Element
        | ((className?: string, loaderClassName?: string) => JSX.Element)
      onError?:
        | JSX.Element
        | ((
            error: unknown,
            refetch: () => void,
            isLoading: boolean
          ) => JSX.Element)
      onEmpty?: JSX.Element
      onSuccess: (data: NonNullable<T>) => JSX.Element
      // Disallow onWithLoadingState in this branch
      onWithLoadingState?: never
    }

/**
 * Type guard to determine if the unified mode (onWithLoadingState) is used.
 *
 * @template T
 * @param {QueryStatusProps<T>} props - The props to check.
 * @returns {props is { query: UseQueryResult<T>; onWithLoadingState: (data: T, isLoading: boolean) => JSX.Element; onError?: JSX.Element | ((error: unknown, refetch: () => void, isLoading: boolean) => JSX.Element); }} True if unified mode is used.
 */
function hasOnWithLoadingState<T>(props: QueryStatusProps<T>): props is {
  query: UseQueryResult<T>
  onWithLoadingState: (data: T, isLoading: boolean) => JSX.Element
  onError?:
    | JSX.Element
    | ((error: unknown, refetch: () => void, isLoading: boolean) => JSX.Element)
} {
  return (
    "onWithLoadingState" in props &&
    typeof props.onWithLoadingState === "function"
  )
}

/**
 * QueryStatus component renders different UI elements based on the query state.
 *
 * It supports two usage modes:
 *
 * 1. **Unified Mode:**
 *    Provide `onWithLoadingState` which receives both the query data and loading state.
 *
 * 2. **Separate Handlers Mode:**
 *    Provide individual renderers:
 *    - `onLoading`: Renders while loading.
 *    - `onError`: Renders if an error occurs.
 *    - `onEmpty`: Renders if the query data is empty.
 *    - `onSuccess`: Renders when the query returns valid data.
 *
 * @template T - The type of data returned by the query.
 * @param {QueryStatusProps<T>} props - The props for handling various query states.
 * @returns {JSX.Element} The rendered UI element based on the query state.
 */
function QueryStatus<T>(props: QueryStatusProps<T>): JSX.Element {
  const { query } = props

  if (hasOnWithLoadingState(props)) {
    if (query.isError && props.onError) {
      return typeof props.onError === "function"
        ? props.onError(query.failureReason, query.refetch, query.isLoading)
        : props.onError
    }

    return props.onWithLoadingState(query.data as T, query.isLoading)
  }

  const {
    onLoading = (c, l) => <Loader className={c} loaderClassName={l} />,
    onError = (error, refetch, isLoading) => (
      <ErrorCard error={error} isLoading={isLoading} onRetry={refetch} />
    ),
    onEmpty = <EmptyCard />,
    onSuccess,
  } = props

  if (query.isLoading) {
    return typeof onLoading === "function" ? onLoading() : onLoading
  }

  if (query.isError) {
    return typeof onError === "function"
      ? onError(query.failureReason, query.refetch, query.isLoading)
      : onError
  }

  const isEmptyData = (data: unknown): boolean =>
    data === undefined ||
    data === null ||
    (Array.isArray(data) && data.length === 0)

  if (isEmptyData(query.data) && onEmpty) {
    return onEmpty
  }

  return onSuccess(query.data as NonNullable<T>)
}

export default QueryStatus
