
import { useUser } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import ProblemPages from './pages/ProblemPages'
import {Toaster} from 'react-hot-toast';

function App() {
  const {isSignedIn} =  useUser();
  return (
    <>
    <Toaster toastOptions={{duration:3000}} />
    <Routes>
      
      
      <Route path='/' element={<HomePage />}/>
      
      <Route path='/problems' element={isSignedIn ? <ProblemPages /> : <Navigate to={"/"} />}/>
    </Routes>

    
    </>
  )
}

export default App

// tw, daisyui, react-router, react-hot-toaster, 
// react-query aka tanstack query, axios