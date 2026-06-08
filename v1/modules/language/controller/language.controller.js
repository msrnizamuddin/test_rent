import Language from "../model/language.model.js";


export const createLanguage = async (req, res) => {
	try {
		const { name, code, centralStatus } = req.body;

		const newLanguage = new Language({ name, code, centralStatus });
		const savedLanguage = await newLanguage.save();

		res.status(201).json(savedLanguage);
	} catch (error) {

		res.status(500).json({ message: error.message });
	}
};


 export const getLanguages = async (req, res) => {
	try {
		const languages = await Language.find();
		res.status(200).json(languages);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
 export const getLanguageById = async (req, res) => {
	try {
		const language = await Language.findById(req.params.id);

		if (!language) {
			return res.status(404).json({ message: 'Language not found' });
		}

		res.status(200).json(language);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};


 export const updateLanguage = async (req, res) => {
	try {
		const { name, code, centralStatus } = req.body;

		const updatedLanguage = await Language.findByIdAndUpdate(
			req.params.id,
			{ name, code, centralStatus },
			{ new: true, runValidators: true }
		);

		if (!updatedLanguage) {
			return res.status(404).json({ message: 'Language not found' });
		}

		res.status(200).json(updatedLanguage);
	} catch (error) {

		res.status(500).json({ message: error.message });
	}
};


export const deleteLanguage = async (req, res) => {
	try {
		const deletedLanguage = await Language.findByIdAndDelete(req.params.id);

		if (!deletedLanguage) {
			return res.status(404).json({ message: 'Language not found' });
		}

		res.status(200).json({ message: 'Language deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
