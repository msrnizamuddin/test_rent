import { Router } from 'express';
import CurrencyRouter from './currency.route.js';

const router = Router();

router.get('/health', (req, res) => {
	res.json({ message: 'Currency route working Good ✅' });
});

router.use('/', CurrencyRouter);

export default router;
