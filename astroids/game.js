"use strict";

const FPS = 30;
const MAX_SPEED = 5; //max speed of player (pixels per frame)
const PLAYER_ACCELERATION = .5 //acceleration of player
const TURN_SPEED = 5;
const PROJ_SPEED = 10; //speed of projectiles (px/frame)
const ASTROID_SPEED = 4;
const ASTROID_RADIUS = 10;
const PLAYER_RADIUS = 10;
const MIN_ASTROID_SPAWN_COOLDOWN = 10; //in frames

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let frameNumber = 0;
let spawnAstroidEvery = 60; //how many frames pass before the next astroid is spawned 
let score = 0;
let gameOver = false;

let upPressed = false;
let downPressed = false;

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

    player.angle += player.moveAngle * Math.PI / 180;
    player.x += player.speed * Math.sin(player.angle);
    player.y -= player.speed * Math.cos(player.angle);
}

function UpdatePhysics() {
    UpdatePlayerPos();
    UpdateProjectilePos();
    UpdateAstroidPos();
}

function UpdateProjectilePos(){
    Projectiles.forEach(function (proj) {
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
        ctx.lineTo(10, 20);
        ctx.lineTo( -10, 20);
        ctx.lineTo(0, 0);
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

//collisions are all handled by the astroid updateds
function UpdateAstroidPos(){
    Astroids.forEach(function (ast) {
        ast.x += ASTROID_SPEED * Math.sin(ast.angle);
        ast.y -= ASTROID_SPEED * Math.cos(ast.angle);

        let hit = false;

        //collision detection with projectiles
        Projectiles.forEach(function (proj) {
            const distance = Math.sqrt(Math.pow(ast.x - proj.x, 2) + Math.pow(ast.y - proj.y, 2));
            if(distance < ast.radius){ 
                Projectiles.delete(proj);
                Astroids.delete(ast);

                hit = true;
            }
        });

        if(hit === true){
            return;
        }

        const distanceFromPlayer = Math.sqrt(Math.pow(ast.x - player.x, 2) + Math.pow(ast.y - player.y, 2));
        if((distanceFromPlayer < ast.radius + PLAYER_RADIUS) && gameOver === false){
            gameOver = true
            alert("Game Over!");
            location.reload();
        }

    });
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
    // ctx.save();
    // ctx.translate(player.x, player.y);
    // ctx.beginPath();
    // ctx.arc(0, 0, PLAYER_RADIUS, 0, 2 * Math.PI);
    // ctx.strokeStyle = "#FFFFFF";
    // ctx.stroke();
    // ctx.restore();  
}

function SpawnAstroid(){

    CreateAstroid(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height), Math.floor(Math.random() * Math.PI * 2));

}

function CreateAstroid(_x, _y, _angle){
    Astroids.add({
        x: _x,
        y: _y,
        speed: ASTROID_SPEED,
        angle: _angle,
        radius: ASTROID_RADIUS
    });
}

function InitEvents() {

    document.addEventListener('keydown', (event) => {

        switch(event.code){
            case "ArrowLeft": player.moveAngle = -TURN_SPEED; break;
            case "ArrowRight": player.moveAngle = TURN_SPEED; break;
            case "ArrowUp": upPressed = true; break;
            case "ArrowDown": downPressed = true; break;
            case "Space": Fire(); break;
        }
    });
    document.addEventListener('keyup', (event) => {

        switch(event.code){
            case "ArrowLeft": player.moveAngle = 0; break;
            case "ArrowRight": player.moveAngle = 0; break;
            case "ArrowUp": upPressed = false; break;
            case "ArrowDown": downPressed = false; break;
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

//actual initilization
InitEvents();
const FrameUpdate = setInterval(function () { 
    frameNumber++;

    if(frameNumber % spawnAstroidEvery == 0){
        SpawnAstroid();
        //console.log("spawn astroid");

        if(spawnAstroidEvery > MIN_ASTROID_SPAWN_COOLDOWN){
            spawnAstroidEvery--; //TODO: tweak this logic
        }
    }

    UpdatePhysics();
    Draw(); 

}, 1000 / FPS);