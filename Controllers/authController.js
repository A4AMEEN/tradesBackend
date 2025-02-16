const nodemailer = require('nodemailer');
const crypto = require('crypto');
const player = require('../Models/player');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();


let tempUserData = {}; // Temporary storage for user details
let otpStorage = {}; // Temporary storage for OTPs

// Signup - Store user data and send OTP

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("it came here")

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        // Check if user exists
        const existingUser = await player.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // Validate password (Plain text comparison)
        if (existingUser.password !== password) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email },
            process.env.SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful!",
            user: { name: existingUser.name, email: existingUser.email,_id:existingUser._id },
            token,
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
};


exports.signup = async (req, res) => {
    const { InGameName, email, password } = req.body;

    if (!InGameName || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Check if InGameName or email already exists
    const existingUser = await player.findOne({
        $or: [{ name: InGameName }, { email: email }],
    });

    if (existingUser) {
        console.log("error ")
        return res.status(400).json({
            error: "Username or email is already registered.",
        });
    }

    // Store user data temporarily
    tempUserData[email] = { InGameName, email, password };

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999);
    otpStorage[email] = otp;

    console.log(`Generated OTP for ${email}: ${otp}`);

    // Send OTP via email
    await sendOtpEmail(email, otp);

    // Send response
    res.status(200).json({ message: 'OTP sent successfully', email });
};

// Get all registered users
exports.getAllUsers = async (req, res) => {
    console.log("hhei");
    
    try {
        // Fetch all users from the database
        const users = await player.find({}, 'name email totalTrades trades createdAt'); // Fetch specific fields

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        // Return the list of users
        console.log("hhei",users);
        res.status(200).json({
            message: "Users fetched successfully",
            users,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
 

// Function to send OTP via Nodemailer
const sendOtpEmail = async (email, otp) => {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'testtdemoo11111@gmail.com',
            pass: 'wikvaxsgqyebphvh',
        },
    });

    let mailOptions = {
        from: 'lifestealtrades@gmail.com',
        to: email,
        subject: 'Minecraft-Themed OTP Verification',
        html: `
          <div style="background-color: #1e1e1e; padding: 20px; color: #fff; text-align: center; font-family: Minecraft, sans-serif;">
            <h2 style="color: #00ff00;">LifeSteal Trade  Verification Code</h2>
            <p>Your OTP for verification is:</p>
            <h1 style="background-color: #333; padding: 10px; display: inline-block; border-radius: 5px;">${otp}</h1>
            <p>This OTP is valid for <strong>60 seconds</strong>. Do not share it with anyone.</p>
          </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    console.log("body", req.body);


    if (otpStorage[email] && otpStorage[email] == otp) {
        // OTP is correct, complete registration
        console.log('User verified:', tempUserData[email]);

        const userData = tempUserData[email];

        if (!userData) {
            return res.status(400)({ error: "UserData not found/Expired! Please signUp again" })
        }

        const newUser = new player({
            name: userData.InGameName,
            email: userData.email,
            password: userData.password,
            totalTrades: 0,
            trades: []
        })

        await newUser.save()
        const SECRET_KEY = process.env.SECRET_KEY
        const token = jwt.sign({ userId: newUser._id, email: newUser.email }, SECRET_KEY, { expiresIn: "7d" });

        console.log("Its Done", newUser, token);


        // TODO: Save user to database here

        // Cleanup temp storage
        delete tempUserData[email];
        delete otpStorage[email];

        res.status(200).json({
            message: "OTP verified successfully!",
            user: {
                name: newUser.name,
                email: newUser.email,
                _id:newUser._id
            },
            token,
        });
    } else {
        return res.status(400).json({ message: 'Invalid OTP' });
    }
};

// Resend OTP
exports.resendOtp = async (req, res) => {


    const { email } = req.body;
    console.log("ressend", req.body);

    if (!tempUserData[email]) {
        return res.status(400).json({ message: 'User not found, please sign up again' });
    }

    const newOtp = crypto.randomInt(100000, 999999);
    otpStorage[email] = newOtp;

    console.log(`Resent OTP for ${email}: ${newOtp}`);

    await sendOtpEmail(email, newOtp);
    res.status(200).json({ message: 'New OTP sent successfully' });
};
