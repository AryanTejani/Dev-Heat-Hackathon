import React from 'react'
import {Route,Routes,BrowserRouter} from 'react-router-dom'
import Login from '../screens/Login'
import Home from '../screens/Home'
import Register from '../screens/Register'
import Project from '../screens/Project'
import Userauth from '../auth/Userauth'

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<Userauth><Home /></Userauth>} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register/>}/>
            <Route path='/project' element={<Userauth><Project/></Userauth>}/>
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes