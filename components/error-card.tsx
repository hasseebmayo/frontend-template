import axios from "axios"
import { AlertCircle, RefreshCcw } from "lucide-react"
/**
 * ErrorCard component displays error messages with appropriate actions based on the error type.
 * Handles different error scenarios including unauthorized access, network errors, and general errors.
 *
 * @component
 * @param {object} props - Component props
 * @param {unknown} props.error - The error object to be handled
 * @param {boolean} [props.isLoading] - Optional flag indicating if a retry action is in progress
 * @param {() => void} [props.onRetry] - Optional callback function to retry the failed action
 * @returns {JSX.Element} A card component displaying the error message and appropriate action buttons
 */
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function ErrorCard({
  error,
  onRetry,
  isLoading,
}: {
  error: unknown
  isLoading?: boolean
  onRetry?: () => void
}) {
  async function onLogout() {
    // Add Logout logic here
  }

  /**
   * Checks if the error is an unauthorized (401) error
   * @param {unknown} err - The error to check
   * @returns {boolean} True if the error is an unauthorized error
   */
  const isUnauthorized = useCallback((err: unknown): boolean => {
    if (axios.isAxiosError(err)) {
      return err.response?.status === 401
    }

    return false
  }, [])

  /**
   * Checks if the error is a network connectivity error
   * @param {unknown} err - The error to check
   * @returns {boolean} True if the error is a network error
   */
  const isNetworkError = useCallback((err: unknown): boolean => {
    if (axios.isAxiosError(err)) {
      return !err.response && err.code === "ERR_NETWORK"
    }

    return false
  }, [])

  /**
   * Extracts a user-friendly error message from the error object
   * @param {unknown} err - The error to process
   * @returns {string} A user-friendly error message
   */
  const getErrorMessage = useCallback((err: unknown): string => {
    if (axios.isAxiosError(err)) {
      if (err.response?.data?.message) {
        return err.response.data.message
      }
      // Otherwise a generic server error

      return "An error occurred while communicating with the server."
    }
    if (err instanceof Error) {
      return err.message
    }
    // Fallback

    return "An unexpected error occurred."
  }, [])

  const [message] = useState<string>(getErrorMessage(error))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-destructive">
          <AlertCircle className="mr-2 h-5 w-5" />
          Error
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>

      {/* Show different buttons depending on the error */}
      <CardFooter className="flex items-center justify-center gap-x-3">
        {isUnauthorized(error) ? (
          <Button
            onClick={onLogout}
            variant="outline"
            size="lg"
            disabled={isLoading}
          >
            Logout
          </Button>
        ) : isNetworkError(error) ? (
          onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="lg"
              disabled={isLoading}
            >
              <RefreshCcw
                className={cn("mr-2 h-4 w-4", {
                  "animate-spin": isLoading,
                })}
              />
              No Network – Try Again
            </Button>
          )
        ) : (
          onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="lg"
              disabled={isLoading}
            >
              <RefreshCcw
                className={cn("mr-2 h-4 w-4", {
                  "animate-spin": isLoading,
                })}
              />
              Try Again
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  )
}
