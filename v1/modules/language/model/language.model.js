import { Schema, model } from 'mongoose';

const languageSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		code: {
			type: String,
			required: true,
			unique: true,
			trim: true
		},
		centralStatus: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active'
		}
	},
	{ timestamps: true }
);

const Language = model('Language', languageSchema);

export default Language;
