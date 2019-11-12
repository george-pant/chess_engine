

var squares = [];

var piece = { 'P': 100, 'N': 300, 'B': 300, 'R': 500, 'Q': 900, 'K': 60000 }

//direction each piece can move Only pawn have different based on color
var directions  = [];
directions["P"] = [-11,-10,-9,-20];
directions["p"] = [9,10,11,20];
directions["B"] = directions["b"] = [-11,-9,11,9];
directions["R"] = directions["r"] = [-1,-10,1,10];
directions["N"] = directions["n"] = [-21,-19,-12,-8,8,12,19,21];
directions["Q"] = directions["q"] = [-11,-10,-9,-1,1,9,10,11];
directions["K"] = directions["k"] = [-11,-10,-9,-1,1,9,10,11];



//create arrays with possible moves for each piece
/*
for (let key in pieces){

    if(key=='B' || key=='R' || key=='Q'){

        for (let i=2;i<8;i++){
            
            for(let j=0,l=pieces[key].length; j<l; j++) {

                pieces[key].push(pieces[key][j]*i);

            }
        }
    }
}*/

// map our array indexes to chess board squares Ue.g a1->21,a2->31,...

for(let i=1;i<9;i++){ 

    for(let j=1;j<9;j++){ 
        
        squares[String.fromCharCode(96+i)+j.toString()] = 28-(i-1)+((j-1)*10); 
    } 
}


var starting_position=[
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

board.moving_player=0   //0 for white moves 1 for black
board.moves=[];         //game moves
board.valid_moves=[];   //possible valid moves
board.position=[];
board.history=[];

board.initialize=function(pos){
    this.position=pos;
    this.find_valid_moves();
}

board.print=function(){
    
    var a=square=''; 
    
    for(let i=20;i<100;i++){
  
    square=this.position[i];

    if(i==20 || i%10==0) square='|';
    if((i+1)%10==0) square='|\n';
    if(this.position[i]==0) square='.';

        a+=' '+square;
    }

    console.log(a);

}

board.status=function(){
    console.log(this.moving_player?'black':'white');
    console.log("move "+this.moves.length);
    console.log(this.moves);
}

board.move=function(from,to){

    this.moving_player=this.moves.length%2==0?0:1;

    if(this.valid_moves[this.moving_player][from].includes(to)){
    
    this.history.push(position);
    this.position[to]=this.position[from];
    this.position[from]=0;
    this.moves.push([from,to]);
    this.find_valid_moves();

    return true;

    }else{
        console.log('invalid move from '+from+' to '+to);
        board.print();
        board.status();
        return false;
    }
}

board.undo_move=function(){

    this.find_valid_moves();
}

board.move_random=function(){
    //console.log(this.valid_moves);
    this.moving_player=this.moves.length%2==0?0:1;

    var keys = Object.keys(this.valid_moves[this.moving_player]);

    var random_piece=keys[Math.floor(keys.length * Math.random())];
    var random_move=this.valid_moves[this.moving_player][random_piece][Math.floor(this.valid_moves[this.moving_player][random_piece].length * Math.random())];
    
    var from=parseInt(random_piece);
    var to=random_move;
    
    //console.log('from '+random_origin+' to '+random_destination);

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
    if (this.position[square]==0 || this.position[square]==1 ){ return 2; }
    return (this.position[square].charCodeAt(0) >= 65 && this.position[square].charCodeAt(0) <= 90)?1:0
}


board.find_valid_moves=function(){

    this.valid_moves[0]=[]; //white valid moves
    this.valid_moves[1]=[]; //black valid moves
    /*this.controlling_squares[0]=[]; //white valid moves
    this.controlling_squares[1]=[]; //black valid moves*/
    
    
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

            target_square=square+directions[piece][k];
            target_piece_color=this.find_piece_color(target_square);

           // if(square!=31 && square!=22) {continue;}

            //target square is outside board
            if(this.position[target_square]==1) { continue; } 

            //target square is occupied by friendly piece
            if( moving_piece_color === target_piece_color ) { continue; } 

            //pawns cannot capture in empty squares
            if( (piece=='p' || piece==='P') && (square-target_square)%2!=0 && this.position[target_square]==0 ){ continue; }
            //and cannot go forward when they are blocked
            if( (piece=='p' || piece==='P') && (square-target_square)%2!=0 && this.position[target_square]!==0 ){ continue; }
            

            (this.valid_moves[moving_piece_color][square] = this.valid_moves[moving_piece_color][square] || []).push(target_square);

            //this.controlling_squares[moving_piece_color].controlling_squares.push(target_square);
            //this.valid_moves[this.find_piece_color(square)][square].push(target_square);
            
            
        }

    }
        
}
    /*
            if(key=='B' || key=='R' || key=='Q'){
        
                for (let i=2;i<8;i++){
                    
                    for(let j=0,l=pieces[key].length; j<l; j++) {
        
                        pieces[key].push(pieces[key][j]*i);
        
                    }
                }
            }*/

        //console.log(this.position[i+j]);
        
}


board.initialize(starting_position);

for(var i=1;i<2;i++){
board.move_random();
board.print();
board.status();
}



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

