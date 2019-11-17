
//console.log('test');

self.addEventListener('message', function(e) {
//var i;

self.postMessage('test');
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
  });
