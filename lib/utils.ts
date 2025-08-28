import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function buildRequestUrl(baseUrl: string, path: string): string {
  const sanitizedBase = baseUrl.replace(/\/+$/, "")
  const sanitizedPath = path.replace(/^\/+/, "")
  return `${sanitizedBase}/${sanitizedPath}`
}
