// routes/authRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const authController = require('../Controllers/authController');

// Signup route
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/playerUsers', authController.getAllUsers);
router.post('/resend-otp', authController.resendOtp);
router.post('/verify-otp', authController.verifyOtp);

router.get('/linked-users', async (req, res) => {
  console.log("came heree")
    try {
      const response = await axios.get('http://api.mallulifesteal.fun/api/linked', {
        headers: {
          Authorization: 'Bearer mallu-public-api-key'
        }
      });

      console.log("userdata",response);
      
  
      res.json(response.data); // Send the response back to Angular
    } catch (error) {
      console.error('Error fetching linked users:', error.message);
      res.status(error.response?.status || 500).json({ error: 'Failed to fetch linked users' });
    }
  });

module.exports = router;
