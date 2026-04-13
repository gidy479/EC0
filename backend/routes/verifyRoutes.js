const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Verify product eco-claims via AI
// @route   POST /api/verify/:productId
// @access  Private
router.post('/:productId', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const prompt = `
You are a strict sustainability expert AI analyzing an e-commerce product for "greenwashing".
Product Name: "${product.name}"
Product Description: "${product.description}"
Eco Labels: ${product.ecoLabels && product.ecoLabels.length > 0 ? product.ecoLabels.join(', ') : 'None'}

Determine if these claims are legitimate or vague "greenwashing". Vague buzzwords like "100% natural magic" should be rejected. Concrete materials (like "Bamboo toothbrush with FSC certification") should be accepted.

Return ONLY a valid JSON object strictly matching this format:
{
  "status": "verified" | "rejected",
  "confidence": <number between 0 and 1>,
  "reasoning": "<short sentence explaining the decision>"
}
`;

        let aiResponseJSON;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                }
            });

            aiResponseJSON = JSON.parse(response.text);

            // Validate response shape
            if (!aiResponseJSON.status || aiResponseJSON.confidence === undefined || !aiResponseJSON.reasoning) {
                throw new Error("Invalid response shape");
            }
        } catch (apiError) {
            console.error("Gemini API Error:", apiError);
            
            let errorMessage = "AI Verification service is currently unavailable. Please try again later.";
            if (apiError.status === 429) {
                errorMessage = "AI Verification quota exceeded. Please try again later.";
            } else if (apiError.status === 503) {
                errorMessage = "AI Verification service is experiencing temporary high demand.";
            } else if (apiError.message && apiError.message.includes('API key not valid')) {
                errorMessage = "Invalid Gemini API Key configuration.";
            }

            return res.status(503).json({ 
                message: errorMessage,
                error: apiError.message
            });
        }

        product.verificationStatus = aiResponseJSON.status;
        product.aiConfidenceScore = aiResponseJSON.confidence;
        product.verificationReasoning = aiResponseJSON.reasoning;

        await product.save();

        res.json({
            status: product.verificationStatus,
            confidence: product.aiConfidenceScore,
            reasoning: product.verificationReasoning,
        });
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: error.message || "Internal server error during verification" });
    }
});

module.exports = router;
