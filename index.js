// server/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

// ✅ Load .env variables
dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();

// ✅ Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ✅ MongoDB Connection (modern syntax)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/flows', require('./routes/flows'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/track', require('./routes/trackingRoutes'));


// ✅ Tracking Routes
try {
  const trackingRoutes = require('./routes/trackingRoutes');
  if (typeof trackingRoutes === 'function') {
    app.use('/track', trackingRoutes);
  } else {
    console.warn('⚠️ trackingRoutes is not a valid router function');
  }
} catch (err) {
  console.warn('⚠️ Tracking routes failed to load:', err.message);
}

// ✅ Background Services: Queue + Trigger Engine
try {
  const queueRunner = require('./scheduler/queueRunner');
  if (typeof queueRunner === 'function') {
    queueRunner();
  } else {
    console.warn('⚠️ queueRunner is not a function');
  }

  require('./engine/triggerEngine');
} catch (err) {
  console.warn('⚠️ Background services failed to start:', err.message);
}

// ✅ Optional Global Error Handler
try {
  const errorHandler = require('./middleware/errorHandler');
  app.use(errorHandler);
} catch (err) {
  console.warn('⚠️ Global error handler not found:', err.message);
}

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
