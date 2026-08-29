import mongoose from "mongoose"

const currencySchema = new mongoose.Schema(
	{
		centralStatus: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
			required: true
		},

		name: {
			type: String,
			required: true,
			trim: true
		},

		cc: {
			type: String,
			required: true,
			uppercase: true,
			trim: true
		},

		symbol: {
			type: String,
			required: true,
			trim: true
		}
	},
	{ timestamps: true }
);


const Currency = mongoose.model('Currency', currencySchema);
export default Currency;
