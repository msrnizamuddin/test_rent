const authModel = require("../model/auth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (payload) => {

    const existingUser = await authModel.findOne({
        tenantId: payload.tenantId,
        email: payload.email,
    });
    if (existingUser) {
        throw new Error("User already exists.");
    }
    const user = await authModel.create({
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password,
    role: "admin",
  });
}
