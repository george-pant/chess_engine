
//console.log('test');

onmessage = function(e) {
    console.log('Message received from main script');
    var workerResult = 'Result: ' + (e.data);
    console.log('Posting message back to main script');
    postMessage(workerResult);
  }

//var i;


/*
    setInterval(function(){ 
        
        self.postMessage(i/10+' moves/sec');
        //console.log(i/10+' moves/sec')
    
    }, 1000);
    
    //var t0 = performance.now(); 
    while(i<2000000){   
         board.move_random();
        //random_moves--;
        i++;
    
        if(i%50==0){
        board.initialize();  
      //  var t0 = performance.now(); 
        }
    
        self.postMessage(message);

    }*/
 
