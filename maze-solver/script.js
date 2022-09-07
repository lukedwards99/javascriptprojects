"use strict";

const NUM_ROWS = 10;
const NUM_COLS = NUM_ROWS; // future proofing

const GRID_DIM = window.innerHeight * .9; // grid will be a square

const CELL_HEIGHT = GRID_DIM / NUM_ROWS;
const CELL_WIDTH = GRID_DIM / NUM_COLS;


const $grid = $('#grid');

//alert($grid.css("width"));

for(let i = 0; i < NUM_ROWS; i++){
    const row = $('<div></div>').addClass("row");
    $grid.append(row);
    for(let j = 0; j < NUM_COLS; j++){
        const cell = $('<div></div>').addClass("cell").width(CELL_WIDTH).height(CELL_HEIGHT).attr("data-row", i).attr("data-col", j);
        row.append(cell);
        const controls = $("<div></div>").addClass('controls');
        //north
        controls.append($("<div></div>").height(cell.height() * .2).width(cell.width() * .2)
            .css('background-color', "#000000").css("border-radius", "50%").css("top", (CELL_HEIGHT * .1)).addClass("controlsNS"));
        //south
        controls.append($("<div></div>").height(cell.height() * .2).width(cell.width() * .2)
            .css('background-color', "#000000").css("border-radius", "50%").css("top", (CELL_HEIGHT * .7)).addClass("controlsNS"));
        //east
        controls.append($("<div></div>").height(cell.height() * .2).width(cell.width() * .2)
            .css('background-color', "#000000").css("border-radius", "50%").css("top", (CELL_HEIGHT * .4)).addClass("controlsE"));
        //west
        controls.append($("<div></div>").height(cell.height() * .2).width(cell.width() * .2)
            .css('background-color', "#000000").css("border-radius", "50%").css("top", (CELL_HEIGHT * .4)).addClass("controlsW"));

        controls.css("display", "none");
        cell.append(controls);
    }
}

$(".cell").on('mouseenter', function() {

    let $this = $(this);
    $this.children(".controls").css("display", "flex");

});

$(".cell").on('mouseleave', function() {

    let $this = $(this);
    $this.children(".controls").css("display", "none");

});

$(".cell").on('click', function(){

    alert($(this).attr("data-row").toString() + " " + $(this).attr("data-col").toString());

});

//alert("done");