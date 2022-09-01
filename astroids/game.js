"use strict";

//const WIDTH = 900;
//const HEIGHT = 600;
const FPS = 30;
const MAX_SPEED = 5; //max speed of player (pixels per frame)

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let upPressed = false;

const GameObjects = new Set();

let player = { //player object
    x: canvas.width / 2,
    y: canvas.height / 2,
    // xVelo: 0,
    // yVelo: 0,
    speed: 0,
    moveAngle: 0,
    angle: 0
}

function UpdatePhysics() {

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

function Draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas to redraw

    DrawPlayer();

}

function DrawPlayer() {
    

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    // ctx.fillStyle = "red";
    // ctx.fillRect(50 / -2, 50 / -2, 50, 50);

    ctx.beginPath();
    //ctx.arc(player.x, player.y, 40, 0, 2 * Math.PI);

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
            case "ArrowLeft": player.moveAngle = -3; break;
            case "ArrowRight": player.moveAngle = 3; break;
            case "ArrowUp": upPressed = true; break;
            //case "ArrowDown": ArrowDownEventHandler(); break;
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


//actual initilization

InitEvents();
const FrameUpdate = setInterval(function () { 

    UpdatePhysics();
    Draw(); 

}, 1000 / FPS);