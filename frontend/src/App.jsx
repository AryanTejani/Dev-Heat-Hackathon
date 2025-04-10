import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/user.context'
import Index from './screens/Index'

const App = () => {
  return (
    <UserProvider>
      <AppRoutes />
      {/* <Index/> */}
    </UserProvider>
  )
}

export default App