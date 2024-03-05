const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const PORT = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);

server.listen(PORT, () => {
  console.log(`server listening at port ${PORT}`);
});

app.use(express.static(join(__dirname, "public")));

let usernames = [null, null];
let countSpectators = 0;
// let gameStarted = false;

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

io.on("connection", (socket) => {
  socket.emit("update-game-info", usernames, countSpectators);
  let passed = false;

  socket.on("userConnected", (userType, username) => {
    if (usernames.includes(username)) {
      io.to(socket.id).emit("existingUsername");
      return;
    } else {
      passed = true;
    }

    if (userType === "player") {
      const playerIndex = usernames.indexOf(null);
      const playerNum = playerIndex * -1 + 1;

      if (playerIndex !== -1) {
        //there are less than 2 players so add the new one
        socket.join(userType);
        usernames[playerIndex] = username;

        io.emit("addPlayer", username, playerIndex);
        io.to(socket.id).emit("playerNum", playerNum);

        socket.on("moveMade", (moveStr, userValidMovesStr) => {
          socket
            .to("player")
            .emit("moveMadePlayer", moveStr, userValidMovesStr);

          io.to("spectator").emit("receiveMoveSpectator", moveStr);

          console.log("a move has been made");
        });

        if (!usernames.includes(null)) {
          // there are 2 players now
          // gameStarted = true;
          io.emit("startGame");
        }
      }

      if (playerIndex === -1) {
        //there are already 2 players
        io.to(socket.id).emit("enoughPlayers");
        passed = false;
      }
    }

    if (userType === "spectator") {
      socket.join(userType);
      countSpectators++;
      usernames.push(username);

      io.emit("addSpectator", username);
    }

    socket.on("checkmate", (winnerNum) => {
      usernames = [null, null];
      countSpectators = 0;
      // let gameStarted = false;

      const winnerIndex = (winnerNum - 1) * -1;
      io.emit("checkmate", usernames[winnerIndex], usernames);
    });

    console.log("user joined", usernames);

    if (passed) {
      io.to(socket.id).emit("pass", username);
    }

    socket.on("disconnect", () => {
      const playerIndex = usernames.indexOf(username);

      if (userType === "player") {
        usernames[playerIndex] = null;
        io.emit("removePlayer", playerIndex);
      }

      if (userType === "spectator") {
        countSpectators--;
        usernames.splice(usernames.indexOf(username), 1);
        io.emit("removeSpectator", username);
      }

      console.log("user left", usernames);
      //   socket.broadcast.emit("player-disconnected", playerNum);
    });
  });
});
