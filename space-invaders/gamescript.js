"use strict";

const NUM_ROWS = 20;
const NUM_COLS = 12;
const SPAWN_PROB = .950; 


const FireBalls = new Set();
const Aliens = new Set();
const grid = document.getElementById("grid");
let player = null; //initilized later  


let PlayerRowIndex = NUM_ROWS - 1;
let PlayerColIndex = 6;
//let PlayerColIndex = Math.floor(NUM_COLS / 2);


function HandleFireBalls() {

    FireBalls.forEach(function (fb) {
        //fb: fire ball object:
            //elem: html fireball img element
            //row: row index
            //col: col index
        
        if(fb.elem == null || fb.row == null || fb.col == null){ //if any fields are empty dont update the object
            return;
        }

        fb.row--;

        if(fb.row < 0){
            fb.elem.remove();
            FireBalls.delete(fb);
            return;
        }

        if(fb.elem === null){
            return;
        }

        document.querySelector('[data-rowindex="' + fb.row + '"] > [data-colindex="' + fb.col + '"]').appendChild(fb.elem);
    });
}

function HandleAliens() {

    Aliens.forEach(function (alien){
        //alien: alien object
            //elem: html fireball img element
            //row: row index
            //col: col index
        if(alien.elem == null || alien.row == null || alien.col == null){ //if any fields are empty dont update the object and delete it
            try {
                alien.elem.remove();
                Aliens.delete(alien);
            } catch (error) {
                console.error(error);
            } finally {
                return;
            }
        }
        
        alien.row++;

        if(alien.row > NUM_ROWS - 1){
            alien.elem.remove();
            Aliens.delete(alien);
            return;
        }

        if(alien.row == PlayerRowIndex && alien.col == PlayerColIndex){
            //alert("GAME OVER!");
        }

        //debugger;
        document.querySelector('[data-rowindex="' + alien.row + '"] > [data-colindex="' + alien.col + '"]').appendChild(alien.elem);
    });
}

function DetectCollision() {
    Aliens.forEach(function (alien) {
        //console.log("Checking alien at row: " + alien.row + " col: " + alien.col + "\n" + "fireball at row: " + fb.row + " col: " + fb.col);
        FireBalls.forEach(function (fb) {
            if((alien.row == fb.row && alien.col == fb.col ) || (alien.row + 1 == fb.row && alien.col == fb.col )){ //TODO: make this more robust
                fb.elem.remove();
                fb.elem = null;
                alien.elem.remove();
                Aliens.delete(alien);
                FireBalls.delete(fb);
            }
        });
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

function ArrowLeftEventHandler(){
    if (PlayerColIndex > 0){
        PlayerColIndex--;
    }
    document.querySelector('[data-rowindex="' + (NUM_ROWS - 1) + '"] > [data-colindex="' + PlayerColIndex + '"]').appendChild(player);
}

function ArrowRightHandler(){
    if (PlayerColIndex < NUM_COLS - 1){
        PlayerColIndex++;
    }
    document.querySelector('[data-rowindex="' + (NUM_ROWS - 1) + '"] > [data-colindex="' + PlayerColIndex + '"]').appendChild(player);
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
            //default: alert(event.code);
        }
    });
}

const AlienPatterns = [
    [
    'aaaaaaaaaaaa',
    'aaa   aaa   ',
    '   aaa   aaa'
    ],
    [
    'a a   a  a  ',
    '    a     a ',
    ' a     a    '
    ],
    [
    'a  a  a  a  ',
    ' a  a  a  a ',
    '   a  a  a  a'
    ],
    [
    'aaaaaaaaaaaa'
    ]
    // [
    // 'aaaaaaaaaaaa',
    // 'aaa   aaa   ',
    // '   aaa   aaa'
    // ],
    // [
    // 'aaaaaaaaaaaa',
    // 'aaa   aaa   ',
    // '   aaa   aaa'
    // ],
];

let SpawnIndex = null; //spawn index is used to keep track of where in the spawning cycle I am at.
let SpawnPattern = null;
function SpawnAliens() {

    if(Math.random() > SPAWN_PROB && SpawnIndex === null) { // start new spawn
        SpawnIndex = 0;
        SpawnPattern = Math.floor(Math.random() * AlienPatterns.length);
    }

    if(SpawnIndex === null) { //no spawning this cycle
        return;
    }

    for(let i = 0; i < AlienPatterns[SpawnPattern][SpawnIndex].length; i++){

        if(AlienPatterns[SpawnPattern][SpawnIndex].charAt(i) === 'a'){
            CreateAlien(0, i);
        }

    }

    SpawnIndex++;

    if(SpawnIndex >= AlienPatterns[SpawnPattern].length)
    {
        SpawnIndex = null;
    }

}

/*** INITIALIZATION HAPPENS HERE!!!***/
window.addEventListener('load', function () {

    //generating board
    let squareRed = false;
    for(let i = 0; i < NUM_ROWS; i++){

        const newRow = document.createElement('div');
        newRow.className = "row";
        newRow.setAttribute("data-rowindex", i); 
        grid.appendChild(newRow);

        for(let j = 0; j < NUM_COLS; j++){
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
    document.querySelector('[data-rowindex="' + PlayerRowIndex + '"] > [data-colindex="' + PlayerColIndex + '"]').appendChild(player);


    // CreateAlien(0,5);
    // CreateFireBall(5,5);


    //initilize events
    InitEvents();
    
    //main game clock at the moment
    let lastAlienMove = 0;
    let lastFireballMove = 0;
    const QuarterSecondIntervalTick = setInterval(() => {
        if(lastAlienMove > 2) {
            HandleAliens();
            SpawnAliens();
            lastAlienMove = 0;
        }else{
            lastAlienMove++;
        }
        HandleFireBalls();  
        DetectCollision();
    }, 250);

    // const SecondIntervalTick = this.setInterval(() => {
    //     const col = Math.floor(Math.random() * NUM_COLS);
    //     CreateAlien(0, col);
    //     //debugger;
    // },1000);
});
