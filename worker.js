var piece_values =[0,10,30,30,50,90,2000,0,0,-10,-30,-30,-50,-90,-2000];

//direction each piece can move Only pawn have different based on color
var directions  = [];

//white pawns
directions[1] = [[10,20],[9],[11]]; 
//knights
directions[2] = directions[10] = [[-21],[-19],[-12],[-8],[8],[12],[19],[21]]; 
//bishops
directions[3] = directions[11] = [[-11,-22,-33,-44,-55,-66,-77],[-9,-18,-27,-36,-45,-54,-63],[11,22,33,44,55,66,77],[9,18,27,36,45,54,63]]; 
//rooks
directions[4] = directions[12] = [[-1,-2,-3,-4,-5,-6,-7],[-10,-20,-30,-40,-50,-60,-70],[1,2,3,4,5,6,7],[10,20,30,40,50,60,70] ];
//queens
directions[5] = directions[13] = directions[4].concat(directions[3]);
//kings
directions[6] = directions[14] = [[-11],[-10],[-9],[-1,-2],[1],[9],[10],[11],[1,2]];
//check
directions[7]=directions[6].concat(directions[2]);
//black pawns
directions[9] = [[-10,-20],[-9],[-11]]; 

var history=[];


const starting_position=[
    -1 , -1 , -1 , -1 , -1 , -1,  -1 , -1 , -1 , -1,
    -1 , -1 , -1 , -1 , -1 , -1,  -1 , -1 , -1 , -1,
    -1 ,   4,  2,  3,  6,  5,  3,  2,  4  , -1,
    -1 ,   1,  1,  1,  1,  1 , 1,  1,  1  , -1,
    -1 ,   0,  0 , 0 , 0 , 0 , 0 , 0,  0  , -1,
    -1 ,   0,  0 , 0 , 0 , 0 , 0 , 0,  0  , -1,
    -1 ,   0,  0 , 0 , 0 , 0 , 0 , 0,  0  , -1,
    -1 ,   0,  0 , 0 , 0 , 0 , 0 , 0,  0  , -1,
    -1 ,   9,  9,  9,  9,  9,  9,  9,  9  , -1,
    -1 ,   12, 10, 11, 14 ,13, 11, 10, 12 , -1,
    -1 , -1 , -1 , -1 , -1 , -1,  -1 , -1 , -1 , -1,
    -1 , -1 , -1 , -1 , -1 , -1,  -1 , -1 , -1 , -1,
    ];



var board = {};

board.total_evaluations=0;
board.evaluations_per_second=0;
board.game_status=2                     //0 if white won 1 for black 2 for game in progress 3 for stalemate
board.moving_player=0                   //0 for white player 1 for black
board.moves=0;                         //game moves
board.en_pasan=false;                   //en pasan square
board.valid_moves=[];                   //possible valid moves
board.position=[];
board.history=[];
board.castling_rights=[[true,true],[true,true]];
board.piece_evaluation=0;
board.positional_evaluation=0;

board.set=function(old_board){
    this.game_status=old_board.game_status; 
    this.moving_player=old_board.moving_player;                   //0 for white player 1 for black
    this.moves=old_board.moves;                         //game moves
    this.en_pasan=old_board.en_pasan;
    this.valid_moves=old_board.valid_moves;                   //possible valid moves
    this.position=old_board.position.concat();
    this.history=old_board.history;
    this.castling_rights=old_board.castling_rights;
    this.piece_evaluation=0;
    this.positional_evaluation=0
}

board.move=function(move){

    
    if(this.valid_moves.includes(move)){
    
    var from=~~(move / 100);
    var to=move%100;

    //keep the current state in history

        this.history.push( 
        {
            position:this.position.slice(),
            castling_rights:this.castling_rights.slice(),
            en_pasan:this.en_pasan         
        }); 

    //make the move in board
    this.position[to]=this.position[from];
    this.position[from]=0;
 
    if(this.en_pasan!==false && to===this.en_pasan && this.position[to]===1) { 
        
            var attacked_pawn=this.moving_player?10:-10;
            this.position[to+attacked_pawn]=0;    

        }
    
    if(false){
        this.position[parseInt(to)]=to[to.length-1] //pawn promotions
    }  
    

    this.en_pasan=false; 

    if( from>30 && from<39 && to-from===20 && this.position[to]===1 && (this.position[to-1]===9 || this.position[to+1]===9) ){
        this.en_pasan=to-10;
    }

    if(from>80 && from<89 && from-to===20 && this.position[to]===9 && (this.position[to-1]===1 || this.position[to+1]===1)){
        this.en_pasan=to+10;
    }

    if(from===24 && to===22 && this.castling_rights[0][0]===true){
        this.position[23]=4;
        this.position[21]=0;
    }

    if(from===24 && to===26 && this.castling_rights[0][0]===true){
        this.position[25]=4;
        this.position[28]=0;
    }

    if(from===94 && to===92 && this.castling_rights[1][0]===true){
        this.position[93]=12;
        this.position[91]=0;
    }

    if(from===94 && to===96 && this.castling_rights[1][0]===true){
        this.position[95]=12;
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
    

    this.moving_player^= 1;
    this.moves++;

    return true;

   }else{
        console.log('invalid move '+move);
        return false;
    }
}

board.undo_move=function(){
    
    var previous=this.history.pop();
    
    this.position=previous.position.concat();
    this.castling_rights=previous.castling_rights;
    this.en_pasan=previous.en_pasan;
    this.moving_player^= 1;
    this.moves--;

}



board.find_piece_color=function(square){
    if (this.position[square]==0 || this.position[square]==-1  || typeof this.position[square]==='undefined'){ return 2; }
    return this.position[square] >8 ?1:0
}

board.attacked_square=function(square,attacking_player){
   
    var piece_color=1-attacking_player;

    for(var m=0;m<directions[7].length;m++) {  

        for(var n=0;n<directions[7][m].length;n++) {
            
            attack_check=square+directions[7][m][n];

            if (this.position[attack_check]===0) { continue; }

            if(this.position[attack_check]===-1 ) { break; } 

            attacking_piece_color=this.position[attack_check]>>3;

            if( piece_color === attacking_piece_color ) { break; } //we found our own piece first

            if( //if we are here it means we found a piece of enemy in our path so we check if its one that can capture our king or not
                ( (this.position[square+9]===9 || this.position[square+11]===9) && piece_color===0  )  || 
                ( (this.position[square-9]===1 || this.position[square-11]===1) && piece_color===1  ) || 
                (m<4 && ( (piece_color===0 && this.position[attack_check]===12) || (piece_color===1 && this.position[attack_check]===4) ) )|| 
                (m>3 && m<8 && ( (piece_color===0 && this.position[attack_check]===11) || (piece_color===1 && this.position[attack_check]===3) ) ) ||
                (m<8 && ( (piece_color===0 && this.position[attack_check]===13) || (piece_color===1 && this.position[attack_check]===5) ) ) || 
                (m>7 && ( (piece_color===0 && this.position[attack_check]===10) || (piece_color===1 && this.position[attack_check]===2) ) ) ||
                (m<8 && n===0 && ( (this.position[attack_check]===14 && piece_color===0 ) || (this.position[attack_check]===6 && piece_color===1 ) ) )
            ){ 
                return true;

            }else{
                break; //non attacking enemy piece blocking the way 
            }
        
            
        }

     }

     return false;
}

board.find_valid_moves=function(){
    
    this.valid_moves=[]; 

   for ( var square=21;square<99;square++){    // iterate all boards squares

        if (this.position[square]<1) { continue; }     //if empty square or outside board continue
            
        var piece=this.position[square];
        //var moving_piece_color= this.find_piece_color(square);
        var moving_piece_color= this.position[square]>>3;

        if(moving_piece_color!=this.moving_player) { continue; }
        
        for(var k=0;k<directions[piece].length;k++) {                                //if piece in the square find all possible moves for this piece

            for(var l=0;l<directions[piece][k].length;l++) {

                target_square=square+directions[piece][k][l];
                
                if(this.position[target_square]==-1 ) { break; }                          //target square is outside board

                //target_piece_color=this.find_piece_color(target_square);
                target_piece_color=this.position[target_square]==0?2:this.position[target_square]>>3;

                if( moving_piece_color === target_piece_color ) { break; }               //target square is occupied by friendly piece
                
                if (piece===1 || piece===9){                                         //pawn rules
                    
                    //cannot capture in empty squares unless its an en pasan square
                    if( (square-target_square)%10!==0 && this.position[target_square]==0 && target_square!==this.en_pasan ){ continue; } 
                    
                    //and cannot go forward when they are blocked
                    if( (square-target_square)%10==0 && this.position[target_square]!=0 ){ break; }    
                    
                    //if pawns are not in the first row they cannot move two squares
                    if( ( (piece===1 && square>40 ) || (piece===9 && square<81 ) ) && Math.abs(directions[piece][k][l])===20 ){ break; } 
                    
                   //if(this.en_pasan && target_square===this.en_pasan){ /*target_square+='_';*/} //en pasan

                    //auto promote to queen
                   // if (piece===1 && target_square>90) { target_square+=5; } if (piece===9 && target_square<29 ) { target_square+=13; } //auto promote to queen
                    
                }
                
                    if(piece===6 || piece===14){ 
                        
                        //king side castle 
                        if( directions[piece][k][l]==-2 &&                              //  if castle is attempted 
                            (   this.castling_rights[moving_piece_color][0]!==true ||   //  we must have castling rights 
                                this.position[target_square]!=0 ||   //  and the squares must be empty 
                                this.attacked_square(square,1-this.moving_player) || this.attacked_square(square-1,1-this.moving_player) // and king and between squares should not be attacked
                            ) ){ 
                                break; 
                            } 
                        
                        //queen side castle
                        if(directions[piece][k][l]==2 && 
                            ( this.castling_rights[moving_piece_color][1]!==true || 
                              this.position[target_square-1]!=0 || 
                              this.position[target_square]!=0 ||  this.position[target_square+1]!=0 || 
                              this.attacked_square(square,1-this.moving_player) || this.attacked_square(square+1,1-this.moving_player) // and king and should not be attacked 
                              )) { break; }  

                    }

                    this.valid_moves.push(square*100+target_square)

                if( target_piece_color!=2) {         
                    break; //we found a capture so we stop this line
                } 


        }
        
        
    }   

}

}

board.evaluate_board=function(){

    var evaluation=0;

    for ( var square=21;square<99;square++){    // iterate all boards squares

        
        if (board.position[square]<1 ) { continue; }
        
        var piece=board.position[square];
            evaluation+=piece_values[piece];
            
        }

    return evaluation;
        

}

var all_moves='';
board.minmax=function(depth,alpha,beta,isMax){

    if(depth===0){
        board.total_evaluations++;
        return board.evaluate_board();
    }
 
    if(isMax){

        var best_move=-9999;   
        board.find_valid_moves();

            for (var h=0;h<board.valid_moves.length;h++){

                board.move(board.valid_moves[h]);
                all_moves+=' '+board.valid_moves[h];

                best_move=Math.max(best_move,board.minmax(depth - 1, alpha, beta, false));
                board.undo_move();

                alpha = alpha>best_move?alpha:best_move;
/*
                if (beta <= alpha) {
                   return best_move;
                }*/
            }
        console.log(all_moves);
        return best_move;

    }else{

        var best_move=9999; 
        board.find_valid_moves();

        for (var h=0;h<board.valid_moves.length;h++){
                
                board.move(board.valid_moves[h]);
                all_moves+=' '+board.valid_moves[h];

                best_move=Math.min(best_move,board.minmax(depth - 1, alpha, beta,  true));
                board.undo_move();

                beta = beta<best_move?beta:best_move
/*
                if (beta <= alpha) {
                   return best_move;
                }*/

            }

            return best_move;

    }


}



self.addEventListener('message', function(e) {

    board.set(JSON.parse(e.data.board));
    var evaluation=board.minmax(1,-9999,9999,true);
    console.log({'move':e.data.move,'evaluation':evaluation,'nodes':board.total_evaluations});
    self.postMessage({'move':e.data.move,'evaluation':evaluation,'nodes':board.total_evaluations});
    self.close();

  }, false);




