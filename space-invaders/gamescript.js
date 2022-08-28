"use strict";

const NUM_ROWS = 20; 
const NUM_COLS = 12; //TODO: set col width
const PROB_NOT_SPAWN = .90; //probablity that if the game is not spawn that it will not spawn in the next tick
const TICK_INTERVAL = 100; //game ticks every quarter second
const ALIEN_TICK_UPDATE = 2; //after how many ticks will the aliens update. 2 = every other frame. 3 = every 3rd frame etc
const MAX_DIFFICULTY_SCORE = 500;
const MAX_DIFFICULTY_SPAWN_RATE = .20;
const MIN_DIFFICULTY_SCORE = 20;
const MIN_DIFFICULTY_SPAWN_RATE = .10;
const POWER_UP_PROB = .25;



const FireBalls = new Set();
const Aliens = new Set();
const PowerUps = new Set();
const grid = document.getElementById("grid");
let player = null; //initilized later
let score = 0;  
let fireballCooldown = 0;
const fireballCooldownStep = TICK_INTERVAL / 1000; //keeps fireball cooldown tied to seconds
const fireballCooldownReset = .5;
let panicCooldown = 0;
const panicCooldownStep = TICK_INTERVAL / 1000; //keeps panic cooldown tied to seconds
const panicCooldownReset = 10;
let probablitySpawnNextTick = 1;
let firstAlienTick = true;
let playerHasPowerup = false;

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
    FireBalls.forEach(function (fb) {
        //console.log("Checking alien at row: " + alien.row + " col: " + alien.col + "\n" + "fireball at row: " + fb.row + " col: " + fb.col);
        Aliens.forEach(function (alien) {
            if((alien.row == fb.row && alien.col == fb.col ) || (alien.row + 1 == fb.row && alien.col == fb.col )){ //TODO: make this more robust
                fb.elem.remove();
                fb.elem = null;
                FireBalls.delete(fb);
                DeleteAlienAddScore(alien);
            }
        });

        PowerUps.forEach(function (pu) {
            if((pu.row == fb.row && pu.col == fb.col ) || (pu.row + 1 == fb.row && pu.col == fb.col )){
                fb.elem.remove();
                fb.elem = null;
                FireBalls.delete(fb);
                pu.elem.remove();
                pu.elem = null;
                PowerUps.delete(pu);
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
        if(playerHasPowerup){
            CreateFireBall(NUM_ROWS - 2, i);
        }
    }

    panicCooldown = panicCooldownReset;
    playerHasPowerup = false;
}

function DeleteAlienAddScore(a){
    a.elem.remove();
    Aliens.delete(a);
    score++;
    document.getElementById('Score').innerHTML = "Score: " + score;
    SetDifficultyProbability();
}

function SetDifficultyProbability(){
    
    if(score < MIN_DIFFICULTY_SCORE) {
        probablitySpawnNextTick = MIN_DIFFICULTY_SPAWN_RATE;
    } else if(score < MAX_DIFFICULTY_SCORE) {
        probablitySpawnNextTick = (score / MAX_DIFFICULTY_SCORE) * MAX_DIFFICULTY_SPAWN_RATE + MIN_DIFFICULTY_SPAWN_RATE;
    } else {
        probablitySpawnNextTick = MAX_DIFFICULTY_SPAWN_RATE + MIN_DIFFICULTY_SPAWN_RATE;
    }

    //console.log(probablitySpawnNextTick);
}

function CreateAlien(_row, _col){// note that once update method is called the first frame that it is displayed
    //will be one row lower than _row value passed. Pass -1 to have show in row 0 on first frame update.
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

    if(playerHasPowerup){
        panicbar.style.backgroundColor = "#00c403";
    } else {
        panicbar.style.backgroundColor = "#c40000" 
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


//Handles spawning of all elements by reading the alien spawn array at the end of the script
let SpawnIndex = null; //spawn index is used to keep track of where in the spawning cycle I am at.
let SpawnPattern = null;
function Spawn() {

    if( Math.random() <= probablitySpawnNextTick && SpawnIndex === null) { // start new spawn
        SpawnIndex = 0;
        SpawnPattern = Math.floor(Math.random() * AlienPatterns.length);
    }

    if(SpawnIndex === null) { //no spawning this cycle
        return;
    }

    for(let i = 0; i < AlienPatterns[SpawnPattern][SpawnIndex].length; i++){

        if(AlienPatterns[SpawnPattern][SpawnIndex].charAt(i) === 'a'){
            CreateAlien(-1, i);
        }
        if(AlienPatterns[SpawnPattern][SpawnIndex].charAt(i) === 'p'){
            if(Math.random() < POWER_UP_PROB){
                CreatePowerUp(-1, i);
            }else{
                CreateAlien(-1, i);
            }
        }

    }

    SpawnIndex++;

    if(SpawnIndex >= AlienPatterns[SpawnPattern].length)
    {
        SpawnIndex = null;
    }
}

function HandlePowerUps() {

    PowerUps.forEach( function(pu) {

        if(pu.elem == null || pu.row == null || pu.col == null){ //if any fields are empty dont update the object and delete it
            try {
                pu.elem.remove();
                PowerUps.delete(pu);
            } catch (error) {
                console.error(error);
            } finally {
                return;
            }
        }
        
        pu.row++;

        if(pu.row > NUM_ROWS - 1){
            pu.elem.remove();
            PowerUps.delete(pu);
            return;
        }

        if(pu.row == PlayerRowIndex && pu.col == PlayerColIndex){ //alien intersect with player
            playerHasPowerup = true;
            panicCooldown = 0;
            pu.elem.remove();
            PowerUps.delete(pu);
            return;
        }

        //debugger;
        document.querySelector('[data-rowindex="' + pu.row + '"] > [data-colindex="' + pu.col + '"]').appendChild(pu.elem);
    
        
    });

}

function CreatePowerUp(_row, _col) { // note that once update method is called the first frame that it is displayed
    //will be one row lower than _row value passed. Pass -1 to have show in row 0 on first frame update.
    const powerUp = document.createElement("img");
    powerUp.src = "PowerUp.png";
    powerUp.className = "gameObject";

    PowerUps.add({
        elem: powerUp,
        row: _row,
        col: _col
    });

}

function SpawnPowerUps() {

    const spawnCol = Math.floor(Math.random() * NUM_COLS)
    CreatePowerUp(-1, );

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
            Spawn();
            HandleAliens();
            //SpawnPowerUps();
            HandlePowerUps();
            lastAlienMove = 0;
            if(firstAlienTick) { //game start up call
                probablitySpawnNextTick = MIN_DIFFICULTY_SPAWN_RATE;
                this.alert(`WELCOME TO SPACE INTRUDERS!!!\n---------------------------------------\nYour goal is to stop as many aliens as possible and to not get hit! More aliens will come the higher your score try to get a high score!`);
                firstAlienTick = false;
            }
        }else{
            lastAlienMove++;
        }

        HandleFireBalls();  
        DetectCollision();
        HandlePlayerStatusBars();

        
        
    }, TICK_INTERVAL);
});


const AlienPatterns = [
    [
        'aaaaaaapaaaa',
        'aaa p aaa   ',
        '   aaa   aaa'
    ],
    [
        'a  p  a  a  ',
        '    a     a ',
        ' a     a    '
    ],
    [
        'p  a  a  a  ',
        ' a  a  p  a ',
        '  a  a  a  a'
    ],
    [
        'apaaaapaaaaa'
    ],
    [
        '    apa     ',
        '  a     a   ',
        ' a   p   a  ',
        '  a     a   ',
        '    apa     '
    ],
    [
        '     aa     ',
        '    a  a    ',
        '   a    a   ',
        '  a      a  ',
        ' a   p    a ',
        'a          a'
    ],
    [
        '  p         ',
        '    a  a    ',
        '   a        ',
        '        p   ',
        '     a    a ',
        'a           '
    ],
    [
        '  p     a    ',
        '             ',
        '   a         ',
        '             ',
        '  a   a    a ',
        '      p      '
    ],
    [
        '  a      a  ',
        '    a  a    ',
        '   p        ',
        '            ',
        '        a   ',
        'a        p  '
    ]
    
];