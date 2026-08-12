import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

import dns from "dns";
dns.setServers(['1.1.1.1', '1.0.0.1']); 

const app = express();
const server = createServer(app);
const io = connectToSocket(server);




app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit:"40kb" , extended: true}));

app.use("/api/v1/users", userRoutes);


app.set("port", (process.env.PORT || 8001));

app.get("/home", (req,res)=>{
    return res.json({"hello": "world"});
});

const URL = process.env.DBURL;

const start = async () =>{
    try{
         const connectionDb = await mongoose.connect(URL);
           console.log(`mongoose connect hai: ${connectionDb.connection.host}`);
        server.listen(app.get("port"),()=>{
        console.log("LISTNING ON PORT 8001");
    });
    }catch(err){
        console.log(err);
    }
}
start();






// const start = async () => {
//     app.set("mongo_user")
//     const connectionDb = await mongoose.connect("mongodb+srv://imdigitalashish:imdigitalashish@cluster0.cujabk4.mongodb.net/")

//     console.log(`MONGO Connected DB HOst: ${connectionDb.connection.host}`)
//     server.listen(app.get("port"), () => {
//         console.log("LISTENIN ON PORT 8000")
//     });



// }



// start();