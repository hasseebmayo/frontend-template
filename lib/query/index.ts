import {
  createTypedFetchHook,
  createTypedQueryClientHook,
  defineQuery,
} from "@/lib/query/query.utils"
import { TEXT_QUERY_KEYS } from "@/lib/query/test"

const QUERY_KEYS = {
  todos: TEXT_QUERY_KEYS,
  users: {
    getAll: defineQuery({
      path: "users",
      queryKey: ["users", "all"],
    }),
  },
}

export const useTypedFetch = createTypedFetchHook(QUERY_KEYS)
export const useTypedQueryClient = createTypedQueryClientHook(QUERY_KEYS)
export { QUERY_KEYS }
