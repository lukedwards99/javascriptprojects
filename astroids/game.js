"use strict";

//const WIDTH = 900;
//const HEIGHT = 600;
const FPS = 30;
const MAX_SPEED = 5; //max speed of player (pixels per frame)
const TURN_SPEED = 3;
const PROJ_SPEED = 10; //speed of projectiles (px/frame)

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let upPressed = false;

//const GameObjects = new Set();
const Projectiles = new Set();

let player = { //player object
    x: canvas.width / 2,
    y: canvas.height / 2,
    // xVelo: 0,
    // yVelo: 0,
    speed: 0,
    moveAngle: 0,
    angle: 0
}

function UpdatePlayerPos(){
    if(upPressed == true) {
        if(player.speed < MAX_SPEED){
            player.speed++;
        }
    }else{
        if(player.speed > 0){
            player.speed--;
        }
    }

    player.angle += player.moveAngle * Math.PI / 180;
    player.x += player.speed * Math.sin(player.angle);
    player.y -= player.speed * Math.cos(player.angle);
}

function UpdatePhysics() {

    UpdatePlayerPos();
    UpdateProjectilePos();
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
        ctx.strokeStyle = "#000000";
        ctx.stroke();
        ctx.restore();  
    });
}

function Draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas to redraw

    DrawPlayer();
    DrawProjectiles();

}

function DrawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 20);
    ctx.lineTo( -10, 20);
    ctx.lineTo(0, 0);
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.restore();  
}

function InitEvents() {

    document.addEventListener('keydown', (event) => {

        switch(event.code){
            case "ArrowLeft": player.moveAngle = -TURN_SPEED; break;
            case "ArrowRight": player.moveAngle = TURN_SPEED; break;
            case "ArrowUp": upPressed = true; break;
            case "Space": Fire(); break;
            //default: alert(event.code);
        }
    });
    document.addEventListener('keyup', (event) => {

        switch(event.code){
            case "ArrowLeft": player.moveAngle = 0; break;
            case "ArrowRight": player.moveAngle = 0; break;
            case "ArrowUp": upPressed = false; break;
            //case "ArrowDown": ArrowDownEventHandler(); break;
            //default: alert(event.code);
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

    UpdatePhysics();
    Draw(); 

}, 1000 / FPS);