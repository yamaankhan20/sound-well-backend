import { Request, Response, Router } from 'express';
import Users from '../../Model/Users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

interface MongoError extends Error {
    code?: number;
    keyValue?: { email?: string; username?: string };
}
const generateToken = (email: string) => {
    return jwt.sign({ email: email }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
};

router.post('/register',async (req, res) => {
    let { username, email, password } = req.body;
    try {
        const saltRounds = 10;
        password = await bcrypt.hash(password, saltRounds);

        const user = new Users({ username, email, password });

        await user.save();
        res.status(201).json(
            {
                "message": "User Registered successfully",
            }
        );

    } catch (error: any) {

        const mongoError = error as MongoError;

        let errorMessage = 'An unknown error occurred.';

        if (mongoError.code === 11000) {
            if(mongoError.keyValue?.email){
                errorMessage = `Email already exists.`;
            }else if(mongoError.keyValue?.username){
                errorMessage = `Username already exists.`;
            }

        }

        res.status(400).json({
            'error_message': errorMessage,
        });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    Users.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error_message: 'User not found.' });
            }

            return bcrypt.compare(password, user.password).then(isMatch => {
                if (!isMatch) {
                    return res.status(401).json({ error_message: 'Invalid credentials.' });
                }
                const Auth_token = generateToken(email);

                res.status(200).json({ message: 'Login successful', token: Auth_token  });
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error_message: 'An unknown error occurred.' });
        });
});


export default router;
