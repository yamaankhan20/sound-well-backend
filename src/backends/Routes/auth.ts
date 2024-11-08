import { Request, Response, Router } from 'express';
import Users from '../../Model/Users';
import Otp from '../../Model/Otp';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as speakeasy from 'speakeasy';
import sendOTPEmail from "../emails/OtpEmails";


dotenv.config();

const router = Router();

const generateToken = (email: string) => {
    return jwt.sign({ email: email }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
};

const generate_otp = ()=> {
    const otp = speakeasy.totp({
        secret : <string> process.env.SPEAKEASY_SECRET,
        encoding: 'base32'
    });
    return otp;
}

router.post('/register',async (req, res) => {
    let { username, email, password } = req.body;
    try {
        const saltRounds = 10;
        password = await bcrypt.hash(password, saltRounds);

        const user = await Users.create({ username, email, password });

        res.status(201).json(
            {
                // "id": user.dataValues.id,
                "message": "User Registered successfully",
            }
        );

    } catch (error: any) {

        let errorMessage = 'An unknown error occurred.';

        if (error.name === 'SequelizeUniqueConstraintError') {
            if (error.errors[0].path === 'email') {
                errorMessage = 'Email already exists.';
            } else if (error.errors[0].path === 'username') {
                errorMessage = 'Username already exists.';
            }
        }

        res.status(400).json({
            'error_message': errorMessage,
        });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    Users.findOne({ where: { email } })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error_message: 'User not found.' });
            }
            return bcrypt.compare(password, user.dataValues.password).then(isMatch => {
                if (!isMatch) {
                    return res.status(401).json({ error_message: 'Invalid credentials.' });
                }

                const Auth_token = generateToken(email);

                if(user.dataValues.roles === 'admin'){
                    res.status(200).json({ message: 'Login successful', token: Auth_token, role: 'admin'  });
                }else{
                    if(user.dataValues.is_verified === 0){
                        return res.status(400).json({
                            id: user.dataValues.id,
                            error_message: 'You Are Not Verified',
                        });
                    }
                    res.status(200).json({ message: 'Login successful', token: Auth_token, role: 'user'  });
                }

            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error_message: 'An unknown error occurred.' });
        });
});

router.get('/verification/:id', (req: Request<{ id: string }, any, { otp: string }>, res: Response) => {
    const { id } = req.params;
    const { otp } = req.body;

    Users.findOne({ where: { id } })
        .then(user => {

            if (!user) {
                return res.status(404).json({ error_message: 'User not found.' });
            }

            if (user.dataValues.is_verified === 1) {
                return res.status(400).json({ error_message: 'User is already verified.' });
            }

            return Otp.findOne({ where: { user_id: id } }).then(userOtp => {
                if (!userOtp || userOtp.dataValues.otp !== otp) {
                    return res.status(400).json({ error_message: 'Invalid OTP.' });
                }


                return Users.update({ is_verified: 1 }, { where: { id } })
                    .then(() => {
                        const Auth_token = generateToken(user.dataValues.email);
                        return res.status(200).json({ message: 'User verified successfully', token: Auth_token });
                    });
            });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error_message: 'An unknown error occurred.' });
        });
});

router.post('/resend-otp', async (req, res) => {
    const { id } = req.body;

    Users.findOne({ where: { id } })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error_message: 'User not found.' });
            }

            return Otp.create({
                user_id: user.dataValues.id,
                email: user.dataValues.email,
                Otp: generate_otp()
            }).then(otpUser => {
                Users.update({ is_verified: 0 }, { where: { id } });
                sendOTPEmail(user.dataValues.email, otpUser.dataValues.Otp);
                return res.status(201).json({
                    "id": user.dataValues.id,
                    "message": "OTP sent successfully",
                });
            });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error_message: 'An unknown error occurred.' });
        });
})
export default router;
