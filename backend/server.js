const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const { check, validationResult } = require("express-validator")
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()

// CORS configuration with proper frontend URL
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-auth-token", "Authorization"],
}

// Log the allowed origin for debugging
console.log("CORS allowed origin:", process.env.FRONTEND_URL || "*")

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// Add pre-flight OPTIONS handling for all routes
app.options("*", cors(corsOptions))

// Connect to MongoDB using the environment variable
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  savedEvents: [
    {
      type: Number,
    },
  ],
  reminders: [
    {
      eventId: Number,
      eventName: String,
      eventDate: Date,
      reminderTime: Date,
      isNotified: Boolean,
    },
  ],
  notifications: [
    {
      type: {
        type: String,
        enum: ['reminder', 'system'],
        default: 'reminder'
      },
      message: String,
      eventId: Number,
      eventName: String,
      isRead: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const User = mongoose.model("User", userSchema)

// Comment Schema
const commentSchema = new mongoose.Schema({
  event: {
    type: Number, // Assuming eventId is a Number
    required: true,
    ref: 'Event' // If you have an Event model, reference it
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference the User model
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Comment = mongoose.model('Comment', commentSchema);

// Auth middleware
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header("x-auth-token")

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" })
  }

  // Verify token using JWT_SECRET environment variable
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded.user
    next()
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" })
  }
}

// Admin middleware
const adminAuth = (req, res, next) => {
  const token = req.header("x-auth-token");
  console.log('Admin auth token:', token);
  if (token !== "yes") {
    console.log('Admin auth failed: Invalid token');
    return res.status(401).json({ msg: "Not authorized as admin" });
  }
  console.log('Admin auth successful');
  next();
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    environment: {
      nodeEnv: process.env.NODE_ENV || "development",
      frontendUrl: process.env.FRONTEND_URL || "Not set",
      mongoConnected: mongoose.connection.readyState === 1,
    },
  })
})

// Register User
app.post(
  "/api/users/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, email, password } = req.body

      // Check if user exists
      let user = await User.findOne({ email })
      if (user) {
        return res.status(400).json({ errors: [{ msg: "User already exists" }] })
      }

      // Create new user
      user = new User({
        name,
        email,
        password,
      })

      // Hash password
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)

      // Save user
      await user.save()

      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
        },
      }

      // Sign token
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || "your-super-secret-jwt-key",
        { expiresIn: "7d" }
      )

      // Return token immediately
      res.json({ token })
    } catch (err) {
      console.error("Registration Error:", err)
      res.status(500).json({ errors: [{ msg: "Server error during registration" }] })
    }
  }
)

// Login User
app.post(
  "/api/users/login",
  [check("email", "Please include a valid email").isEmail(), check("password", "Password is required").exists()],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      // Check if user exists
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] })
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] })
      }

      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
        },
      }

      // Sign token using JWT_SECRET environment variable
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
        if (err) throw err
        res.json({ token })
      })
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server error")
    }
  },
)

// Get user profile
app.get("/api/users/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Save event
app.post("/api/users/events/save", auth, async (req, res) => {
  try {
    const { eventId } = req.body
    const user = await User.findById(req.user.id)

    // Check if event is already saved
    if (user.savedEvents.includes(eventId)) {
      // Remove event if already saved
      user.savedEvents = user.savedEvents.filter((id) => id !== eventId)
    } else {
      // Add event if not saved
      user.savedEvents.push(eventId)
    }

    await user.save()
    res.json(user.savedEvents)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Get user reminders
app.get("/api/users/reminders", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    // Return reminders, sorted by reminderTime
    const sortedReminders = user.reminders.sort((a, b) => new Date(a.reminderTime) - new Date(b.reminderTime));
    res.json(sortedReminders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Save reminder
app.post("/api/users/reminders", auth, async (req, res) => {
  try {
    const { eventId, eventName, eventDate, reminderTime } = req.body;
    const user = await User.findById(req.user.id);

    // Check if reminder already exists
    const existingIndex = user.reminders.findIndex((r) => r.eventId === eventId);

    if (existingIndex >= 0) {
      // Update existing reminder
      user.reminders[existingIndex] = {
        eventId,
        eventName,
        eventDate,
        reminderTime,
        isNotified: false,
      };
    } else {
      // Add new reminder
      user.reminders.push({
        eventId,
        eventName,
        eventDate,
        reminderTime,
        isNotified: false,
      });
    }

    // Add notification
    const notification = {
      type: 'reminder',
      message: `Reminder set for ${eventName}`,
      eventId,
      eventName,
      isRead: false,
      createdAt: new Date()
    };
    
    user.notifications.push(notification);
    await user.save();

    // Emit notification to the user
    io.to(req.user.id).emit('notification', notification);

    res.json({ 
      reminders: user.reminders,
      notification: notification
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get user notifications
app.get("/api/users/notifications", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Mark notification as read
app.put("/api/users/notifications/:notificationId/read", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const notification = user.notifications.id(req.params.notificationId);
    
    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }
    
    notification.isRead = true;
    await user.save();
    
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Delete reminder
app.delete("/api/users/reminders/:eventId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    // Filter out the reminder
    user.reminders = user.reminders.filter((reminder) => reminder.eventId !== Number.parseInt(req.params.eventId))

    await user.save()
    res.json(user.reminders)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Comment Endpoints - Moved before server.listen()

// Get comments for an event
app.get('/api/events/:eventId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ event: req.params.eventId }).populate('user', ['name']); // Populate user name
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a comment to an event
app.post('/api/events/:eventId/comments', auth, async (req, res) => {
  try {
    const newComment = new Comment({
      event: req.params.eventId,
      text: req.body.text,
      user: req.user.id // Get user from auth middleware
    });

    const comment = await newComment.save();
    
    // Populate user name before returning
    await comment.populate('user', ['name']);

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a comment
app.delete('/api/events/:eventId/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check if user owns the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await comment.deleteOne();
    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a comment
app.put('/api/events/:eventId/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check if user owns the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update comment text
    comment.text = req.body.text;
    await comment.save();
    
    // Populate user name before returning
    await comment.populate('user', ['name']);
    
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete event (admin only)
app.delete("/api/events/:eventId", adminAuth, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    console.log('Attempting to delete event:', eventId);
    
    // Delete all comments for this event
    const commentsResult = await Comment.deleteMany({ event: eventId });
    console.log('Deleted comments:', commentsResult);
    
    // Remove event from all users' saved events and reminders
    const usersResult = await User.updateMany(
      {},
      {
        $pull: {
          savedEvents: eventId,
          reminders: { eventId: eventId },
          notifications: { eventId: eventId }
        }
      }
    );
    console.log('Updated users:', usersResult);

    // Emit event deletion notification to all connected clients
    io.emit('eventDeleted', { eventId });
    console.log('Emitted event deletion notification');

    res.json({ msg: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ msg: "Server error while deleting event" });
  }
});

// Start server using PORT environment variable
const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected via Socket.IO');
  // You can add your real-time event handlers here
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
