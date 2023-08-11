
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


ctx.beginPath();
ctx.arc(95, 50, 40, 0, 2 * Math.PI);
ctx.stroke();




function StartFrameUpdate(){
    FrameUpdate = setInterval(function () { 
        frameNumber++;
    
        // if(frameNumber % spawnAstroidEvery == 0){
        //     SpawnAstroid();
    
        //     if(spawnAstroidEvery > MIN_ASTROID_SPAWN_COOLDOWN){
        //         spawnAstroidEvery--;
        //     }
        // }
    
        UpdatePhysics();
        Draw(); 
    
    }, 1000 / FPS);
}
