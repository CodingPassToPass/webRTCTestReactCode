import express from "express";
import cors from "cors";
import { createServer} from "http";
import { Server} from "socket.io";
const app = express();
const server = createServer( app);
const io = new Server( server, {
    cors:{
        origin:"http://localhost:5173",
        methods:['GET','POST'],
        credentials:true,
    }
});
//allUsers
const allUsers = [];

app.get("/", ( req,res)=>{
    res.json({
        message:"hello",
    })
})

//handle socket connections
io.on("connection", ( socket)=>{
    // console.log(`Someone connected to server and socket ID is ${socket.id}`);
    console.log(socket.id);
    socket.on("join-user", ( username)=>{
        console.log(username, "and", socket.id);
        allUsers.push({ username, id: socket.id});
        //everyone one 
        io.emit("joined", allUsers);
    })
})

server.listen( 8000, ( req, res)=>{
    console.log(`server is running on Port 8000`);
})