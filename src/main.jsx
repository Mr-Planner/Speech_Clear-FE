import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import router from "./router.jsx"
import { RouterProvider } from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

// useQuery, useMutation은 공통된 queryClient 인스턴스를 사용 
const queryClient = new QueryClient(); 

// BrowserRouter : basename(라우터) 정보 가져오기 위해
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
