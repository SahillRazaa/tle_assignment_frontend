import React from 'react'
import Navbar from '../components/layout/Navbar'
import StudentsOverview from '../components/layout/StudentsOverview'
import Footer from '../components/layout/Footer'

const Dashboard = () => {
  return (
    <>
        <Navbar/>
        <StudentsOverview/>
        <Footer/>
    </>
  )
}

export default Dashboard