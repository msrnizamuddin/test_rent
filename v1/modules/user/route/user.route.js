import express from 'express'
import { getUserController } from '../controller/user.controller.js'


const router = express.Router()


router.get('/', getUserController)

export default router