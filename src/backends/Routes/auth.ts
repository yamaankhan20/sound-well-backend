import { Request, Response, Router } from 'express';
import Users from '../../Model/Users';
import Otp from '../../Model/Otp';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import sendOTPEmail from "../emails/OtpEmails";
import { randomBytes } from 'crypto';
import { Op } from 'sequelize';


dotenv.config();

const router = Router();



const generate_otp = ()=> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // Letters and Numbers
    let otp = '';

    // Generate a random OTP of the specified length using crypto for secure randomness
    for (let i = 0; i < 8; i++) {
        const randomByte = randomBytes(1); // Get a random byte
        const randomIndex = randomByte[0] % characters.length; // Get a value within the range of characters length
        otp += characters.charAt(randomIndex); // Append random character to OTP string
    }

    return otp;
}

router.post('/register', async (req:any, res:any) => {
    let { username, email, password } = req.body;
    const OTP = generate_otp();  // Make sure this function is properly defined

    try {
        const saltRounds = 10;
        password = await bcrypt.hash(password, saltRounds);

        const user = await Users.create({ username, email, password });

        await Otp.create({
            user_id: user.dataValues.id,
            email: user.dataValues.email,
            Otp: OTP
        });

        await Users.update({ is_verified: 0 }, { where: { id: user.dataValues.id } });

        return res.status(201).json({
            message: 'User Registered successfully.'
        });

    } catch (error: any) {
        console.error(error);

        let errorMessage = 'An unknown error occurred.';

        if (error.name === 'SequelizeUniqueConstraintError') {
            if (error.errors[0].path === 'email') {
                errorMessage = 'Email already exists.';
            } else if (error.errors[0].path === 'username') {
                errorMessage = 'Username already exists.';
            }
        }

        return res.status(400).json({
            error_message: errorMessage,
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

                const Auth_token = user.dataValues.email;

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
                        const Auth_token = user.dataValues.email;
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
    const OTP  =generate_otp();
    Users.findOne({ where: { id } })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error_message: 'User not found.' });
            }

            return Otp.create({
                user_id: user.dataValues.id,
                email: user.dataValues.email,
                Otp: OTP
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

router.get('/get-users', async (req, res) => {
    try {
        const all_users = await Users.findAll(
            {
                where: {
                    roles: {
                        [Op.ne]: 'admin',
                    }
                },
                include: {
                    model: Otp,
                    as: 'otps',
                    required: false,
                    order: [
                        ['createdAt', 'DESC'],
                    ],
                    limit: 1,
                }
            }
        );
        res.status(200).json({"data": all_users});
    }catch(err) {
        console.error(err);
        res.status(500).json({ error_message: 'An error occurred while fetching users.' });
    }
})

router.put('/edit-user/:id', async (req: any, res: any) => {
    const { id } = req.params;
    const { username, email, password } = req.body;

    try {
        const user = await Users.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ error_message: 'User not found.' });
        }

        const updatedPassword = password
            ? bcrypt.hash(password, 10)
            : Promise.resolve(user.dataValues.password);

        const hashedPassword = await updatedPassword;

        const updatedUser = await user.update({
            username: username || user.dataValues.username,
            email: email || user.dataValues.email,
            password: hashedPassword,
        });

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error_message: 'An error occurred while updating the user.' });
    }
});

router.delete('/delete-user/:id', async (req:any, res:any) => {
    const { id } = req.params;

    try {
        const user = await Users.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ error_message: 'User not found.' });
        }

        await user.destroy();

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_message: 'An error occurred while deleting the user.' });
    }
});


export default router;
