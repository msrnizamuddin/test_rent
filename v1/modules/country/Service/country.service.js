import Country from '../Model/country.model.js'
export const createCountryService = async(payload) =>
{
    const result = await Country.create(payload)
    return result
}

export const getAllCountryService = async()=>
{
    const result = await Country.find({})
    return result
}


export const getCountryByIDService = async(id)=>
{
    const result = await Country.findById(id)
    return result
}


export const updateCountryService = async(id, payload) =>
{
    const result = await Country.findByIdAndUpdate(
                id,
                payload,
                {
                    new: true,
                    runValidators: true
                }
            );

    return result
}