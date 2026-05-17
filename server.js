const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const DeviceCommand = require("./models/DeviceCommand");
const user_model = require("./models/user_model");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// ======================
// MongoDB Connection
// ======================

// mongodb://127.0.0.1:27017/iot_DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server Listening on port ${PORT}`);
    });

  })
  .catch((err) => {
    console.log("MongoDB Error:", err);
  });



// POST ROUTE

app.post("/api/device", async (req, res) => {
  try {
    const { command } = req.body;

    // Validate input
    if (!["ON", "OFF"].includes(command)) {
      return res.status(400).json({
        success: false,
        message: "Command must be ON or OFF",
      });
    }

    // Save to DB
    const newCommand = new DeviceCommand({
      command,
    });

    await newCommand.save();

    console.log("New Device Command:", command);

    res.status(200).json({
      success: true,
      command: newCommand.command,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});



// GET ROUTE

app.get("/api/device", async (req, res) => {
  try {

    // Get latest command
    const latestCommand = await DeviceCommand
      .findOne()
      .sort({ createdAt: -1 });

    // If no command exists
    if (!latestCommand) {
      return res.status(404).json({
        success: false,
        message: "No command found",
      });
    }


    res.status(200).json({
      success: true,
      command: latestCommand.command,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

//SIGNUP ROUTE
app.post("/api/signup", async (req, res) => {

  try {

    const { name, phone, email, password } = req.body;

    // Check if email already exists

    const existingUser = await user_model.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Create new user

    const newUser = new user_model({
      name,
      phone,
      email,
      password,
    });

    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      user: newUser,
    });
    console.log(newUser)
  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

    
  }

});


//LOGIN ROUTE
app.post("/api/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    // Check if user exists

    const user = await user_model.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check password

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // Login successful

    res.status(200).json({
      message: "Login successful",
      user,
    });
    console.log(user.email)

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

  }

});

let lastSeen = null;

app.post("/api/device/heartbeat", (req, res) => {

  lastSeen = Date.now();

  res.json({
    success: true
  });
});

app.get("/api/device/status", (req, res) => {

  const now = Date.now();

  let status = "OFFLINE";

  if (lastSeen && (now - lastSeen < 20000)) {
    status = "ONLINE";
  }

  res.json({
    status,
    lastSeen
  });
});

const PORT = process.env.PORT||3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Listening on port ${PORT}`);
});


