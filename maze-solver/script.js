"use strict";

const NUM_ROWS = 10;
const NUM_COLS = NUM_ROWS; // future proofing

const GRID_DIM = window.innerHeight * .75; // grid will be a square

const CELL_HEIGHT = GRID_DIM / NUM_ROWS;
const CELL_WIDTH = GRID_DIM / NUM_COLS;

let selectingStart = false;
let selectingEnd = false;


const $grid = $('#grid');

for(let i = 0; i < NUM_ROWS; i++){
    const row = $('<div></div>').addClass("row");
    $grid.append(row);
    for(let j = 0; j < NUM_COLS; j++){
        const cell = $('<div></div>').addClass("cell").width(CELL_WIDTH).height(CELL_HEIGHT).attr("data-row", i).attr("data-col", j);
        row.append(cell);
        const controls = $("<div></div>").addClass('controls');
        //north
        controls.append($("<div></div>").height(cell.height() * .2).width(cell.width() * .2)
            .css('background-color', "#000000").css("border-radius", "50%").css("top", (CELL_HEIGHT * .1))
            .addClass("controlsNS").attr("data-side", "N").on('click', AddWallHandler));
        //south
        controls.append($("<div></div>").height(cell.height() * .2).width(cell.width() * .2)
            .css('background-color', "#000000").css("border-radius", "50%").css("top", (CELL_HEIGHT * .7))
            .addClass("controlsNS").attr("data-side", "S").on('click', AddWallHandler));
        //east
        controls.append($("<div></div>").height(cell.height() * .2).width(cell.width() * .2)
            .css('background-color', "#000000").css("border-radius", "50%").css("top", (CELL_HEIGHT * .4))
            .addClass("controlsE").attr("data-side", "E").on('click', AddWallHandler));
        //west
        controls.append($("<div></div>").height(cell.height() * .2).width(cell.width() * .2)
            .css('background-color', "#000000").css("border-radius", "50%").css("top", (CELL_HEIGHT * .4))
            .addClass("controlsW").attr("data-side", "W").on('click', AddWallHandler));

        controls.css("display", "none");
        cell.append(controls);
    }
}

$(".cell").on('mouseenter', function() {

    const $this = $(this);
    $this.children(".controls").css("display", "flex");

});

$(".cell").on('mouseleave', function() {

    const $this = $(this);
    $this.children(".controls").css("display", "none");

});

$(".cell").on('click', function () {
    const $this = $(this);


    if(selectingStart){

        if($this.hasClass("end")){
            return;
        }
        
        $(".start").removeClass("start");
        $this.addClass("start");

        selectingStart = false;
        return;
    }

    if(selectingEnd){

        if($this.hasClass("start")){
            return;
        }
        
        $(".end").removeClass("end");
        $this.addClass("end");

        selectingEnd = false;
        return;
    }

});

$("#setstart").on('click', function () {
    if(selectingEnd){
        return;
    }

    selectingStart = true;
});

$("#setend").on('click', function () {
    if(selectingStart){
        return;
    }
    selectingEnd = true;
});

$("#findpath").on('click', function () {
    FindPath();
});

//event handler for clicks of adding the walls
function AddWallHandler(){

    if(selectingStart || selectingEnd){
        return;
    }

    const $this = $(this);
    const $cell = $this.parents(".cell");
    
    const row = parseInt($cell.attr("data-row"));
    const col = parseInt($cell.attr("data-col"));
    
    switch ($this.attr("data-side")) {
        case "N": 
            $cell.attr("data-nwall", true).css("border-top-color", "#000000");
            if(row > 0){
                $('.cell[data-row="' + (row - 1) + '"][data-col="' + col + '"]').attr("data-swall", true).css("border-bottom-color", "#000000");
            } 
            break;
        case "S": 
            $cell.attr("data-swall", true).css("border-bottom-color", "#000000"); 
            if(row < NUM_ROWS){
                $('.cell[data-row="' + (row + 1) + '"][data-col="' + col + '"]').attr("data-nwall", true).css("border-top-color", "#000000");
            } 
            break;
        case "E": 
            $cell.attr("data-ewall", true).css("border-right-color", "#000000");
            if(col < NUM_COLS){
                $('.cell[data-row="' + (row) + '"][data-col="' + (col + 1) + '"]').attr("data-wwall", true).css("border-left-color", "#000000");
            } 
            break;
        case "W": 
            $cell.attr("data-wwall", true).css("border-left-color", "#000000"); 
            if(col > 0){
                $('.cell[data-row="' + (row) + '"][data-col="' + (col - 1) + '"]').attr("data-ewall", true).css("border-right-color", "#000000");
            } 
            break;
    }
}

function FindPath(){
    //starting with : https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm

    const Cells = [];

    $(".cell").each(function (){
        if($(this).hasClass("start")) {
            Cells.push({"elem": $(this), "dist": 0});
            //alert($(this).attr("data-row") + " " + $(this).attr("data-col"))
        }else{
            Cells.push({elem: $(this), dist: 999999});
        }
    });

    Cells.sort(function(a, b) {return a.dist - b.dist;});

    //alert(Cells[0].elem.attr("data-row") + " " + Cells[0].elem.attr("data-col"))

}

