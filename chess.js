"strict mode";
const board = document.querySelectorAll(".board")[0];
const arrColumnLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
let activePlayer = "1"; //activePlayer is white
let arrValidMoves;
let lastMove = "##-##"; //Format: startCoordinates-endCoordinates
let globPieceStyleNumber = 2;
let playerInCheck = ""; // empty string if no player is in check, 0 if black is in check and 1 if white is in check;

//?  document.getElementById(`square-${startX}${startY}`)

//note: throughout the whole program 0 is used for black pieces and 1 is used for white pieces
//note: throughout the whole program coordinates is calculated to correspond to the array and not to the actual board ie. The left white rook on A1 has coordinates of (0; 0) {this will be displayed as 00 in the format xy even though arrays work with a yx format}

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
    let squareCoordinates = String(j - 1) + String(k - 1); // -1 so the coordinates of the squares corresponds to the array indeces
    // console.log(`(${squareCoordinates[0]}, ${squareCoordinates[1]})`);

    if ((k % 2 === 1 && j % 2 === 1) || (k % 2 === 0 && j % 2 === 0)) {
      //If the square is located in even-even / odd-odd column and row numbers then it is light
      square.setAttribute("data-square-color", "dark");
    } else {
      if ((k % 2 === 1 && j % 2 === 0) || (k % 2 === 0 && j % 2 === 1)) {
        //If the square is located in even-odd / odd-even column and row numbers then it is dark
        square.setAttribute("data-square-color", "light");
      }
    }

    square.setAttribute("id", `square-${squareCoordinates}`);
    square.setAttribute("data-coordinates", squareCoordinates);
    square.classList.add("square");
    board.appendChild(square);
  }
}

function changeLightSquareColor() {
  let color = document.getElementById("lightSquareColor").value;
  document
    .querySelectorAll("[data-square-color = 'light']")
    .forEach((e) => (e.style.background = color));
}

function changeDarkSquareColor() {
  let color = document.getElementById("darkSquareColor").value;
  document
    .querySelectorAll("[data-square-color = 'dark']")
    .forEach((e) => (e.style.background = color));
}

function changePieceStyle(pieceStyleNumber) {
  //change Global variable
  globPieceStyleNumber = pieceStyleNumber;

  for (let k = 0; k <= 7; k++) {
    for (let j = 0; j <= 7; j++) {
      let square = document.getElementById(`square-${j}${k}`);
      let piece = square.children[0];
      if (piece) {
        let pieceType = piece.dataset.piece;
        piece.setAttribute("src", `images/${pieceType}${pieceStyleNumber}.png`);
      }
    }
  }
}

//note set the board with all the pieces according to the 2d array and to the correct piece images (piece images are based on the pieceStyleNumber)
function displayBoard(board, pieceStyleNumber) {
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
      let piece = board[k][j];

      if (piece) {
        let pieceImg = document.createElement("img");
        pieceImg.classList.add("piece");
        pieceImg.setAttribute("data-piece", `${piece}`);
        pieceImg.setAttribute("src", `images/${piece + pieceStyleNumber}.png`);
        pieceImg.setAttribute("draggable", `true`);
        pieceImg.style.width = "100%";
        pieceImg.style.height = "100%";

        let square = document.getElementById(`square-${j}${k}`);
        square.appendChild(pieceImg);
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
  displayBoard(board, pieceStyleNumber);
}

function initArrValidMoves() {
  arrValidMoves = new Array(8);

  for (let k = 0; k < 8; k++) {
    arrValidMoves[k] = new Array(8);

    for (let j = 0; j < 8; j++) {
      arrValidMoves[k][j] = [];
    }
  }
}

function squareIsInBounds(X, Y) {
  return X >= 0 && X <= 7 && Y >= 0 && Y <= 7;
}

function checkDirectionsForObstruction(startX, startY, ...arr) {
  let i, endSquare;

  //* horizontally and vertically

  // top
  if (arr.includes(1)) {
    i = startY + 1;

    if (squareIsInBounds(startX, i)) {
      endSquare = document.getElementById(`square-${startX}${i}`);

      while (i <= 7 && !endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${startX}${i}`);

        i++;
        endSquare = document.getElementById(`square-${startX}${i}`);
      }

      if (endSquare && endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${startX}${i}`);
      }
    }
  }

  // right
  if (arr.includes(2)) {
    i = startX + 1;

    if (squareIsInBounds(i, startY)) {
      endSquare = document.getElementById(`square-${i}${startY}`);

      while (i <= 7 && !endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${i}${startY}`);

        i++;
        endSquare = document.getElementById(`square-${i}${startY}`);
      }

      if (endSquare && endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${i}${startY}`);
      }
    }
  }

  // bottom
  if (arr.includes(3)) {
    i = startY - 1;

    if (squareIsInBounds(startX, i)) {
      endSquare = document.getElementById(`square-${startX}${i}`);

      while (i >= 0 && !endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${startX}${i}`);

        i--;
        endSquare = document.getElementById(`square-${startX}${i}`);
      }

      if (endSquare && endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${startX}${i}`);
      }
    }
  }

  // left
  if (arr.includes(4)) {
    i = startX - 1;

    if (squareIsInBounds(i, startY)) {
      endSquare = document.getElementById(`square-${i}${startY}`);

      while (i >= 0 && !endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${i}${startY}`);

        i--;
        endSquare = document.getElementById(`square-${i}${startY}`);
      }

      if (endSquare && endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${i}${startY}`);
      }
    }
  }

  //* diagonals

  let h;

  // top-right

  if (arr.includes(5)) {
    i = startX + 1;
    h = startY + 1;

    if (squareIsInBounds(i, h)) {
      endSquare = document.getElementById(`square-${i}${h}`);

      while (i <= 7 && h <= 7 && !endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${i}${h}`);

        i++;
        h++;
        endSquare = document.getElementById(`square-${i}${h}`);
      }

      if (endSquare && endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${i}${h}`);
      }
    }
  }

  // bottom-right

  if (arr.includes(6)) {
    i = startX + 1;
    h = startY - 1;

    if (squareIsInBounds(i, h)) {
      endSquare = document.getElementById(`square-${i}${h}`);

      while (i <= 7 && h >= 0 && !endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${i}${h}`);

        i++;
        h--;
        endSquare = document.getElementById(`square-${i}${h}`);
      }

      if (endSquare && endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${i}${h}`);
      }
    }
  }

  // bottom-left

  if (arr.includes(7)) {
    i = startX - 1;
    h = startY - 1;

    if (squareIsInBounds(i, h)) {
      endSquare = document.getElementById(`square-${i}${h}`);

      while (i >= 0 && h >= 0 && !endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${i}${h}`);

        i--;
        h--;
        endSquare = document.getElementById(`square-${i}${h}`);
      }

      if (endSquare && endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${i}${h}`);
      }
    }
  }

  // top-left

  if (arr.includes(8)) {
    i = startX - 1;
    h = startY + 1;

    if (squareIsInBounds(i, h)) {
      endSquare = document.getElementById(`square-${i}${h}`);

      while (i >= 0 && h <= 7 && !endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${i}${h}`);

        i--;
        h++;
        endSquare = document.getElementById(`square-${i}${h}`);
      }

      if (endSquare && endSquare.children[0]) {
        arrValidMoves[startY][startX].push(`${i}${h}`);
      }
    }
  }
}

function getArrValidMoves($2dBoard) {
  //loop through the board and get the valid moves for every single piece on the board
  for (let k = 0; k < $2dBoard.length; k++) {
    for (let j = 0; j < $2dBoard[k].length; j++) {
      let piece = $2dBoard[k][j]; //string
      //x and y coordinates according to the array. (not the board coordinates);

      // obstructionIsPresent are only for sliding pieces (Rooks, Bishops and Queens)
      // coordinates is in the format (x,y)
      // let startCoordinates = `${j}${k}`;
      let startX = j;
      let startY = k;
      let endX, endY;

      // piece is on startCoordinates

      switch (piece[1]) {
        case "k":
          for (let i = startY - 1; i <= startY + 1; i++) {
            for (let h = startX - 1; h <= startX + 1; h++) {
              if (
                !(i === startY && h === startX) && // same square as starting square
                squareIsInBounds(h, i)
              ) {
                arrValidMoves[startY][startX].push(`${h}${i}`);
              }
            }
          }
          break;

        //sliding pieces
        case "q":
          checkDirectionsForObstruction(startX, startY, 1, 2, 3, 4, 5, 6, 7, 8);

          break;
        case "r":
          checkDirectionsForObstruction(startX, startY, 1, 2, 3, 4);

          break;
        case "b":
          checkDirectionsForObstruction(startX, startY, 5, 6, 7, 8);

          break;

        //knight and pawn
        case "n":
          for (let i = 1; i <= 4; i++) {
            for (let h = 1; h <= 2; h++) {
              let temp;

              if (i % 2 === 0) {
                temp = h - 3;
              } else {
                temp = 3 - h;
              }

              endX;
              endY;

              if (i <= 2) {
                // first 2 iterations of i
                endX = startX + h;
                endY = startY + temp;
              } else {
                // second 2 iterations of i
                endX = startX - h;
                endY = startY + temp;
              }

              if (squareIsInBounds(endX, endY))
                arrValidMoves[startY][startX].push(`${endX}${endY}`);
            }
          }

          break;
        case "p":
          if (piece[0] === "0") {
            //black pawns

            for (let i = -1; i <= 1; i++) {
              endX = startX + i;
              endY = startY - 1;

              if (i !== 0) {
                //if endSquare is not in front of the pawn (the pawn can take)
                if (squareIsInBounds(endX, endY)) {
                  let endSquare = document.getElementById(
                    `square-${endX}${endY}`
                  );

                  if (
                    endSquare.children[0] &&
                    endSquare.children[0].dataset.piece[0] !== piece[0]
                  ) {
                    arrValidMoves[startY][startX].push(`${endX}${endY}`);
                  }
                }
              } else {
                // endSquare is in front of the pawn

                if (squareIsInBounds(endX, endY)) {
                  let endSquare = document.getElementById(
                    `square-${endX}${endY}`
                  );

                  if (!endSquare.children[0]) {
                    arrValidMoves[startY][startX].push(`${endX}${endY}`);

                    if (startY === 6) {
                      endY--;

                      endSquare = document.getElementById(
                        `square-${endX}${endY}`
                      );

                      if (!endSquare.children[0]) {
                        arrValidMoves[startY][startX].push(`${endX}${endY}`);
                      }
                    }
                  }
                }
              }
            }
          } else if (piece[0] === "1") {
            // white pawns

            for (let i = -1; i <= 1; i++) {
              endX = startX + i;
              endY = startY + 1;

              if (i !== 0) {
                //if endSquare is not in front of the pawn (the pawn can take)
                if (squareIsInBounds(endX, endY)) {
                  let endSquare = document.getElementById(
                    `square-${endX}${endY}`
                  );
                  if (
                    endSquare.children[0] &&
                    endSquare.children[0].dataset.piece[0] !== piece[0]
                  ) {
                    arrValidMoves[startY][startX].push(`${endX}${endY}`);
                  }
                }
              } else {
                // endSquare is in front of the pawn

                if (squareIsInBounds(endX, endY)) {
                  let endSquare = document.getElementById(
                    `square-${endX}${endY}`
                  );

                  if (!endSquare.children[0]) {
                    arrValidMoves[startY][startX].push(`${endX}${endY}`);

                    if (startY === 1) {
                      endY++;

                      endSquare = document.getElementById(
                        `square-${endX}${endY}`
                      );

                      if (!endSquare.children[0]) {
                        arrValidMoves[startY][startX].push(`${endX}${endY}`);
                      }
                    }
                  }
                }
              }
            }
          }

          break;
      }
    }
  }
  console.table(arrValidMoves);
}

// The element with the piece-select class contains the pieces that can be chosen when a pawn is promoted
function selectPieces(pieceColor) {
  let cover = document.querySelector(".cover");
  cover.classList.remove("hidden");

  let pieces = ["king", "queen", "rook", "bishop", "night", "pawn"];

  for (let k = 0; k < 6; k++) {
    let piece = document.querySelector(`.${pieces[k]}`);
    piece.setAttribute(
      "src",
      `images/${pieceColor}${pieces[k][0]}${globPieceStyleNumber}.png`
    );

    piece.setAttribute("data-piece", `${pieceColor}${pieces[k][0]}`);
  }
}

function toggleActivePlayer() {
  // 0 if activePlayer is black and 1 if active player is white.
  if (activePlayer === "0") {
    activePlayer = "1";
  } else if (activePlayer === "1") {
    activePlayer = "0";
  }
}

function getInactivePlayer() {
  if (activePlayer === "0") {
    return "1";
  } else if (activePlayer === "1") {
    return "0";
  }
}

function evaluateCheck() {
  let isInCheck = false; // boolean to check if

  let k = 0;

  while (k < 8 && isInCheck === false) {
    let j = 0;

    while (j < 8 && isInCheck === false) {
      if (arrBoard[k][j][0] === activePlayer) {
        let i = 0;

        while (i < arrValidMoves[k][j].length && isInCheck === false) {
          let square = document.getElementById(
            `square-${arrValidMoves[k][j][i][0]}${arrValidMoves[k][j][i][1]}`
          );

          console.log(square);

          if (
            square.children[0] &&
            square.children[0].dataset.piece === `${getInactivePlayer()}k`
          ) {
            isInCheck = true;
            square.style.backgroundColor = "red";
          }

          i++;
        }
      }

      j++;
    }

    k++;
  }
}

function moveIsValid(startCoordinates, endCoordinates) {
  if (
    arrValidMoves[startCoordinates[1]][startCoordinates[0]].includes(
      String(endCoordinates)
    )
  )
    return true;
}

function movePiece(endObject, pieceObj, startY, startX, endCoordinates) {
  let pieceType = pieceObj.dataset.piece;

  endObject.appendChild(pieceObj);

  //update the array that stores the piece positions
  //remove piece from starting square in the array;
  arrBoard[startY][startX] = "";

  //put piece in end square;
  arrBoard[endCoordinates[1]][endCoordinates[0]] = pieceType;

  console.log("move is valid");

  let audio = document.getElementById(`pieceAudio`);
  if (audio.paused) {
    audio.play();
  } else {
    audio.currentTime = 0;
  }

  initArrValidMoves();
  getArrValidMoves(arrBoard);
  debugger;
  evaluateCheck();

  toggleActivePlayer();
}

function resetSquareColor(squareCoordinates) {
  let square = document.getElementById(`square-${squareCoordinates}`);

  if (square.dataset.squareColor === "light") {
    square.style.background = "rgb(39, 174, 219)";
  } else if (square.dataset.squareColor === "dark") {
    square.style.background = "rgb(45, 39, 219)";
  }
}

// let arrBoard = [
//   ["1r", "1n", "1b", "1q", "1k", "1b", "1n", "1r"],
//   ["1p", "1p", "1p", "1p", "1p", "1p", "1p", "1p"],
//   ["", "", "", "", "", "", "", ""],
//   ["", "", "", "", "", "", "", ""],
//   ["", "", "", "", "", "", "", ""],
//   ["", "", "", "", "", "", "", ""],
//   ["0p", "0p", "0p", "0p", "0p", "0p", "0p", "0p"],
//   ["0r", "0n", "0b", "0q", "0k", "0b", "0n", "0r"],
// ];

initArrValidMoves();

let arrBoard = [
  ["", "", "", "", "1k", "", "", ""],
  ["", "0p", "", "", "", "", "1p", ""],
  ["", "", "", "", "", "0q", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "1n", ""],
  ["1p", "", "0b", "", "", "", "", ""],
  ["", "", "", "1r", "", "0p", "0p", "0p"],
  ["", "", "", "", "", "0r", "0k", ""],
];

// get the valid moves for each piece in the starting setup
displayBoard(arrBoard, globPieceStyleNumber); // set the board to the default position
getArrValidMoves(arrBoard);

document.querySelectorAll(".piece").forEach((piece) => {
  let startCoordinates, endCoordinates, startX, startY, startPieceValidMoves;

  piece.addEventListener("dragstart", (e) => {
    let startSquare = document.elementsFromPoint(e.clientX, e.clientY)[1]; // first parent of img is square
    startSquare.style.backgroundColor = "yellow";

    startCoordinates = startSquare.dataset.coordinates;
    startX = startCoordinates[0];
    startY = startCoordinates[1];
    // console.log(startX, startY);

    startPieceValidMoves = arrValidMoves[startY][startX];

    for (let k = 0; k < startPieceValidMoves.length; k++) {
      let square = document.getElementById(`square-${startPieceValidMoves[k]}`);
      square.style.background = "lime";
    }
  });

  piece.addEventListener("dragend", (e) => {
    let endObject = document.elementsFromPoint(e.clientX, e.clientY)[0]; // endObject is the object where the piece is placed
    let endObjectParent = document.elementsFromPoint(e.clientX, e.clientY)[1]; // endObjectParent is the parent of the object where the piece is placed

    if (!endObject.classList.contains("square")) {
      // endObject is another piece
      //if.. end and start pieces are not of the same color
      //*   console.log(endObjectParent);
      endObject = endObjectParent;
    }

    endCoordinates = endObject.dataset.coordinates;
    // console.log(endCoordinates);

    //change the colour of the squares back to the original colour of the board
    for (let k = 0; k < startPieceValidMoves.length; k++) {
      resetSquareColor(startPieceValidMoves[k]);
    }

    resetSquareColor(startCoordinates);

    //check if move should be played ie the move is valid and the correct colour piece was moved
    if (
      moveIsValid(startCoordinates, endCoordinates) &&
      piece.dataset.piece[0] === activePlayer
    ) {
      //? if move is valid and the piece that was moved is the same colour as the active pieces
      //note only active pieces can move;

      if (endObject.children[0]) {
        // if the endSquare has a piece on it and the piece is not the active player: then take the piece

        // take the piece on the endSquare
        if (endObject.children[0].dataset.piece[0] !== activePlayer) {
          // move the pieces on the board
          endObject.removeChild(endObject.children[0]);
          movePiece(endObject, piece, startY, startX, endCoordinates);
        } else {
          // the piece on the endSquare is also an activePiece and therefore can't be taken: moved piece is same as endPiece
          console.log("move is invalid");
        }
      } else {
        // endSquare does not have any piece on it so move the piece

        let pieceType = piece.dataset.piece;

        // if the piece is a pawn also let it promote
        if (
          pieceType[1] === "p" &&
          ((pieceType[0] === "0" && endCoordinates[1] === "0") ||
            (pieceType[0] === "1" && endCoordinates[1] === "7"))
        ) {
          // set the piece to a new promoted piece
          selectPieces(pieceType[0]);

          function promotePiece(event) {
            document.querySelector(".cover").classList.add("hidden");
            let element = event.currentTarget;
            console.log(element);
            piece.dataset.piece = element.dataset.piece;
            piece.setAttribute(
              "src",
              `images/${piece.dataset.piece}${globPieceStyleNumber}.png`
            );
            movePiece(endObject, piece, startY, startX, endCoordinates);

            let pieceOptions = document.querySelectorAll(".piece-select img");

            pieceOptions.forEach((elemnt) => {
              elemnt.removeEventListener("click", promotePiece, false);
            });
          }

          let pieceOptions = document.querySelectorAll(".piece-select img");

          pieceOptions.forEach((element) => {
            element.addEventListener("click", promotePiece, false);
          });
        } else if (piece) {
          movePiece(endObject, piece, startY, startX, endCoordinates);
        }
      }
    } else {
      console.log("move is invalid");
    }
  });
});

// TODO:  Maak dit moontlik om op mobile die game te speel
// TODO:  Verbeter die layout
// TODO:  Roekeer moet 'n VALID move wees
// TODO:  Add 'n clock
// TODO:  Skaak
// TODO:  Skaakmat
// TODO:  Maak dit multiplayer
// TODO:
// TODO:
// TODO:
// TODO:
