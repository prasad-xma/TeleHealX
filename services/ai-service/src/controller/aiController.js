import {GoogleGenerativeAI} from '@google/generative-ai';
// import dotenv from 'dotenv';

dotenv.config();

const geminiAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

export const symptomsChecker = async (req, res) => {
    try {
        const { symtoms } = req.body;

        const model = geminiAI.getGenerativeModel({ model: "gemini-pro" });
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(5000).json({ error: "Fail to generate..."});
    }
};