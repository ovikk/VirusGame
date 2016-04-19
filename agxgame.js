var io;
var gameSocket;

exports.initGame = function(sio, socket){
	io = sio;
	gameSocket = socket;
	gameSocket.emit('connected', {message: "You are connected"});


	// События host'a
	gameSocket.on('hostCreateNewGame', hostCreateNewGame);
	gameSocket.on('Answered', giveAnswer);

	// События client'a
	gameSocket.on('playerJoinGame', playerJoinGame);
	gameSocket.on('gameOver', gameOver);
	gameSocket.on('newGame', newGame);
}

function newGame(data){
	io.sockets.in(data.gameId).emit('newGame');
	io.sockets.in(data.gameId).emit('beginGame', data);
}

function gameOver(data){
		io.sockets.in(data.gameId).emit('gameOver');
}

function hostCreateNewGame() {
	var thisGameId = (Math.random() * 10000) | 0;

	this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

	this.join(thisGameId.toString());
}


function playerJoinGame(data){
	var sock = this;
	var room = gameSocket.manager.rooms["/" + data.gameId];

	if (room != undefined) {
		data.mySoketId = sock.id;
		sock.join(data.gameId);

		io.sockets.in(data.gameId).emit('beginGame', data);
	} else {
		//error
	}

}


function giveAnswer(data){
		io.sockets.in(data.gameId).emit('gamming', data);
}
