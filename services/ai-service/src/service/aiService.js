const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const Questionnaire = require('../models/Questionnaire');
const Result = require('../models/Result');

const modelCandidates = [
    process.env.GEMINI_MODEL,
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
].filter(Boolean);

const isMissingModelError = (error) => {
    const message = error?.message || '';

    return error?.status === 404 || message.includes('not found') || message.includes('not supported for generateContent');
};

const isQuotaError = (error) => {
    const message = error?.message || '';

    return error?.status === 429 || message.includes('Too Many Requests') || message.includes('quota');
};

const buildFallbackResponse = (symptoms) => {
    return [
        'AI service is busy or quota is exceeded, so this is a basic fallback response.',
        '',
        'Possible conditions:',
        '- Common viral infection or flu like illness',
        '- Mild seasonal illness or fatigue related symptoms',
        '',
        'Recommended doctor specialty:',
        '- General physician or primary care doctor',
        '',
        'Basic self care advice:',
        '- Rest well and drink enough water',
        '- Monitor your symptoms for changes',
        '- Take only basic medicine you normally tolerate if needed',
        '',
        'Red flags that need urgent care:',
        '- Trouble breathing',
        '- Chest pain',
        '- Severe weakness, confusion, or fainting',
        '- High fever that does not improve',
        '',
        `Symptoms entered: ${symptoms}`,
    ].join('\n');
};

const checkSymptoms = async ({ symptoms, patientId }) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const questionnaire = await Questionnaire.create({
        patientId,
        symptoms,
    });

    const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const prompt = `
You are a medical triage assistant.
Symptoms: ${symptoms}

Return a concise response with:
1. Possible conditions
2. Recommended doctor specialty
3. Basic self-care advice
4. Red flags that need urgent care
`;

    let aiResponse = '';
    let lastError = null;

    for (const modelName of modelCandidates) {
        try {
            const model = geminiAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            aiResponse = response.text();

            if (aiResponse) {
                break;
            }
        } catch (error) {
            lastError = error;

            if (!isMissingModelError(error) || modelName === modelCandidates[modelCandidates.length - 1]) {
                if (isQuotaError(error)) {
                    aiResponse = buildFallbackResponse(symptoms);
                    break;
                }

                throw error;
            }
        }
    }

    if (!aiResponse) {
        if (lastError && isQuotaError(lastError)) {
            aiResponse = buildFallbackResponse(symptoms);
        } else {
            throw new Error('AI response was empty');
        }
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

const getLatestResultByPatient = async ({ patientId }) => {
    if (!patientId) {
        throw new Error('patientId is required');
    }

    if (!mongoose.Types.ObjectId.isValid(String(patientId))) {
        throw new Error('Invalid patientId');
    }

    const latestQuestionnaire = await Questionnaire.findOne({ patientId })
        .sort({ createdAt: -1 })
        .lean();

    if (!latestQuestionnaire) {
        return {
            questionnaire: null,
            result: null,
            aiResponse: '',
        };
    }

    const latestResult = await Result.findOne({ questionnaireId: latestQuestionnaire._id })
        .sort({ createdAt: -1 })
        .lean();

    return {
        questionnaire: latestQuestionnaire,
        result: latestResult || null,
        aiResponse: latestResult?.aiResponse || '',
    };
};

module.exports = {
    checkSymptoms,
    getLatestResultByPatient,
};