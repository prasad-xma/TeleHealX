import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    questionnaireId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Questionnaire",
        required: true
    },
    aiResponse: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export default mongoose.model("Result", resultSchema);