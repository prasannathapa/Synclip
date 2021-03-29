'use strict';
const http = require("http");
const WebSocketServer = require("websocket").server
const Client = require("./Client")
let clientList = new Client();

const httpserver = http.createServer((req, res) => {
    console.log("we have received a request");
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello World!');
    res.end();
})
const websocket = new WebSocketServer({
    "httpServer": httpserver
})
httpserver.listen(8080, () => console.log("My server is listening on port 8080"))


websocket.on("request", request => {

    let connection = request.accept(null, request.origin);
    clientList.setClient(request.key,request.socket.remoteAddress,"CLIENT ["+connection.remoteAddress+"]",null, connection);

    connection.on("close", () => {
        let name = clientList.removeClient(request.key);
        console.log(name +" Offline | connected devices: "+ clientList.getSize());
    })
    connection.on("message", message => {
        try{
            let jsonObj = JSON.parse(message.utf8Data);
            switch(jsonObj.reqType){
                case 'update':
                    console.log(clientList.updateClient(request.key, jsonObj));
                    clientList.notifyAll(request.key);
                    break;
                case 'sync':
                    clientList.sync(request.key, jsonObj);
                    break;
                default:
                    connection.send(JSON.stringify({error:"reqType not defined, available reqType are 'update' and 'sync'"}))
            }
        }
        catch(err){
            connection.send(JSON.stringify({error:err.message}))
            console.log(`Received message ${message.utf8Data}`)
            console.log(err.message)

        }
        //console.log(`Received message ${message.utf8Data}`)
    });
    //console.log("CLINET [" + request.socket.remoteAddress + "] with ID ["+request.key+"] Joined, Total Connections: " + clientList.getSize());
    //Clientlist.push(connection);
})

// {"name":"Prasanna Thapa", "RSApublicKey":null, "reqType":"update"}
// {"type":"text", "RSApublicKey":"Hello World!!!", "data":"My Message","reqType":"sync", "encrypted":false}
// {"type":"text", "lI12/5h5DOFPjNbYqU0Tzw==":"Hello World!!!", "data":"My Message","reqType":"sync", "encrypted":true}