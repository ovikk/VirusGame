
;
jQuery(function($){
	'use strict';

	var IO = {
		init: function(){
			IO.socket = io.connect();
			IO.bindEvents();
		},

		bindEvents : function() {
			IO.socket.on('connected', IO.onConnected);
			IO.socket.on('newGameCreated', IO.onNewGameCreated);
			IO.socket.on('beginGame', IO.beginGame);
			IO.socket.on('gamming', IO.gamming);
			IO.socket.on('gameOver', IO.over);
			IO.socket.on('newGame', IO.newGame);
		},

		newGame : function(){
			App.newInit();
		},

		onConnected : function(){
			App.mySocketId = IO.socket.socket.sessionid;
		},

		onNewGameCreated: function(data) {
			App.Host.gameInit(data);
		},

		beginGame : function(data){
			App.showGameScreen();
		},

		gamming : function(data){
			App.updateFiled(data.ind_i, data.ind_j, data.val);



			// есть ли ход
			if(App.existTurn()){
				console.log("Turn exists");

				if(data.nTurns == 3){
					App.changePlayer();
				}
				App.showGameScreen();
			}else{
				console.log("Turn doesn't exist");
				App.nTurns = -1;
				IO.socket.emit('gameOver', data);
				//return;
			}



		},

		over: function(){
				App.result();
		},

	};



	var App = {

		gameId: 0,
		myRole: '',
		mySocketId: '',
		nickname: '',

		turn : true,
		nTurns : 1,

		w: 0,
		h: 0,

		field: '',

		marked: "",



		init: function() {
			App.cacheElements();
			App.showInitScreen();
			App.bindEvents();


			// инициализируем поле для игрока
			App.w = 10;
			App.h = 10;

			App.field = new Array(App.h);
			App.marked = new Array(App.h);
			for (var i=0;i<App.h;i++) {
    			App.field[i]=new Array(App.w);
					App.marked[i] = new Array(App.w);
    			for (var j=0;j<App.w;j++) {
        			App.field[i][j]=0;
    			}
			}
			App.field[0][0] = 1;
			App.field[App.h-1][App.w-1] = 3;


			// тут создать поле
			//FastClick.attach(document.body);
		},

		newInit : function(){
			App.w = 10;
			App.h = 10;

			App.field = new Array(App.h);
			App.marked = new Array(App.h);
			for (var i=0;i<App.h;i++) {
					App.field[i]=new Array(App.w);
					App.marked[i] = new Array(App.w);
					for (var j=0;j<App.w;j++) {
							App.field[i][j]=0;
					}
			}
			App.field[0][0] = 1;
			App.field[App.h-1][App.w-1] = 3;

			if(App.myRole == "Host")
				App.turn = true;
			else
				App.turn = false;

			App.nTurns = 1;

		},

		cacheElements: function(){
			App.$doc = $(document);

			App.$gameArea = $('#gameArea');
			App.$introScreen = $('#intro-screen-template').html();
			App.$joinScreen = $('#join-game-template').html();
			App.$createScreen = $('#create-game-template').html();
			App.$gameScreen = $('#game-template').html();
			App.$overScreen = $('#game-over-screen-template').html();
		},

		bindEvents: function() {
			App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);
			App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
			App.$doc.on('click', '#btnStart', App.Player.onPlayerStartClick);
			App.$doc.on('click', '#btnNewGame', App.onNewGame);
			App.$doc.on('click', '.cell', App.onClickTurn);

			//App.$doc.on('click', '#btnPlayerNextTurn', App.Player.onNextTurnClick);
			//App.$doc.on('click', '#btnHostNextTurn', App.Host.onNextTurnClick);
		},

		onNewGame: function(){
			IO.socket.emit('newGame', {gameId : App.gameId});
		},


		showInitScreen: function() {
			App.$gameArea.html(App.$introScreen);
  		//App.doTextFit('.title');
		},

		updateFiled: function (i,j,val){
			App.field[i][j] = val;
		},

		changePlayer: function () {
			App.turn = !App.turn;
			if(App.nTurns == 1)
				App.nTurns = 1;
			else
			  App.nTurns = 0;
		},

		existTurn: function() {
			var good = 1;
			var good_wall = 2;
			var bad = 3;
			var bad_wall = 4;

			if(App.myRole != 'Host'){
				good = 3;
				good_wall = 4;
				bad = 1;
				bad_wall = 2;
			}


			for(var m = 0; m < App.h; m++){
				for(var n = 0; n < App.w; n++){
					App.marked[m][n] = false;
				}
			}

			for(var i = 0; i < App.h; i++){
				for(var j = 0; j < App.w; j++){
					if(App.checkExistTurn(i,j,good,good_wall,bad, bad_wall)){
						return true;
					}
				}
			}
			return false;

		},


		checkExistTurn: function(i,j,good,good_wall,bad, bad_wall){
			if(i < 0 || i >= App.h || j < 0 || j >= App.w)
				return false;

			if(App.field[i][j] == good_wall || App.field[i][j] == bad_wall || App.field[i][j] == good)
				return false;


			for(var a = i - 1; a <= i + 1; a++){
				for(var b = j - 1; b <= j + 1; b++){
					if(a == i && b == j)
						continue;
					if(App.checkAlive(a,b, good, good_wall))
						return true;
				}
			}

			return false;

		},

		result: function(){
			App.$gameArea.html(App.$overScreen);

			if(App.nTurns == -1){
				$('#gameover').text("You failed");
			}else{
				$('#gameover').text("You won");
			}

		},

		showGameScreen: function() {

			var str = "";
			var img = "";
			var cur = 0;
			for (var i = 0; i < App.h; i++) {
				str = str + "<tr>";
				for (var j = 0; j < App.w; j++) {
					cur = App.field[i][j]
					switch (cur) {
						case 0:	//пусто
							img = "imgs/blanc_green.png";
							break;
						case 1:	// Точка хоста
							img = "imgs/red_dot.png";
							break;
						case 2:	// Стена хоста
							img = "imgs/red_fill.png";
							break;
						case 3:	// Точка книента
							img = "imgs/blue_dot.png";
							break;
						case 4: 	// Стена клиента
							img = "imgs/blue_fill.png";
							break;
						default:
							img = "imgs/blanc_green.png";
							break;
					}

					str = str + "<td > " +
						"<img id = " + i + "_" + j + " class = cell  src='"+ img +
						"'></td>"
				}

				str = str + "</tr>"

			}

			var turn = "";
			if(App.turn){

				if(App.nTurns == 2)
					turn = "You have 1 turn";
				else
					turn = "You have " + (3 - App.nTurns) + " turns";
			}else{
				turn = "Opponent's turn";
			}

			turn = "<div class='createGameWrapper'> <div class='info'>" + turn + "</div> </div>"

			var head = "";//"<div> <div id='leftname' class='namePl'> Player1 </div> <div id='right=name' class='namePr'>Player2</div> </div>"

			App.$gameArea.html(head + "<div class='field'> <table id='board'>" + str + "</table></div>" + turn );

		},




		onClickTurn: function() {


			if(App.turn){
				console.log("Good turn");
				// Проверить на валидность
				var cell = $(this).attr('id').split("_");
				var i = parseInt(cell[0]);
				var j = parseInt(cell[1]);

				if(App.myRole == 'Host')
					App.Host.onClickTurnHost(i,j);
				else
					App.Player.onClickTurnPlayer(i,j);


			}else{
				console.log("You cannot turn");
			}
		},



		Host : {

			onCreateClick: function() {
				App.nickname =  $('#inputPlayerName').val() || 'anon';
				IO.socket.emit('hostCreateNewGame');
			},

			gameInit: function(data) {
				App.gameId = data.gameId;
				App.mySocketId = data.mySocketId;
				App.myRole = 'Host';
				App.Host.displayNewGameScreen();
			},

			displayNewGameScreen : function() {
				App.$gameArea.html(App.$createScreen);
				$('#greeting').text("Hello, " + App.nickname + "!");
				$('#gameURL').text(window.location.href);


				$('#spanNewGameCode').text(App.gameId);
			},



			onClickTurnHost: function(i,j) {
				// 0 - empty, 1 - red_dot, 2 - red_wall, 3 - blue_dot, 4 - blue_wall
				console.log("Turn Host");
				if(App.field[i][j] == 2 || App.field[i][j] == 4 || App.field[i][j] == 1){
					//console.log("Here is wall of your dot");
					return;
				} else {
					// Ставить можно. Проверить есть ли вокруг живые клетки

					//App.Host.marked = new Array(App.h);
					for(var m = 0; m < App.h; m++){
						//App.Host.marked[m] = new Array(App.w);
						for(var n = 0; n < App.w; n++){
							App.marked[m][n] = false;
						}
					}


					for(var a = i - 1; a < (i + 2); a++)
						for(var b = j - 1; b < (j + 2); b++){

							if(a == i && b == j)
								continue;

							if(App.checkAlive(a,b, 1, 2)){

								//console.log("you can");
								App.nTurns += 1;
								var mark = 0;
								if(App.field[i][j] == 0)
									mark = 1;
								if(App.field[i][j] == 3)
									mark = 2;
								App.field[i][j] = mark;
								IO.socket.emit("Answered", {gameId : App.gameId, ind_i: i, ind_j: j, val: mark, nTurns: App.nTurns});



								//delete App.Host.marked;
								return;
							}
						}
					//console.log("you cannot");
					//delete App.Host.marked;

				}
		}
},


		checkAlive: function(i,j, good, good_wall){
				//console.log(i + " " + j)
				if(i < 0 || i >= App.h || j < 0 || j >= App.w)
					return false;

				if(App.marked[i][j] == true)
					return false;
				App.marked[i][j] = true;
				if(App.field[i][j] == 0)
					return false;
				if(App.field[i][j] == good)
					return true;
				if(App.field[i][j] == good_wall){
					for(var a = i - 1; a <= i+1; a++)
						for(var b = j - 1; b <= j+1; b++)
							if(App.checkAlive(a,b,good,good_wall))
								return true;
				}
				return false;
		},


		Player : {
			hostSocketId: '',

			onJoinClick: function() {
				App.nickname =  $('#inputPlayerName').val() || 'anon';
				App.$gameArea.html(App.$joinScreen);
			},

			onPlayerStartClick: function() {
				//App.$gameArea.html(App.$gameScreen);
				var data = {
					gameId : ($('#inputGameId').val())
				};
				App.myRole = 'Player';
				App.turn = false;
				IO.socket.emit('playerJoinGame', data);
			},
			onClickTurnPlayer: function (i,j){

				// 0 - empty, 1 - red_dot, 2 - red_wall, 3 - blue_dot, 4 - blue_wall
				console.log("Turn CLient");
				if(App.field[i][j] == 2 || App.field[i][j] == 4 || App.field[i][j] == 3){
					console.log("Here is wall of your dot");
					return;
				} else {
					// Ставить можно. Проверить есть ли вокруг живые клетки

					//App.Host.marked = new Array(App.h);
					for(var m = 0; m < App.h; m++){
						//App.Host.marked[m] = new Array(App.w);
						for(var n = 0; n < App.w; n++){
							App.marked[m][n] = false;
						}
					}


					for(var a = i - 1; a < (i + 2); a++)
						for(var b = j - 1; b < (j + 2); b++){

							if(a == i && b == j)
								continue;

							if(App.checkAlive(a,b, 3, 4)){

								console.log("you can");
								App.nTurns += 1;
								var mark = 0;
								if(App.field[i][j] == 0)
									mark = 3;
								if(App.field[i][j] == 1)
									mark = 4;
								App.field[i][j] = mark;
								IO.socket.emit("Answered", {gameId : App.gameId, ind_i: i, ind_j: j, val: mark, nTurns: App.nTurns});



								//delete App.Host.marked;
								return;
							}
						}
					console.log("you cannot");
					//delete App.Host.marked;

				}
			}

		},



		doTextFit : function(el) {
				textFit(
						$(el)[0],
						{
								alignHoriz:true,
								alignVert:false,
								widthOnly:true,
								reProcess:true,
								maxFontSize:300
						}
				);
		}

};






	IO.init();
  App.init();
}($));
