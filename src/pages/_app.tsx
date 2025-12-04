import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheetManager } from 'styled-components';

import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StyleSheetManager>
        <Component {...pageProps} />
      </StyleSheetManager>
    </QueryClientProvider>
  );
}

