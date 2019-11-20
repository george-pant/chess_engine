//(function(){

var squares = [];

var piece = { 'P': 100, 'N': 300, 'B': 300, 'R': 500, 'Q': 900, 'K': 60000 }

//direction each piece can move Only pawn have different based on color
var directions  = [];
directions["P"] = [[-10,-20],[-9],[-11]];
directions["p"] = [[10,20],[9],[11]];
directions["B"] = directions["b"] = [[-11,-22,-33,-44,-55,-66,-77],[-9,-18,-27,-36,-45,-54,-63],[11,22,33,44,55,66,77],[9,18,27,36,45,54,63]];
directions["R"] = directions["r"] = [[-1,-2,-3,-4,-5,-6,-7],[-10,-20,-30,-40,-50,-60,-70],[1,2,3,4,5,6,7],[10,20,30,40,50,60,70] ];
directions["N"] = directions["n"] = [[-21],[-19],[-12],[-8],[8],[12],[19],[21]];
directions["Q"] = directions["q"] = directions["r"].concat(directions["b"]);
directions["K"] = directions["k"] = [[-11],[-10],[-9],[-1,-2],[1],[9],[10],[11],[1,2]];
directions["check"]=directions["q"].concat(directions["n"]);

var history=[];

// map our array indexes to chess board squares Ue.g a1->21,a2->31,...

for(let i=1;i<9;i++){ 

    for(let j=1;j<9;j++){ 
        
        squares[String.fromCharCode(96+i)+j.toString()] = 28-(i-1)+((j-1)*10); 
    } 
}

const starting_position=[
    1 , 1 , 1 , 1 , 1 , 1,  1 , 1 , 1 , 1,
    1 , 1 , 1 , 1 , 1 , 1,  1 , 1 , 1 , 1,
    1 ,'r','n','b','k','q','b','n','r', 1,
    1 ,'p','p','p','p','p','p','p','p', 1,
    1 , 0,  0 , 0 , 0 , 0 , 0 , 0,  0 , 1,
    1 , 0,  0 , 0 , 0 , 0 , 0 , 0,  0 , 1,
    1 , 0,  0 , 0 , 0 , 0 , 0 , 0,  0 , 1,
    1 , 0,  0 , 0 , 0 , 0 , 0 , 0,  0 , 1,
    1 ,'P','P','P','P','P','P','P','P', 1,
    1 ,'R','N','B','K','Q','B','N','R', 1,
    1 , 1 , 1 , 1 , 1 , 1,  1 , 1 , 1 , 1,
    1 , 1 , 1 , 1 , 1 , 1,  1 , 1 , 1 , 1,
    ];


var board = {};

board.game_status=2                     //0 if white won 1 for black 2 for game in progress
board.moving_player=0                   //0 for white player 1 for black
board.moves=[];                         //game moves
board.valid_moves=[];                   //possible valid moves
board.valid_moves[0]=[];                   //possible valid moves
board.valid_moves[1]=[];                   //possible valid moves
board.position=[];
board.history=[];
board.castling_rights=[[true,true],[true,true]];

board.initialize=function(){
    this.game_status=2; 
    this.moving_player=0;                   //0 for white player 1 for black
    this.moves=[];                         //game moves
    this.valid_moves=[];                   //possible valid moves
    this.position=starting_position.concat();
    this.history=[];
    this.castling_rights=[];
    this.castling_rights[0]=[true,true];   //white castling rights [kingside,queenside]
    this.castling_rights[1]=[true,true];   //black castling rights [kingside,queenside]
    this.find_valid_moves();
};

board.move=function(from,to){

    this.moving_player=(this.moves.length%2==0 || this.moves.length==0) ?0:1;

    if(this.valid_moves[this.moving_player][from].includes(to)){
    
    //keep the current state in history

        this.history.push( 
        {
            position:this.position.slice(),
            castling_rights:this.castling_rights.slice(),
            moves:this.moves.slice()
            
        });               

    //make the move in board
    this.position[parseInt(to)]=this.position[from];
    this.position[from]=0;
    
    if(typeof to==='string') { this.position[parseInt(to)]=to[to.length-1] }  //pawn promotions
     
    if(from===24 && to===22 && this.castling_rights[0][0]===true){
        this.position[23]='r';
        this.position[21]=0;
    }

    if(from===24 && to===26 && this.castling_rights[0][0]===true){
        this.position[25]='r';
        this.position[28]=0;
    }

    if(from===94 && to===92 && this.castling_rights[1][0]===true){
        this.position[93]='R';
        this.position[91]=0;
    }

    if(from===94 && to===96 && this.castling_rights[1][0]===true){
        this.position[95]='R';
        this.position[98]=0;
    }

    //first time white king moves we lose all castling rights
    if(from===24 && this.castling_rights[0].indexOf(true)>-1 )             {     this.castling_rights[0]=[false,false];                         } 
    //first time a rook moves or is captured we lose this side castling rights
    else if( (from===21 || to===21) && board.castling_rights[0][0]===true ) {    this.castling_rights[0][0]=false;  } 
    else if( (from===28 || to===28) && board.castling_rights[0][1]===true ) {    this.castling_rights[0][1]=false;  }

    
    //first time black king moves we lose all castling rights
    if(from===94 && this.castling_rights[1].indexOf(true)>-1 )             {     this.castling_rights[1]=[false,false];                         } 
    //first time a rook moves or is captured we lose this side castling rights
    else if( (from===91 || to===91) && board.castling_rights[1][0]===true ) {    this.castling_rights[1][0]=false;  } 
    else if( (from===98 || to===98) && board.castling_rights[1][1]===true ) {    this.castling_rights[1][1]=false;  }
    

    this.moves.push([from,to]);                     //keep track of moves,
    this.moving_player= 1 - this.moving_player;     //change moving player
    this.find_valid_moves();                        //find valid moves for next move

    if(this.valid_moves[this.moving_player].length===0){ 
        this.game_status=this.moving_player= 1 - this.moving_player;
    }

    return true;

    }else{
        console.log('invalid move from '+from+' to '+to);
        board.print();
        board.status();
        return false;
    }
}

board.undo_move=function(){
    
    if(this.history.length>0){

    var previous=this.history.pop();

    this.position=previous.position.concat();
    this.castling_rights=previous.castling_rights;
    this.moves=previous.moves.concat(); 
    
    if(this.game_status==2){
        this.moving_player= 1 - this.moving_player;
    }else{  
    this.game_status=2;
    }

    this.find_valid_moves();

    }else{
        return false;
    }

}

board.move_random=function(){

    //this.moving_player=this.moves.length%2==0?0:1;
    var first_piece=Object.keys(this.valid_moves[this.moving_player])[0];
    console.log(first_piece);
    var first_to=this.valid_moves[this.moving_player][first_piece][0];

/*
    var keys = Object.keys(this.valid_moves[this.moving_player]);

    var random_piece=keys[Math.floor(keys.length * Math.random())];
    var random_move=this.valid_moves[this.moving_player][random_piece][Math.floor(this.valid_moves[this.moving_player][random_piece].length * Math.random())];
    
    var from=parseInt(random_piece);
    var to=random_move;*/

    var from=first_piece;
    var to=first_to;

    if(this.move(from,to)) return true;

    return false;

}

board.find_piece_color=function(square){
    if (this.position[square]==0 || this.position[square]==1  || typeof this.position[square]==='undefined'){ return 2; }
    return (this.position[square].charCodeAt(0) >= 65 && this.position[square].charCodeAt(0) <= 90)?1:0
}


board.find_valid_moves=function(){

    this.valid_moves[0]=[]; //white valid moves
    this.valid_moves[1]=[]; //black valid moves

    for(var i=21;i<92;i=i+10){      // iterate all boards squares

        for(var j=0;j<8;j++){
        
        var square=i+j;
        
        if(square==94){ 
            console.log(true);
        }
        if (this.position[square]==0) { continue; }                                 //if empty square continue
            
        var piece=this.position[square];
        var moving_piece_color= this.find_piece_color(square);

        if(moving_piece_color!=this.moving_player) { continue; }

        for(var k=0;k<directions[piece].length;k++) {                                //if piece in the square find all possible moves for this piece

            for(var l=0;l<directions[piece][k].length;l++) {
                
                target_square=parseInt(square)+parseInt(directions[piece][k][l]);
                
                if(this.position[target_square]==1 ) { break; }                          //target square is outside board

                target_piece_color=this.find_piece_color(target_square);

                if( moving_piece_color === target_piece_color ) { break; }               //target square is occupied by friendly piece
                
                if (piece==='p' || piece==='P'){                                         //pawn rules

                    if( (square-target_square)%10!==0 && this.position[target_square]==0 ){ continue; } //cannot capture in empty squares
                    
                    if( (square-target_square)%10==0 && this.position[target_square]!=0 ){ break; }    //and cannot go forward when they are blocked
                
                    if( ( (piece==='p' && square>40 ) || (piece==='P' && square<81 ) ) && Math.abs(directions[piece][k][l])===20 ){ break; } //if pawns are not in the first row they cannot move two squares
                    
                    if (piece==='p' && target_square>90) { target_square+='q' } if (piece==='P' && target_square<29 ) { target_square+='Q' } //auto promote to queen
                }

                    if(piece==='k' || piece==='K'){ 
                        
                        if( directions[piece][k][l]==-2 && ( this.castling_rights[moving_piece_color][0]!==true || this.position[target_square]!=0) ){ break; } //king side castle 
                        
                        if(directions[piece][k][l]==2 && ( this.castling_rights[moving_piece_color][1]!==true || this.position[target_square-1]!=0 || this.position[target_square]!=0  )) { break; }  //queen side castle 

                    }

                    var king_capture_found=false;   //  make move temporarily and if king is checked break 
                    
                    var old_target=this.position[parseInt(target_square)];
                    this.position[parseInt(target_square)]=this.position[square];
                    this.position[square]=0;
                    //this.moving_player= 1 - this.moving_player; 
                    
                    var king_square=(this.moving_player==0)?this.position.indexOf('k'):this.position.indexOf('K');
                    var king_color=this.moving_player;


                    for(var m=0;m<directions['check'].length;m++) {  

                        for(var n=0;n<directions['check'][m].length;n++) {
                            
                            checkmate_check=king_square+directions['check'][m][n];

                            if (this.position[checkmate_check]==0) { continue; }

                            if(this.position[checkmate_check]==1 ) { break; } 

                            attacking_piece_color=this.find_piece_color(checkmate_check);

                            if( king_color === attacking_piece_color ) { break; } //we found our own piece first

                        /*    if(
                                (n<4 && this.position[checkmate_check].toASCIILower==='r' ) || 
                                (n>3 && this.position[checkmate_check].toASCIILower==='b' ) ||
                                (n<8 && this.position[checkmate_check].toASCIILower==='q' ) || 
                                (n>7 && this.position[checkmate_check].toASCIILower==='n' )
                            ){ 
                        */

                            if( //if we are here it means we found a piece of enemy in our path so we check if its one that can capture our king or not
                                ( 
                                    ( (directions['check'][m][n]===12 || directions['check'][m][n]===11)  && this.position[checkmate_check]==='P' && king_color===0  )  
                                    || 
                                    ( (directions['check'][m][n]===-12 || directions['check'][m][n]===-11)  && this.position[checkmate_check]==='p' && king_color===1  )  
                                )|| 
                                (m<4 && ( (king_color===0 && this.position[checkmate_check]==='R') || (king_color===1 && this.position[checkmate_check]==='r') ) )|| 
                                (m>3 && m<8 && ( (king_color===0 && this.position[checkmate_check]==='B') || (king_color===1 && this.position[checkmate_check]==='b') ) ) ||
                                (m<8 && ( (king_color===0 && this.position[checkmate_check]==='Q') || (king_color===1 && this.position[checkmate_check]==='q') ) ) || 
                                (m>7 && ( (king_color===0 && this.position[checkmate_check]==='N') || (king_color===1 && this.position[checkmate_check]==='n') ) )
                            ){ 
                                king_capture_found=true; 
                                m=n=15; //break the check for king capture;
                            
                            }else{
                                break; //non attacking enemy piece blocking the way 
                            }
                        
                            
                        }
            
                     }

                    this.position[square]=this.position[parseInt(target_square)];
                    this.position[parseInt(target_square)]=old_target;
                    //this.moving_player= 1 - this.moving_player; 
                     
                if(!king_capture_found){

                (this.valid_moves[moving_piece_color][square] = this.valid_moves[moving_piece_color][square] || []).push(target_square);

                }
                
                if( /*moving_piece_color !== target_piece_color && */target_piece_color!=2 ) { break; }  //we found a capture so we stop this line
            
                }
            
            }

        }
        
    }   

}
    //  make all moves and if king is checked remove from valid moves 
/*
    var final_moves=Object.keys(this.valid_moves[0]);

    for(var i=0;i<final_moves.length;i++){

        for(var j=0;j<this.valid_moves[0][final_moves[i]].length;j++){

         console.log(this.valid_moves[0][final_moves[i]][j]);

         from=final_moves[i];
         to=this.valid_moves[0][final_moves[i]][j];

         this.position[parseInt(to)]=this.position[from];
         this.position[from]=0;

         var king_square=this.position.indexOf('k');
         
         for(var k=0;k<directions['k'].length;k++) {  
            for(var l=0;l<8;l++){

            }

         }

         this.position[parseInt(to)]=this.position[from];
         this.position[from]=0;

         console.log(king_square);

    }
}*/
    //console.log(final_moves);
/*
        for(var i=0;k<this.valid_moves[moving_piece_color].length;i++) { 
            this.position[parseInt(to)]=this.position[from];
            this.position[from]=0;

            this.castling_rights[0].indexOf(true)

        }*/



board.initialize();
/*
var i=0;var t0 = performance.now();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    while(i<100000){   
      //console.lo                                                                                                                                                                                                                                                                                                                          g('Starting2..');
      board.move_random();
      i++;
 
     if(i%50==0){
     board.initialize();  
     }

    }
    var t1 = performance.now();
    var moves_per_sec=i/((t1 - t0)/1000);


    console.log( moves_per_sec.toFixed(2) + " moves/second.");
*/



//}).call(this);
/*
var chess_worker = new Worker('worker.js');
chess_worker.postMessage('starting_position');


chess_worker.onmessage = function(e) {
    console.log(e.data);
  }*/

//var random_moves=50;

/*
    if(i%100000==0) {
        var t1 = performance.now();
        console.log("100000 " + 100000/((t1 - t0)*1000) + " moves/second.");
        var t0 = performance.now(); 
    }*/

    


/*
board.initialize(starting_position);

for(var i=1;i<2;i++){
board.move_random();
board.print();
board.status();
}*/



/*
board.move_algebraic("e2","e4");
board.print();
board.status();


board.move_algebraic("e7","e5");
board.print();
board.status();

board.move_algebraic("d1","h5");
board.print();
board.status();

board.find_valid_moves();
console.log(board.valid_moves);
*/
//var random_piece = board.valid_moves[moving_player][Math.floor(Math.random()*board.valid_moves[moving_player].length)];


//console.log(pieces['B']);

/*
board.print=function(){
    
    var a=square=''; 

    if(this.position){
    for(var i=20;i<100;i++){
  
    square=this.position[i];

    if(i==20 || i%10==0) square='|';
    if((i+1)%10==0) square='|\n';
    if(this.position[i]==0) square='.';

        a+=' '+square;
    }

    console.log(a);
    }else{
    console.log('board is not defined');
    }

}

board.status=function(){
    console.log(this.moving_player?'black':'white');
    console.log("move "+this.moves.length);
    console.log(this.moves);
}*/

/*

board.move_algebraic=function(from,to){

    if(this.move(squares[from],squares[to])) {
        return true;
    }

    return false;
}
*/