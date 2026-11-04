import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './lib/auth.jsx'
import { I18nProvider } from './lib/i18n.jsx'
import { ToastProvider } from './lib/toast.jsx'
import { AppDataProvider } from './lib/appData.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <ToastProvider>
          <AppDataProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </AppDataProvider>
        </ToastProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
