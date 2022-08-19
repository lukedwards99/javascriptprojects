"use strict";

var NUM_ROWS = 12;
var NUM_COLS = 12;


const grid = document.getElementById("grid");

let squareRed = false;

for(let i = 0; i < 12; i++){

    const newRow = document.createElement('div');
    newRow.className = "row";
    newRow.setAttribute("data-rowindex", i); 
    grid.appendChild(newRow);

    for(let j = 0; j < 12; j++){
        const newSquare = document.createElement('div');
        newSquare.className = "col" + (squareRed ? " red" : " blue");
        squareRed = !squareRed;
        newSquare.setAttribute("data-colindex", j);
        newRow.appendChild(newSquare);    
    }
    squareRed = !squareRed;
}

const player = document.getElementById('PlayerElem');
player.src = "PlayerFire.png"
document.querySelector('[data-rowindex="11"] > [data-colindex="6"]').appendChild(player);

var CurrRowIndex = 11;
var CurrColIndex = 6;

function ArrowLeftEventHandler(){
    if (CurrColIndex > 0){
        CurrColIndex--;
    }
    document.querySelector('[data-rowindex="11"] > [data-colindex="' + CurrColIndex + '"]').appendChild(player);
}

function ArrowRightHandler(){
    if (CurrColIndex < NUM_COLS - 1){
        CurrColIndex++;
    }
    document.querySelector('[data-rowindex="11"] > [data-colindex="' + CurrColIndex + '"]').appendChild(player);
}

const PlayerProjectiles = new Set();

// function FireBallIntervalHandler(fireball, interval){

//     alert("Hello");

// }

const FireBalls = new Set();

const QuarterSecondIntervalTick = setInterval(() => {

    FireBalls.forEach(function (fb) {
        //fb: fire ball object:
            //elem: html fireball img
            //row: row index
            //col: col index
        
        if(fb.elem == null || fb.row == null || fb.col == null){ //if any fields are empty dont update the object
            return;
        }

        if(fb.row < 0){
            fb.elem.remove();
            FireBalls.delete(fb);
            return;
        }

        document.querySelector('[data-rowindex="' + fb.row + '"] > [data-colindex="' + fb.col + '"]').appendChild(fb.elem);
        fb.row--;
    });

}, 250);



function SpaceEventHandler(){

    const fireBall = document.createElement("img");
    fireBall.src = "Fireball.png"
    fireBall.className = "gameObject";
    const fb = {
        elem: fireBall,
        col: CurrColIndex,
        row: CurrRowIndex - 1
    }
    
    FireBalls.add(fb);

}

document.addEventListener('keydown', (event) => {

    switch(event.code){
        case "ArrowLeft": ArrowLeftEventHandler(); break;
        case "ArrowRight": ArrowRightHandler(); break;
        case "Space": SpaceEventHandler(); break;
        default: alert(event.code);
    }
});