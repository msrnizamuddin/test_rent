import mongoose from 'mongoose';

const { Schema, model, ObjectId } = mongoose;

const brandSchema = new Schema(
	{
		tenantId: {
			type: String,
			required: true
			// unique: true
		},

		centralStatus: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active'
		},

		name: {
			type: String,
			required: [true, 'Brand name is required']
		},

		slug: {
			type: String,
			required: [true, 'Slug is required'],
			unique: true,
			trim: true,
			lowercase: true
		},

		profileImage: {
			type: String,
			default: ''
		},

		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active'
		},

		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},

		updatedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			default: null
		}
	},
	{
		timestamps: true
	}
);

export const Brand = model('Brand', brandSchema);
