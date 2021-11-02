import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connect } from "./libs/database.js";
import { User } from "./models/user.js";
import { messagerules,emailrules } from "./validation/messagevalidation.js";
import { validationResult } from "express-validator";


// Setup NodeJS and connect to database
dotenv.config();
await connect();

// Setup app
const app = express();
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(["Request"] + req.method + "" + req.path);
  next();
})


const validate = (rules) => {
  const middlewares = rules;

  middlewares.push((req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      errors: errors.array()
    });
  });
  return middlewares;
}

// Register new user
app.post("/register",validate(emailrules), async (req, res) => {
    const user = await User.register(req.body);
    if (!user) {
      return res.status(400).json({ success: false });
    }
  res.status(201).json({ success: user });
});



// Login using email and password
app.post("/login", async (req, res) => {
  const user = await User.login(req.body);

  if (!user) {
    return res.status(400).json({ user });
  }

  // Create JWT token
  const token = jwt.sign({ _id: user._id }, process.env.SECRET);

  res.json({ user, token });
});


//this to get all the infos from my dbs and then we write in http requist file like this GET http://localhost:PORT/
app.get("/", async (req, res) => {
  const user = await User.find({});

  if (!user) {
    return res.status(400).json({ user });
  }

  // Create JWT token

  res.json({ user });
});

// This middleware checks if a valid JWT is included in the request
const checkLogin = (req, res, next) => {
  const rawJWTHeader = req.headers.authorization;
  
  if (!rawJWTHeader) {
    return res.sendStatus(401);
  }

  const token = rawJWTHeader.slice(7);
  jwt.verify(token, process.env.SECRET, function(err, decoded) {
    if (err) {
      console.log("Error verifying JWT", err.message);
      return res.sendStatus(401);
    }
    
    next();
  });
};

// this middleware returns and array of middleware functions


// This endpoint takes in a message and saves it; returning a list of messages
const messages = ["First!"];
app.post("/message", checkLogin, validate(messagerules), (req, res) => {
  messages.push(req.body.message);
  res.send(messages);
});

// If the previous middlewares did not handle the request, this will!
app.use((req, res) => {
    res.status(404);
    res.json({ error: "Resource not found 😥" });
});

app.listen(process.env.PORT, () => {
  console.log("Listening on http://localhost:" + process.env.PORT);
});
