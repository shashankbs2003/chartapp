import mongoose from "mongoose";

//Function to connect to the mongodb database =>(synchronous arrow function)

export const connectDB = async ()=>{
  try{

    mongoose.connection.on('connected',()=>console.log('Database Connected'));
    await mongoose.connect(`${process.env.MONGODB_URI}/chart-app`)

  }catch(error)
  {
    console.log(error);

  }

}