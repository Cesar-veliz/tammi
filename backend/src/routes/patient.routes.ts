import { Router, Response } from 'express';
import { PatientService } from '../services/patient.service';
import { CreatePatientRequest } from '../types';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/patients - Search patients with pagination
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await PatientService.searchPatients(query, page, limit);
    return res.json(result);
  } catch (error: any) {
    res.status(500).json({
      code: 'DB_001',
      message: 'Error searching patients',
      details: error.message
    });
  }
});

// GET /api/patients/:id - Get patient by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const patient = await PatientService.getPatientById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        code: 'DB_003',
        message: 'Patient not found'
      });
    }

    return res.json(patient);
  } catch (error: any) {
    res.status(500).json({
      code: 'DB_001',
      message: 'Error retrieving patient',
      details: error.message
    });
  }
});

// POST /api/patients - Create new patient
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const patientData: CreatePatientRequest = req.body;
    const patient = await PatientService.createPatient(patientData);
    return res.status(201).json(patient);
  } catch (error: any) {
    if (error.message.includes('Missing required fields')) {
      return res.status(400).json({
        code: 'VAL_003',
        message: error.message
      });
    }

    if (error.message.includes('Invalid RUT')) {
      return res.status(400).json({
        code: 'VAL_001',
        message: error.message
      });
    }

    if (error.message.includes('already exists')) {
      return res.status(409).json({
        code: 'VAL_002',
        message: error.message
      });
    }

    res.status(500).json({
      code: 'DB_001',
      message: 'Error creating patient',
      details: error.message
    });
  }
});

// PUT /api/patients/:id - Update patient
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const patientData: Partial<CreatePatientRequest> = req.body;
    const patient = await PatientService.updatePatient(req.params.id, patientData);
    return res.json(patient);
  } catch (error: any) {
    if (error.message.includes('Invalid RUT')) {
      return res.status(400).json({
        code: 'VAL_001',
        message: error.message
      });
    }

    res.status(500).json({
      code: 'DB_001',
      message: 'Error updating patient',
      details: error.message
    });
  }
});

// DELETE /api/patients/:id - Delete patient (Admin only)
router.delete('/:id', requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await PatientService.deletePatient(req.params.id);
    return res.status(204).send();
  } catch (error: any) {
    res.status(500).json({
      code: 'DB_001',
      message: 'Error deleting patient',
      details: error.message
    });
  }
});

export default router;