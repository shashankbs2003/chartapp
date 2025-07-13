{/* 1. first in the backend we need to initialization of node init -y
  2. i bcryptjs to encrypte the password and store in mongodb
  3. i cloudinary to uplode chart,image on cloud 
  4.cors to connect backend and frontend
  5. .env to use the enveranment variable in the backend server
  6. express to create backend server 
  7. jsonwebtoken to create the tocken and authorise the user
  8. mongoose package to connect eith the mongodb database
  9. socket.io used to enable the real time chart application*/}

  import express from 'express';
  import 'dotenv/config';
  import cors from 'cors';
  import http from 'http';
  import { connectDB } from './lib/db.js';
  import userRouter from './router/userRoutes.js';
  import messageRouter from './router/messageRoutes.js';
  import { Server } from 'socket.io';
import { Socket } from 'dgram';
  

  //create express app and HTTP server
  const app=express();
  const server=http.createServer(app)

  //Initialize socket.io server
  export const io = new Server(server, {cors : {origin : "*"}})

  //sotres online user

export const userSocketMap = {};// {userId: socketId}

// Socket.io connection handler
io.on("connection", (Socket)=>{
  const userId = Socket.handshake.query.userId;
  console.log("User connected", userId);

  if(userId) userSocketMap[userId]= Socket.id;

  //emit online users to all connected client
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  Socket.on("disconnected",()=>{
      console.log("User Disconnected", userId);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap))

  });

})

  //middleware setup
  app.use(express.json({limit:"4mb"}));
  //to connect all the urls
  app.use(cors());

  app.use("/api/status", (req,res)=> res.send("server is live"));
  app.use("/api/auth",userRouter);
  app.use("/api/messages",messageRouter);
  

  //connect to mogodb

  await connectDB();

  const PORT =process.env.PORT || 5000;
  server.listen(PORT,()=> console.log("server is running on port: "+PORT));