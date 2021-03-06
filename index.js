const { response } = require("express");
const http = require("http");
const app =  require("express")();
app.get("/", (req,res) => res.sendFile(__dirname + "/index.html"));

app.listen(9091, ()=> console.log("Listening on http port 9091"));
const websocketServer =  require("websocket").server;
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening on 9090"));

//hashmap clients
const clients = {};
const games = {};

const wsServer = new websocketServer({
    "httpServer": httpServer
});

wsServer.on("request", request => {
    //conect
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log("opened!"));
    connection.on("close", () => console.log("closed!"));
    connection.on("message", message =>{
        const result = JSON.parse(message.utf8Data);
        // I've recived a message from the client

        //a user want to create a new game
        if(result.method === "create"){
            const clientID= result.clientID;
            const gameID= guid();

            games[gameID] = {
                "id": gameID,
                "clients":[]
            };

            const payLoad = {
                "method": "create",
                "game": games[gameID]
            };

            const con = clients[clientID].connection;
            con.send(JSON.stringify(payLoad));

        }


        if (result.method==="join") {
            const clientID = result.clientID;
            const gameID = result.gameId;
            const game  = games[gameID];
             
            if(game.clients.length>=2){
                //sorry no room
                return;
            }

           const player= {"0":"Player1","1":"Player2"}[game.clients.length]  
           game.clients.push({
               "clientID": clientID,
               "player":player
           })

           const payload={
            "method":"join",
            "game":game
            }

           game.clients.forEach( c => {
               clients[c.clientID].connection.send(JSON.stringify(payload));
           });



        }



    });

    //generate a new clientID
    const clientID = guid();
    clients[clientID] = {
        "connection": connection
    };

    const payLoad = {
        "method": "connect",
        "clientID": clientID
    };

    //send back the client connect
    connection.send(JSON.stringify(payLoad));


});


function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();