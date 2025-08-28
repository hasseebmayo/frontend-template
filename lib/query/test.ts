import { defineQuery } from "@/lib/query/query.utils"

export const TEXT_QUERY_KEYS = {
  all: defineQuery<string[], undefined, { searchParams?: string }>({
    queryKey: ["text", "all"],
    path: "/todos",
  }),
}
