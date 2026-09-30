import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { IconContext } from '@phosphor-icons/react';
import { createQueryClient, prefetchAll } from './api/hooks';
import { App } from './App';
import { ToastProvider } from './feedback/Toaster';
import { ThemeProvider } from './theme/ThemeProvider';
import './styles/nocturne.css';
import './styles/themes.css';
import './styles/app.css';

const queryClient = createQueryClient();
prefetchAll(queryClient);

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ThemeProvider>
          <IconContext.Provider value={{ size: '1em' }}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </IconContext.Provider>
        </ThemeProvider>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
