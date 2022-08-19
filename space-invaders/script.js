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

var PlayerRowIndex = 11;
var PlayerColIndex = 6;

function ArrowLeftEventHandler(){
    if (PlayerColIndex > 0){
        PlayerColIndex--;
    }
    document.querySelector('[data-rowindex="11"] > [data-colindex="' + PlayerColIndex + '"]').appendChild(player);
}

function ArrowRightHandler(){
    if (PlayerColIndex < NUM_COLS - 1){
        PlayerColIndex++;
    }
    document.querySelector('[data-rowindex="11"] > [data-colindex="' + PlayerColIndex + '"]').appendChild(player);
}

const FireBalls = new Set();
const Aliens = new Set();

function HandleFireBalls() {

    FireBalls.forEach(function (fb) {
        //fb: fire ball object:
            //elem: html fireball img element
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

        Aliens.forEach(function (alien) {
            if(alien.row == fb.row && alien.col == fb.col){
                alert("before remove");
                fb.elem.remove();
                fb.elem = null;
                alien.elem.remove();
                Aliens.delete(alien);
                FireBalls.delete(fb);
                alert("after remove");
            }
        });

        if(fb.elem === null){
            return;
        }

        document.querySelector('[data-rowindex="' + fb.row + '"] > [data-colindex="' + fb.col + '"]').appendChild(fb.elem);
        fb.row--;
    });

}

function HandleAliens() {

    Aliens.forEach(function (alien){
        //alien: alien object
            //elem: html fireball img element
            //row: row index
            //col: col index
        if(alien.elem == null || alien.row == null || alien.col == null){ //if any fields are empty dont update the object
            return;
        }

        if(alien.row > 11){
            alien.elem.remove();
            Aliens.delete(alien);
            return;
        }

        if(alien.row == PlayerRowIndex && alien.col == PlayerColIndex){
            alert("GAME OVER!");
        }

        document.querySelector('[data-rowindex="' + alien.row + '"] > [data-colindex="' + alien.col + '"]').appendChild(alien.elem);
        alien.row++;
    });

}

const QuarterSecondIntervalTick = setInterval(() => {

    HandleFireBalls();    
    HandleAliens();

}, 250);

function SpaceEventHandler(){

    const fireBall = document.createElement("img");
    fireBall.src = "Fireball.png"
    fireBall.className = "gameObject";
    const fb = {
        elem: fireBall,
        col: PlayerColIndex,
        row: PlayerRowIndex - 1
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

const alien = document.createElement("img");
alien.src = "Alien.png";
alien.className = "gameObject";

Aliens.add({
    elem: alien,
    row: 0,
    col: 5
});