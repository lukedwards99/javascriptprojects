
const grid = document.getElementById("grid");

let squareRed = false;

for(let i = 0; i < 12; i++){

    const newRow = document.createElement('div');
    newRow.className = "row";
    newRow.setAttribute("data-rowindex", i); 
    grid.appendChild(newRow);

    for(let j = 0; j < 12; j++){
        const newSquare = document.createElement('div');
        newSquare.className = "col" + (squareRed ? " red" : " blue");
        squareRed = !squareRed;
        newSquare.setAttribute("data-colindex", j);
        newRow.appendChild(newSquare);    
    }
    squareRed = !squareRed;
}