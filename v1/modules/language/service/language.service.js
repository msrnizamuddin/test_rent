import Language from "../model/language.model.js";

export const createLanguageService = async languageData => {
	const newLanguage = new Language(languageData);
	return await newLanguage.save();
};

export const getLanguagesService = async () => {
	return await Language.find();
};

export const getLanguageByIdService = async id => {
	return await Language.findById(id);
};

export const updateLanguageService = async (id, languageData) => {
	return await Language.findByIdAndUpdate(id, languageData, {
		new: true,
		runValidators: true
	});
};

export const deleteLanguageService = async id => {
	return await Language.findByIdAndDelete(id);
};
