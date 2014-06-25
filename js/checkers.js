$(function(){

	Parse.initialize("ZzMYjfOLOLxsWRX8NjvfWHYuT1GFIJb0XYNY5MfX", "GArtoY76I0N9UKAxq6ccgfuyxXY0W6xloBWjbEUh");
	Player = Parse.Object.extend("Player");

var message={}, 
	row=12,
	column=12,

	player = [],

	playerCounter=0,
	targetSquare=null,
	simple=0,

	turn=null,

	hot_flag=false,
	hot_spots = [],
	current_color=null,
	current_kind=null,
	checked_square=null,

	current = move1 = move2 = move1_2 = move2_2 = null,

	colors = [],

	jumpFlag=null,

	// IMAGES OF THE PLAYABLE CHIPS
	red = ('<img src="./images/chip_red.jpg">'),
	brown = ('<img src="./images/chip_brown.jpg">'),
	green = ('<img src="./images/chip_green.jpg">'),
	orange = ('<img src="./images/chip_orange.jpg">');

	red_king = ('<img src="./images/chip_red_king.jpg">'),
	brown_king = ('<img src="./images/chip_brown_king.jpg">'),
	green_king = ('<img src="./images/chip_green_king.jpg">'),
	orange_king = ('<img src="./images/chip_orange_king.jpg">');


	/*--------------------------------------------------------------------*/
	/*---------------------CALLING ALL FUNCTIONS HERE  -------------------*/
	/*--------------------------------------------------------------------*/
	subscribe();
  createBoard();
	assignChips();	
	$('.box').on('click', this, checkMove);
	/*--------------------------------------------------------------------*/
	/*--------------------- CREATE POPULATE THE BOARD  -------------------*/
	/*--------------------------------------------------------------------*/

	function createBoard () {
		// This function 
		// results in a #board populated by <div id#r1c1 class ="box" + "legal" or "illegal"

		var flag=true;

		for (var r=0; r<row; r++){
			flag ? flag=false : flag=true;	//alternates between black and white squares
			$('#board').append('<div id="r' + r + '" class="row"></div>');

			for (var c=0; c<column; c++){
				var $thisSquare = $('<div id="r'+r+'c'+c+'" class="box"></div>');

				if( (r<3&&c<3) || (r>8&&c<3) || (c>8&&r<3) || (c>8&&r>8) ) 	
				{
					$thisSquare.addClass("blank occupied");
					flag ? flag=false : flag=true;
				}
				else{
					switch (flag)
					{ 	case true:
							$thisSquare.addClass("legal");
							$thisSquare.addClass("not_hot");
							flag=false;
							break;
						case false:
							$thisSquare.addClass("illegal");
							flag=true;
							break;
					};
				}
				$('#r'+r).append($thisSquare);	
			}
		}
		$('#r0c3').addClass('king_brown');
		$('#r0c5').addClass('king_brown');
		$('#r0c7').addClass('king_brown');

		$('#r3c0').addClass('king_red');
		$('#r5c0').addClass('king_red');
		$('#r7c0').addClass('king_red');

		$('#r4c11').addClass('king_orange');
		$('#r6c11').addClass('king_orange');
		$('#r8c11').addClass('king_orange');

		$('#r11c4').addClass('king_green');
		$('#r11c6').addClass('king_green');
		$('#r11c8').addClass('king_green');				

	}

	function assignChips(){
		colors[1]="red";
		colors[2]="brown";
		colors[3]="orange";
		colors[4]="green";

		for (var r=0; r<row; r++){
			for (var c=0; c<column; c++){
				
				var thisSquare=('#r'+r+'c'+c+'');
				var thisClass=($(thisSquare).attr('class'));				//WHY DOES THIS WORK THIS WAY???
				
				 if ((r>=0 && r<3 && c >2 && c<9 && thisClass === "box legal not_hot") || (r>=0 && r<3 && c >2 && c<9 && thisClass === "box legal not_hot king_brown") ){
				 	// if thisClass is a legal box then assign the position to the brown chip
				 	
				 	$(thisSquare).append(brown);
				 	$(thisSquare).addClass('occupied brown unking');				 	
				 }
				 else if (r>=3 && r<9 && c >= 0 && c<3 && thisClass === "box legal not_hot" || r>=3 && r<9 && c >= 0 && c<3 && thisClass === "box legal not_hot king_red"){
				 	$(thisSquare).append(red);	
				 	$(thisSquare).addClass('occupied red unking');			 	
				 }
				 else if(c>=3 && c<9 && r >= 9 && r<12 && thisClass === "box legal not_hot" || c>=3 && c<9 && r >= 9 && r<12 && thisClass === "box legal not_hot king_green"){
				 	$(thisSquare).append(green);
				 	$(thisSquare).addClass('occupied green unking');				 	
				 }
				 else if (r>=3 && r<9 && c >= 9 && c<12 && thisClass === "box legal not_hot" || r>=3 && r<9 && c >= 9 && c<12 && thisClass === "box legal not_hot king_orange"){
				 	$(thisSquare).append(orange);	
				 	$(thisSquare).addClass('occupied orange unking');			 	
				 }
			}
		}
	}

	/*--------------------------------------------------------------------*/
	/*------------------------- ADDING PLAYERS     -----------------------*/
	/*--------------------------------------------------------------------*/


	function getData(){	
		PUBNUB.publish({channel: "checkers", message: {type: 'login'}});
	}


	function playerNameSetup()
	{
		var Player = Parse.Object.extend("Player");
		var query = new Parse.Query(Player);
		query.descending("createdAt");
		query.find({
			success: function(results) {
				for(var i=0; i < results.length; i++)
				{
					var name = results[i].get('player_name');
					$('#playerName'+(i+1)).text(name);
					console.log('name: '+name);
					if(i===3){
						assignPlayers(i+1);
					}
				}
			},
			error: function(error){}
		});
	}
	
	function assignPlayers (num) {
		console.log('assignPlayers');
		for (var i=0; i<num; i++){
			player[i]=$('#playerName'+(i+1)).text();
		}
		startGame();
	}

	/*--------------------------------------------------------------------*/
	/*------------------------- STARTING THE GAME  -----------------------*/
	/*--------------------------------------------------------------------*/

	function startGame (){
		console.log('*---------------*');
		console.log('startGame');
		console.log('*---------------*');
 
		turn=1;
		movePrompt();
	}

	/*--------------------------------------------------------------------*/
	/*-------------------------- MOVING PROMPTER  ------------------------*/
	/*--------------------------------------------------------------------*/

	function movePrompt(){	
		console.log('*------------------------*');							/* CALL TO PUB NUB */
		console.log("movePrompt PubNub Call ----> movePrompter ");
		console.log("CALL FROM: CLICK");
		console.log("");
		console.log("");
		PUBNUB.publish({channel: "checkers", message: {type: 'move'}});
	}

	function movePrompter () {												/* THIS CHANGES THE "Up Next" TAG SO PLAYER KNOWS TURN */
		console.log('*---------------------------------------------*');
		console.log("movePrompter.  CALLED FROM movePrompt.  CALLED FROM pubnub");
		console.log('Turn: ' + turn); 
		console.log('players: ');
		console.log(player);
		console.log('color: '+colors[turn]);
		console.log('*---------------------------------------------*');
		console.log('');
		console.log('');
		$('#upNext').text(turn);
		$('#upNext').css('background-color', colors[turn]);	
	}

	/*--------------------------------------------------------------------*/
	/*-------------------------- MOVING PIECES    ------------------------*/
	/*--------------------------------------------------------------------*/


	function checkMove () {	
		console.log("CLICK CLICK CLICK CLICK CLICK CLICK CLICK");
		currentSquare = $(this).attr("id");
		currentStatus = $(this).attr("class");
		var color=colors[turn];
		if ($('#'+currentSquare).hasClass('king')){
			current_kind='king';
		}
		else if ($('#'+currentSquare).hasClass('unking')){
			current_kind='unking';
		}
		console.log('*---------------------------------------------*');
		console.log("checkMove.  CALLED FROM button click.");
		console.log("currentSquare: " + currentSquare);
		console.log("currentStatus: " + currentStatus);
		console.log("color: " + color);
		console.log("turn: " + turn);
		console.log("hot_flag: " + hot_flag);
		console.log("jumpFlag: " + jumpFlag);
		console.log("Checked_square: "+ checked_square);
		console.log('move1_2: '+ move1_2);
		console.log('move2_2: '+ move2_2);
		console.log('current_kind: '+ current_kind);
		console.log('*---------------------------------------------*');
		console.log('');
		console.log('');

		if ($(this).hasClass('not_hot')) {
			notLegalMove();
		};
		if ($(this).hasClass('hot')) { 
			slidePiecePrompt(jumpFlag, move1, move2, checked_square, currentSquare, color, current_kind);
		};
		
		switch (turn) {
			case 1 :

				if ($(this).hasClass('red') && hot_flag===true){ slidePiecePrompt(jumpFlag, move1, move2, checked_square, currentSquare, color, current_kind) };
				$(this).hasClass('red') ? possibleMoves(currentSquare) : notLegalMove();
				console.log('CHECK MOVE:  CASE 1');
				break;
			case 2 :
				if ($(this).hasClass('brown') && hot_flag===true){ slidePiecePrompt(jumpFlag, move1, move2, checked_square, currentSquare, color, current_kind) };
				$(this).hasClass('brown') ? possibleMoves(currentSquare) : notLegalMove();
				console.log('CHECK MOVE:  CASE 2');
				break;
			case 3 :
				if ($(this).hasClass('orange') && hot_flag===true){ slidePiecePrompt(jumpFlag, move1, move2, checked_square, currentSquare, color, current_kind) };
				$(this).hasClass('orange') ? possibleMoves(currentSquare) : notLegalMove();
				console.log('CHECK MOVE:  CASE 3');
				break;
			case 4 :
				if ($(this).hasClass('green') && hot_flag===true){ slidePiecePrompt(jumpFlag, move1, move2, checked_square, currentSquare, color, current_kind) };
				$(this).hasClass('green') ? possibleMoves(currentSquare) : notLegalMove();
				console.log('CHECK MOVE:  CASE 4');
				break;
		}
	}

	function slidePiecePrompt(jumpFlag, jumpPiece1, jumpPiece2, checked_square, currentSquare, color, current_kind){
		console.log('*--------------------*');
		console.log('slidePiecePrompt')
		console.log('====================== pubNub call.  Comes from Check Move')
		console.log("currentStatus: " + currentStatus);
		console.log("color: " + color);
		console.log("turn: " + turn);
		console.log('*---------------------------------------------*');
		PUBNUB.publish({channel: "checkers", message: {type: 'slide', jumpFlag: jumpFlag, jump1: move1, jump2: move2, old: checked_square, current: currentSquare, color: color, current_kind: current_kind }});
	}

	function removeAllClass(){
		for (var h=0; h<2; h++){
			$('#'+hot_spots[h]).removeClass('hot');
			$('#'+hot_spots[h]).addClass('not_hot');
				
		}
		hot_spots=[];
		hot_flag=false;
	}

	function removeOneClass(square){
		$('#'+square).removeClass('hot');
	}	

	/*--------------------------------------------------------------------*/
	/*-------------------------- CHECKING LEGAL   ------------------------*/
	/*--------------------------------------------------------------------*/

	function possibleMoves (thisSquare){
		console.log('*-----------------------------*');
		console.log('possibleMoves.  CALLED FROM: checkMove');
		console.log('*-----------------------------*');
		
		checked_square = thisSquare;	
		var coords=thisSquare.split("");
		if ( (turn===3 || turn===1) && (coords[4])){
			console.log("TURN IS EQUAL TO: "+turn);
			var row = parseInt(coords[1]);
			var col = parseInt(coords[3]+coords[4]);
			console.log('coords[3]: '+coords[3]);
			console.log('coords[4]: '+coords[4]);
			console.log('coords[3]+coords[4]: '+coords[3]+coords[4]);
		}
		else if ( (turn===4 || turn===2) && (coords[4]))
		{	
			var row = parseInt(coords[1]+coords[2]);
			var col = parseInt(coords[4]);
		}
		else {	
			var row=coords[1];
			var col=coords[3];
			row=parseInt(row);
			col=parseInt(col);
		}
		
		console.log("row: "+row);
		console.log("col: "+col);

	/******************** NORMAL MOVEMENTS *******************/


		if(turn===1 && $('#'+thisSquare).hasClass('unking')) {
			current = thisSquare;
			console.log("Current Square !!! "+current);
			current_color = "red";
			current_kind = "unking";
			move1 = "r"+(row-1)+"c"+(col+1);
			move2 = "r"+(row+1)+"c"+(col+1);
			move1_2 = "r"+(row-2)+"c"+(col+2);
			move2_2 = "r"+(row+2)+"c"+(col+2);
		}
		if(turn===2 && $('#'+thisSquare).hasClass('unking')) {
			current = thisSquare;
			current_color = "brown";
			current_kind = "unking";
			move1 = "r"+(row+1)+"c"+(col-1);
			move2 = "r"+(row+1)+"c"+(col+1);
			move1_2 = "r"+(row+2)+"c"+(col-2);
			move2_2 = "r"+(row+2)+"c"+(col+2);
		}
		if(turn===3 && $('#'+thisSquare).hasClass('unking')) {
			current = thisSquare;
			console.log('!!!!!!!!!!!!!!!!!!!CURRENT ORANGE !!!!!!!!!!!!!!')
			console.log(thisSquare);
			current_color = "orange";
			current_kind = "unking";
			move1 = "r"+(row-1)+"c"+(col-1);
			move2 = "r"+(row+1)+"c"+(col-1);
			move1_2 = "r"+(row-2)+"c"+(col-2);
			move2_2 = "r"+(row+2)+"c"+(col-2);
		}
		if(turn===4 && $('#'+thisSquare).hasClass('unking')) {
			current = thisSquare;
			current_color = "green";
			current_kind = "unking";
			move1 = "r"+(row-1)+"c"+(col-1);
			move2 = "r"+(row-1)+"c"+(col+1);
			move1_2 = "r"+(row-2)+"c"+(col-2);
			move2_2 = "r"+(row-2)+"c"+(col+2);
		}

	/******************** KING MOVEMENTS *******************/

		if(turn===1 && $('#'+thisSquare).hasClass('king')) {
			current = thisSquare;
			console.log("Current Square !!! "+current);
			current_color = "red";
			current_kind = "king";
			move1 = "r"+(row-1)+"c"+(col-1);
			move2 = "r"+(row+1)+"c"+(col-1);
			move1_2 = "r"+(row-2)+"c"+(col-2);
			move2_2 = "r"+(row+2)+"c"+(col-2);
		}
		if(turn===2 && $('#'+thisSquare).hasClass('king')) {
			current = thisSquare;
			current_color = "brown";
			current_kind = "king";
			move1 = "r"+(row-1)+"c"+(col-1);
			move2 = "r"+(row-1)+"c"+(col+1);
			move1_2 = "r"+(row-2)+"c"+(col-2);
			move2_2 = "r"+(row-2)+"c"+(col+2);
		}
		if(turn===3 && $('#'+thisSquare).hasClass('king')) {
			current = thisSquare;
			console.log(thisSquare);
			current_color = "orange";
			current_kind = "king";
			move1 = "r"+(row-1)+"c"+(col+1);
			move2 = "r"+(row+1)+"c"+(col+1);
			move1_2 = "r"+(row-2)+"c"+(col+2);
			move2_2 = "r"+(row+2)+"c"+(col+2);
		}
		if(turn===4 && $('#'+thisSquare).hasClass('king')) {
			current = thisSquare;
			current_color = "green";
			current_kind = "king";
			move1 = "r"+(row+1)+"c"+(col-1);
			move2 = "r"+(row+1)+"c"+(col+1);
			move1_2 = "r"+(row+2)+"c"+(col-2);
			move2_2 = "r"+(row+2)+"c"+(col+2);
		}

		isOccupied(move1) ? bySelf(move1, move1_2) : addLegalStatus(move1);
		isOccupied(move2) ? bySelf(move2, move2_2) : addLegalStatus(move2);
		if (isOccupied(move1_2)){ removeOneClass(move1_2) };
		if (isOccupied(move2_2)){ removeOneClass(move2_2) };

	}
	function isOccupied (square) {
		var occupied = $('#'+square).hasClass('occupied') ? true : false;
		console.log('*---------------------*');
		console.log('isOccupied.  CALLED FROM: possibleMoves');
		console.log('*----------------------*')
		console.log("Square "+square+ "is occupied? "+ occupied);
		console.log('');
		console.log('');
		return occupied;	
	}

	function bySelf(square, square2){
		console.log("*---------------*");
		console.log("bySelf: check to see if the occuypying checker is players")
		console.log("*---------------*");
		console.log("square: "+square);
		console.log("square2: "+square2);
		$('#'+square).hasClass(current_color) ? removeOneClass(square) : jumpable(square,square2);

	}


	function addLegalStatus(square){
		console.log("*---------------*");
		console.log("addLegalStatus(square).  CALLED FROM: possibleMoves");
		console.log("*---------------*");	
		console.log('square: ' + square);
		console.log('');
		console.log('');
		$('#'+square).removeClass('not_hot');
		$('#'+square).addClass('hot');
		hot_spots.push(square);
		hot_flag = true;
		console.log('hot_spots: '+hot_spots);
		console.log('hot_flag '+hot_flag);

	}
	function slidePiece(jumpFlag, move1, move2, old, current, current_color, current_kind){

		console.log('*-----------------*');
		console.log('called from pub nub, called from slidePiecePrompt');
		console.log('slide piece');
		console.log('*-----------------*');
		console.log("Current_color: "+current_color);
		console.log("New square: "+current);
		console.log("old square "+old);
		console.log("Turn: "+turn);	
		console.log("move1 "+move1 );
		console.log("move2 " + move2);
		console.log("move1_2: "+move1_2);
		console.log("move2_2: "+move2_2);
		console.log("current_kind: "+current_kind);
		
		var newSquare=current;
		var newColor=current_color;

		if (newSquare===move1_2 || newSquare === move2_2){ 
			if (newSquare === move1_2) {
				var takeFlag=0;
			}
			else {
				var takeFlag=1;
			}

			removeJump(old, current_color, current_kind, move1, move2, current, takeFlag);

		}

		
		else {
			console.log('new square is not a jump');
			console.log('going to do a normal slide');

			$('#'+old).removeClass("occupied"); 
			$('#'+old).removeClass(current_color);
			$('#'+old).removeClass(current_kind);
			$('#'+old).children().remove();

			$('#'+current).addClass('occupied');
			$('#'+current).addClass(current_color);
			$('#'+current).addClass(current_kind);

			if (current_kind === "unking") {
				switch (current_color)
				{
					case 'red':
						$('#'+current).append(red);
						break;
					case 'brown':
						$('#'+current).append(brown);
						break;
					case 'green':
						$('#'+current).append(green);
						break;
					case 'orange':
						$('#'+current).append(orange);
						break;	
				}
			}
			else if (current_kind === "king") {
				switch (current_color)
				{
					case 'red':
						$('#'+current).append(red_king);
						break;
					case 'brown':
						$('#'+current).append(brown_king);
						break;
					case 'green':
						$('#'+current).append(green_king);
						break;
					case 'orange':
						$('#'+current).append(orange_king);
						break;	
				}

			}
		}

		console.log('SLIDE COMPLETE SLIDE COMPLETE SLIDE COMPLETE')
		
/***********************************************************************/		
/********************** KING??  GAME OVER ??  **************************/
/***********************************************************************/

		console.log('calling isKing from slidePiece');
		isKing(newSquare, newColor);
		console.log('calling winner from slidePiece');
		gameOver(newSquare, newColor);	
		console.log('calling for next turn');
		nextTurn();


	}

	function notLegalMove () {
		console.log('*======================*');
		console.log('notLegalMove');
		console.log('called from: checkMove');
		console.log('*======================*');

		removeAllClass();
		movePrompt();
	}

	/*--------------------------------------------------------------------*/
	/*---------------------JUMP FUNCTIONS 			-------------------*/
	/*--------------------------------------------------------------------*/


	function jumpable (square, square2) {
		console.log("*---------------*");
		console.log("jumpable: check to see if the occuypying checker is jumpable")
		console.log("*---------------*");
		console.log("square: "+square);
		console.log("square2: "+square2);
		console.log('calling isOccupied');

		if( !($('#'+square).hasClass(current_color)) && !isOccupied(square2)){
			jumpFlag = true;
			console.log("JumpFlag="+jumpFlag)
			addLegalStatus(square2);
		}
		
	}

	function removeJump(old, current_color, current_kind, move1, move2, current, takeFlag){	
		console.log('*------------------------*');							/* CALL TO PUB NUB */
		console.log("movePrompt removeJump ");
		//console.log("CALL FROM: ")
		console.log("");
		console.log("");
		PUBNUB.publish({channel: "checkers", message: {type: 'jump', old: old, current_color: current_color, current_kind: current_kind, move1: move1, move2: move2, current: current, takeFlag: takeFlag}});
	}

	function takePiece (old, current_color, current_kind, move1, move2, current, takeFlag) {
		console.log('new square === 1_2 or 2_2');

		$('#'+old).removeClass("occupied"); 
		$('#'+old).removeClass(current_color);
		$('#'+old).removeClass(current_kind);
		$('#'+old).children().remove();

		if (takeFlag === 0 ) {
			$('#'+move1).removeClass("occupied"); 
			$('#'+move1).removeClass(current_color);
			$('#'+move1).removeClass(current_kind);
			$('#'+move1).children().remove();				
		}
		else if (takeFlag === 1 ){

			$('#'+move2).removeClass("occupied"); 
			$('#'+move2).removeClass(current_color);
			$('#'+move2).removeClass(current_kind);
			$('#'+move2).children().remove();

		}
		$('#'+current).addClass('occupied');
		$('#'+current).addClass(current_color);
		$('#'+current).addClass(current_kind);

		if (current_kind === "unking") {
			switch (current_color)
			{
				case 'red':
					$('#'+current).append(red);
					break;
				case 'brown':
					$('#'+current).append(brown);
					break;
				case 'green':
					$('#'+current).append(green);
					break;
				case 'orange':
					$('#'+current).append(orange);
					break;	
			}
		}
		else if (current_kind === "king") {
			switch (current_color) {
				case 'red':
					$('#'+current).append(red_king);
					break;
				case 'brown':
					$('#'+current).append(brown_king);
					break;
				case 'green':
					$('#'+current).append(green_king);
					break;
				case 'orange':
					$('#'+current).append(orange_king);
					break;	
			}
		}
	}
	function isKing (square, color) {
		console.log('*----------------------------------*');
		console.log('isKing');
		console.log('');
		console.log('king_current_color: '+'king_'+color);
		console.log('current_square: '+square);
		console.log('current class: '+ $('#'+square).attr('class'));
		console.log('');
		console.log('');		
		switch (color) {
			case ("red") :
				if ($('#'+square).hasClass('king_orange')) { kingPrompt(square, color) };
				break;
			case ("orange") :
				if ($('#'+square).hasClass('king_red')) { kingPrompt(square, color) };
				break;
			case ("green") :
				if ($('#'+square).hasClass('king_brown')) { kingPrompt(square, color) };
				break;
			case ("brown") :
				if ($('#'+square).hasClass('king_green')) { kingPrompt(square, color) };
				break;												
		}
	}
	function kingPrompt (square, color) {
		console.log("kingPrompt.  CALLED FROM: isKing");
		PUBNUB.publish({channel: "checkers", message: {type: 'king', square:square, color:color}});
	}
	function kingMe (square,color) {

		$('#'+square).removeClass('unking');
		$('#'+square).children().remove();  
		$('#'+square).addClass('king');

		switch (color) {
			case "red" : 
				$('#'+square).append(red_king);
				break;
			case "green" :
				$('#'+square).append(green_king);
				break;
			case "orange" :
				$('#'+square).append(orange_king);
				break;
			case "brown"  :
				$('#'+square).append(brown_king);
				break;
		}
		console.log('isKing!');
		console.log('===============');
		console.log('current square: '+square);
		console.log('current color: '+color);
		console.log('current square class: '+$('#'+square).attr("class"));
		console.log('current square class: '+$('#'+square).attr("class"));
		console.log('');
		console.log('');
	}

	/*--------------------------------------------------------------------*/
	/*---------------------         NEXT TURN         --------------------*/
	/*--------------------------------------------------------------------*/

	function nextTurn(){
		hot_flag=false;
		turn++
		if (turn>4) {turn=1};
		removeAllClass();	
		move1_2 = move2_2   // RESET THE MOVES FOR THE OTHER  		
		console.log('hot_flag '+hot_flag);
		console.log('removeAllClass');
		movePrompt();
	}

	/*--------------------------------------------------------------------*/
	/*---------------------        GAME OVER ???       -------------------*/
	/*--------------------------------------------------------------------*/

	function gameOver(square, color) {
		if ($('#'+square).hasClass('king') && $('#'+square).hasClass('king_'+color)){
			console.log('******************AT THE END***************');
			gameOverPrompt();
		}
		else{
			movePrompt();
		}
	}

	function gameOverPrompt () {
		PUBNUB.publish({channel: "checkers", message: {type: 'winner'}});
	}

	function done () {		
		$('#main').children().remove();
	}

	/*--------------------------------------------------------------------*/
	/*---------------------PUB NUB PUBLISH AND SEND MSG-------------------*/
	/*--------------------------------------------------------------------*/

	function subscribe(){
	     PUBNUB.subscribe({
	          channel    : "checkers",      // CONNECT TO THIS CHANNEL.
	          restore    : false,              // STAY CONNECTED, EVEN WHEN BROWSER IS CLOSED
	                                           // OR WHEN PAGE CHANGES.
	          callback   : receive_message,
	
	          disconnect : function() {        // LOST CONNECTION.
	            console.log('you are disconnecting');
	          },
	          reconnect  : function() {        // CONNECTION RESTORED.
	            console.log('And we are back!');
	          },
	          connect    : function() {        // CONNECTION ESTABLISHED.
	            console.log('connected');
	            getData();

	          }
	      });	      
	}

	function receive_message(message)
	{
	  switch(message.type)
	  {
			case 'login' :
				console.log("------------------------");
				console.log("Message received to login");
				console.log("------------------------");			
				console.log("");
				console.log('---> playerNameSetup()');
				playerNameSetup();
			case 'move' :
				console.log("------------------------")
				console.log("Message received to move")
				console.log("------------------------")
				console.log("");
				console.log('---> movePrompter()');		
				movePrompter();		
				break;
			case 'slide':
				console.log("------------------------")
				console.log("Message received to slide from slidePiecePrompt")
				console.log("------------------------")
				console.log("");
				console.log('---> slidePiece()');					
				slidePiece(message.jumpFlag, message.jump1, message.jump2, message.old, message.current, message.color, message.current_kind);	
				
				break;
			case 'jump' :
				takePiece (message.old, message.current_color, message.current_kind, message.move1, message.move2, message.current, message.takeFlag);
				break;
			case 'king' :
				kingMe(message.square, message.color);
				break;				
			case 'winner' :
				done();
				break;				
	  }
	}



});
