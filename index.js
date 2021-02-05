//Require Packages

require('dotenv').config();
const { getLessonsInfo, getLesson, getModule, newModule, uploadModule, checkResults, markRead, getResult } = require("./handlers/lessons");
const { getAssignInfo, getAssgn, getSub, submitSub, uploadSub, getLivelist, createLive, getQuizModule, checkResAsgn, getAsgnQuizRes, newAsgn, getquizsub, getsubsub, getStudList, updateMarks } = require("./handlers/assignments");
const { ssignup, llogin } = require("./handlers/users");
const authMiddleware = require("./util/isloggedin");
const bodyParser = require("body-parser");


//Initialize Packages

const express = require("express");
const app = express();
const server = require(`http`).Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
//User Settings

app.use(bodyParser.json());

//CORS

app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

//Route Handlers

app.get("/api/lessons", authMiddleware, getLessonsInfo);

app.get("/api/live", authMiddleware, getLivelist);

app.post("/api/live", authMiddleware, createLive);

app.get("/api/assignments", authMiddleware, getAssignInfo);

app.post("/api/module/upload", authMiddleware, uploadModule);

app.get("/api/module/quizes/:ref/result", authMiddleware, getResult);

app.post("/api/module/quizes/:chapId/:ref", authMiddleware, checkResults);

app.post("/api/module/new/:chapId", authMiddleware, newModule);

app.post("/api/assignments/updatemarks", authMiddleware, updateMarks);

app.post("/api/assignment/new/:asgnId", authMiddleware, newAsgn);

app.get("/api/lessons/:lessonId", authMiddleware, getLesson);

app.get("/api/assignments/:assgnId", authMiddleware, getAssgn);

app.get("/api/module/:type/:chapId/:ref", authMiddleware, getModule);

app.post("/api/module/:type/:chapId/:ref", authMiddleware, markRead);

app.post("/api/ssignup", ssignup);

app.post("/api/login", llogin);

app.get("/api/written/:asgnId/:subId", authMiddleware, getSub);

app.get("/api/quiz/:ref/:userId/result", authMiddleware, getAsgnQuizRes);

app.get("/api/quiz/:asgnId/:ref", authMiddleware, getQuizModule);

app.post("/api/written/:asgnId/:subId", authMiddleware, submitSub);

app.post("/api/quiz/:asgnId/:ref", authMiddleware, checkResAsgn);

app.get("/api/assignments/quiz/submissions/:id", authMiddleware, getquizsub);

app.get("/api/assignments/sub/submissions/:id", authMiddleware, getsubsub);

app.get("/api/analysis/studlist", getStudList);

app.post("/api/written/upload", authMiddleware, uploadSub);

//Production Script
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

//Socket Com
io.on("connection", (socket) => {
  console.log("Hello");
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    console.log(userId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

//Listen server

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server Started on PORT ${PORT}`);
});