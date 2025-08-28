/** biome-ignore-all lint/suspicious/noExplicitAny: error type is any */
"use client"
import type { UseQueryOptions } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { env } from "@/env"
import { buildRequestUrl } from "@/lib/utils"

export type FetchApiType = {
  queryKey: string[]
  path: string
}

type IUseFetch<T> = {
  path: string
  queryKey: readonly unknown[] // Accept any readonly array for compatibility
  config?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">
}

export function useFetch<T>({ path, queryKey, ...config }: IUseFetch<T>) {
  const auth = { token: "" }
  if (!queryKey) {
    throw new Error("queryKey is required")
  }
  if (!path) {
    throw new Error("path is required")
  }
  const REQUEST_URL = buildRequestUrl(env.NEXT_PUBLIC_APP_URL, path)

  const fetchData = async (): Promise<T> => {
    try {
      const response = await axios.get(REQUEST_URL, {
        headers: auth?.token
          ? {
              Authorization: `Bearer ${auth?.token}`,
            }
          : {},
      })
      if (response.data.data) {
        return response.data.data
      }
      return response.data
    } catch (error: any) {
      if (!error.response) {
        throw new Error("Network error, please check your internet connection.")
      }
      if (error.response.status === 401) {
        console.log("Unauthorized access, logging out...")
        // Add your function here
      }
      throw error
    }
  }

  const query = useQuery<T, Error>({
    queryKey,
    queryFn: fetchData,
    refetchOnWindowFocus: false,
    ...config,
  })

  return query
}
