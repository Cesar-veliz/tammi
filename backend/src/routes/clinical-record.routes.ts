import { Router, Response } from 'express';
import { ClinicalRecordService } from '../services/clinical-record.service';
import { CreateClinicalRecordRequest } from '../types';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/patients/:patientId/clinical-records - Get all clinical records for a patient
router.get('/patients/:patientId/clinical-records', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const records = await ClinicalRecordService.getClinicalRecordsByPatient(req.params.patientId);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({
      code: 'DB_001',
      message: 'Error retrieving clinical records',
      details: error.message
    });
  }
});

// POST /api/patients/:patientId/clinical-records - Create new clinical record
router.post('/patients/:patientId/clinical-records', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const recordData: CreateClinicalRecordRequest = req.body;
    const record = await ClinicalRecordService.createClinicalRecord(
      req.params.patientId,
      req.user!.userId,
      recordData
    );
    res.status(201).json(record);
  } catch (error: any) {
    if (error.message.includes('Invalid ophthalmic values')) {
      return res.status(400).json({
        code: 'VAL_004',
        message: error.message
      });
    }

    res.status(500).json({
      code: 'DB_001',
      message: 'Error creating clinical record',
      details: error.message
    });
  }
});

// GET /api/clinical-records/:id - Get clinical record by ID
router.get('/clinical-records/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const record = await ClinicalRecordService.getClinicalRecordById(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        code: 'DB_003',
        message: 'Clinical record not found'
      });
    }

    res.json(record);
  } catch (error: any) {
    res.status(500).json({
      code: 'DB_001',
      message: 'Error retrieving clinical record',
      details: error.message
    });
  }
});

// PUT /api/clinical-records/:id - Update clinical record
router.put('/clinical-records/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const recordData: Partial<CreateClinicalRecordRequest> = req.body;
    const record = await ClinicalRecordService.updateClinicalRecord(req.params.id, recordData);
    res.json(record);
  } catch (error: any) {
    if (error.message.includes('Invalid ophthalmic values')) {
      return res.status(400).json({
        code: 'VAL_004',
        message: error.message
      });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({
        code: 'DB_003',
        message: error.message
      });
    }

    res.status(500).json({
      code: 'DB_001',
      message: 'Error updating clinical record',
      details: error.message
    });
  }
});

export default router;