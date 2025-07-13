//get all user except the logged in user

import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import {io, userSocketMap} from "../server.js";

export const getUsersForSidebar = async (req, res)=>{
  try{
    const userId = req.user._id;
    const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password");
    
    //count number of message not seen

    const unseenMessages ={}
    const promises = filteredUsers.map(async (user)=>{
      const messages = await Message.find({senderId: user._id , reciverId: userId, seen: false})
      if(messages.length> 0){
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({success: true, users: filteredUsers, unseenMessages});



  }catch(error){
    console.log(error.message);
    res.json({success: false, message:error.message});

  }

}

//get all messages for selected user
export const getMessages = async(req, res)=>{
  try{
    const{id: selectedUserId} = req.params;
    const myId = req.user._id;

    const messages = await Message.find({$or: [ {senderId: myId, reciverId: selectedUserId},{senderId: selectedUserId, reciverId: myId}]
    })
    await Message.updateMany({senderId: selectedUserId, reciverId: myId}, {seen: true});

    res.json({success: true, messages})
   

  }catch(error){
     console.log(error.message);
    res.json({success: false, message: error.message})

  }
}

//api to mark message as seen using message id
export const markMessageAsSeen = async(req, res)=>{
  try{
    const {id}= req.params;
    await Message.findByIdAndUpdate(id, {seen: true})
    res.json({success: true})
  }catch(error){
     console.log(error.message);
    res.json({success: false, message: error.message})
  }
}

//send message to selected user
export const sendMessage = async (req, res)=>{
  try{
    const {text, image} = req.body;
    const reciverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if(image){
      const uplodeResponse = await cloudinary.uploader.upload(image)
      imageUrl = uplodeResponse.secure_url;

    }
    const newMessage = await Message.create({
      senderId,
      reciverId,
      text,
      image: imageUrl
    })

    //emit the new message to the reciver's socket
    const reciverSocketId = userSocketMap[reciverId];
    if(reciverSocketId){
      io.to(reciverSocketId).emit("newMessage", newMessage)
    }

    res.json({success: true, newMessage});

  }catch(error){
     console.log(error.message);
    res.json({success: false, message: error.message})
  }
}