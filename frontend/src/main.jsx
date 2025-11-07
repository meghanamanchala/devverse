import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ClerkProvider } from "@clerk/clerk-react";
import App from './App.jsx'

const PUBLISHABLE_KEY = "pk_test_cGxlYXNpbmctcm9vc3Rlci0xMC5jbGVyay5hY2NvdW50cy5kZXYk";


createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
)

