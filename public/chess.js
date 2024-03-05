"use strict";

// //note: throughout the whole program 0 is used for black pieces and 1 is used for white pieces
// //note: throughout the whole program Coords is calculated to correspond to the array and not to the actual board ie. The left white rook on A1 has Coords of (0; 0) {this square will have a Coords data attribute of 00 in the format xy even though arrays work with a yx format}

//notes How to play chess:

//note Play on a checkered board, each square has its own Coords
//Done: createBoard()

//note Play with chess pieces
//Done: displayBoard(board)

//note, each piece can move in its own way
// take note of en passant and castling

//note if a pawn is on the last row, it can promote to any other piece except a king
// promotePawn

//note Take turns to play starting with white
// #playerTurn

//note At the end of each turn, check if the next player is in check, if they are their next move should get them out of check.

//note If they are in check and they can't get out of check, they are in checkmate and the game is over.

//note Extras
//note
//note

// TODO:  Maak dit moontlik om op mobile die game te speel
// TODO:  Verbeter die layout
// TODO:  Add 'n clock
// TODO:  Skaakmat
// TODO:  Wys watse stukke gevat is aan die kant.
// TODO:
// TODO:
const socket = io();
let userType;
let playerNum;
let game;
const spectatorArr = [];

const btnPlay = document.querySelector(".play-btn");
const btnSpectate = document.querySelector(".spectate-btn");
const gameCover = document.querySelector(".game-cover");
const inputUsername = document.querySelector(".username-input");
const gameInfo = document.querySelector(".game-info");
const spectatorList = document.querySelector(".spectatorList");
const spectatorsNumLabel = document.querySelector(".spectatorNum");
const gameCoverMessage = gameCover.querySelector(".game-cover-message");
const userNameLabel = gameInfo.querySelector(".username > .username-label");
const gameStartInputs = gameCover.querySelector(".game-start-inputs");
const gameRestartInputs = gameCover.querySelector(".game-restart-inputs");
const btnRestart = gameCover.querySelector(".restart-btn");

const addSpectator = function (username) {
  spectatorArr.push(username);
  const html = `<div class="spectator">${username}</div>`;
  spectatorList.insertAdjacentHTML("beforeEnd", html);

  spectatorsNumLabel.textContent = spectatorArr.length;
};

const removeSpectator = function (username) {
  const index = spectatorArr.indexOf(username);
  const spectator = spectatorList.querySelector(
    `.spectator:nth-child(${index + 1})`
  );
  spectator.remove();
  spectatorArr.splice(index, 1);

  spectatorsNumLabel.textContent = spectatorArr.length;
};

const addPlayer = function (username, index) {
  const userNameElmnt = gameInfo.querySelector(`.user-${index} .username`);
  const userStatusElmnt = gameInfo.querySelector(`.user-${index} .status`);

  userNameElmnt.textContent = username;
  userStatusElmnt.classList.add("connected");
  userStatusElmnt.textContent = "Connected";
};

const removePlayer = function (index) {
  const userNameElmnt = gameInfo.querySelector(`.user-${index} .username`);
  const userStatusElmnt = gameInfo.querySelector(`.user-${index} .status`);

  userNameElmnt.textContent = "--Username--";
  userStatusElmnt.classList.remove("connected");
  userStatusElmnt.textContent = "Disconnected";
};

////event listeners
btnPlay.addEventListener("click", () => {
  userType = "player";
  const username = inputUsername.value;

  if (username.length >= 3) {
    socket.emit("userConnected", userType, username);
  } else {
    inputUsername.style.border = "3px solid red";
  }
});

btnSpectate.addEventListener("click", () => {
  userType = "spectator";
  const username = inputUsername.value;

  if (username.length >= 3) {
    socket.emit("userConnected", userType, username);
  } else {
    inputUsername.style.border = "3px solid red";
  }
});

btnRestart.addEventListener("click", () => {
  window.location.reload();
});

////socket events
socket.on("update-game-info", (usernames, countSpectators) => {
  //first 2 usernames is the players and the rest is spectators
  for (let k = 2; k < usernames.length; k++) {
    addSpectator(usernames[k], countSpectators);
  }

  if (usernames[0]) {
    addPlayer(usernames[0], 0);
  }

  if (usernames[1]) {
    addPlayer(usernames[1], 1);
  }
});

socket.on("existingUsername", () => {
  gameCoverMessage.textContent = "Try another username";
});

socket.on("pass", (username) => {
  gameCover.classList.add("hidden");
  userNameLabel.textContent = username;
});

socket.on("addSpectator", (username) => {
  addSpectator(username);
});

socket.on("removeSpectator", (username) => {
  removeSpectator(username);
});

socket.on("addPlayer", (username, index) => {
  addPlayer(username, index);
});

socket.on("playerNum", (playerNumber) => {
  playerNum = playerNumber;
});

socket.on("startGame", () => {
  console.log(
    `I am playing as the ${playerNum === 1 ? "white🤍" : "black⚫"} pieces`
  );

  game = new ChessGame(".chessgame-container", {
    playerNumber: playerNum,
    coordinates: true,
    timed: true,
    userType: userType,
  });
});

socket.on("moveMadePlayer", (moveStr, enemyValidMovesStr) => {
  game.receiveEnemyMove(moveStr, enemyValidMovesStr);
});

socket.on("receiveMoveSpectator", (moveStr) => {
  game.receiveMoveSpectator(moveStr);
});

socket.on("checkmate", (winnerUsername) => {
  gameStartInputs.classList.add("hidden");
  gameRestartInputs.classList.remove("hidden");
  gameCover.classList.remove("hidden");
  gameCoverMessage.textContent = `#1🏆 ${winnerUsername} won`;
});

socket.on("removePlayer", (index) => {
  removePlayer(index);
});

socket.on("enoughPlayers", () => {
  gameCoverMessage.innerHTML =
    "There are already 2 players <br> try spectating";
});

////game logic
class Move {
  take = false;
  check = false; // shows if move places enemy king in check.

  constructor(pieceCode, startCoords, endCoords) {
    this.pieceCode = pieceCode;
    this.startCoords = startCoords;
    this.endCoords = endCoords;

    if (pieceCode[1] === "p") {
      this.enPassant = false;
      this.pawnPromote = false;
      this.pawnPromotedTo = "";
    }

    if (pieceCode[1] === "k") this.castle = false;
  }

  makeMoveInternally(internalBoard) {
    const endX = this.endCoords[0];
    const endY = this.endCoords[1];
    const startX = this.startCoords[0];
    const startY = this.startCoords[1];

    if (this.pieceCode[0] === internalBoard[+endY][+endX][0]) return false;

    if (this.enPassant) {
      this.take = true;

      const X = +endX;
      const Y = +endY + (parseInt(this.pieceCode[0]) * -2 + 1);

      internalBoard[Y][X] = "";
    }

    if (this.pawnPromote) {
      internalBoard[startY][startX] = this.pawnPromotedTo;
    }

    if (this.castle) {
      const kingRowY = parseInt(this.pieceCode[0]) === 1 ? 0 : 7;

      let rookEndX;
      let rookStartX;

      if (startX < endX) {
        rookStartX = 7;
        rookEndX = 5;
      } else if (endX < startX) {
        rookStartX = 0;
        rookEndX = 3;
      }

      //move the rook on the internal board AFTER move is made on UI board
      internalBoard[kingRowY][rookEndX] = internalBoard[kingRowY][rookStartX];
      internalBoard[kingRowY][rookStartX] = "";
    }

    //make move on internal board AFTER move is made on UI board
    let newPiece = internalBoard[startY][startX];
    if (this.pieceCode[1] === "k" || this.pieceCode[1] === "r") newPiece += "m";

    internalBoard[endY][endX] = newPiece;
    internalBoard[startY][startX] = "";

    return true;
  }

  makeMove(internalBoard, UIBoard, createPieceImgCallback) {
    const endX = this.endCoords[0];
    const endY = this.endCoords[1];
    const startX = this.startCoords[0];
    const startY = this.startCoords[1];

    //make move on UI board and edit pieceCode
    const endSquare = UIBoard.querySelector(`#square-${"" + endX + endY}`);

    let piece = UIBoard.querySelector(`#square-${"" + startX + startY}`)
      .children[0];

    //take enemy piece
    if (internalBoard[endY][endX] !== "") {
      this.take = true;
      endSquare.children[0].remove();
    }

    //en-passant
    if (this.enPassant) {
      this.take = true;

      const X = +endX;
      const Y = +endY + (parseInt(this.pieceCode[0]) * -2 + 1);
      const square = UIBoard.querySelector(`#square-${X}${Y}`);

      square.children[0].remove(); //remove the enemy's pawn from the board

      internalBoard[Y][X] = "";
    }

    if (this.pawnPromote) {
      internalBoard[startY][startX] = this.pawnPromotedTo;

      const startSquare = UIBoard.querySelector(`#square-${this.startCoords}`);
      const endSquare = UIBoard.querySelector(`#square-${this.endCoords}`);

      startSquare.children[0]?.remove();
      piece = createPieceImgCallback(this.pawnPromotedTo);
    }

    if (this.castle) {
      const kingRowY = parseInt(this.pieceCode[0]) === 1 ? 0 : 7;

      let rookEndX;
      let rookStartX;

      if (startX < endX) {
        rookStartX = 7;
        rookEndX = 5;
      } else if (endX < startX) {
        rookStartX = 0;
        rookEndX = 3;
      }

      const rookStartSquare = UIBoard.querySelector(
        `#square-${rookStartX}${kingRowY}`
      );
      const rookEndSquare = UIBoard.querySelector(
        `#square-${rookEndX}${kingRowY}`
      );
      const rookPieceUI = rookStartSquare.children[0];

      rookEndSquare.append(rookPieceUI);

      //move the rook on the internal board AFTER move is made on UI board
      internalBoard[kingRowY][rookEndX] = internalBoard[kingRowY][rookStartX];
      internalBoard[kingRowY][rookStartX] = "";
    }

    endSquare.append(piece);

    //make move on internal board AFTER move is made on UI board
    let newPiece = internalBoard[startY][startX];
    if (this.pieceCode[1] === "k" || this.pieceCode[1] === "r") newPiece += "m";

    internalBoard[endY][endX] = newPiece;
    internalBoard[startY][startX] = "";
  }

  isMoveValid(validMoves) {
    const arr = validMoves.slice();

    arr.forEach((row, k) => {
      row.forEach((col, j) => {
        arr[k][j] = col.map((move, i) => {
          return move.endCoords;
        });
      });
    });

    return arr[this.startCoords[1]][this.startCoords[0]].includes(
      this.endCoords
    );
  }
}

// necessary for game to work with HTML
class ChessGame {
  #chessBoardUI;
  #currentPlayer = 1; //current player is retreived from the socket. 1 is the default value for spectators;
  #enemyPlayer;
  // #arrColumns = ["a", "b", "c", "d", "e", "f", "g", "h"];
  #pieceStyleNumber = 2;
  #internalBoard;
  #playerTurn = 1; // it is always white that starts
  #userMovesMade = [];
  #enemyMovesMade = [];
  #userValidMoves = new Array(8).fill(""); // 3d array of all the valid endsquares the user can place pieces on for each starting square
  #enemyValidMoves = [];
  #userType;

  constructor(boardSelector, options) {
    this.#playAudioFromStart("game-start.webm");

    this.#chessBoardUI = document
      .querySelector(boardSelector)
      .querySelector(".chessboard");

    this.#evaluateOptions(options);
    this.#enemyPlayer = this.#currentPlayer === 1 ? 0 : 1;

    //create chessboard
    this.#generateChessBoard();

    //add pieces
    this.#initInternalBoard();
    this.#addChessPieces();

    if (this.#userType === "player") {
      //get valid moves for pieces based on position (not regarding check)
      this.#userValidMoves = this.#generateValidMovesForBoard(
        this.#currentPlayer
      );

      //allow pieces to move based on valid moves
      this.#allowPieceMovement();
    }
  }

  #evaluateOptions(options) {
    if (options?.playerNumber !== undefined) {
      this.#currentPlayer = options?.playerNumber;
    }

    if (options?.coordinates === true) {
      this.#addBoardCoordinates();
    }

    if (options.timed === true) {
      this.#addTimer();
    }

    if (options.userType !== undefined) {
      this.#userType = options.userType;
    }
  }

  #addBoardCoordinates() {
    document.documentElement.style.setProperty(
      "--coordinates-strip-width",
      "30px"
    );

    const html = `<div class="coordinates vertical-coordinates">
    <span>1</span>
    <span>2</span>
    <span>3</span>
    <span>4</span>
    <span>5</span>
    <span>6</span>
    <span>7</span>
    <span>8</span>
  </div>
  <div class="coordinates horizontal-coordinates">
    <span>A</span>
    <span>B</span>
    <span>C</span>
    <span>D</span>
    <span>E</span>
    <span>F</span>
    <span>G</span>
    <span>H</span>
  </div>`;

    this.#chessBoardUI.insertAdjacentHTML("beforeBegin", html);
  }

  #addTimer() {
    let html = `<div class="timer-container user1">
      <div class="username">Opponent</div>
      <div class="time">10:00</div>
    </div>`;

    this.#chessBoardUI.parentElement.insertAdjacentHTML("beforeBegin", html);

    html = `<div class="timer-container user2">
        <div class="username">Player</div>
        <div class="time">10:00</div>
      </div>`;

    this.#chessBoardUI.parentElement.insertAdjacentHTML("afterEnd", html);
  }

  ////generate the squares of the chessboard with Coords
  #generateChessBoard() {
    this.#addPieceSelect();

    const generateSquares = function (k, j) {
      const square = document.createElement("div");
      const squareCoords = "" + j + k; // -1 so the Coords of the squares corresponds to the array indeces
      // console.log(`(${squareCoords[0]}, ${squareCoords[1]})`);

      if (k % 2 === j % 2) {
        //If the square is located in even-even / odd-odd column and row numbers then it is dark
        square.setAttribute("data-square-color", "dark");
      } else {
        if (k % 2 !== j % 2) {
          //If the square is located in even-odd / odd-even column and row numbers then it is light
          square.setAttribute("data-square-color", "light");
        }
      }

      square.setAttribute("id", `square-${squareCoords}`);
      square.dataset.coords = squareCoords;
      square.classList.add("square");
      this.#chessBoardUI.appendChild(square);
    };

    if (this.#currentPlayer === 1) {
      for (let k = 7; k >= 0; k--) {
        for (let j = 0; j <= 7; j++) {
          generateSquares.call(this, k, j);
        }
      }
    }

    if (this.#currentPlayer === 0) {
      for (let k = 0; k <= 7; k++) {
        for (let j = 7; j >= 0; j--) {
          generateSquares.call(this, k, j);
        }
      }
    }
  }

  //helper function
  #addPieceSelect() {
    const html = `
    <div class="pawn-promotion-cover hidden">
      <div class="piece-select">
        <img data-piece-type="k" alt="king" class="hidden" ></img>
        <img data-piece-type="q" alt="queen" ></img>
        <img data-piece-type="r" alt="rook" ></img>
        <img data-piece-type="b" alt="bishop" ></img>
        <img data-piece-type="n" alt="night" ></img>
        <img data-piece-type="p" alt="pawn" class="hidden" ></img>
      </div>
    </div>`;

    this.#chessBoardUI.insertAdjacentHTML("beforeEnd", html);
  }

  //// Put chess pieces on board
  //helper function
  #initInternalBoard() {
    this.#internalBoard = new Array(8).fill("");

    this.#internalBoard.forEach((_, i) => {
      this.#internalBoard[i] = new Array(8).fill("");
    });
  }

  //helper function
  #createPieceImg(pieceCode) {
    const pieceImg = document.createElement("img");
    pieceImg.classList.add("piece");
    pieceImg.dataset.pieceColor = +pieceCode[0];
    pieceImg.dataset.pieceType = pieceCode[1];
    pieceImg.setAttribute(
      "src",
      `images/${pieceCode}${this.#pieceStyleNumber}.png`
    );
    pieceImg.setAttribute("draggable", "true");

    return pieceImg;
  }

  #addChessPieces() {
    const arrBoard = [
      ["1r", "1n", "1b", "1q", "1k", "1b", "1n", "1r"],
      ["1p", "1p", "1p", "1p", "1p", "1p", "1p", "1p"],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["0p", "0p", "0p", "0p", "0p", "0p", "0p", "0p"],
      ["0r", "0n", "0b", "0q", "0k", "0b", "0n", "0r"],
    ];

    // const arrBoard = [
    //   ["1r", "", "", "1q", "1k", "", "", "1r"],
    //   ["1p", "1p", "1p", "", "", "1p", "1p", "1p"],
    //   ["", "", "1n", "", "", "1n", "", ""],
    //   ["", "0b", "1b", "1p", "", "1b", "", ""],
    //   ["", "", "", "", "", "0b", "", ""],
    //   ["", "", "0n", "", "0p", "", "", ""],
    //   ["0p", "0p", "0p", "", "", "0p", "0p", "0p"],
    //   ["0r", "", "", "0q", "0k", "", "0n", "0r"],
    // ];

    // const arrBoard = [
    //   ["1r", "", "", "1q", "1k", "", "", "1r"],
    //   ["1p", "1p", "1p", "", "", "1p", "", "1p"],
    //   ["", "", "1n", "", "", "1n", "", ""],
    //   ["", "0b", "1b", "1p", "", "1b", "", ""],
    //   ["", "", "", "", "", "0b", "", ""],
    //   ["", "", "0n", "", "0p", "", "", ""],
    //   ["0p", "0p", "0p", "", "", "0p", "1p", "0p"],
    //   ["0r", "", "", "0q", "0k", "", "0n", "0r"],
    // ];

    // const arrBoard = [
    //   ["1r", "1n", "1b", "1q", "1k", "", "1n", "1r"],
    //   ["1p", "1p", "1p", "1p", "1b", "1p", "1p", "1p"],
    //   ["", "", "", "", "", "", "", ""],
    //   ["", "", "", "", "1p", "", "", ""],
    //   ["", "", "", "", "", "", "0p", ""],
    //   ["", "", "", "", "", "0p", "", ""],
    //   ["0p", "0p", "0p", "0p", "0p", "", "", "0p"],
    //   ["0r", "0n", "0b", "0q", "0k", "0b", "0n", "0r"],
    // ];

    arrBoard.forEach((row, k) => {
      row.forEach((pieceCode, j) => {
        if (pieceCode !== "") {
          this.#internalBoard[k][j] = pieceCode;

          const square = this.#chessBoardUI.querySelector(`#square-${j}${k}`);

          square.append(this.#createPieceImg(pieceCode));
        }
      });
    });
  }

  //// get pieces' valid moves

  // helper function
  #squareIsInBounds(X, Y) {
    return X >= 0 && X <= 7 && Y >= 0 && Y <= 7;
  }

  #initValidMovesArr(arr) {
    for (let k = 0; k < 8; k++) {
      arr[k] = new Array(8).fill("");

      for (let j = 0; j < 8; j++) {
        arr[k][j] = [];
      }
    }
  }

  //helper function
  #promotePawn(move) {
    const promoteCover = this.#chessBoardUI.querySelector(
      ".pawn-promotion-cover"
    );
    const pieceSelect = this.#chessBoardUI.querySelector(".piece-select");

    promoteCover.classList.remove("hidden");

    const options = [...pieceSelect.children];

    options.forEach((child) => {
      if (!child.classList.contains("hidden")) {
        const pieceCode = `${this.#currentPlayer}${child.dataset.pieceType}`;

        child.dataset.pieceCode = pieceCode;
        child.src = `images/${pieceCode}${this.#pieceStyleNumber}.png`;
      }
    });

    const p = new Promise((resolve, reject) => {
      let promotion = function (e) {
        const clickedElement = e.target;

        if (clickedElement.tagName === "IMG") {
          const promotedPiece = clickedElement.dataset.pieceCode;

          promoteCover.classList.add("hidden");
          pieceSelect.removeEventListener("click", promotion, false);

          resolve(promotedPiece);
          reject("there was an error at the promotion of the pawn");
        }
      };

      promotion = promotion.bind(this);
      pieceSelect.addEventListener("click", promotion, false);
    });

    return p;
  }

  //helper function
  #enemyAttacksSquare(coords, enemyValidMovesArr) {
    return !!enemyValidMovesArr
      .slice()
      .flat(2)
      .find((move) => {
        return move.endCoords === coords;
      });
  }

  //helper function
  #userAttacksSquare(coords) {
    return !!this.#userValidMoves
      .slice()
      .flat(2)
      .find((move) => {
        return move.endCoords === coords;
      });
  }

  //helper function
  #generateValidMovesForBoard(playerNum, internalBoard = this.#internalBoard) {
    const validMovesArr = new Array(8).fill("");
    this.#initValidMovesArr(validMovesArr);

    //loop through the board and get the valid moves for every single piece on the board
    internalBoard.forEach((row, k) => {
      row.forEach((pieceCode, j) => {
        if (parseInt(pieceCode[0]) === playerNum) {
          const pieceCoords = `${j}${k}`;

          validMovesArr[k][j] = this.#generateValidMovesForPiece(
            pieceCoords,
            internalBoard
          );
        }
      });
    });

    return validMovesArr;
  }

  #generateValidMovesForPiece(
    pieceCoords,
    internalBoard = this.#internalBoard
  ) {
    const validMoves = [];
    const startX = parseInt(pieceCoords[0]);
    const startY = parseInt(pieceCoords[1]);
    const pieceCode = internalBoard[startY][startX];
    const playerNum = parseInt(pieceCode[0]);
    const enemyPlayerNum = playerNum === 1 ? 0 : 1;
    const enemyMovesMade =
      playerNum === this.#currentPlayer
        ? this.#enemyMovesMade
        : this.#userMovesMade;
    const enemyValidMoves =
      playerNum === this.#currentPlayer
        ? this.#enemyValidMoves
        : this.#userValidMoves;

    //helper function
    const getSlidingPieceValidMoves = function (...arr) {
      let i, endPiece;

      const checkTopBottom = function (step, startX, startY) {
        //top-bottom
        let i = startY + step;
        if (this.#squareIsInBounds(startX, i)) {
          endPiece = internalBoard[i][startX];

          while (i / step <= 3.5 * (step + 1) && !endPiece) {
            validMoves.push(
              new Move(pieceCode, `${startX}${startY}`, `${startX}${i}`)
            );

            i += step;

            if (internalBoard[i]) {
              endPiece = internalBoard[i][startX];
            } else {
              endPiece = null;
            }
          }

          if (endPiece) {
            validMoves.push(
              new Move(pieceCode, `${startX}${startY}`, `${startX}${i}`)
            );
          }
        }
      };

      const checkRightLeft = function (step, startX, startY) {
        //right-left

        let i = startX + step;

        if (this.#squareIsInBounds(i, startY)) {
          endPiece = internalBoard[startY][i];

          while (i / step <= 3.5 * (step + 1) && !endPiece) {
            validMoves.push(
              new Move(pieceCode, `${startX}${startY}`, `${i}${startY}`)
            );

            i += step;

            if (internalBoard[startY]) {
              endPiece = internalBoard[startY][i];
            } else {
              endPiece = null;
            }
          }

          if (endPiece) {
            validMoves.push(
              new Move(pieceCode, `${startX}${startY}`, `${i}${startY}`)
            );
          }
        }
      };

      let h;

      const checkPositiveDiagonal = function (step, startX, startY) {
        //positive diagonal

        i = startX + step;
        h = startY + step;

        if (this.#squareIsInBounds(i, h)) {
          endPiece = internalBoard[h][i];

          while (
            i / step <= 3.5 * (step + 1) &&
            h / step <= 3.5 * (step + 1) &&
            !endPiece
          ) {
            validMoves.push(
              new Move(pieceCode, `${startX}${startY}`, `${i}${h}`)
            );

            i += step;
            h += step;

            if (internalBoard[h]) {
              endPiece = internalBoard[h][i];
            } else {
              endPiece = null;
            }
          }

          if (endPiece) {
            validMoves.push(
              new Move(pieceCode, `${startX}${startY}`, `${i}${h}`)
            );
          }
        }
      };

      const checkNegativeDiagonal = function (iStep, hStep, startX, startY) {
        //Negative diagonal

        let i = startX + iStep;
        let h = startY + hStep;

        if (this.#squareIsInBounds(i, h)) {
          endPiece = internalBoard[h][i];

          while (
            i / iStep <= 3.5 * (iStep + 1) &&
            h / hStep <= 3.5 * (hStep + 1) &&
            !endPiece
          ) {
            validMoves.push(
              new Move(pieceCode, `${startX}${startY}`, `${i}${h}`)
            );

            i += iStep;
            h += hStep;

            if (internalBoard[h]) {
              endPiece = internalBoard[h][i];
            } else {
              endPiece = null;
            }
          }

          if (endPiece) {
            validMoves.push(
              new Move(pieceCode, `${startX}${startY}`, `${i}${h}`)
            );
          }
        }
      };

      const mapDirections = new Map();
      //*vertically
      // top
      mapDirections.set(1, checkTopBottom);

      // bottom
      mapDirections.set(2, checkTopBottom);

      //* horizontally
      // right
      mapDirections.set(3, checkRightLeft);

      // left
      mapDirections.set(4, checkRightLeft);

      //* Positive diagonals
      // top-right
      mapDirections.set(5, checkPositiveDiagonal);

      // bottom-left
      mapDirections.set(6, checkPositiveDiagonal);

      // bottom-right
      mapDirections.set(7, checkNegativeDiagonal);

      // top-left
      mapDirections.set(8, checkNegativeDiagonal);

      for (let dirNum of arr) {
        if (dirNum !== 7 && dirNum !== 8) {
          if (dirNum % 2 === 0) {
            mapDirections.get(dirNum).bind(this)(-1, startX, startY);
          } else {
            mapDirections.get(dirNum).bind(this)(1, startX, startY);
          }
        } else {
          if (dirNum === 7) {
            mapDirections.get(dirNum).bind(this)(1, -1, startX, startY);
          } else {
            mapDirections.get(dirNum).bind(this)(-1, 1, startX, startY);
          }
        }
      }
    };

    //helper function
    const checkSquaresForCastling = function (
      kingCoords,
      rookCoords,
      castlingSide
    ) {
      // check if there are pieces between king and rook

      let piecesBetween = false;
      let travellingSquareIsAttacked = false;
      const kingRowY = parseInt(kingCoords[1]);
      const kingRow = internalBoard[kingRowY];

      const kingX = Number(kingCoords[0]);
      const rookX = Number(rookCoords[0]);
      const dir = castlingSide === "king" ? 1 : -1;

      let k = kingX + dir;

      while (
        piecesBetween === false &&
        k / dir < rookX / dir &&
        travellingSquareIsAttacked === false
      ) {
        piecesBetween = kingRow[k] !== "";

        // check if enemy attacks squares where king will move
        if (k !== 1) {
          //should stop before coords '10' or '17' is evaluated
          travellingSquareIsAttacked = this.#enemyAttacksSquare(
            `${k}${kingRowY}`,
            enemyValidMoves
          );
        }

        k = k + dir;
      }

      return !piecesBetween && !travellingSquareIsAttacked;
    };

    //helper function
    const castlingAsValidMove = function (startY, startX, castlingSide) {
      const kingRowY = playerNum === 1 ? 0 : 7;
      const kingCoords = `${startX}${startY}`;

      let rookStartX;
      let kingEndX;

      if (castlingSide === "king") {
        rookStartX = 7;
        kingEndX = 6;
      } else if (castlingSide === "queen") {
        rookStartX = 0;
        kingEndX = 2;
      }

      const pieceCode = internalBoard[kingRowY][rookStartX];
      const rookCoords = `${rookStartX}${kingRowY}`;

      //check if rooks have moved
      if (pieceCode === `${playerNum}r` && pieceCode.indexOf("m") === -1) {
        // rook has not moved
        const canCastle = checkSquaresForCastling.call(
          this,
          kingCoords,
          rookCoords,
          castlingSide
        );

        if (canCastle) {
          const move = new Move(
            pieceCode,
            `${startX}${startY}`,
            `${kingEndX}${kingRowY}`
          );

          move.castle = true;

          validMoves.push(move);
        }
      }
    };

    const pieceType = pieceCode[1]; //str

    // board Coords is in the format (x,y)
    // let startCoords = `${j}${k}`;

    let endX, endY;

    // piece is on startCoords

    switch (pieceType) {
      case "k":
        for (let i = startY - 1; i <= startY + 1; i++) {
          for (let h = startX - 1; h <= startX + 1; h++) {
            if (
              !(i === startY && h === startX) && // same square as starting square
              this.#squareIsInBounds(h, i)
            ) {
              validMoves.push(
                new Move(pieceCode, `${startX}${startY}`, `${h}${i}`)
              );
            }
          }
        }

        //castling

        // check if king has not moved
        if (pieceCode.indexOf("m") === -1) {
          //king side

          castlingAsValidMove.call(this, startY, startX, "king");

          //queen side
          castlingAsValidMove.call(this, startY, startX, "queen");
        }

        break;

      //sliding pieces
      //queen
      case "q":
        getSlidingPieceValidMoves.call(this, 1, 2, 3, 4, 5, 6, 7, 8);

        break;

      //rook
      case "r":
        getSlidingPieceValidMoves.call(this, 1, 2, 3, 4);

        break;

      //bishop
      case "b":
        getSlidingPieceValidMoves.call(this, 5, 6, 7, 8);

        break;

      //knight
      case "n":
        for (let i = 1; i <= 4; i++) {
          for (let h = 1; h <= 2; h++) {
            let temp;

            if (i % 2 === 0) {
              temp = h - 3;
            } else {
              temp = 3 - h;
            }

            if (i <= 2) {
              // first 2 iterations of i
              endX = startX + h;
              endY = startY + temp;
            } else {
              // second 2 iterations of i
              endX = startX - h;
              endY = startY + temp;
            }

            if (this.#squareIsInBounds(endX, endY)) {
              validMoves.push(
                new Move(pieceCode, `${startX}${startY}`, `${endX}${endY}`)
              );
            }
          }
        }

        break;

      //pawn
      case "p":
        const checkPawnValidMoves = function (direction) {
          for (let i = -1; i <= 1; i++) {
            endX = startX + i;
            endY = startY + direction;

            if (i !== 0) {
              //if endSquare is not in front of the pawn (the pawn can take)

              //check if endCoords is in bounds
              if (this.#squareIsInBounds(endX, endY)) {
                const endPieceCode = internalBoard[endY][endX];

                const [enemyLastMove] = enemyMovesMade.slice(-1);

                //if there is an endPiece and endPiece is an enemy piece
                if (
                  endPieceCode !== "" &&
                  parseInt(endPieceCode[0]) === enemyPlayerNum
                ) {
                  const move = new Move(
                    pieceCode,
                    `${startX}${startY}`,
                    `${endX}${endY}`
                  );
                  move.take = true;

                  // also allow pawn to promote

                  if (endY === (playerNum === 1 ? 7 : 0)) {
                    move.pawnPromote = true;
                  }

                  validMoves.push(move);
                } else if (
                  // there is not an endPiece but check for en-passant

                  enemyLastMove?.pieceCode === `${enemyPlayerNum}p` &&
                  +enemyLastMove.startCoords[1] === (playerNum === 1 ? 6 : 1) &&
                  Math.abs(
                    +enemyLastMove.endCoords[1] - +enemyLastMove.startCoords[1]
                  ) === 2 &&
                  endX === +enemyLastMove.endCoords[0] &&
                  endY === +enemyLastMove.endCoords[1] + direction
                ) {
                  // en-passant
                  const move = new Move(
                    pieceCode,
                    `${startX}${startY}`,
                    `${endX}${endY}`
                  );
                  move.take = true;
                  move.enPassant = true;

                  validMoves.push(move);
                }
              }
            } else {
              // endSquare is in front of the pawn

              if (this.#squareIsInBounds(endX, endY)) {
                const endPiece = internalBoard[endY][endX];

                if (endPiece === "") {
                  const move = new Move(
                    pieceCode,
                    `${startX}${startY}`,
                    `${endX}${endY}`
                  );

                  validMoves.push(move);

                  if (endY === (playerNum === 1 ? 7 : 0)) {
                    move.pawnPromote = true;
                  }

                  // check if pawn can move 2 squares
                  if (startY === -2.5 * direction + 3.5) {
                    endY += direction;
                    const endPiece = internalBoard[endY][endX];

                    if (endPiece === "") {
                      validMoves.push(
                        new Move(
                          pieceCode,
                          `${startX}${startY}`,
                          `${endX}${endY}`
                        )
                      );
                    }
                  }
                }
              }
            }
          }
        };

        checkPawnValidMoves.call(this, 2 * Number(playerNum) - 1);
        break;
    }

    return validMoves;
  }

  //// Allow user's pieces to move
  //helper function
  #playSound(move) {
    if (move.checkmate) {
      this.#playAudioFromStart("game-end.webm");
    } else if (move.check) {
      this.#playAudioFromStart("move-check.mp3");
    } else if (move.castle) {
      this.#playAudioFromStart("castle.mp3");
    } else if (move.pawnPromote) {
      this.#playAudioFromStart("promote.mp3");
    } else if (move.take) {
      this.#playAudioFromStart("capture.mp3");
    } else {
      this.#playAudioFromStart("move-self.mp3");
    }
  }

  //helper function
  #playAudioFromStart(audioName) {
    const audio = document.querySelector("#pieceAudio");

    audio.setAttribute("src", `audio/${audioName}`);
    if (audio.paused) {
      audio.play();
    } else {
      audio.currentTime = 0;
    }
  }

  //helper function
  #kingIsSafeAfterMove(move, playerNum, internalBoard = this.#internalBoard) {
    // checks if the king for the related playerNum is safe after the specific move was made
    const enemyPlayerNum = playerNum === 1 ? 0 : 1;

    let tempBoard = new Array(8).fill("");

    tempBoard = tempBoard.map((_, k) => {
      return internalBoard[k].slice();
    });

    const moveCanBeMade = move.makeMoveInternally(tempBoard);

    if (!moveCanBeMade) return false;

    const tempEnemyValidMoves = this.#generateValidMovesForBoard(
      enemyPlayerNum,
      tempBoard
    );

    let kingCoords;

    //king will be moved so the move.endCoords is the kingCoords
    if (move.pieceCode[1] === "k") {
      kingCoords = move.endCoords;
    } else {
      //get the user-king-coords

      //! can possibly cause error playerNum i.s.o. this.#currentPlayer
      kingCoords = this.#getKingCoords(playerNum, tempBoard);
    }

    return !this.#enemyAttacksSquare(kingCoords, tempEnemyValidMoves);
  }

  //helper function
  #enemyKingIsSafe(kingCoords) {
    if (!kingCoords) kingCoords = this.#getKingCoords(this.#enemyPlayer);

    return !this.#userAttacksSquare(kingCoords);
  }

  //helper function
  #elementIsUsersPiece(element) {
    return (
      element?.classList.contains("piece") &&
      parseInt(element.dataset.pieceColor) === this.#currentPlayer
    );
  }

  //helper function
  #kingHasMoveToPlay(kingCoords, internalBoard) {
    //returns true if the king at kingCoords in internalBoard has a valid move to play

    const kingValidMoves = this.#generateValidMovesForPiece(kingCoords);

    const startX = kingCoords[0];
    const startY = kingCoords[1];

    let hasValidMove = false;
    let k = 0;

    while (k < kingValidMoves.length && hasValidMove === false)
      kingValidMoves.forEach((move) => {
        const endX = move.endCoords[0];
        const endY = move.endCoords[1];
        const endPieceColor = parseInt(internalBoard[endY][endX][0]);
        const kingColor = parseInt(internalBoard[startY][startX][0]);

        if (endPieceColor !== kingColor) hasValidMove;
      });

    return hasValidMove;
  }

  #getKingCoords(playerNum, internalBoard = this.#internalBoard) {
    let kingCoords;
    let k = 0;

    while (!kingCoords && k <= 7) {
      let j = 0;

      while (!kingCoords && j <= 7) {
        if (internalBoard[k][j].slice(0, 2) === `${playerNum}k`) {
          kingCoords = `${j}${k}`;
        }
        j++;
      }
      k++;
    }

    return kingCoords;
  }

  //helper function
  #playerCheckmate(move, playerNum) {
    //  check if the player corresponding to the playerNum is in checkmate
    // assume that player is in check

    const enemyValidMoves = this.#generateValidMovesForBoard(
      this.#enemyPlayer,
      this.#internalBoard
    ).flat(2);

    console.log(enemyValidMoves);

    let kingHasMoveToPlay = false;
    let k = 0;

    while (k < enemyValidMoves.length && kingHasMoveToPlay === false) {
      let move = enemyValidMoves[k];

      if (
        this.#kingIsSafeAfterMove(move, this.#enemyPlayer, this.#internalBoard)
      ) {
        kingHasMoveToPlay = true;
      }

      k++;
    }

    // //true means checkmate; false means not checkmate
    return !kingHasMoveToPlay;
  }

  //helper function
  #pieceDragStart(e) {
    const element = e.target;

    // only let user drag element if the element is a chess piece with the user's color
    if (this.#elementIsUsersPiece(element)) {
      const startCoords = element.parentElement.dataset.coords;
      const startX = startCoords[0];
      const startY = startCoords[1];

      this.#userValidMoves[startY][startX].forEach((move) => {
        this.#chessBoardUI.querySelector(
          `#square-${move.endCoords}`
        ).style.backgroundColor = "green";
      });
    }
  }

  //helper function
  #pieceDragEnd(e) {
    const element = e.target;

    this.#resetBoardColor();

    // only let user drag element if the element is a chess piece with the user's color

    if (this.#elementIsUsersPiece(element)) {
      e.preventDefault();

      const endElmnts = document.elementsFromPoint(e.x, e.y);
      let endSquare;

      if (endElmnts[0]?.classList.contains("piece")) {
        endSquare = endElmnts[1];
      } else if (endElmnts[0]?.classList.contains("square")) {
        endSquare = endElmnts[0];
      }

      if (!endSquare) return;

      const startCoords = element.parentElement.dataset.coords;
      const startX = parseInt(startCoords[0]);
      const startY = parseInt(startCoords[1]);

      const endCoords = endSquare.dataset.coords;
      const endX = parseInt(endCoords[0]);
      const endY = parseInt(endCoords[1]);

      if (startCoords !== endCoords) {
        //search in the valid moves array for the move that was made

        const move = this.#userValidMoves[startY][startX].find((move) => {
          return move.endCoords === endCoords;
        });

        // move will be undefined if no valid move has been found
        const endPieceCode = this.#internalBoard[endY][endX];

        if (
          // a valid move has been made
          move && //It is the user's turn
          this.#playerTurn === this.#currentPlayer && //endPiece is an enemy piece
          (endPieceCode === ""
            ? true
            : parseInt(endPieceCode[0]) !== this.#currentPlayer)
        ) {
          if (this.#kingIsSafeAfterMove(move, this.#currentPlayer)) {
            let p;

            if (move.pawnPromote) {
              p = this.#promotePawn(move);
            }

            const awaitCode = function () {
              move.makeMove(
                this.#internalBoard,
                this.#chessBoardUI,
                this.#createPieceImg.bind(this)
              );

              this.#playerTurn = this.#enemyPlayer;
              this.#userMovesMade.push(move);

              this.#userValidMoves = this.#generateValidMovesForBoard(
                this.#currentPlayer
              );

              if (!this.#enemyKingIsSafe()) {
                move.check = true;
                if (this.#playerCheckmate(move, this.#enemyPlayer))
                  move.checkmate = true;
                socket.emit("checkmate", this.#currentPlayer);
              }

              this.#playSound(move);

              //send the move and the user's valid moves to the server
              socket.emit(
                "moveMade",
                JSON.stringify(move),
                JSON.stringify(this.#userValidMoves)
              );
            };

            if (p) {
              p.then((promotedPiece) => {
                move.pawnPromotedTo = promotedPiece;
                //note: awaitCode should only happen after the pawn has been promoted

                awaitCode.call(this);
              }).catch((err) => {
                console.error(err);
              });
            } else {
              awaitCode.call(this);
            }
          } else {
            this.#playAudioFromStart("illegal.webm");
          }
        }

        /*


        const getLastMoveNotation = function () {
          let piece = objLastMove.piece[1];
          let takes = objLastMove.taken ? "x" : "";
          let str = objLastMove.moveNum + ". ";

          if (piece !== "p") {
            str += piece.toUpperCase() + takes;
          } else {
            if (takes) {
              str += arrColumns[startCoords[0]] + takes;
            }
          }

          str += arrColumns[endCoords[0]] + (Number(endCoords[1]) + 1);

          return str;
        };

        objLastMove.notation = getLastMoveNotation();

        console.log(objLastMove.notation);

        */
      }
    }
  }

  #allowPieceMovement() {
    this.#chessBoardUI.addEventListener(
      "dragstart",
      this.#pieceDragStart.bind(this),
      false
    );

    this.#chessBoardUI.addEventListener(
      "dragend",
      this.#pieceDragEnd.bind(this),
      false
    );
  }

  //helper function
  #resetBoardColor() {
    const lightSquareColor = "rgb(39, 174, 219)";
    const darkSquareColor = "rgb(45, 39, 219)";
    const squares = this.#chessBoardUI.querySelectorAll(".square");

    squares.forEach((square) => {
      let squareColour = square.dataset.squareColor;

      square.style.backgroundColor =
        squareColour === "light" ? lightSquareColor : darkSquareColor;
    });
  }

  //// Allow enemy pieces to move
  receiveEnemyMove(receivedMoveStr, enemyValidMovesStr) {
    const receivedMove = JSON.parse(receivedMoveStr);
    this.#enemyValidMoves = JSON.parse(enemyValidMovesStr);

    const move = new Move(
      receivedMove.pieceCode,
      receivedMove.startCoords,
      receivedMove.endCoords
    );

    move.take = receivedMove.take;
    move.check = receivedMove.check;
    move.enPassant = receivedMove.enPassant;
    move.pawnPromote = receivedMove.pawnPromote;
    move.pawnPromotedTo = receivedMove.pawnPromotedTo;
    move.castle = receivedMove.castle;
    move.checkmate = receivedMove.checkmate;

    move.makeMove(
      this.#internalBoard,
      this.#chessBoardUI,
      this.#createPieceImg.bind(this)
    );

    this.#playerTurn = this.#currentPlayer;
    this.#enemyMovesMade.push(move);

    this.#userValidMoves = this.#generateValidMovesForBoard(
      this.#currentPlayer
    );

    this.#playSound(move);
  }

  receiveMoveSpectator(receivedMoveStr) {
    const receivedMove = JSON.parse(receivedMoveStr);

    const move = new Move(
      receivedMove.pieceCode,
      receivedMove.startCoords,
      receivedMove.endCoords
    );

    move.take = receivedMove.take;
    move.check = receivedMove.check;
    move.enPassant = receivedMove.enPassant;
    move.pawnPromote = receivedMove.pawnPromote;
    move.pawnPromotedTo = receivedMove.pawnPromotedTo;
    move.castle = receivedMove.castle;
    move.checkmate = receivedMove.checkmate;

    move.makeMove(
      this.#internalBoard,
      this.#chessBoardUI,
      this.#createPieceImg.bind(this)
    );

    this.#playSound(move);
  }

  //getters
  get userValidMoves() {
    return this.#userValidMoves;
  }

  get enemyValidMoves() {
    return this.#enemyValidMoves;
  }

  get board() {
    return this.#internalBoard;
  }
}
