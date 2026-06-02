import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
	{
		tenantId: {
			type: String,
			unique: true
		},
		shopName: {
			type: String,
			required: [true, 'shop name is required'],
			trim: true
		},
		email: {
			type: String,
			required: [true, 'email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
		},
		status: {
			type: String,
			enum: ['active', 'inactive', 'suspended'],
			default: 'active'
		},
		plan: {
			type: String,
			enum: ['free', 'basic', 'pro'],
			default: 'free'
		}
	},
	{ timestamps: true, versionKey: false }
);

export default mongoose.model('Tenant', tenantSchema);
