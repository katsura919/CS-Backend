const Process = require('../models/processModel');
const generateEmbedding  = require("../utils/generateEmbedding");

exports.createProcess = async (req, res) => {
  try {
    const { title, description, steps } = req.body;

    if (!title || !description || !steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ error: "Title, description, and at least one step are required." });
    }

    // Prepare text for embedding
    const textToEmbed = `${title}. ${description}. Steps: ${steps.join(". ")}`;

    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed);
    if (!embedding) {
      return res.status(500).json({ error: "Failed to generate embedding." });
    }

    // Save process with embedding
    const newProcess = new Process({ title, description, steps, embedding });
    await newProcess.save();

    res.status(201).json(newProcess);
  } catch (error) {
    console.error("Error creating process:", error);
    res.status(500).json({ error: "Error creating process." });
  }
};

exports.getProcesses = async (req, res) => {
  try {
    const processes = await Process.find().sort({ createdAt: -1 }); // Sorts by latest created
    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching processes.' });
  }
};

exports.getProcessById = async (req, res) => {
  try {
    const process = await Process.findById(req.params.id);
    if (!process) {
      return res.status(404).json({ error: 'Process not found.' });
    }
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching process.' });
  }
};

exports.updateProcess = async (req, res) => {
  try {
    const { title, description, steps } = req.body;

    // Generate new embedding if content is updated
    const textToEmbed = `${title} ${description} ${steps.join(" ")}`;
    const embedding = await generateEmbedding(textToEmbed);

    const updatedProcess = await Process.findByIdAndUpdate(
      req.params.id,
      { title, description, steps, embedding },
      { new: true, runValidators: true }
    );

    if (!updatedProcess) {
      return res.status(404).json({ error: "Process not found." });
    }
    res.json(updatedProcess);
  } catch (error) {
    res.status(500).json({ error: "Error updating process." });
  }
};

exports.deleteProcess = async (req, res) => {
  try {
    const deletedProcess = await Process.findByIdAndDelete(req.params.id);
    if (!deletedProcess) {
      return res.status(404).json({ error: 'Process not found.' });
    }
    res.json({ message: 'Process deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting process.' });
  }
};
