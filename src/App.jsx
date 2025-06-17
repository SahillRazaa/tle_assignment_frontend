import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element= {<Login/>}/>
        <Route path='/dashboard' element= {<Dashboard/>}/>
        <Route path='/profile/:handle/:id' element= {<ProfilePage/>}/>
      </Routes>
      <ToastContainer/>
    </Router>
  )
}

export default App
