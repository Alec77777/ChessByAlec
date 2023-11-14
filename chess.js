const board = document.querySelectorAll(".board")[0];

const arrBoard = [Array(8), Array(8), Array(8), Array(8), Array(8), Array(8), Array(8), Array(8)];

const arrPieces = ['p', 'r', 'n', 'b', 'q', 'k'];
const arrColumnLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

// Take note: array indeces are from 0 to 7 top-left to bottom-right;
// 8 [][][][][][][][]
// 7 [][][][][][][][]
// 6 [][][][][][][][]
// 5 [][][][][][][][]
// 4 [][][][][][][][]
// 3 [][][][][][][][]
// 2 [][][][][][][][]
// 1 [][][][][][][][]
//   A B C D E F G H

for (let k = 8; k >= 1; k--) {
    for (let j = 1; j <= 8; j++) {
        let square = document.createElement("div");
        let squareCoordinates = arrColumnLetters[j - 1] + k;

        if (((k % 2 === 1) && (j % 2 === 1)) || ((k % 2 === 0) && (j % 2 === 0))) {//If the square is located in even-even / odd-odd column and row numbers then it is light
            square.setAttribute('data-light-square', '');
        } else {
            if (((k % 2 === 1) && (j % 2 === 0)) || ((k % 2 === 0) && (j % 2 === 1))) {//If the square is located in even-odd / odd-even column and row numbers then it is dark
                square.setAttribute('data-dark-square', '');
            }
        }

        square.setAttribute("id", `square-${squareCoordinates}`);
        square.setAttribute("data-coordinate", squareCoordinates);
        square.classList.add("square");
        board.appendChild(square);

        // console.log(squareCoordinates);
    }
}
console.dir(arrBoard);

function changeSquareColor() {
    var cl = document.getElementById("squareColor").value;
    document.querySelectorAll('[data-light-square]').forEach(e => e.style.background = cl);
}

function setBoard(fenString) {
    //fenString Example (space is next square and # is next row): 
    // 0r 0n 0b 0k 0q 0b 0n 0r#0p 0p 0p 0p 0p 0p 0p 0p#####1p 1p 1p 1p 1p 1p 1p 1p#1r 1n 1b 1k 1q 1b 1n 1r 

    let posHash = fenString.indexOf('#');;
    let k = 8;

    while ((fenString.length !== 0) && (k !== 0)) {

        console.log(fenString);
        row = fenString.slice(0, posHash);
        fenString = fenString.slice(posHash + 1, fenString.length);
        console.log(row, fenString);

        let posSpace = row.indexOf(' ');
        let j = 1;


        while (row.length !== 0) {
            console.log(row);
            piece = row.slice(0, posSpace);
            row = row.slice(posSpace + 1, row.length);
            console.log(posSpace, piece, row);

            pieceImage = document.createElement('img');
            pieceImage.setAttribute('src', `images/${piece}.png`);
            pieceImage.setAttribute('data-piece', `${piece}`);
            pieceImage.classList.add('piece');
            document.getElementById(`square-${arrColumnLetters[j - 1]}${k}`).appendChild(pieceImage);
            arrBoard[k - 1][j - 1] = `${piece}`;
            console.log(arrBoard);

            j++;
            posSpace = row.indexOf(' ');
        }

        k--;
        posHash = fenString.indexOf('#');
    }
}

setBoard('0r 0n 0b 0k 0q 0b 0n 0r #0p 0p 0p 0p 0p 0p 0p 0p #####1p 1p 1p 1p 1p 1p 1p 1p #1r 1n 1b 1k 1q 1b 1n 1r #');