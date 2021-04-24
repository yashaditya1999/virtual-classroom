const http = require('http');
const fs = require('fs');
const httpServer = http.createServer();
const PORT = process.env.PORT||8080;
const WebSocket = require('ws');
const wss = new WebSocket.Server({server:httpServer});
let conn={};
wss.on ('listening', () => {
	console.log('Started Listening');
});
wss.on ('connection', (connection) => {
	console.log('New Connection');
	connection.on('message', (message) => {
		console.log('New Message');
		message=JSON.parse(message);
		if(message.type==='cred'){
			wss.clients.forEach(client =>{
				if(client != connection && client.readyState===WebSocket.OPEN){
					client.send(JSON.stringify(message));
				}
			});
			connection.uid=message.uid;
			conn[message.uid]=connection;
		}
		else{ //if(message.type==='offer'){
			const mun=message.un;
			message.un=connection.uid;
			if(conn[mun]!=undefined)
				if(conn[mun].readyState==WebSocket.OPEN)
					conn[mun].send(JSON.stringify(message));
		}/* 
		else if(message.type==='answer'){
			const mun=message.un;
			message.un=connection.uid;
			if(conn[mun].readyState==WebSocket.OPEN)
				conn[mun].send(JSON.stringify(message));
		}
		else if(message.type==='candidate'){
			const mun=message.un;
			message.un=connection.uid;
			if(conn[mun].readyState==WebSocket.OPEN)
				conn[mun].send(JSON.stringify(message));
		} */
	});
	connection.on('close', () => {
		console.log("Client Disconnected");
		delete conn[connection.uid];
	});
});
httpServer.on('request', (request, response) => {
	request.on('error', (err) => {
		console.error(err);
		response.statusCode = 400;
		response.end();
	});
	response.on('error', (err) => {
		console.error(err);
	});
	if (request.url === '/') {
		response.writeHead(200, { 'content-type': 'text/html' });
		fs.createReadStream('public/index.html').pipe(response);
	}
	else {
		response.statusCode = 404;
		response.end();
	}
}).listen(PORT);
