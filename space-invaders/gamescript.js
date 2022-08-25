"use strict";

const NUM_ROWS = 20; 
const NUM_COLS = 12; //TODO: set col width
const PROB_NOT_SPAWN = .90; //probablity that if the game is not spawn that it will not spawn in the next tick
const TICK_INTERVAL = 250; //game ticks every quarter second
const ALIEN_TICK_UPDATE = 2; //after how many ticks will the aliens update. 2 = every other frame. 3 = every 3rd frame etc
const MAX_DIFFICULTY_SCORE = 500;
const MAX_DIFFICULTY_SPAWN_RATE = .20;
const MIN_DIFFICULTY_SCORE = 20;
const MIN_DIFFICULTY_SPAWN_RATE = .10;



const FireBalls = new Set();
const Aliens = new Set();
const grid = document.getElementById("grid");
let player = null; //initilized later
let score = 0;  
let fireballCooldown = 0;
const fireballCooldownStep = .5;
const fireballCooldownReset = 2;
let panicCooldown = 0;
const panicCooldownStep = .25; 
const panicCooldownReset = 15;
let probablitySpawnNextTick = 1;
let firstAlienTick = true;

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
            score--;
            document.getElementById('Score').innerHTML = "Score: " + score;
            return;
        }

        if(alien.row == PlayerRowIndex && alien.col == PlayerColIndex){ //alien intersect with player
            alert("GAME OVER!");
            location.reload();
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
                FireBalls.delete(fb);
                DeleteAlienAddScore(alien);
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

function ArrowRightEventHandler(){
    if (PlayerColIndex < NUM_COLS - 1){
        PlayerColIndex++;
    }
    document.querySelector('[data-rowindex="' + (NUM_ROWS - 1) + '"] > [data-colindex="' + PlayerColIndex + '"]').appendChild(player);
}




function FireEventHandler(){
    if (fireballCooldown > 0){
        return;
    }

    CreateFireBall(PlayerRowIndex - 1, PlayerColIndex);
    fireballCooldown = fireballCooldownReset;
}

function PanicEventHandler(){ //TODO: Implement
    if(panicCooldown > 0){
        return;
    }

    Aliens.forEach(function (a) {
        if(a.row == NUM_ROWS - 1 || a.row == NUM_ROWS - 2){
            DeleteAlienAddScore(a);
        }
    });

    for(let i = 0; i < NUM_COLS; i++){
        CreateFireBall(NUM_ROWS - 1, i);
        CreateFireBall(NUM_ROWS - 2, i);
    }
    panicCooldown = panicCooldownReset;
}

function DeleteAlienAddScore(a){
    a.elem.remove();
    Aliens.delete(a);
    score++;
    document.getElementById('Score').innerHTML = "Score: " + score;
    probablitySpawnNextTick = (score > MAX_DIFFICULTY_SCORE ? MAX_DIFFICULTY_SPAWN_RATE : ((score < MIN_DIFFICULTY_SCORE ? MIN_DIFFICULTY_SCORE : score) / MAX_DIFFICULTY_SCORE) * MAX_DIFFICULTY_SPAWN_RATE)
    console.log(probablitySpawnNextTick);
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

function HandlePlayerStatusBars(){

    //Fire progress bar
    let firebar = document.getElementById("fireballProgressBar");
    if(fireballCooldown <= 0){
        firebar.style.width = "100%";
    }else{
    let fireBarInverseWidth = fireballCooldown / fireballCooldownReset;
    firebar.style.width = (100 - fireBarInverseWidth * 100) + "%";
    fireballCooldown -= fireballCooldownStep;
    }
    //Panic progess bar
    let panicbar = document.getElementById("panicProgressBar");
    if(panicCooldown <= 0){
        panicbar.style.width = "100%";
    }else{
    let panicBarInverseWidth = panicCooldown / panicCooldownReset;
    panicbar.style.width = (100 - panicBarInverseWidth * 100) + "%";
    panicCooldown -= panicCooldownStep;
    }
}

function InitEvents(){
    /*** EVENTS SECTION ***/

    document.addEventListener('keydown', (event) => {

        switch(event.code){
            case "ArrowLeft": ArrowLeftEventHandler(); break;
            case "ArrowRight": ArrowRightEventHandler(); break;
            case "ArrowUp": FireEventHandler(); break;
            case "ArrowDown": PanicEventHandler(); break;
            //default: alert(event.code);
        }
    });

    document.getElementById("leftButton").addEventListener('click', ArrowLeftEventHandler);
    document.getElementById("rightButton").addEventListener('click', ArrowRightEventHandler);
    document.getElementById("fireButton").addEventListener('click', FireEventHandler);
    document.getElementById("panicButton").addEventListener('click', PanicEventHandler);
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
    '  a  a  a  a'
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

    if( Math.random() <= probablitySpawnNextTick && SpawnIndex === null) { // start new spawn
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

    //eviroment setup
    document.body.style.zoom = "80%";

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
    
    //main game clock 
    let lastAlienMove = 0;
    //let lastFireballMove = 0;
    const QuarterSecondIntervalTick = setInterval(() => {

        if(lastAlienMove > ALIEN_TICK_UPDATE) { //aliens only move every 2 ticks
            SpawnAliens();
            HandleAliens();
            lastAlienMove = 0;
            if(firstAlienTick) {
                probablitySpawnNextTick = MIN_DIFFICULTY_SPAWN_RATE;
            }
        }else{
            lastAlienMove++;
        }

        HandleFireBalls();  
        DetectCollision();
        HandlePlayerStatusBars();

        
        
    }, TICK_INTERVAL);
});
