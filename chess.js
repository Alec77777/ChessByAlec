const board = document.querySelectorAll(".board")[0];
const arrColumnLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

// Take note: array indeces are from 0 to 7 bottom-left to top-right;
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
    }
}

function changeLightSquareColor() {
    var cl = document.getElementById("lightSquareColor").value;
    document.querySelectorAll('[data-light-square]').forEach(e => e.style.background = cl);
}

function changeDarkSquareColor() {
    var cl = document.getElementById("darkSquareColor").value;
    document.querySelectorAll('[data-dark-square]').forEach(e => e.style.background = cl);
}

function setBoard(board) {
    //arrBoard Example:
    // 8 [0r][0n][0b][0q][0k][0b][0n][0r]
    // 7 [0p][0p][0p][0p][0p][0p][0p][0p]
    // 6 [  ][  ][  ][  ][  ][  ][  ][  ]
    // 5 [  ][  ][  ][  ][  ][  ][  ][  ]
    // 4 [  ][  ][  ][  ][  ][  ][  ][  ]
    // 3 [  ][  ][  ][  ][  ][  ][  ][  ]
    // 2 [1p][1p][1p][1p][1p][1p][1p][1p]
    // 1 [1r][1n][1b][1q][1k][1b][1n][1r]
    //    A   B   C   D   E   F   G   H

    for (let k = 1-1; k <= 8-1; k++) {
        for (let j = 1-1; j <= 8-1; j++) {
            var piece = board[k][j];

            if (piece) {
                let pieceImg = document.createElement('img');
                pieceImg.classList.add('piece');
                pieceImg.setAttribute('data-piece', `${piece}`);
                pieceImg.setAttribute('src', `images/${piece}.png`);
                pieceImg.setAttribute('draggable', `true`);
                pieceImg.style.width = '100%';
                pieceImg.style.height = '100%';
                let square = document.getElementById(`square-${arrColumnLetters[j]}${k+1}`);
                square.appendChild(pieceImg);
            }
        }
    }
}

var arrBoard = [['1r', '1n', '1b', '1q', '1k', '1b', '1n', '1r'], ['1p', '1p', '1p', '1p', '1p', '1p', '1p', '1p'], [], [], [], [], ['0p', '0p', '0p', '0p', '0p', '0p', '0p', '0p'], ['0r', '0n', '0b', '0q', '0k', '0b', '0n', '0r']];
setBoard(arrBoard);

document.querySelectorAll('.piece').forEach(piece => {
    var startSquare;

    piece.addEventListener('dragstart', e => {
        startSquare = document.elementsFromPoint(e.clientX, e.clientY)[1]; // first parent of img is square
    })

    piece.addEventListener('dragend', e => {
        let endObject = document.elementsFromPoint(e.clientX, e.clientY)[0]; // endObject is the object where the piece is placed
        let endObjectParent = document.elementsFromPoint(e.clientX, e.clientY)[1]; // endObjectParent is the parent of the object where the piece is placed
        
        if (endObject.classList.contains('square')){
            endObject.appendChild(piece);
        } else if (endObject.dataset.piece[0] !== piece.dataset.piece[0]) {
            //if.. end and start pieces are not of the same colour
            console.log(endObject);
            endObjectParent.removeChild(endObject);
            endObjectParent.appendChild(piece);
        }
    })
});

// function movePiece (Xcoord, Ycoord, piece){

// }