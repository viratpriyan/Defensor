const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'Please add all fields' });
        }

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('phone', '==', phone).get();

        if (!snapshot.empty) {
            return res.status(400).json({ success: false, message: 'User already exists with this phone number' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserRef = usersRef.doc();
        await newUserRef.set({
            name,
            email,
            phone,
            password: hashedPassword,
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: newUserRef.id,
                name,
                email,
                phone,
                token: generateToken(newUserRef.id)
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Please enter phone and password' });
        }

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('phone', '==', phone).get();

        if (snapshot.empty) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        let userDoc;
        snapshot.forEach(doc => { userDoc = { id: doc.id, ...doc.data() }; });

        const isMatch = await bcrypt.compare(password, userDoc.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: {
                id: userDoc.id,
                name: userDoc.name,
                email: userDoc.email,
                phone: userDoc.phone,
                token: generateToken(userDoc.id)
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

module.exports = { registerUser, loginUser };
