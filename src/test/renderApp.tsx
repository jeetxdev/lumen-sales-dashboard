import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { resetMockDb } from '../api/client';
import { createQueryClient } from '../api/hooks';
import { App } from '../App';
import { ToastProvider } from '../feedback/Toaster';
import { ThemeProvider } from '../theme/ThemeProvider';

export function renderApp(path = '/', { latencyMs = 0 }: { latencyMs?: number } = {}) {
  resetMockDb({ latencyMs });
  const client = createQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <ThemeProvider>
          <MemoryRouter initialEntries={[path]}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}
