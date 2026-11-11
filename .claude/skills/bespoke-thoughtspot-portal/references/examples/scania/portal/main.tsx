import React from 'react';
import ReactDOM from 'react-dom/client';
import { CreditsProvider } from './lib/credits';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TierProvider } from './context/TierContext';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <TierProvider>
        <AuthProvider>
          <CreditsProvider>
            <App />
          </CreditsProvider>
        </AuthProvider>
      </TierProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
