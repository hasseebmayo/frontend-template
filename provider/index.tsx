'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import axios from 'axios';
import React, { useState } from 'react';

import { Toaster } from 'react-hot-toast';

const MAX_RETRIES = 2;
const HTTP_STATUS_TO_NOT_RETRY = [400, 401, 403, 404];
export default function Provider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry(failureCount, error) {
              console.error('Query failed, retrying...', error);

              // If we've retried more than MAX_RETRIES times, stop
              if (failureCount > MAX_RETRIES) {
                return false;
              }

              // If it's an AxiosError, check the response status
              if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                // If status is one of [400, 401, 403, 404], do not retry
                if (status && HTTP_STATUS_TO_NOT_RETRY.includes(status)) {
                  console.log('Aborting retry due to status:', status);
                  return false;
                }
              }

              // Otherwise, allow React Query to retry
              return true;
            },
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <>

        {children}
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </>
    </QueryClientProvider>
  );
}
