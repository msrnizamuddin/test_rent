import { Router } from "express";
import brandController from '../controller/createBrand.js';
import validate from '../middleware/validate.js';
import schema from '../validation/brand.validation.js';
const router = Router();

router.post('/createBrand', validate(schema), brandController.createBrand);
router.get('/getBrand', brandController.getBrands);
router.get('/getBrand/:id', brandController.getBrandById);
router.patch('/update/:id', brandController.updateBrand);
router.delete('/delete/:id', brandController.deleteBrand);
router.put('/update/:id', brandController.updateBrand);


export default router;