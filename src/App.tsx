import React from 'react'
import Navbar from './components/NavBar/NavBar'
import { BrowserRouter } from 'react-router-dom'

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      {/* Other components and routes can be added here */}
    </BrowserRouter>
  )
}

export default App
