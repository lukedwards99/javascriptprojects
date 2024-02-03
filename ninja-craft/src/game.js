import "./entities.js"
import { createPlayer } from "./entities.js";

let GameState = {
    canvas: null,
    time: 0
}

const player = {
    x: 0,
    y: 0,
    sprites: {
        idle: null,
        walking: null
    }
}

window.onload(() => {

    const playerSprites = new Image();
    playerSprites.src = 'path/to/your/spriteSheet.png';

    GameState.canvas = document.getElementById("gameCanvas")

    const player = createPlayer(playerSprites, GameState.canvas)

    initKeyHandlers()

});

function initKeyHandlers() {
    document.addEventListener('keydown', (event) => handleKeyPress(event));
}

function handleKeyPress(event) {
    switch (event.key) {
        case 'w':
        case 'W':
            this.moveUp();
            break;
        case 'a':
        case 'A':
            this.moveLeft();
            break;
        case 's':
        case 'S':
            this.moveDown();
            break;
        case 'd':
        case 'D':
            this.moveRight();
            break;
        default:
            // Handle other keys if needed
            break;
    }
}