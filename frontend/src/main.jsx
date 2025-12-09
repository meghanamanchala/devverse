
import { createRoot } from 'react-dom/client';
import './index.css';
import { ClerkProvider } from "@clerk/clerk-react";
import App from './App.jsx';
import { Provider } from 'react-redux';
import store from './app/store';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </Provider>
);

