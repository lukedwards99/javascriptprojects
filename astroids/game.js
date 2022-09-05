"use strict";

const FPS = 60;
const MAX_SPEED = 5; //max speed of player (pixels per frame)
const PLAYER_ACCELERATION = .25 //acceleration of player
const TURN_SPEED = 5;
const PROJ_SPEED = 20; //speed of projectiles (px/frame)
const PROJ_LENGTH = 20; //shouldnt be less that PROJ_SPEED.
const MIN_ASTROID_SPEED = 2;
const SPEED_PUNSHIMENT = 2; //if player is standing still min astroid speed goes up (shouldnt be larger than MIN_ASTROID_RADIUS - MIN_ASTROID_SPEED)
const MAX_ASTROID_SPEED = 15;
const MIN_ASTROID_RADIUS = 10;
const RADIUS_PUNISHMENT = 10; //if player is standing still min astroid radius goes down (shouldnt be less than MIN_ASTROID_RADIUS)
const MAX_ASTROID_RADIUS = 40;
const PLAYER_RADIUS = 10;
const MIN_ASTROID_SPAWN_COOLDOWN = 10; //in frames
const PLAYER_SAFE_SPAWN_RADIUS = 200; //radius around player where astroids cant spawn
const OUT_OF_BOUNDS_BUFFER = 200; //how many pixels out of bounds before game over or deletion of object

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let frameNumber = 0;
let spawnAstroidEvery = 60; //how many frames pass before the next astroid is spawned 
let score = 0;
let timeleft = 60;
let gameOver = false;

//main clock intervals are set at initilization
let TimerUpdate;
let FrameUpdate;

let upPressed = false;
let downPressed = false;
let spacePressed = false;

const Projectiles = new Set();
const Astroids = new Set();

let player = { //player object
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 0,
    moveAngle: 0,
    angle: 0
}

function UpdatePlayerPos(){
    if(InBounds(player) == false){
        gameOver == true;
        GameOver();
        return;
    }

    if(upPressed == true && downPressed != true) {
        if(player.speed < MAX_SPEED){
            player.speed += PLAYER_ACCELERATION;
        }
    }else{
        if(player.speed > 0){
            player.speed -= PLAYER_ACCELERATION;
        }
    }

    if(downPressed == true && upPressed != true) {
        if(player.speed > (MAX_SPEED * -1)){
            player.speed -= PLAYER_ACCELERATION;
        }
    }else{
        if(player.speed < 0){
            player.speed += PLAYER_ACCELERATION;
        }
    }

    if(spacePressed == true){
        Fire();
    }

    player.angle += player.moveAngle * Math.PI / 180;
    player.x += player.speed * Math.sin(player.angle);
    player.y -= player.speed * Math.cos(player.angle);
}

function InBounds(alpha){

    if(alpha.x < -OUT_OF_BOUNDS_BUFFER || alpha.x > canvas.width + OUT_OF_BOUNDS_BUFFER ||
        alpha.y < -OUT_OF_BOUNDS_BUFFER || alpha.y > canvas.width + OUT_OF_BOUNDS_BUFFER){
            return false;
        }
    
    return true;
}

function UpdatePhysics() {
    UpdatePlayerPos();
    UpdateProjectilePos();
    UpdateAstroidPos();
}

function UpdateProjectilePos(){
    Projectiles.forEach(function (proj) {
        if(InBounds(proj) == false){
            Projectiles.delete(proj);
            return;
        }
        proj.x += PROJ_SPEED * Math.sin(proj.angle);
        proj.y -= PROJ_SPEED * Math.cos(proj.angle);
    });
}

function DrawProjectiles(){
    Projectiles.forEach(function (proj) {
        ctx.save();
        ctx.translate(proj.x, proj.y);
        ctx.rotate(proj.angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, PROJ_LENGTH);
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke();
        ctx.restore();  
    });
}

function DrawAstroids(){
    Astroids.forEach(function (ast) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke();
        ctx.restore();  
    });
}

function CheckProjectileCollision(ast, proj, astRadius){
    const _proj = {
        x: proj.x,
        y: proj.y,
        angle: proj.angle
    }    

    //check 3 points along the projectile
    const distance1 = Math.sqrt(Math.pow(ast.x - _proj.x, 2) + Math.pow(ast.y - _proj.y, 2));
    _proj.x -= PROJ_LENGTH / 2 * Math.sin(_proj.angle);
    _proj.y += PROJ_LENGTH / 2 * Math.cos(_proj.angle);
    const distance2 = Math.sqrt(Math.pow(ast.x - _proj.x, 2) + Math.pow(ast.y - _proj.y, 2));
    _proj.x -= PROJ_LENGTH * Math.sin(_proj.angle);
    _proj.y += PROJ_LENGTH * Math.cos(_proj.angle);
    const distance3 = Math.sqrt(Math.pow(ast.x - _proj.x, 2) + Math.pow(ast.y - _proj.y, 2));
    if(distance1 < astRadius || distance2 < astRadius || distance3 < astRadius){ 
        return true;
    }
    return false;
}

//collisions are all handled by the astroid updateds
function UpdateAstroidPos(){
    Astroids.forEach(function (ast) {

        if(InBounds(ast) == false){
            Astroids.delete(ast);
            return;
        }

        ast.x += ast.speed * Math.sin(ast.angle);
        ast.y -= ast.speed * Math.cos(ast.angle);

        let hit = false;

        //collision detection with projectiles
        Projectiles.forEach(function (proj) {
            if(CheckProjectileCollision(ast, proj, ast.radius)){
                Projectiles.delete(proj);
                Astroids.delete(ast);
                hit = true;
            }
        });

        if(hit === true){
            AddScore();
            return;
        }

        if(CheckCollision(ast, player, ast.radius + PLAYER_RADIUS) && gameOver === false){
            gameOver = true
            GameOver();
            //location.reload();
        }
    });
}

function CheckCollision(alpha, beta, min_distance){
    const distance = Math.sqrt(Math.pow(alpha.x - beta.x, 2) + Math.pow(alpha.y - beta.y, 2));
    if(distance < min_distance){ 
        return true;
    }
    return false;
}

function AddScore(){
    score++;
    document.getElementById("score").innerHTML = "Score: " + score.toString();
}

function Draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas to redraw

    DrawPlayer();
    DrawProjectiles();
    DrawAstroids();
}

function DrawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.beginPath();
    ctx.moveTo(0, -PLAYER_RADIUS);
    ctx.lineTo(PLAYER_RADIUS, PLAYER_RADIUS);
    ctx.lineTo(-PLAYER_RADIUS, PLAYER_RADIUS);
    ctx.lineTo(0, -PLAYER_RADIUS);
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
    ctx.restore();  

    //will draw the hitbox of the player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_RADIUS, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
    ctx.restore();  
}

function SpawnAstroid(){

    const x = Math.floor(Math.random() * canvas.width);
    const y = Math.floor(Math.random() * canvas.height);
    const radius = Math.floor((Math.random() * (MAX_ASTROID_RADIUS - MIN_ASTROID_RADIUS)) + MIN_ASTROID_RADIUS);
    const angle = Math.atan2((player.y - y), (player.x - x)) + (Math.PI/2);
    const speed = Math.floor((Math.random() * (MAX_ASTROID_SPEED - MIN_ASTROID_SPEED)) + MIN_ASTROID_SPEED);

    //skip spawn if on top of player
    if(spacePressed == false && (CheckCollision(player, {x: x, y: y}, PLAYER_SAFE_SPAWN_RADIUS) == false)){
        console.log("easy spawn");
        CreateAstroid(x, y, angle, radius, speed);
    }else if(spacePressed == true && CheckCollision(player, {x: x, y: y}, PLAYER_SAFE_SPAWN_RADIUS / 2) == false){ //to discourage camping and spinning
        console.log("hard spawn");
        CreateAstroid(x, y, angle, radius - RADIUS_PUNISHMENT, Math.floor((Math.random() * (MAX_ASTROID_SPEED - MIN_ASTROID_SPEED + SPEED_PUNSHIMENT)) + MIN_ASTROID_SPEED + SPEED_PUNSHIMENT));
    }else{
        SpawnAstroid(); //try again if spawned on player
        return;
    }
}

function CreateAstroid(_x, _y, _angle, _radius, _speed){
    Astroids.add({
        x: _x,
        y: _y,
        speed: _speed,
        angle: _angle,
        radius: _radius
    });
}

function TimeOut(){
    const modal = document.getElementById("modal");
    modal.style.display = "block";
    document.getElementById("modal-text").innerHTML = "Your final score was <b>" + score.toString() + "</b>";

    StopGame();
}

function GameOver(){
    const modal = document.getElementById("modal");
    modal.style.display = "block";
    document.getElementById("modal-text").innerHTML = "GAME OVER! Try again?";

    StopGame();
}

function StopGame(){

    StopFrameUpdate();
    StopTimerUpdate();

}

function InitEvents() {

    document.addEventListener('keydown', (event) => {

        switch(event.code){
            case "KeyA":
            case "ArrowLeft": player.moveAngle = -TURN_SPEED; break;
            case "KeyD":
            case "ArrowRight": player.moveAngle = TURN_SPEED; break;
            case "KeyW":
            case "ArrowUp": upPressed = true; break;
            case "KeyS":
            case "ArrowDown": downPressed = true; break;
            case "Space": spacePressed = true; break;
            //case "Space": Fire(); break;
        }
    });

    // document.addEventListener('keypress', (event) => {
    //     if(event.code === 'Space'){
    //         Fire();
    //     }
    // });

    document.addEventListener('keyup', (event) => {

        switch(event.code){
            case "KeyA":
            case "ArrowLeft": player.moveAngle = 0; break;
            case "KeyD":
            case "ArrowRight": player.moveAngle = 0; break;
            case "KeyW":
            case "ArrowUp": upPressed = false; break;
            case "KeyS":
            case "ArrowDown": downPressed = false; break;
            case "Space": spacePressed = false; break;
        }
    });
}

function Fire(){

    let projectile = {
        x: player.x,
        y: player.y,
        angle: player.angle
    }

    Projectiles.add(projectile);
}

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

function StopFrameUpdate(){
    clearInterval(FrameUpdate);
}

function StartTimerUpdate() {
    TimerUpdate = setInterval(function () {
        timeleft--;
    
        //gameover
        if(timeleft <= 0){
            TimeOut();
        }

        SpawnAstroid();
    
        if(spawnAstroidEvery > MIN_ASTROID_SPAWN_COOLDOWN){
            spawnAstroidEvery--;
        }
    
        document.getElementById("timeleft").innerHTML = "Time Left: " + timeleft;
    }, 1000);
}

function StopTimerUpdate(){
    clearInterval(TimerUpdate);
}

//actual initilization
InitEvents();
StartFrameUpdate();
StartTimerUpdate();
