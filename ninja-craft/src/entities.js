/**
 * Creates a player using the spriteSheet and draws to the canvas provided
 * returns playeObject:
 * const playerObject = {
        spriteSheet: spriteSheet,
        canvas: canvas,
        x: 0,
        y: 0
    } 
 */
export function createPlayer(spriteSheet, canvas){

    const playerObject = {
        type: "player",
        spriteSheet: spriteSheet,
        canvas: canvas,
        x: 0,
        y: 0,
        facing: 0, // 0: up, 1 right, 2: down, 3: left
        anim_frame: 0,
    }

    return playerObject
}

export function drawHumanoid(entity, action){

}

export function moveHumanoid(enity, direction){

}