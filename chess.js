const board = document.querySelectorAll(".board")[0];
const arrColumnLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];

// note: array indeces are from 0 to 7 bottom-left to top-right;
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

    if ((k % 2 === 1 && j % 2 === 1) || (k % 2 === 0 && j % 2 === 0)) {
      //If the square is located in even-even / odd-odd column and row numbers then it is light
      square.setAttribute("data-light-square", "");
    } else {
      if ((k % 2 === 1 && j % 2 === 0) || (k % 2 === 0 && j % 2 === 1)) {
        //If the square is located in even-odd / odd-even column and row numbers then it is dark
        square.setAttribute("data-dark-square", "");
      }
    }

    square.setAttribute("id", `square-${squareCoordinates}`);
    square.setAttribute("data-coordinates", squareCoordinates);
    square.classList.add("square");
    board.appendChild(square);
  }
}

function changeLightSquareColor() {
  var cl = document.getElementById("lightSquareColor").value;
  document
    .querySelectorAll("[data-light-square]")
    .forEach((e) => (e.style.background = cl));
}

function changeDarkSquareColor() {
  var cl = document.getElementById("darkSquareColor").value;
  document
    .querySelectorAll("[data-dark-square]")
    .forEach((e) => (e.style.background = cl));
}

function changePieceStyle(pieceStyleNumber) {
  for (let k = 0; k <= 7; k++) {
    for (let j = 0; j <= 7; j++) {
      let square = document.getElementById(
        `square-${arrColumnLetters[j]}${k + 1}`
      );
      let piece = square.children[0];

      if (piece) {
        let pieceType = piece.dataset.piece;
        piece.setAttribute("src", `images/${pieceType}${pieceStyleNumber}.png`);
      }
    }
  }
}

function clearBoard(board) {
  board = new Array(
    Array(),
    Array(),
    Array(),
    Array(),
    Array(),
    Array(),
    Array(),
    Array()
  );
  setBoard(board, 1);
}

function setBoard(board, pieceStyleNumber) {
  //* arrBoard Example:
  // 8 [0r][0n][0b][0q][0k][0b][0n][0r]
  // 7 [0p][0p][0p][0p][0p][0p][0p][0p]
  // 6 [  ][  ][  ][  ][  ][  ][  ][  ]
  // 5 [  ][  ][  ][  ][  ][  ][  ][  ]
  // 4 [  ][  ][  ][  ][  ][  ][  ][  ]
  // 3 [  ][  ][  ][  ][  ][  ][  ][  ]
  // 2 [1p][1p][1p][1p][1p][1p][1p][1p]
  // 1 [1r][1n][1b][1q][1k][1b][1n][1r]
  //    A   B   C   D   E   F   G   H

  for (let k = 0; k <= 7; k++) {
    for (let j = 0; j <= 7; j++) {
      var piece = board[k][j];

      if (piece) {
        let pieceImg = document.createElement("img");
        pieceImg.classList.add("piece");
        pieceImg.setAttribute("data-piece", `${piece}`);
        pieceImg.setAttribute("src", `images/${piece + pieceStyleNumber}.png`);
        pieceImg.setAttribute("draggable", `true`);
        pieceImg.style.width = "100%";
        pieceImg.style.height = "100%";

        if (piece[0] === "1") {
          //piece is white
          pieceImg.classList.add("active");
        }

        let square = document.getElementById(
          `square-${arrColumnLetters[j]}${k + 1}`
        );
        square.appendChild(pieceImg);
      }
    }
  }
}

var arrBoard = [
  ["1r", "1n", "1b", "1q", "1k", "1b", "1n", "1r"],
  ["1p", "1p", "1p", "1p", "1p", "1p", "1p", "1p"],
  ["", "", "", "0n"],
  [],
  [],
  [],
  ["0p", "0p", "0p", "0p", "0p", "0p", "0p", "0p"],
  ["0r", "0n", "0b", "0q", "0k", "0b", "0n", "0r"],
];

setBoard(arrBoard, 1); // Default pieces

document.querySelectorAll(".piece").forEach((piece) => {
  var startCoordinates, endCoordinates;

  piece.addEventListener("dragstart", (e) => {
    let startSquare = document.elementsFromPoint(e.clientX, e.clientY)[1]; // first parent of img is square
    startSquare.style.background = "yellow";
    startCoordinates = startSquare.dataset.coordinates;
  });

  piece.addEventListener("dragend", (e) => {
    let endObject = document.elementsFromPoint(e.clientX, e.clientY)[0]; // endObject is the object where the piece is placed
    let endObjectParent = document.elementsFromPoint(e.clientX, e.clientY)[1]; // endObjectParent is the parent of the object where the piece is placed

    if (!endObject.classList.contains("square")) {
      // endObject is another piece
      //if.. end and start pieces are not of the same colour
      //*   console.log(endObjectParent);
      endObject = endObjectParent;
    }

    endCoordinates = endObject.dataset.coordinates;

    if (moveIsValid(piece.dataset.piece, startCoordinates, endCoordinates)) {
      console.log("move is valid");
      document.body.style.background = "green";
      document.getElementById(`pieceAudio`).play();

      if (endObject.children[0]) {
        endObject.removeChild(endObject.children[0]);
      }

      endObject.appendChild(piece);
    } else {
      console.log("move is invalid");
      document.body.style.background = "red";
    }
  });
});

function moveIsValid(piece, startCoordinates, endCoordinates) {
  console.log(piece, startCoordinates, endCoordinates);

  //? explain
  if (endCoordinates !== undefined) {
    var moveIsValid = false;
    var arrValidMoves = new Array();
    let xDiff =
        arrColumnLetters.indexOf(endCoordinates[0]) -
        arrColumnLetters.indexOf(startCoordinates[0]),
      yDiff = endCoordinates[1] - startCoordinates[1]; // the x and y differences from the starting coordinates to the ending coordinates
    let startSquare = document.querySelector(`#${startCoordinates}`);
    console.log(xDiff, yDiff);

    //* check if move is valid based solely on the piece and the way the piece moves
    switch (piece[1]) {
      case "k":
        if (xDiff < 2 && xDiff > -2 && yDiff < 2 && yDiff > -2) {
          moveIsValid = true;
          arrValidMoves;
        } else {
          moveIsValid = false;
        }
        break;

      case "q":
        if (Math.abs(xDiff) == Math.abs(yDiff) || xDiff === 0 || yDiff === 0) {
          moveIsValid = true;
        } else {
          moveIsValid = false;
        }
        break;

      case "r":
        if (xDiff === 0 || yDiff === 0) {
          moveIsValid = true;
        } else {
          moveIsValid = false;
        }
        break;

      case "b":
        if (Math.abs(xDiff) == Math.abs(yDiff)) {
          moveIsValid = true;
        } else {
          moveIsValid = false;
        }
        break;

      case "n":
        if (
          (Math.abs(xDiff) === 2 && Math.abs(yDiff) === 1) ||
          (Math.abs(xDiff) === 1 && Math.abs(yDiff) === 2)
        ) {
          moveIsValid = true;
        } else {
          moveIsValid = false;
        }
        break;

      case "p":
        if (
          (Math.abs(yDiff) === 1 && xDiff === 0) ||
          (Math.abs(yDiff) === 2 &&
            xDiff === 0 &&
            startCoordinates[1] === "2" &&
            piece[0] === "1") ||
          (Math.abs(yDiff) === 2 &&
            xDiff === 0 &&
            startCoordinates[1] === "7" &&
            piece[0] === "0")
        ) {
          moveIsValid = true;
        } else {
          console.log(xDiff, startCoordinates, piece);
          moveIsValid = false;
        }
        break;
    }

    //* check if move is valid relative to other pieces

    let endSquare = document.querySelector(`#square-${endCoordinates}`);

    if (
      moveIsValid &&
      (endSquare.children[0] === undefined ||
        endSquare.children[0].dataset.piece[0] !== piece[0])
    ) {
      moveIsValid = true;
    } else {
      moveIsValid = false;
      //* console.log(endSquare.children[0]);
    }

    //* check if there are pieces in the way of the movement of the piece
    const arrMoveLine = new Array();

    for (let k = 0; k <= endCoordinates[0]; k++) {}

    if (
      moveIsValid &&
      (piece[1] === "q" ||
        piece[1] === "r" ||
        piece[1] === "b" ||
        piece[1] === "p")
    ) {
    }

    return moveIsValid;
  } else {
    return false;
  }
}

//* function toggleActivePieces(activePieceColour) {
//*   for (let k = 0; k <= 7; k++) {
//*     for (let j = 0; j <= 7; j++) {
//*       let square = document.getElementById(
//*         `square-${arrColumnLetters[j]}${k + 1}`
//*       );

//*       let piece = square.children[0];

//*       if (piece && piece.dataset.piece[0] === activePieceColour) {
//*         piece.classList.remove("active");
//*         console.log(piece);
//*       } else if (piece && piece.dataset.piece[0] !== activePieceColour) {
//*         piece.classList.add("active");
//*         console.log(piece);
//*       }
//*     }
//*   }
//* }

// function movePiece(Xcoord, Ycoord, piece) {}

// var movesCount = 0; //This variable will hold a move number (eg: move 1 has been made, move 2 has been made etc)
