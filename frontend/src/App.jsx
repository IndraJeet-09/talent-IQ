
import { useUser } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import ProblemPages from './pages/ProblemPages'
import {Toaster} from 'react-hot-toast';
import DashboardPage from './pages/DashboardPage';

function App() {
  const {isSignedIn, isLoaded} =  useUser();

  if(!isLoaded) return null;
  return (
    <>
    <Toaster toastOptions={{duration:3000}} />
    <Routes>

      <Route path='/' element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} /> }/>
      <Route path='/dashboard' element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} /> }/>
      
      <Route path='/problems' element={isSignedIn ? <ProblemPages /> : <Navigate to={"/"} />}/>
    </Routes>

    
    </>
  )
}

export default App
