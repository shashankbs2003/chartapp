import {v2 as cloudinary} from 'cloudinary';
import User from '../models/User.js';
//import cloudinary from '../lib/cloudinary'


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//controller to check if user is authenticated

export const checkAuth = (req,res)=>{
  res.json({success: true, user: req.user});
}

//controller to update user profile details
export const updateProfile = async(req, res)=>{
  try{
    const {profilepic, bio, fullName} = req.body;
    const userId = req.userId._id;
    let updatedUser;
    if(profilepic){
      updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
    }else{
      const upload = await cloudinary.uploader.upload(profilepic);

      //updated user information
      updatedUser= await User.findByIdAndUpdate(userId, {profilepic: upload.secure_url, bio, fullName}, {new: true});
    }
    res.json({success: true, user: updatedUser});
  }
  catch(error){
    console.log(error.message)
    res.json({success: false, message:error.message});

  }
}

export default cloudinary;