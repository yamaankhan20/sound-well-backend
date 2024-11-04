import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/chat-system');
    } catch (error) {
        process.exit(1);
    }
};

export default connectDB;
