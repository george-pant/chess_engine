

var pieces = [];

piece = { 'P': 100, 'N': 300, 'B': 300, 'R': 500, 'Q': 900, 'K': 60000 }

pieces["P"] = [-11,-10,-9];
pieces["p"] = [9,10,11];
pieces["B"] = [-11,-9,11,9];
pieces["R"] = [-1,-10,1,10];
pieces["N"] = [-29,-21,-12,-10,8,12,21,29];
pieces["Q"] = [-11,-10,-9,-1,1,9,10,11];
pieces["K"] = [-11,-10,-9,-1,1,9,10,11];

//create arrays with possible moves for each piece

for (let key in pieces){

    if(key=='B' || key=='R' || key=='Q'){

        for (let i=2;i<8;i++){

            for(let j=0,l=pieces[key].length; j<l; j++) {

                pieces[key].push(pieces[key][j]*i);

            }
        }
    }
}


console.log(pieces);

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
]



var board = {};

board.current_position=[];

board.initialize=function(position){
    this.current_position=position;
}

board.print=function(){
    
    var a=square=''; 
    
    for(let i=20;i<100;i++){
  
    square=this.current_position[i];

    if(i==20 || i%10==0) square='|';
    if((i+1)%10==0) square='|\n';
    if(this.current_position[i]==0) square='.';

        a+=' '+square;

    }

    console.log(a);

}





board.initialize(starting_position);

board.print();
