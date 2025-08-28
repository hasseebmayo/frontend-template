Next.js Template Documentation

# This a Next.js template

## Color Palette Generation for shadcn

You can visit [this](https://oxidus.vercel.app/) . It will generate the color palette for you. You can copy and paste those colors inside `global.css`.

## Component Usage

Everything used in the project is inside the `components` folder. To use a component, import it like this:

```
import { Button } from "@/components/ui/button";
```

## Query Parameters Usage

We are using **nuqs** for query parameters. Visit the [nuqs documentation](https://nuqs.47ng.com/docs/tips-tricks) for more details.

## Declaring Environment Variables

We use the **env** package. Visit the [env documentation](https://github.com/t3-oss/t3-env). First define variables in the `.env` file, then add them to `env.ts` for runtime validation.

## Typography Usage

We use a `Typography` component:

```
<Typography variant="h1">Hello, world!</Typography>
```

Refer to the Figma design and extend variant styles accordingly.

## Data Fetching

We use **TanStack Query**. See [official documentation](https://tanstack.com/query/latest/docs/framework/react/guides/queries) .

### How to Fetch Data

Use the custom hook `useFetch`:

```

import { useFetch } from "@/hooks/use-fetch";

const { data, isLoading, error } = useFetch<{id: string}>({
  path: "/api/path",
  queryKey: ["path"],
  config: {
    staleTime: 60 * 5,
  },
});

```

### Typed Query System

We use a utility-driven approach to define queries and strongly type them:

*   Define queries using `defineQuery`
*   Use `createTypedFetchHook` to fetch data
*   Use `createTypedInvalidationHook` to invalidate queries
# Defining Queries with `defineQuery`

The `defineQuery` function provides a type-safe way to define API endpoints in your Next.js application. This utility ensures proper typing from definition to component usage.

## Syntax

```tsx
defineQuery<TData, TParams, TSearchParams>(queryDefinition)
```

## Type Parameters

- **`TData`**: The expected response data type from the API
- **`TParams`**: Parameters required for the endpoint (path/URL parameters)
- **`TSearchParams`**: URL search parameters (query string parameters)

## Query Definition Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `queryKey` | `readonly unknown[]` or `(params: TParams, searchParams?: TSearchParams) => readonly unknown[]` | Yes | The cache key for TanStack Query |
| `path` | `string` or `(params: TParams, searchParams?: TSearchParams) => string` | Yes | API endpoint path |
| `requiresParams` | `boolean` | No | Whether parameters are required |
| `searchParams` | `TSearchParams` or `(params: TParams) => TSearchParams` | No | Default search parameters |
| `_data` | `TData` | No | Type placeholder for TypeScript inference |
| `_params` | `TParams` | No | Type placeholder for parameters |
| `_searchParams` | `TSearchParams` | No | Type placeholder for search params |

## Path Structure Options

### Static Path
Simple path string: `/api/posts`

### Path with Parameter Placeholders
Uses colon syntax: `/api/posts/:id`

### Dynamic Path Function
Function that returns path: `(params) => `/api/posts/${params.id}`

## Query Key Best Practices

- Simple queries: `["entity-name"]`
- With ID: `["entity-name", "detail", id]`
- Relations: `["entity-name", id, "related-entity"]`
- With filters: `["entity-name", "list", JSON.stringify(filters)]`

## Examples

### Basic Static Query

```tsx
const postList = defineQuery<Post[]>({
  queryKey: ["posts"],
  path: "/api/posts"
});
```

### Query with Required Parameters

```tsx
const postDetail = defineQuery<Post, { id: string }>({
  queryKey: ["post", "detail"],
  path: "/api/posts/:id",
  requiresParams: true,
  _data: {} as Post
});
```

### Query with Dynamic Path and Key

```tsx
const userPosts = defineQuery<Post[], { userId: string }>({
  queryKey: (params) => ["users", params.userId, "posts"],
  path: (params) => `/api/users/${params.userId}/posts`,
  requiresParams: true
});
```

### Query with Search Parameters

```tsx
interface PostSearchParams {
  category?: string;
  sortBy?: 'date' | 'title';
  page?: number;
}

const filteredPosts = defineQuery<Post[], undefined, PostSearchParams>({
  queryKey: ["posts", "filtered"],
  path: "/api/posts",
  searchParams: {
    sortBy: 'date',
    page: 1
  }
});
```

### Advanced Query with All Features

```tsx
interface ProductsResponse {
  products: Product[];
  total: number;
  pages: number;
}

interface ProductFilters {
  category: string;
}

interface ProductsSearchParams {
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  inStock?: boolean;
}

const filteredProducts = defineQuery<
  ProductsResponse,
  ProductFilters,
  ProductsSearchParams
>({
  queryKey: (params, searchParams) => [
    "products",
    params.category,
    searchParams?.sort,
    searchParams?.inStock ? "in-stock" : "all"
  ],
  path: (params) => `/api/products/${params.category}`,
  requiresParams: true,
  searchParams: (params) => ({
    page: 1,
    limit: 20,
    sort: 'newest'
  })
});
```

## Usage with `useTypedFetch`

After defining your queries, use them with `useTypedFetch`:

```tsx
function ProductList() {
  // Static query - no params needed
  const { data: allProducts } = useTypedFetch("allProducts");

  // Query with required params
  const { data: categoryProducts } = useTypedFetch("categoryProducts", {
    params: { category: "electronics" }
  });

  // Query with params and search params
  const { data: filteredProducts } = useTypedFetch("filteredProducts", {
    params: { category: "electronics" },
    searchParams: {
      page: 2,
      limit: 10,
      sort: "price_asc",
      inStock: true
    },
    options: {
      staleTime: 60000 // 1 minute
    }
  });
}
```

## Benefits

- **Type Safety**: Full TypeScript inference from definition to component
- **Centralized API Layer**: All endpoints defined in one location
- **Self-Documenting**: Clear structure shows required parameters
- **Cache Management**: Consistent cache keys for effective caching
- **IDE Support**: Autocomplete for parameters and options
- **Scalability**: Easy to extend as your API grows

## Mutation (POST, PUT, DELETE, PATCH)

Use `useApi` hook. It supports toast feedback and different methods.

```

import { useApi } from "@/hooks/use-api";

export function Home() {
  const { onRequest } = useApi({});

  function handleSubmit() {
    onRequest({
      path: "/some-path",
      data: {},
      onSuccess: (data) => {
        // update local state
      },
      onError: (err) => {
        // handle error
      },
    });
  }

  return <button onClick={handleSubmit}>Submit</button>;
}

```

## MatchQueryStatus

This component simplifies UI states for query results:

*   `onSuccess` – when data is returned
*   `onError`, `onLoading`, `onEmpty` – for various states

```

import { MatchQueryStatus } from "@/components/match-query-status";
import { useTypedFetch } from "@/lib/query";

export default function Page() {
  const query = useTypedFetch("getData");

  return (
    <MatchQueryStatus
      query={query}
      onSuccess={(data) => {
        // render content
      }}
    />
  );
}

```

## Forms and Validation

Use [React Hook Form](https://react-hook-form.com/) and [Zod](https://github.com/colinhacks/zod) along with [shadcn/ui](https://ui.shadcn.com/docs/components/form).

```

"use client"

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form, FormControl, FormDescription, FormField, FormItem,
  FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export function InputForm() {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(data) {
    // Handle submit
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

```

## Defining Zod Schemas

All zod schemas should be placed in the `/lib/schema` folder. Organize them into files based on logical domains.

## How to use this template

### Install & run

- Install deps: `pnpm install`
- Start dev server: `pnpm dev`
- Build: `pnpm build`
- Start production: `pnpm start`

### Linting & formatting (Biome)

This project uses Biome for both linting and formatting (Next.js 15.5 deprecates `next lint`).

- Check: `pnpm lint`
- Fix: `pnpm lint:fix`
- Format: `pnpm format`

VS Code: the workspace recommends the Biome extension and sets it as the default formatter.

### Git hooks (Husky)

Husky runs checks on commit:

- `pre-commit`: runs `pnpm lint` and `pnpm typecheck`
- `commit-msg`: validates commit messages with Commitlint (Conventional Commits)

Enable hooks after cloning:

```
pnpm install
pnpm prepare
```

Bypass hooks with `--no-verify` (not recommended):

```
git commit -m "chore: wip" --no-verify
```

### Commit message conventions (Commitlint)

We follow Conventional Commits. Format:

```
<type>(optional scope): <subject>

[optional body]

[optional footer(s)]
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Examples:

- `feat(auth): add OAuth flow`
- `fix(ui): button hover state on Safari`
- `chore: update deps`

Run commitlint manually (optional):

```
pnpm dlx -p @commitlint/config-conventional @commitlint/cli commitlint \
  --from HEAD~10 --to HEAD \
  --extends @commitlint/config-conventional
```
