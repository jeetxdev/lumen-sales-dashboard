import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { resetMockDb } from '../api/client';
import { createQueryClient } from '../api/hooks';
import { App } from '../App';
import { ThemeProvider } from '../theme/ThemeProvider';

export function renderApp(path = '/') {
  resetMockDb({ latencyMs: 0 });
  const client = createQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}
