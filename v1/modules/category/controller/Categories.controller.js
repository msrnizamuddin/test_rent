import Category from "../model/category.model.js";
import SubCategory from "../model/SubCategory.model.js"
import ChildCategory from "../model/ChildCategory.model.js";


export const createCategory = async (req, res, next) => {
    const result = await Category.create(req.body);
    res.send(result)
}

export const createSubCategory = async (req, res, next) => {
    const result = await SubCategory.create(req.body);
    res.send(result)

}

export const createChildCategory = async (req, res, next) => {
    const result = await ChildCategory.create(req.body);
    res.send(result)
}


export const getAllCaterogires = async (req, res) => {
    const data = await Category.find({})
    res.send(data)
}

export const getAllSUbCaterogires = async (req, res) => {
    const data = await SubCategory.find({})
    res.send(data)
}

export const getAllChildCaterogires = async (req, res) => {
    const data = await ChildCategory.find({})
    res.send(data)
}
