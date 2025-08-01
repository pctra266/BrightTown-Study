import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider } from 'react-router-dom';
import router from "./route/routers"

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router}></RouterProvider>
      
    </AuthProvider>
  )
}

export default App
