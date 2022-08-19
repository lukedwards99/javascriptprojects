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

function SpaceEventHandler(){

    

}

document.addEventListener('keydown', (event) => {
    var code = event.code;

    switch(event.code){
        case "ArrowLeft": ArrowLeftEventHandler(); break;
        case "ArrowRight": ArrowRightHandler(); break;
        case "Space": SpaceEventHandler(); break;
        default: alert(event.code);
    }
});