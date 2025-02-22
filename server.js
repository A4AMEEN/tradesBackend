const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./Routers/authRoutes');
const tradeRoutes = require('./Routers/tradeRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: ['https://mallutrades.vercel.app', 'http://localhost:4200'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);

app.get('/test', (req, res) => {
  console.log("backend Pinginnnngggg...")
  res.json({ message: "Hello from backend" });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://alameenmail07:45ZzYzLognmUo34k@cluster0.u1jnq.mongodb.net/Cluster0?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('DB Connection Error:', err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});