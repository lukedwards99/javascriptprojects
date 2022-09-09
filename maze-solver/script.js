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
            $cell.attr("data-nwall", "true").css("border-top-color", "#000000");
            if(row > 0){
                $('.cell[data-row="' + (row - 1) + '"][data-col="' + col + '"]').attr("data-swall", "true").css("border-bottom-color", "#000000");
            } 
            break;
        case "S": 
            $cell.attr("data-swall", "true").css("border-bottom-color", "#000000"); 
            if(row < NUM_ROWS){
                $('.cell[data-row="' + (row + 1) + '"][data-col="' + col + '"]').attr("data-nwall", "true").css("border-top-color", "#000000");
            } 
            break;
        case "E": 
            $cell.attr("data-ewall", "true").css("border-right-color", "#000000");
            if(col < NUM_COLS){
                $('.cell[data-row="' + (row) + '"][data-col="' + (col + 1) + '"]').attr("data-wwall", "true").css("border-left-color", "#000000");
            } 
            break;
        case "W": 
            $cell.attr("data-wwall", "true").css("border-left-color", "#000000"); 
            if(col > 0){
                $('.cell[data-row="' + (row) + '"][data-col="' + (col - 1) + '"]').attr("data-ewall", "true").css("border-right-color", "#000000");
            } 
            break;
    }
}

function FindPath(){
    //starting with : https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm

    if($(".start").length == 0 || $(".end").length == 0){

        alert("Please select a starting and end point!!!");

    }

    $(".cell").attr("data-dist", Number.MAX_SAFE_INTEGER);
    $(".cell").attr("data-explored", "false");

    $(".start").attr("data-dist", "0"); //since start has no 

    
    while(true){ //get min paths
        const CurrCell = GetNextCell();
        if(CurrCell == null){
            break;
        }
        CurrCell.attr("data-explored", "true");

        const Neighbors = GetValidNeighbors(CurrCell);

        const distFromStart = parseInt(CurrCell.attr("data-dist")) + 1;

        Neighbors.forEach(function (elem) {
            if(parseInt(elem.attr("data-dist")) > distFromStart){
                elem.attr("data-dist", distFromStart.toString());
                elem.attr("data-pathtostart-col", CurrCell.attr("data-col"));
                elem.attr("data-pathtostart-row", CurrCell.attr("data-row"));
                elem.text(distFromStart.toString());
            }
        });

        //debugger;

    }

    if($(".end").attr("data-pathtostart-col") == null){
        alert("NO VALID PATH");
        return;
    }

    NavigateBackwards();
}

function NavigateBackwards(){

    let CurrCell = $(".end");

    while(CurrCell.hasClass("start") != true){
        CurrCell.css("background-color", "blue");
        CurrCell = GetCell(CurrCell.attr("data-pathtostart-row"), CurrCell.attr("data-pathtostart-col"));
    }

}

function GetNextCell(){
    let returnCell = null;
    let minDist = Number.MAX_SAFE_INTEGER;

    $('.cell').each(function () {
        if(parseInt($(this).attr("data-dist")) < minDist && $(this).attr("data-explored") === "false"){
            returnCell = $(this);
            minDist = parseInt(returnCell.attr("data-dist"));
        }
    });

    return returnCell;
}

function IsUnexploredCells(){

    $('.cell').each(function () {
        if($(this).attr("data-explored") === "false"){
            return false;
        }
    });
    
    return true;
}

function GetValidNeighbors(CurrCell) {
    const Neighbors = [];
    const row = parseInt(CurrCell.attr("data-row"));
    const col = parseInt(CurrCell.attr("data-col"));

    if(col > 0 && CurrCell.attr("data-wwall") != "true"){
        Neighbors.push(GetCell(row, col - 1));
    }
    if(col < NUM_COLS && CurrCell.attr("data-ewall") != "true"){
        Neighbors.push(GetCell(row, col + 1));
    }
    if(row > 0 && CurrCell.attr("data-nwall") != "true"){
        Neighbors.push(GetCell(row - 1, col));
    }
    if(row < NUM_ROWS && CurrCell.attr("data-swall") != "true"){
        Neighbors.push(GetCell(row + 1, col));
    }
    //debugger;
    Neighbors.filter(function (elem) { //remove explored elements
        //debugger;
        if(elem.attr("data-explored") === "true"){
            return false;
        }
    });

    return Neighbors;
}


function GetCell(row, col){

    return $('.cell[data-row="' + row + '"][data-col="' + col + '"]')
}