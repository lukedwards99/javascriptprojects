"use strict";

//const WIDTH = 900;
//const HEIGHT = 600;
const FPS = 30;
const MAX_VELO = 5; //max velosity of player (pixels per frame)

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let upPressed = false;

const GameObjects = new Set();

let player = { //player object
    x: canvas.width / 2,
    y: canvas.height / 2,
    xVelo: 0,
    yVelo: 0
}

function UpdatePhysics() {

    if(upPressed == true) {
        if(player.xVelo > (MAX_VELO * -1)){
            player.xVelo--;
        }
    }else{
        if(player.xVelo < 0){
            player.xVelo++;
        }
    }

    player.y = player.y + player.xVelo;

}

function Draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas to redraw

    DrawPlayer();

}

function DrawPlayer() {
    ctx.beginPath();
    //ctx.arc(player.x, player.y, 40, 0, 2 * Math.PI);

    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + 10, player.y + 20);
    ctx.lineTo(player.x - 10, player.y + 20);
    ctx.lineTo(player.x, player.y);
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
}

function InitEvents() {

    document.addEventListener('keydown', (event) => {

        switch(event.code){
            //case "ArrowLeft": ArrowLeftEventHandler(); break;
            //case "ArrowRight": ArrowRightEventHandler(); break;
            case "ArrowUp": upPressed = true; break;
            //case "ArrowDown": ArrowDownEventHandler(); break;
            //default: alert(event.code);
        }
    });
    document.addEventListener('keyup', (event) => {

        switch(event.code){
            //case "ArrowLeft": ArrowLeftEventHandler(); break;
            //case "ArrowRight": ArrowRightEventHandler(); break;
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