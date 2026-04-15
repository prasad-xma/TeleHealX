const { GoogleGenerativeAI } = require('@google/generative-ai');
const Questionnaire = require('../models/Questionnaire');
const Result = require('../models/Result');

const checkSymptoms = async ({ symptoms, patientId }) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const questionnaire = await Questionnaire.create({
        patientId,
        symptoms,
    });

    const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are a medical triage assistant.
Symptoms: ${symptoms}

Return a concise response with:
1. Possible conditions
2. Recommended doctor specialty
3. Basic self-care advice
4. Red flags that need urgent care
`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    if (!aiResponse) {
        throw new Error('AI response was empty');
    }

    const savedResult = await Result.create({
        questionnaireId: questionnaire._id,
        aiResponse,
    });

    return {
        questionnaire,
        result: savedResult,
        aiResponse,
    };
};

module.exports = {
    checkSymptoms,
};