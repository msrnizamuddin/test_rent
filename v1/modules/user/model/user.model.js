import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs"; 

const employeeLoginSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

employeeLoginSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

employeeLoginSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


const User = model('User', employeeLoginSchema);
export default User;
// Password hash করার জন্য pre-save hook
