// $(function (){

//     alert("ready");
// });

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
        const cell = $('<div></div>').addClass("cell").width(CELL_WIDTH).height(CELL_HEIGHT);
        row.append(cell);
    }
}

alert("done");