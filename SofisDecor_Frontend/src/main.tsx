// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import router from './App.tsx';
import LoadingProvider from './contexts/ContextLoading';

import './index.css'

createRoot(document.getElementById('root')!).render(

  <LoadingProvider>
    <RouterProvider router={router} />
  </LoadingProvider>

)
