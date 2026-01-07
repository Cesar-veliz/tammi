import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../types';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const credentials: LoginRequest = req.body;

    if (!credentials.username || !credentials.password) {
      return res.status(400).json({
        code: 'VAL_003',
        message: 'Username and password are required'
      });
    }

    const authResponse = await AuthService.login(credentials);
    return res.json(authResponse);
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        code: 'AUTH_001',
        message: 'Invalid username or password'
      });
    }

    res.status(500).json({
      code: 'DB_001',
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  // In a stateless JWT system, logout is handled client-side
  // by removing the token from storage
  return res.json({ success: true, message: 'Logged out successfully' });
});

export default router;