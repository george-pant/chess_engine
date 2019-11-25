//(function(){
    if (typeof window === 'undefined'){
        var { performance } = require('perf_hooks'); }

var squares = [];

var piece_values = { 'p':10, 'P': 10, 'n':30 ,'N': 30, 'b':30, 'B': 30, 'r':50, 'R': 50, 'q': 90, 'Q':90, 'k':1000, 'K': 1000 }

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

board.game_status=2                     //0 if white won 1 for black 2 for game in progress 3 for stalemate
board.moving_player=0                   //0 for white player 1 for black
board.moves=[];                         //game moves
board.en_pasan=false;                   //en pasan square
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
    this.en_pasan=false;
    this.valid_moves=[];                   //possible valid moves
    this.position=starting_position.concat();
    this.history=[];
    this.castling_rights=[];
    this.castling_rights[0]=[true,true];   //white castling rights [kingside,queenside]
    this.castling_rights[1]=[true,true];   //black castling rights [kingside,queenside]
    this.find_valid_moves();
};

board.set=function(old_board){
    this.game_status=old_board.game_status; 
    this.moving_player=old_board.moving_player;                   //0 for white player 1 for black
    this.moves=old_board.moves;                         //game moves
    this.en_pasan=old_board.en_pasan;
    this.valid_moves=old_board.valid_moves;                   //possible valid moves
    this.position=old_board.position.concat();
    this.history=old_board.history;
    this.castling_rights=old_board.castling_rights;
    this.find_valid_moves();
}

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
 
    if(typeof to==='string') { 
        
        if(parseInt(to)===this.en_pasan){ 
            var attacked_pawn=this.moving_player?10:-10;
            this.position[parseInt(to)+attacked_pawn]=0;    
        }
        else{
        this.position[parseInt(to)]=to[to.length-1] //pawn promotions
        }  
    }

    this.en_pasan=false; 

    if( from>30 && from<39 && to-from===20 && this.position[to]==='p' && (this.position[to-1]==='P' || this.position[to+1]==='P') ){
        this.en_pasan=to-10;
    }

    if(from>80 && from<89 && from-to===20 && this.position[to]==='P' && (this.position[to-1]==='p' || this.position[to+1]==='p')){
        this.en_pasan=to+10;
    }

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

    //var t0 = performance.now();
    this.find_valid_moves();                        //find valid moves for next move
    //var t1 = performance.now();

    //console.log(t1-t0);

    if(this.valid_moves[this.moving_player].length===0){ //Player has no valid move - checkmate or stalemate 

        king_square=(this.moving_player==0)?this.position.indexOf('k'):this.position.indexOf('K');
        this.game_status=this.attacked_square(king_square,1-this.moving_player)? 1 - this.moving_player :3; //if our king is attacked its a checkmate 

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
    this.moving_player= 1 - this.moving_player;     //change moving player
    this.game_status=2;
    /*
    if(this.game_status==2){
        this.moving_player= 1 - this.moving_player;
    }else{  
    this.game_status=2;
    }*/

    this.find_valid_moves();

    }else{
        return false;
    }

}

board.move_random=function(){
    //return true;

    //this.moving_player=this.moves.length%2==0?0:1;
    
    //var first_piece=Object.keys(this.valid_moves[this.moving_player])[0];
    //var first_to=this.valid_moves[this.moving_player][first_piece][0];


    var keys = Object.keys(this.valid_moves[this.moving_player]);

    var random_piece=keys[Math.floor(keys.length * Math.random())];
    var random_move=this.valid_moves[this.moving_player][random_piece][Math.floor(this.valid_moves[this.moving_player][random_piece].length * Math.random())];
    
    var from=parseInt(random_piece);
    var to=random_move;

    //console.log(from+'_'+to);
/*
    var from=first_piece;
    var to=first_to;
*/

    if(this.move(from,to)) return [from,to];

    return false;

}

board.find_piece_color=function(square){
    if (this.position[square]==0 || this.position[square]==1  || typeof this.position[square]==='undefined'){ return 2; }
    return (this.position[square].charCodeAt(0) >= 65 && this.position[square].charCodeAt(0) <= 90)?1:0
}

board.attacked_square=function(square,attacking_player){
   
    var piece_color=1-attacking_player;

    for(var m=0;m<directions['check'].length;m++) {  

        for(var n=0;n<directions['check'][m].length;n++) {
            
            attack_check=square+directions['check'][m][n];

            if (this.position[attack_check]==0) { continue; }

            if(this.position[attack_check]==1 ) { break; } 

            attacking_piece_color=this.find_piece_color(attack_check);

            if( piece_color === attacking_piece_color ) { break; } //we found our own piece first

            if( //if we are here it means we found a piece of enemy in our path so we check if its one that can capture our king or not
                ( (this.position[square+9]==='P' || this.position[square+11]==='P') && piece_color===0  )  || 
                ( (this.position[square-9]==='p' || this.position[square-11]==='p') && piece_color===1  ) || 
                (m<4 && ( (piece_color===0 && this.position[attack_check]==='R') || (piece_color===1 && this.position[attack_check]==='r') ) )|| 
                (m>3 && m<8 && ( (piece_color===0 && this.position[attack_check]==='B') || (piece_color===1 && this.position[attack_check]==='b') ) ) ||
                (m<8 && ( (piece_color===0 && this.position[attack_check]==='Q') || (piece_color===1 && this.position[attack_check]==='q') ) ) || 
                (m>7 && ( (piece_color===0 && this.position[attack_check]==='N') || (piece_color===1 && this.position[attack_check]==='n') ) ) ||
                (m<8 && n===0 && ( (this.position[attack_check]==='K' && piece_color===0 ) || (this.position[attack_check]==='k' && piece_color===1 ) ) )
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
    
    this.valid_moves[0]=[]; //white valid moves
    this.valid_moves[1]=[]; //black valid moves

   for ( var square=21;square<99;square++){    // iterate all boards squares

        if (this.position[square]==0 || this.position[square]==1 ) { continue; }     //if empty square or outside board continue
            
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

                    //cannot capture in empty squares unless its an en pasan square
                    if( (square-target_square)%10!==0 && this.position[target_square]==0 && target_square!==this.en_pasan ){ continue; } 
                    
                    //and cannot go forward when they are blocked
                    if( (square-target_square)%10==0 && this.position[target_square]!=0 ){ break; }    
                    
                    //if pawns are not in the first row they cannot move two squares
                    if( ( (piece==='p' && square>40 ) || (piece==='P' && square<81 ) ) && Math.abs(directions[piece][k][l])===20 ){ break; } 
                    
                    if(this.en_pasan && target_square===this.en_pasan){ target_square+='_';} //en pasan

                    //auto promote to queen
                    if (piece==='p' && target_square>90) { target_square+='q'; } if (piece==='P' && target_square<29 ) { target_square+='Q'; } //auto promote to queen
                    
                }
                
                    if(piece==='k' || piece==='K'){ 
                        
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
                    
                    //we make the move temporarily to check if king is captured 

                    var old_target=this.position[parseInt(target_square)];
                    this.position[parseInt(target_square)]=this.position[square];
                    this.position[square]=0;
                    
                    // en passant temporary fix
                    if(typeof target_square==='string' && parseInt(target_square)===this.en_pasan){ var attacked_pawn=this.moving_player?10:-10;this.position[parseInt(target_square)+attacked_pawn]=0; }

                    var king_square=(this.moving_player==0)?this.position.indexOf('k'):this.position.indexOf('K');

                    //check if king is captured
                    
                    var king_capture_found=this.attacked_square(king_square,1-this.moving_player);

                    //undo the move
                    
                    this.position[square]=this.position[parseInt(target_square)];
                    this.position[parseInt(target_square)]=old_target;
                    // en passant temporary fix
                    if(typeof target_square==='string' && parseInt(target_square)===this.en_pasan){ var attacked_pawn=this.moving_player?10:-10;this.position[parseInt(target_square)+attacked_pawn]=this.moving_player?'P':'p'; }

                if(!king_capture_found){
                    
                (this.valid_moves[moving_piece_color][square] = this.valid_moves[moving_piece_color][square] || []).push(target_square);

                }
                
                if( target_piece_color!=2 ) { break; }  //we found a capture so we stop this line
            
                }

        }
    
        
    }   

}
    
board.evaluate_board=function(){

    var evaluation=0;
    
    for ( var square=21;square<99;square++){    // iterate all boards squares

        if (this.position[square]==0 || this.position[square]==1 ) { continue; }
        
        if( this.position[square].charCodeAt(0) >= 65 && this.position[square].charCodeAt(0) <= 90) { 
            evaluation-=piece_values[this.position[square]];
        }
        else
        {
            evaluation+=piece_values[this.position[square]];
        }

        
        
    }

    return evaluation;
}

random_games=function(board_copy,games_to_play,depth){
    
    var starting_pos=JSON.parse(JSON.stringify(board_copy));
    
    var eval=0;
    var current_eval=0;
    var games=0;
    var i=0;
    
        while(games<games_to_play){   
         //   var t0 = performance.now();                                                                                                                                                                                                                                                                                                                       
         board_copy.move_random();
          i++;
         // var t1 = performance.now();
        //  console.log(t1 - t0);
         if(board_copy.game_status!=2 || i%(depth*2)==0){
         
         games++;
         current_eval=board_copy.evaluate_board();
         eval+=current_eval;
         current_eval=0;    
        /*
         if(board.status===0 || current_eval>29){
            white_won++;
         }else if( board.status===1 || current_eval<-29){
            black_won++;
         }else{
             draws++;
         }*/
    
         board_copy.set(starting_pos);  
        // console.log(board_copy);
         }
    
        }
       // var tstop = performance.now();
       // var moves_per_sec=i/((tstop - tstart)/1000);
       return eval;
        //console.log( moves_per_sec.toFixed(2) + " moves/second.");
        //console.log("White_won:"+white_won);
        //console.log("Black_won:"+black_won);
       // console.log("Draws"+draws);
    }

board.find_best_move=function(){

    var best_move=[];
    var best_eval=2000;
    var candidate_moves = Object.keys(board.valid_moves[board.moving_player]);

    for (var j=0;j<candidate_moves.length;j++){
    
        var from=candidate_moves[j]; 
        
        //console.log(from);

        for (var h=0;h<board.valid_moves[board.moving_player][from].length;h++){
    
        var to=board.valid_moves[board.moving_player][from][h];
        //console.log(from+'-'+to);
        //console.log(from+'_'+to);
        var board_copy = jQuery.extend(true, {}, board);
        //console.log(board_copy);

        board_copy.move(from,to);
        current_eval=random_games(board_copy,100,6);

       // console.log('current_eval:'+current_eval);
       // console.log('best_eval:'+best_eval);
       // console.log(best_move);
        if(current_eval<best_eval) { 
            //console.log('test');
            best_eval=current_eval;
            best_move.push([from,to]);
            }
        }

    }
    
    return best_move;
}


board.initialize();


/*
var i=0;var tstart = performance.now();   
var white_won=black_won=draws=0;

var candidate_moves = Object.keys(board.valid_moves[board.moving_player]);


for (var j=0;j<candidate_moves.length;j++){

    var from=candidate_moves[j]; 
    
    for (var h=0;h<board.valid_moves[board.moving_player][from].length;h++){

    var to=board.valid_moves[board.moving_player][from][h];
    
    console.log(from+'_'+to);
    board.move(from,to);
    board.random_games(10000);
    }
}*/





// random games
/*
var i=0;
var games=0;
var stats=[0,0,0,0];
var tstart = performance.now();

setInterval(function(){

    board.move_random();
    i++;
    if (typeof window !== 'undefined'){
    update_board(board);
    }

    if(board.game_status!=2 || board.moves.length>240){
        var tstop = performance.now();
        stats[board.game_status]++;
        games++;

        if(games%100===0 ){ 

            console.log('Played '+ games);
            console.log('White won '+stats[0]);
            console.log('Black won '+stats[1]);
            console.log('No winner '+stats[2]);
            console.log('Total Moves '+ i);
            var moves_per_sec=i/((tstop - tstart)/1000);
            console.log( moves_per_sec.toFixed(2) + " moves/second.");

        };

        board.initialize();


    }

    
}, 0);
*/




    //console.log(i);



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
    }

    


/*
board.initialize(starting_position);

for(var i=1;i<2;i++){
board.move_random();
board.print();
board.status();
}*/




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
