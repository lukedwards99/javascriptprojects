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
        const cell = $('<div></div>').addClass("cell").addClass("p-0").width(CELL_WIDTH).height(CELL_HEIGHT).attr("data-row", i).attr("data-col", j);
        row.append(cell);
        const controls = $("<div></div>").addClass('controls');
        //we use height for both width and hight so they stay clean circles
        //north
        controls.append($("<div></div>").height(cell.height() * .2).width(cell.height() * .2)
            .css('background-color', "#000000").css("border-radius", "50%").css("top", (CELL_HEIGHT * .1)).css("left", "40%")
            .addClass("control").attr("data-side", "N").on('click', AddWallHandler));
        //south
        controls.append($("<div></div>").height(cell.height() * .2).width(cell.height() * .2)
            .css('background-color', "#000000").css("border-radius", "50%").css("top", (CELL_HEIGHT * .7)).css("left", "40%")
            .addClass("control").attr("data-side", "S").on('click', AddWallHandler));
        //east
        controls.append($("<div></div>").height(cell.height() * .2).width(cell.height() * .2)
            .css('background-color', "#000000").css("border-radius", "50%").css("top", (CELL_HEIGHT * .4)).css("left", "70%")
            .addClass("control").attr("data-side", "E").on('click', AddWallHandler));
        //west
        controls.append($("<div></div>").height(cell.height() * .2).width(cell.height() * .2)
            .css('background-color', "#000000").css("border-radius", "50%").css("top", (CELL_HEIGHT * .4)).css("left", "10%")
            .addClass("control").attr("data-side", "W").on('click', AddWallHandler));

        controls.css("display", "none");
        cell.append(controls);
    }
}

$(".cell").on('mouseenter', function() {
    if(selectingEnd || selectingStart){
        return;
    }

    const $this = $(this);
    $this.children(".controls").css("display", "block");

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
        $("#setstart").addClass("btn-success").removeClass("btn-outline-success");

        return;
    }

    if(selectingEnd){

        if($this.hasClass("start")){
            return;
        }
        
        $(".end").removeClass("end");
        $this.addClass("end");

        selectingEnd = false;
        $("#setend").addClass("btn-danger").removeClass("btn-outline-danger");

        return;
    }
});

$("#setstart").on('click', function () {
    if(selectingEnd){
        return;
    }
    $(this).removeClass("btn-success").addClass("btn-outline-success");

    selectingStart = true;
});

$("#setend").on('click', function () {
    if(selectingStart){
        return;
    }
    $(this).removeClass("btn-danger").addClass("btn-outline-danger");

    selectingEnd = true;
});

$("#findpath").on('click', function () {
    $(".path").removeClass("path");
    $(".cell").removeAttr("data-pathtostart-col").removeAttr("data-pathtostart-row").removeAttr("data-dist");

    switch(parseInt($("#SearchAlgoSelect").val())){
        case 1: FindPathDijkstra(); break;
        case 2: FindPathBFS(); break;
        case 3: alert("Not Implemented."); break;
        case 4: alert("Not Implemented."); break;
        default: alert($("#SearchAlgoSelect").val()); return;
    }
});

$("#reset").on('click', function () {
    location.reload();
});

$("#genmaze").on('click', function () {

    switch($("#MazeGenAlgo").val().toString()){
        case "1": GenMazeDepthFirst(); break;
        case "2": GenMazeDepthFirst(true); break;
        case "3": alert("Not Implemented."); break;
    }
});

function SetAllUnexplored(){
    $(".cell").attr("data-explored", "false");
}

function FindPathBFS(){
    //SetAllWalls();
    if($(".start").length == 0 || $(".end").length == 0){
        alert("Please select a starting and end point!!!");
        return;
    }

    SetAllUnexplored();

    const queue = [];

    const StartCell = $(".start");
    SetExplored(StartCell);

    queue.push(StartCell);
    //debugger;

    while(queue.length > 0){

        const CurrCell = queue.shift();
        SetExplored(CurrCell);

        if(CurrCell.hasClass("end")){
            NavigateBack();
            return;
        }

        // $(".exploring").removeClass("exploring");
        // CurrCell.addClass("exploring");
        // debugger;

        const Neighbors = GetValidNeighbors(CurrCell);
        Neighbors.forEach(function (neihbor){
            SetExplored(neihbor);
            neihbor.attr("data-pathtostart-col", CurrCell.attr("data-col"));
            neihbor.attr("data-pathtostart-row", CurrCell.attr("data-row"));
            queue.push(neihbor);
            //debugger;
        });
    }

    alert("NO VALID PATH");
}

function NavigateBack(){
    let CurrCell = $(".end");
    
    while(CurrCell.hasClass("start") != true){
        if(CurrCell.hasClass("end") == false){
            CurrCell.addClass("path");
        }
        
        CurrCell = GetCell(CurrCell.attr("data-pathtostart-row"), CurrCell.attr("data-pathtostart-col"));
    }
}

function SetExplored(cell){
    cell.attr("data-explored", "true");
}

function SetAllWalls(){
    $(".cell").attr("data-nwall", "true").css("border-top-color", "#000000")
                .attr("data-swall", "true").css("border-bottom-color", "#000000")
                .attr("data-ewall", "true").css("border-right-color", "#000000")
                .attr("data-wwall", "true").css("border-left-color", "#000000")
                .attr("data-explored", "false");
}

function GenMazeDepthFirst(horizontalBias){

    //using https://en.wikipedia.org/wiki/Maze_generation_algorithm

    //reset maze
    SetAllWalls();
    
    const Stack = [];

    const StartCell = GetCell(Math.floor(Math.random() * NUM_ROWS), Math.floor(Math.random() * NUM_COLS))
    StartCell.attr("data-explored", "true");
    Stack.push(StartCell);// starting cell

    const GeneratingMaze = setInterval(function (){
        if(Stack.length <= 0){
            clearInterval(GeneratingMaze);
            $(".selected").removeClass("selected");
            return;
        }

        const CurrCell = Stack.pop();
        $(".selected").removeClass("selected");
        CurrCell.addClass("selected");

        if(CellHasUnvistedNeighbors(CurrCell)){
            Stack.push(CurrCell);
            const NextCell = ChooseNeighbor(CurrCell);
            RemoveWall(CurrCell, NextCell);
            NextCell.attr("data-explored", "true");
            Stack.push(NextCell);
        }

    }, 50);

    function RemoveWall(alpha, beta){ //DOES NOT CHECK IF CELLS ARE NEIGHBORS

        const alphaRow = GetRow(alpha);
        const alphaCol = GetCol(alpha);
        const betaRow = GetRow(beta);
        const betaCol = GetCol(beta);

        if(alphaRow < betaRow) { 
            alpha.attr("data-swall", "false").css("border-bottom-color", "#a9a9a9");
            beta.attr("data-nwall", "false").css("border-top-color", "#a9a9a9");
        } else if (alphaRow > betaRow) {
            alpha.attr("data-nwall", "false").css("border-top-color", "#a9a9a9");
            beta.attr("data-swall", "false").css("border-bottom-color", "#a9a9a9");
        } else if (alphaCol < betaCol) {
            alpha.attr("data-ewall", "false").css("border-right-color", "#a9a9a9");
            beta.attr("data-wwall", "false").css("border-left-color", "#a9a9a9");
        } else if (alphaCol > betaCol) {
            alpha.attr("data-wwall", "false").css("border-left-color", "#a9a9a9");
            beta.attr("data-ewall", "false").css("border-right-color", "#a9a9a9");
        }
    }


    //local functions for gen maze
    function CellHasUnvistedNeighbors(CurrCell){
        const row = parseInt(CurrCell.attr("data-row"));
        const col = parseInt(CurrCell.attr("data-col"));

        if(col > 0 && GetCell(row, col - 1).attr("data-explored") === "false"){
            return true;
        }
        if(col < NUM_COLS && GetCell(row, col + 1).attr("data-explored") === "false"){
            return true;
        }
        if(row > 0 && GetCell(row - 1, col).attr("data-explored") === "false"){
            return true;
        }
        if(row < NUM_ROWS && GetCell(row + 1, col).attr("data-explored") === "false"){
            return true;
        }

        return false;
    }

    function ChooseNeighbor(CurrCell){
        if(CellHasUnvistedNeighbors(CurrCell) == false){
            alert("CANT FIND NEIGHBOR WITH ALL VISITED CELLS");
        }
        const Neighbors = [];
        const row = parseInt(CurrCell.attr("data-row"));
        const col = parseInt(CurrCell.attr("data-col"));

        if(col > 0 && GetCell(row, col - 1).attr("data-explored") === "false"){
            Neighbors.push(GetCell(row, col - 1));
        }
        if(col < NUM_COLS && GetCell(row, col + 1).attr("data-explored") === "false"){
            Neighbors.push(GetCell(row, col + 1));
        }
        if(row > 0 && GetCell(row - 1, col).attr("data-explored") === "false"){
            Neighbors.push(GetCell(row - 1, col));
        }
        if(row < NUM_ROWS && GetCell(row + 1, col).attr("data-explored") === "false"){
            Neighbors.push(GetCell(row + 1, col));
        }

        let returnVal;// = Neighbors[Math.floor(Math.random() * Neighbors.length)];

        if(horizontalBias === true){
            const _newReturnVal = []

            Neighbors.forEach(function (elem) {
                //debugger;
                if(GetRow(elem) == GetRow(CurrCell)){
                    _newReturnVal.push(elem);
                }
            });

            if(_newReturnVal.length != 0 && Math.random() < 1/NUM_COLS){ //one in num col chance that it will still allow another row. 
                returnVal = _newReturnVal[Math.floor(Math.random() * _newReturnVal.length)];
            }else{
                returnVal = Neighbors[Math.floor(Math.random() * Neighbors.length)];
            }

        }else{
            returnVal = Neighbors[Math.floor(Math.random() * Neighbors.length)];
        }

        return returnVal;
    }

}

function GetRow(cell){
    try{
        return parseInt(cell.attr("data-row"));
    }catch(e){
        console.error(e.toString());
        debugger;
    }
}

function GetCol(cell){
    try{
        return parseInt(cell.attr("data-col"));
    }catch(e){
        console.error(e.toString());
        debugger;
    }
}

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
            if($cell.attr("data-nwall") !== "true"){
                $cell.attr("data-nwall", "true").css("border-top-color", "#000000");
                if(row > 0){
                    $('.cell[data-row="' + (row - 1) + '"][data-col="' + col + '"]').attr("data-swall", "true").css("border-bottom-color", "#000000");
                } 
            }else{
                $cell.attr("data-nwall", "false").css("border-top-color", "#a9a9a9");
                if(row > 0){
                    $('.cell[data-row="' + (row - 1) + '"][data-col="' + col + '"]').attr("data-swall", "false").css("border-bottom-color", "#a9a9a9");
                } 
            }
            break;
        case "S": 
            if($cell.attr("data-swall") !== "true"){
                $cell.attr("data-swall", "true").css("border-bottom-color", "#000000"); 
                if(row < NUM_ROWS){
                    $('.cell[data-row="' + (row + 1) + '"][data-col="' + col + '"]').attr("data-nwall", "true").css("border-top-color", "#000000");
                } 
            }else{
                $cell.attr("data-swall", "false").css("border-bottom-color", "#a9a9a9");
                if(row < NUM_ROWS){
                    $('.cell[data-row="' + (row + 1) + '"][data-col="' + col + '"]').attr("data-nwall", "false").css("border-top-color", "#a9a9a9");
                } 
            }
            break;
        case "E": 
            if($cell.attr("data-ewall") !== "true"){
                $cell.attr("data-ewall", "true").css("border-right-color", "#000000");
                if(col < NUM_COLS){
                    $('.cell[data-row="' + (row) + '"][data-col="' + (col + 1) + '"]').attr("data-wwall", "true").css("border-left-color", "#000000");
                }
            }else{
                $cell.attr("data-ewall", "false").css("border-right-color", "#a9a9a9");
                if(col < NUM_COLS){
                    $('.cell[data-row="' + (row) + '"][data-col="' + (col + 1) + '"]').attr("data-wwall", "false").css("border-left-color", "#a9a9a9");
                } 
            }
            break;
        case "W": 
            if($cell.attr("data-wwall") !== "true"){
                $cell.attr("data-wwall", "true").css("border-left-color", "#000000"); 
                if(col > 0){
                    $('.cell[data-row="' + (row) + '"][data-col="' + (col - 1) + '"]').attr("data-ewall", "true").css("border-right-color", "#000000");
                } 
            }else{
                $cell.attr("data-wwall", "false").css("border-left-color", "#a9a9a9");
                if(col > 0){
                    $('.cell[data-row="' + (row) + '"][data-col="' + (col - 1) + '"]').attr("data-ewall", "false").css("border-right-color", "#a9a9a9");
                } 
            }
            break;
    }
}

function FindPathDijkstra(){
    //https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm

    if($(".start").length == 0 || $(".end").length == 0){
        alert("Please select a starting and end point!!!");
        return;
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
                //elem.html(distFromStart.toString());
            }
        });
    }

    if($(".end").attr("data-pathtostart-col") == null){
        alert("NO VALID PATH");
        return;
    }

    NavigateBackwardsDijkstra();

    function NavigateBackwardsDijkstra(){

        let CurrCell = $(".end");
    
        while(CurrCell.hasClass("start") != true){
            if(CurrCell.hasClass("end") == false){
                CurrCell.addClass("path");
            }
            
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
    
    //not sure why this didnt work
    // Neighbors.filter(function (elem) { //remove explored elements
    //     //debugger;
    //     if(elem.attr("data-explored") == "true"){
    //         alert(elem.attr("data-explored"));
    //         debugger;
    //         return false;
    //     }
    //     return true;
    // });


    //filter out explored elements
    const _Neighbors = []
    Neighbors.forEach(function (elem) {
        if(elem.attr("data-explored") != "true"){
            _Neighbors.push(elem);
        }
    })

    return _Neighbors;
}


function GetCell(row, col){
    if(col === null){
        col = Math.floor(Math.random() * NUM_COLS);
    }
    if(row === null){
        row = Math.floor(Math.random() * NUM_ROWS);
    }

    return $('.cell[data-row="' + row + '"][data-col="' + col + '"]')
}