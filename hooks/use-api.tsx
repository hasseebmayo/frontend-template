/** biome-ignore-all lint/suspicious/noExplicitAny: <type any is used  */
import { useMutation } from "@tanstack/react-query"
import type { AxiosProgressEvent } from "axios"
import axios from "axios"
import { env } from "@/env"
import useToast from "@/hooks/use-toast"
import { buildRequestUrl } from "@/lib/utils"

type DataRequestType<T> = {
  path: string
  data: T
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
}

type ApiResponse<R> = {
  message: string
  data: R
}

type MutationFunction<T, R = any> = {
  data: T
  path: string
  onSuccess?: (data: R) => void
  onError?: (error: any) => void
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
}
type IUsePostApi<T> = {
  key?: string | T
  showSuccessToast?: boolean
  showErrorToast?: boolean
  method?: "post" | "put" | "delete" | "patch"
}

const useApi = <T,>({
  showSuccessToast = true,
  showErrorToast = true,
  key,
  method = "post",
}: IUsePostApi<T> = {}) => {
  const API_URL = env.NEXT_PUBLIC_APP_URL
  const auth = { token: "" } // authenticate ho kr session data ara from useauth()
  const { toastError, toastSuccess } = useToast()
  const headers = auth?.token ? { Authorization: `Bearer ${auth?.token}` } : {}

  const postRequest = ({
    data,
    path,
    onUploadProgress,
  }: DataRequestType<T>) => {
    const REQUEST_PATH = buildRequestUrl(API_URL, path)

    // config contains token and data jo api per ja raha hai
    const config = {
      headers,
      onUploadProgress,
      withCredentials: true,
    }

    switch (method) {
      case "post":
        return axios.post<ApiResponse<any>>(REQUEST_PATH, data, config)
      case "put":
        return axios.put<ApiResponse<any>>(REQUEST_PATH, data, config)
      case "delete":
        return axios.delete<ApiResponse<any>>(REQUEST_PATH, { headers })
      case "patch":
        return axios.patch<ApiResponse<any>>(REQUEST_PATH, data, config)
      default:
        throw new Error("Invalid method provided")
    }
  }
  // hook used for mutations
  const {
    mutate,
    isError,
    isIdle,
    error,
    isPending,
    isSuccess,
    isPaused,
    failureCount,
    failureReason,
  } = useMutation({
    mutationFn: postRequest,
    mutationKey: [key], // in our case post request
  })

  function onRequest<R = any>({
    data,
    path,
    onError = () => {},
    onSuccess = () => {},
    onUploadProgress,
  }: MutationFunction<T, R>) {
    mutate(
      {
        path,
        data,
        onUploadProgress,
      },
      {
        onSuccess: (response) => {
          showSuccessToast && toastSuccess(response.data.message)
          onSuccess(response.data.data)
        },

        onError: (error: any) => {
          console.log(error)
          showErrorToast && toastError(error?.response?.data?.message)
          onError(error)
        },
      }
    )
  }
  return {
    onRequest,
    isError,
    isIdle,
    error,
    isPending,
    isSuccess,
    isPaused,
    failureCount,
    failureReason,
  }
}

export default useApi
