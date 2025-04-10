import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Login from '../screens/Login';
import Home from '../screens/Home';
import Register from '../screens/Register';
import Project from '../screens/Project';
import UserAuth from '../auth/Userauth';
import { UserProvider } from '../context/user.context';
import Index from '../screens/Index';
import Navbar from '../components/Navbar';

const AppRoutes = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Index />}/>
          <Route path='/home' element={<UserAuth><Home/></UserAuth>} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register/>}/>
          <Route path='/project' element={<UserAuth><Project/></UserAuth>}/>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default AppRoutes;
