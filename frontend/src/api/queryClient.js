import { QueryClient } from '@tanstack/react-query';

// Centralized QueryClient configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // default: 5 minutes stale, 1 hour cache
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});