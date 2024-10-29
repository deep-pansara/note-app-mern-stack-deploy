const { authenticateToken } = require("./utilities");
const User = require("./models/userModel");
const Note = require("./models/noteModel");
const config = require("./config.json");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

//middlewares
app.use(express.json());

const corsOptions = {
    origin: 'https://note-app-mern-stack-deploy-ui.vercel.app', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

//routes
app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

app.get("/hello-world", (req, res) => {
  res.json({ data: {
      "name":"deep",
      "product":"hp laptop",
      "quatity":"5",
      "rate" : "30000",
      "amount": "3044"
  } });
});

//Create an account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName)
    return res
      .status(400)
      .json({ error: true, message: "Please enter a full name" });
  if (!email)
    return res.status(400).json({ error: true, message: "Email is required" });
  if (!password)
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });

  const isUserExists = await User.findOne({ email: email });
  if (isUserExists)
    return res
      .status(403)
      .json({ error: true, message: "user already exists" });

  const user = new User({ fullName, email, password });
  await user.save();

  const accessToken = jwt.sign({ user }, process.env.SECRET_ACCESS_TOKEN, {
    expiresIn: "1h",
  });

  return res.json({
    error: false,
    message: "Registration Successfull",
    user,
    accessToken,
  });
});

//login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email)
    return res.status(400).json({ error: true, message: "Email is required" });

  if (!password)
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });

  const userInfo = await User.findOne({ email: email });
  if (!userInfo) {
    return res.status(403).json({ error: true, message: "User not found" });
  }

  if (userInfo.email === email && userInfo.password === password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, {
      expiresIn: "1h",
    });
    return res.json({
      error: false,
      message: "Login Successfull",
      email,
      accessToken,
    });
  } else {
    return res
      .status(400)
      .json({ error: true, message: "invalid credentials" });
  }
});

app.post("/get-user", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: user._id });
  if (!isUser) {
    return res.status(404).json({ error: true, message: "User not Exists" });
  }

  return res.json({
    user: {
      fullName: isUser.fullName,
      email: isUser.email,
      "_id": isUser._id,
      createdOn: isUser.createdOn,
    },
    message: "",
  });
});

//Add note
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;
  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await note.save();
    return res
      .status(200)
      .json({ error: false, note, message: "Note saved successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

//edit note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags && !isPinned) {
    res.status(400).json({ error: true, message: "no changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();
    res
      .status(200)
      .json({ error: false, note, message: "Note successfully Updated" });
  } catch (error) {
    res.status(400).json({ error: true, message: "internal server error" });
  }
});

//GET all notes
app.get("/get-all-notes/", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({
      isPinned: -1,
    });

    return res.status(200).json({
      error: false,
      notes,
      message: "All notes retrived successfully",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "internal server error" });
  }
});

//Delete note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }
    await note.deleteOne({ _id: noteId, userId: user._id });
    return res.json({ error: false, message: "Note deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server error" });
  }
});

//update pinned value
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  if (!isPinned) {
    res.status(400).json({ error: true, message: "no changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isPinned = isPinned;

    await note.save();
    res
      .status(200)
      .json({ error: false, note, message: "Note successfully Updated" });
  } catch (error) {
    res.status(400).json({ error: true, message: "internal server error" });
  }
});

//Search notes
app.get("/search-notes/", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;
  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search query is required" });
  }

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Matching notes retrieved successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

//check defined routes middleware
app.use("*", (req, res) => {
  res.json({ error: true, message: "This route is not exists" });
});

//database connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(8000, () => {
      console.log("Server is started");
    });
  })
  .catch(error => console.log(error));
