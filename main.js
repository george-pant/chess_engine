

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

console.log(squares);

var starting_position=[
    1 , 1 , 1 , 1 , 1 , 1,  1 , 1 , 1 , 1,
    1 , 1 , 1 , 1 , 1 , 1,  1 , 1 , 1 , 1,
    1 ,'r','n','b','q','k','b','n','r', 1,
    1 ,'p','p','p','p','p','p','p','p', 1,
    1 , 0,  0 , 0 , 0 , 0 , 0 , 0,  0 , 1,
    1 , 0,  0 , 0 , 0 , 0 , 0 , 0,  0 , 1,
    1 , 0,  0 , 0 , 0 , 0 , 0 , 0,  0 , 1,
    1 , 0,  0 , 0 , 0 , 0 , 0 , 0,  0 , 1,
    1 ,'P','P','P','P','P','P','P','P', 1,
    1 ,'R','N','B','Q','K','B','N','R', 1,
    1 , 1 , 1 , 1 , 1 , 1,  1 , 1 , 1 , 1,
    1 , 1 , 1 , 1 , 1 , 1,  1 , 1 , 1 , 1,
    ];


var board = {};

board.move=0;
board.valid_moves=[];
board.position=[];

board.initialize=function(pos){
    this.position=pos;
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

board.move=function(from,to){

    this.find_valid_moves();

    if(this.valid_moves[from]===to){

    this.position[to]=this.position[from];
    this.position[from]=0;
    this.move++;
    return true;
    }else{

        return false;
    }
}

board.move_algebraic=function(from,to){

    return this.move(this.position[squares[from]],this.position[squares[to]])?true:false;
}

board.find_piece_color=function(square){
    if (this.position[square]==0 || this.position[square]==1 ){ return false; }
    return (this.position[square].charCodeAt(0) >= 65 && this.position[square].charCodeAt(0) <= 90)?2:1
}


board.find_valid_moves=function(){

    moving_player=this.move%2==0?1:2; //1 if white moves 2 for black

    // iterate all boards squares
    for(var i=21;i<92;i=i+10){
        for(var j=0;j<8;j++){
        
        var square=i+j;
        //if empty square continue
        if (this.position[square]==0) { continue; }
            //console.log(this.position[square]);
        var piece=this.position[square];
        
        if(moving_player!==this.find_piece_color(square)) { continue; } //we can only move pieces of our own color

        //if piece in the square find all possible moves for this piece
        for(var k=0;k<directions[piece].length;k++) {

            target_square=square+directions[piece][k];
           
            //target square is outside board
            if(this.position[target_square]==1) { continue; } 

            //target square is occupied by friendly piece
            if(moving_player==this.find_piece_color(target_square) ) { continue; } 

            //pawns cannot capture in empty squares
            if( piece=='p' && (square-target_square)%2!=0 && this.find_piece_color(target_square)==0 ){ continue; }
            //and cannot go forward when they are blocked
            if( piece=='p' && (square-target_square)%2!=0 && this.find_piece_color(target_square)!==0 ){ continue; }
            
            this.valid_moves[square]=target_square;
            
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

board.print();

board.move_algebraic("h2","h4");

board.print();

board.move_algebraic("e7","e5");

board.print();

//console.log(pieces['B']);

