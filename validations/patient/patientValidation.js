import { check, validationResult } from "express-validator";
const patientValidation = [
	check("title").notEmpty().withMessage("title is required"),
    check("firstName").notEmpty().withMessage("firstName is required"),
	check("lastName").notEmpty().withMessage("lastName is required"),
	check("mobileNumber").notEmpty().withMessage("mobileNumber is required"),
	check("mobileCode").notEmpty().withMessage("mobileCode is required"),
    check("email").notEmpty().withMessage("email is required").isEmail().withMessage("email should be in proper format"),
    check("gender").notEmpty().withMessage("gender is required"),
	check("dob").notEmpty().withMessage("dob is required"),
	check("height").notEmpty().withMessage("height is required"),
	check("weight").notEmpty().withMessage("weight is required"),
    check("bloodGroup").notEmpty().withMessage("bloodGroup is required"),
	check("state").notEmpty().withMessage("state is required"),
	check("city").notEmpty().withMessage("city is required"),
	check("area").notEmpty().withMessage("area is required"),
    check("gender").notEmpty().withMessage("gender is required"),
	check("pinCode").notEmpty().withMessage("pinCode is required"),
	check("addressType").notEmpty().withMessage("addressType is required"),
	(req, res, next) => {
		const errors = validationResult(req).array();
		if (errors.length > 0) {
			return res.send({ status: 0, message: errors[0].msg });
		}
		return next();
	},
];

const otpGenerationValidation=[
	check("mobileNumber").notEmpty().withMessage("mobileNumber is required"),
	(req, res, next) => {
		const errors = validationResult(req).array();
		if (errors.length > 0) {
			return res.send({ status: 0, message: errors[0].msg });
		}
		return next();
	},
]

const verifyOTP=[
	check("userId").notEmpty().withMessage("userId is required").isMongoId().withMessage("Invalid Id"),
	check("otp").notEmpty().withMessage("otp is required"),

	(req, res, next) => {
		const errors = validationResult(req).array();
		if (errors.length > 0) {
			return res.send({ status: 0, message: errors[0].msg });
		}
		return next();
	},
]
export default {patientValidation,otpGenerationValidation,verifyOTP}