import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter ,HashRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Get base path from import.meta.env.BASE_URL (set by Vite)
const basePath = import.meta.env.BASE_URL;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter >
      <App />
    </HashRouter>
  </StrictMode>
);
