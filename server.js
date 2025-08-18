const express = require('express');
const { sequelize } = require('./models'); // Import Sequelize instance

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// Root route to check server status
app.get('/', (req, res) => {
  res.send('Hello, server and database are working!');
});

// Import and use admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);


const courseRoutes = require('./routes/courseRoutes');
app.use('/api/courses', courseRoutes);

const publicRoutes = require('./routes/publicRoutes');
app.use('/public', publicRoutes);


// Authenticate database and start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connection is working!');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
