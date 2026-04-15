import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        symptoms: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

export default mongoose.model("Questionnaire", questionSchema);