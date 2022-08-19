"use strict";

var NUM_ROWS = 12;
var NUM_COLS = 12;

const FireBalls = new Set();
const Aliens = new Set();
const grid = document.getElementById("grid");
let player = null; //initilized later  


let PlayerRowIndex = 11;
let PlayerColIndex = 6;

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
                fb.elem.remove();
                fb.elem = null;
                alien.elem.remove();
                Aliens.delete(alien);
                FireBalls.delete(fb);
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

function CreateFireBall(_row, _col){
    const fireBall = document.createElement("img");
    fireBall.src = "Fireball.png"
    fireBall.className = "gameObject";
    FireBalls.add({
        elem: fireBall,
        col: _col,
        row: _row
    });
}

function SpaceEventHandler(){
    CreateFireBall(PlayerRowIndex - 1, PlayerColIndex);
}

function CreateAlien(_row, _col){
    const alien = document.createElement("img");
    alien.src = "Alien.png";
    alien.className = "gameObject";

    Aliens.add({
        elem: alien,
        row: _row,
        col: _col
    });
}

function InitEvents(){
    /*** EVENTS SECTION ***/

    document.addEventListener('keydown', (event) => {

        switch(event.code){
            case "ArrowLeft": ArrowLeftEventHandler(); break;
            case "ArrowRight": ArrowRightHandler(); break;
            case "Space": SpaceEventHandler(); break;
            default: alert(event.code);
        }
    });

}



window.addEventListener('load', function () {

    //generating board
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


    //init player
    player = document.getElementById('PlayerElem');
    player.src = "PlayerFire.png"
    document.querySelector('[data-rowindex="11"] > [data-colindex="6"]').appendChild(player);


    CreateAlien(0,5);
    CreateFireBall(4,5);


    //initilize events
    InitEvents();
    
    //main game clock at the moment
    const QuarterSecondIntervalTick = setInterval(() => {
        HandleFireBalls();    
        HandleAliens();
    }, 250);
});



