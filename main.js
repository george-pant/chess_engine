
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

board.moving_player=0                   //0 for white player 1 for black
board.moves=[];                         //game moves
board.valid_moves=[];                   //possible valid moves
board.valid_moves[0]=[];                   //possible valid moves
board.valid_moves[1]=[];                   //possible valid moves
board.position=[];
board.history=[];
board.castling_rights=[[true,true],[true,true]];
//board.castling_rights[0]=[true,true];   //white castling rights [kingside,queenside]
//board.castling_rights[1]=[true,true];   //black castling rights [kingside,queenside]

board.initialize=function(){
    //this.print();
    this.moving_player=0                   //0 for white player 1 for black
    this.moves=[];                         //game moves
    this.valid_moves=[];                   //possible valid moves
    this.position=starting_position.concat();
   // console.log(window.starting_position);
    this.print();
    this.history=[];
    this.castling_rights=[];
    this.castling_rights[0]=[true,true];   //white castling rights [kingside,queenside]
    this.castling_rights[1]=[true,true];   //black castling rights [kingside,queenside]
    this.print();
    this.find_valid_moves();
    this.print();
};


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
}

board.move=function(from,to){

    this.moving_player=this.moves.length%2==0?0:1;

    if(this.valid_moves[this.moving_player][from].includes(to)){
    
    //keep the current state in history

        this.history.push( 
        {
            position:this.position,
            castling_rights:this.castling_rights,
            moves:this.moves
            
        });               

    //make the move in board
    this.position[to]=this.position[from];
    this.position[from]=0;
    
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

    this.position=previous.position;
    this.castling_rights=previous.castling_rights;
    this.moves=previous.moves; 
    this.moving_player= 1 - this.moving_player; 

    this.find_valid_moves();

    }else{
        return false;
    }

}

board.move_random=function(){

    this.moving_player=this.moves.length%2==0?0:1;

    var keys = Object.keys(this.valid_moves[this.moving_player]);

    var random_piece=keys[Math.floor(keys.length * Math.random())];
    var random_move=this.valid_moves[this.moving_player][random_piece][Math.floor(this.valid_moves[this.moving_player][random_piece].length * Math.random())];
    
    var from=parseInt(random_piece);
    var to=random_move;

    if(this.move(from,to)) return true;

    return false;

}

board.move_algebraic=function(from,to){

    if(this.move(squares[from],squares[to])) {
        return true;
    }

    return false;
}

board.find_piece_color=function(square){
    if (this.position[square]==0 || this.position[square]==1 || typeof this.position[square]==='undefined'){ return 2; }
    return (this.position[square].charCodeAt(0) >= 65 && this.position[square].charCodeAt(0) <= 90)?1:0
}


board.find_valid_moves=function(){

    this.valid_moves[0]=[]; //white valid moves
    this.valid_moves[1]=[]; //black valid moves

    // iterate all boards squares
    for(var i=21;i<92;i=i+10){
        for(var j=0;j<8;j++){
        
        var square=i+j;
        //if empty square continue
        if (this.position[square]==0) { continue; }
            
        var piece=this.position[square];
        var moving_piece_color=this.find_piece_color(square);

        //if piece in the square find all possible moves for this piece
        for(var k=0;k<directions[piece].length;k++) {

            for(var l=0;l<directions[piece][k].length;l++) {

            target_square=square+directions[piece][k][l];
            
            target_piece_color=this.find_piece_color(target_square);

            
            //target square is occupied by friendly piece
            if( moving_piece_color === target_piece_color ) { break; } 

            //target square is outside board
            if(this.position[target_square]==1 ) { break; } 

            //pawn rules
            if (piece==='p' || piece==='P'){

                //cannot capture in empty squares
                if( (square-target_square)%10!==0 && this.position[target_square]==0 ){ continue; }
                
                //and cannot go forward when they are blocked
                 if( (square-target_square)%10==0 && this.position[target_square]!=0 ){ break; }
            
                //if pawns are not in the first row they cannot move two squares

                 if( ( (piece==='p' && square>40 ) || (piece==='P' && square<81 ) ) && Math.abs(directions[piece][k][l])===20 ){ break; }
            
            }

            
            if(piece==='k' || piece==='K'){ 
   
                //king side castle 
                if( (this.castling_rights[moving_piece_color][0]!==true && directions[piece][k][l]==-2) || this.position[target_square]!=0) { break; }
                //queen side castle 
                if( (this.castling_rights[moving_piece_color][1]!==true && directions[piece][k][l]==2)  || this.position[target_square]!=0) { break; }  
                
            }

            (this.valid_moves[moving_piece_color][square] = this.valid_moves[moving_piece_color][square] || []).push(target_square);
            
            //we found a capture
            if( moving_piece_color !== target_piece_color && target_piece_color!=2 ) { break; } 

            

            //this.controlling_squares[moving_piece_color].controlling_squares.push(target_square);
            //this.valid_moves[this.find_piece_color(square)][square].push(target_square);
          
            }
            
            }

        }
        
    }   
        
}


board.initialize();
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

