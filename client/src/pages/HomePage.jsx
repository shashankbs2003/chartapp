import React, { useContext, useState } from 'react'
import Slidebar from '../components/Slidebar'
import ChartContainer from '../components/ChartContainer'
import RightSidebar from '../components/RightSidebar'
import { ChatContext } from '../../context/ChatContext'

const HomePage = () => {
//const[selectedUser,setSelectedUser]= useState(false)
const {selectedUser} = useContext(ChatContext)

  return (
    <div className='border w-full h-screen sm:px-[15%] sm:py-[5%]'>
    <div className={`grid backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
      <Slidebar/>
      <ChartContainer />
      <RightSidebar /> 
     </div>
    </div>
  )
}

export default HomePage
