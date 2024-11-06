const express = require("express"); 
const socket = require("socket.io");
const http = require("http");
const {Chess}= require("chess.js");
const path = require("path");
const { title } = require("process");

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();

let players = {};
let currPlayer = "w"; //white will be first player

app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.render("index",{title: "Chess"});
})

io.on("connection",function(uniqueSocket){
    console.log("Connected");
 
    if(!players.white){
        players.white = uniqueSocket.id;
        uniqueSocket.emit("playerRole","w");
    }
    else if(!players.black){
        players.black= uniqueSocket.id;
        uniqueSocket.emit("playerRole","b");
    }
    else{
        uniqueSocket.emit("spectatorRole");
    }

    uniqueSocket.on("disconnect",function(){
        if(uniqueSocket.id===players.white){
            delete players.white;
        }
        else if(uniqueSocket.id === players.black){
            delete players.black;
        }
    });

    uniqueSocket.on("move",(move)=>{
        try {
            if(chess.turn()==='w' && uniqueSocket.id!==players.white) return;
            if(chess.turn()==='b' && uniqueSocket.id!==players.black) return;
       
            const res= chess.move(move);

            if(res){
                currPlayer=chess.turn();
                io.emit("move",move);
                io.emit("boardState",chess.fen());
            }
            else{
                console.log("Wrong Move: ",move);
                uniqueSocket.emit("invalidMove".move);
            }
        } catch (error) {
            console.log(error);
            uniqueSocket.emit("Wrong Move: ",move);
        }
    });
});


server.listen(3000,function(){
    console.log("Running on Server 3000"); 
});