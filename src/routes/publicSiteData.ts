import { Router } from 'express';
import { getPublicSiteData } from '../controllers/publicSiteDataController';

const router = Router();

router.get('/site-data', getPublicSiteData);

export default router;
