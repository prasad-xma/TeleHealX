const { checkSymptoms } = require('../service/aiService');

const analyzeSymptoms = async (req, res) => {
    try {
        const { symptoms, patientId } = req.body;

        if (typeof symptoms !== 'string' || !symptoms.trim()) {
            return res.status(400).json({ message: 'Symptoms are required' });
        }

        const data = await checkSymptoms({
            symptoms: symptoms.trim(),
            patientId,
        });

        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: error.message || 'Failed to analyze symptoms' });
    }
};

module.exports = {
    analyzeSymptoms,
};