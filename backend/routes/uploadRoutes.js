import express from 'express';
import cloudinary from '../config/cloudinary.js';
import Patient from '../models/Patient.js';

const router = express.Router();

const validateFile = (file) => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf'];

  if (!file) return 'No file provided';
  if (file.size > MAX_FILE_SIZE) return 'File size exceeds 10MB limit';
  if (!allowedTypes.includes(file.mimetype)) return 'Only PDF files are allowed';

  return null;
};

router.post('/cloudinary', async (req, res) => {
  try {
    if (!req.files || !req.files.report) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const file = req.files.report;
    const validationError = validateFile(file);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'cbc_reports',
      resource_type: 'raw',
      allowed_formats: ['pdf']
    });
    // If patientId is provided, associate the document with the patient
    if (req.body.patientId) {
      const patient = await Patient.findById(req.body.patientId);
      if (patient) {
        patient.documents.push({
          url: result.secure_url,
          public_id: result.public_id,
          uploadDate: new Date(),
          documentType: 'CBC_Report'
        });
        await patient.save();
      }
    }

    res.json({
      message: 'File uploaded successfully',
      fileUrl: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading file',
      error: error.message 
    });
  }
});

export default router;