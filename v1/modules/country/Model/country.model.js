import mongoose from 'mongoose'

const { Schema } = mongoose

const CountrySchema = new Schema(
    {
        name:
        {
            type: String,
            required: true
        },
        centralStatus: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        code:
        {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
)


const Country = mongoose.model('Country', CountrySchema);
export default Country;