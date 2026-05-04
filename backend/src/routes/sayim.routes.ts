import { Router } from 'express';
import { barkodOku } from '../controllers/sayim.controller';

const router = Router();

// POST /api/v1/sayim/oku
router.post('/oku', barkodOku);

export default router;

