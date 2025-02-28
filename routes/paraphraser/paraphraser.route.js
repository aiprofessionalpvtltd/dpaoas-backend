// routes/paraphraser.route.js
const express = require("express");
const { paraphraseText } = require("../../services/paraphraser");
const router = express.Router();

/**
 * @swagger
 * /api/paraphraser:
 *   post:
 *     summary: Paraphrase text
 *     description: Returns multiple paraphrasing options for a given text
 *     tags: [Paraphraser]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to paraphrase
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 original:
 *                   type: string
 *                   example: "This is the original text."
 *                 paraphrased:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["This is a paraphrased version.", "Another paraphrased option."]
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Text is required"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error processing your request"
 */
router.post("/", async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Text is required' 
      });
    }
    
    // Generate multiple paraphrasing options
    const paraphrasedOptions = await paraphraseText(text);
    
    return res.status(200).json({
      success: true,
      original: text,
      paraphrased: paraphrasedOptions
    });
    
  } catch (error) {
    console.error('Error paraphrasing text:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing your request' 
    });
  }
});

// Optional: Add an endpoint to verify the service is running
router.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Paraphraser service is running"
  });
});

module.exports = router;