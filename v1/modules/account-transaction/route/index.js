import Router from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Account Transaction API is working!' });
});

export default router;