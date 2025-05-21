const FAQ = require('../models/knowledgeModel');
const generateEmbedding = require("../utils/generateEmbedding");

exports.createFAQ = async (req, res) => {
    try {
        const { question, answer, tenantId } = req.body;
        
        // Validation
        if (!question || !answer || !tenantId) {
            return res.status(400).json({
                error: "Question, answer, and tenantId are required."
            });
        }

        // Prepare text for embedding
        const textToEmbed = `${question}. ${answer}`;
        const embedding = await generateEmbedding(textToEmbed);
        
        if (!embedding) {
            return res.status(500).json({
                error: "Failed to generate embedding."
            });
        }

        // Create new FAQ
        const newFAQ = new FAQ({
            question,
            answer,
            tenantId,
            embedding
        });
        
        await newFAQ.save();
        res.status(201).json(newFAQ);
    } catch (error) {
        console.error("Error creating FAQ:", error);
        res.status(500).json({ error: "Error creating FAQ." });
    }
};

exports.getFAQs = async (req, res) => {
    try {
        const tenantId = req.query.tenantId;
        const FAQs = await FAQ.find()
            .where('tenantId', tenantId)
            .sort({ createdAt: -1 }); // Updated to use createdAt instead of sentAt
        res.json(FAQs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching FAQs.' });
    }
};

exports.getFAQById = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found.' });
        }
        res.json(faq);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching FAQ.' });
    }
};

exports.updateFAQ = async (req, res) => {
    try {
        const { question, answer } = req.body;
        
        // Generate new embedding if content is updated
        const textToEmbed = `${question} ${answer}`;
        const embedding = await generateEmbedding(textToEmbed);
        
        const updatedFAQ = await FAQ.findByIdAndUpdate(
            req.params.id,
            { question, answer, embedding },
            { new: true, runValidators: true }
        );
        
        if (!updatedFAQ) {
            return res.status(404).json({ error: "FAQ not found." });
        }
        
        res.json(updatedFAQ);
    } catch (error) {
        res.status(500).json({ error: "Error updating FAQ." });
    }
};

exports.deleteFAQ = async (req, res) => {
    try {
        const deletedFAQ = await FAQ.findByIdAndDelete(req.params.id);
        if (!deletedFAQ) {
            return res.status(404).json({ error: 'FAQ not found.' });
        }
        res.json({ message: 'FAQ deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting FAQ.' });
    }
};