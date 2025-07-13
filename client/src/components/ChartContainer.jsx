import React, { useContext, useEffect, useRef, useState } from 'react';
import assets, { messagesDummyData } from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChartContainer = () => {

  const {messages, selectedUser, setSelectedUser, sendMessage, getMessages} = useContext(ChatContext)
  const { authUser, onlineUsers} = useContext(AuthContext)

  const scrollEndRef = useRef();

  const [input, setInput] = useState('');

  //handel sending a message
  const handleSendMessage = async (e)=>{
    e.preventDefault();
    if(input.trim() === "") return null;
    await sendMessage({text: input.trim()});
    setInput("")

  }

  //handle sending a image
  const handleSendImage = async (e)=>{
    const file = e.target.files[0];
    if(!file || !file.type.startsWith("image/")){
      toast.error("select an image file")
      return;
    }
    const reader = new FileReader();

    reader.onloadend = async()=>{
      await sendMessage({image: reader.result})
      e.target.value = ""
    }
    reader.readAsDataURL(file)
    

  }
  useEffect(()=>{
    if(selectedUser){
      getMessages(selectedUser._id)
    }
  },[selectedUser])


  const currentUserId = '680f50e410f3cd28382ecf9'; // your own ID

  useEffect(() => {
    if (scrollEndRef.current && messages) {
      scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="profile" className="w-8 rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden w-6 cursor-pointer"
        />
        <img src={assets.help_icon} alt="help" className="max-md:hidden w-5" />
      </div>

      {/* Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-4 space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.senderId !== authUser._id;

          return (
            <div
              key={index}
              className={`flex items-end gap-3 ${
                isUser ? 'justify-end flex-row-reverse' : 'justify-start'
              }`}
            >
              {/* Avatar + Time */}
              <div className="flex flex-col items-center text-xs text-gray-400">
                <img src={
                  msg.senderId === authUser._id 
                  ? authUser?.profilePic || assets.avatar_icon
                  : selectedUser?.profilePic || assets.avatar_icon
                }
                alt='user'
                className='w-6 h-6 rounded-full'
                />
                
                <p>{formatMessageTime(msg.createdAt)}</p>
              </div>

              {/* Message */}
              {msg.image ? (
                <img
                  src={msg.image}
                  alt="chat"
                  className="max-w-[220px] rounded-lg border border-gray-600"
                />
              ) : (
                <p
                  className={`p-3 text-sm text-white max-w-[220px] break-words bg-[#6f4ef2] rounded-lg ${
                  msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                >

                  {msg.text}
                </p>
              )}
            </div>
          );
        })}

        <div ref={scrollEndRef} />
      </div>

      {/*---bottom area-----*/}
      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-black/10 backdrop-blur-md'>
        <div className=' flex items-center flex-1 bg-white/10 border border-gray-700 px-4 py-2 rounded-full'>
          <input onChange={(e)=>setInput(e.target.value)} value={input} onKeyDown={(e)=>e.key==="Enter" ? handleSendMessage(e) : null} type="text" placeholder='Send a message' className='flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none' />
          <input onChange={handleSendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="Upload" srcset="" className='w-5 h-5 ml-3' cursor-pointer />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} alt="send" srcset=""  className='w-7 h-7 cursor-pointer'/>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10">
      <img src={assets.logo_icon} alt="logo" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChartContainer;
