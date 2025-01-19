import React from 'react'
import ReactDOM from 'react-dom/client'
import { supabase } from './lib/supabase'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

// Initialize session context
const initializeApp = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <SessionContextProvider supabaseClient={supabase} initialSession={session}>
        <BrowserRouter>
          <App />
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </SessionContextProvider>
    </React.StrictMode>
  )
}

// Start the app
initializeApp() 