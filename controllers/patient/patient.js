import moment from "moment";
import jwt from "jsonwebtoken";
import ejs from "ejs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from "fs";
import patient from "../../schemas/patient/pateint.js";
import sendMessage from "../../utils/sms_module.js";
import CONFIG from "../../config/config.js";
import common from "../../utils/common.js";
import sendEmail from "../../utils/nodemailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//==============Registration API==========================//

const patientRegistration = async (req, res) => {
  try {
    let patientData = req.body,
      currentYear,
      patientAllData,
      registration,
      checkMobile,
      checkEmail;
    currentYear = moment().year().toString().substring(2);
    patientAllData = await patient.find({
      patientId: { $regex: currentYear },
    });
    patientData.patientId =
      CONFIG.PatientNo +
      "-" +
      currentYear +
      "-" +
      String(patientAllData.length + 1).padStart(4, "0");
    checkEmail = await patient.findOne({ email: patientData.email });
    if (checkEmail) {
      return res.send({ status: 0, message: "email already exist" });
    }
    checkMobile = await patient.findOne({
      mobileNumber: patientData.mobileNumber,
    });
    if (checkMobile) {
      return res.send({ status: 0, message: "Mobile number is already exist" });
    }
    registration = await patient.create(patientData);
    if (registration) {
      return res.send({ status: 1, message: "data registered successfully" });
    } else {
      return res.send({ status: 0, message: "something went wrong" });
    }
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
};

//=====================otp generation API====================================//

const patientLoginOtpGeneration = async (req, res) => {
  try {
    let patientLogin = req.body,
      loginData,
      otp;
    loginData = await patient.findOne(
      { mobileNumber: patientLogin.mobileNumber },
      { email: 1 ,firstName:1}
    );
    if (!loginData) {
      return res.send({ status: 0, message: "you are not registered" });
    } else if (loginData) {
      otp = common.otpGenerate();
      const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // Set expiration to 10 minutes from now
      // Update patient record with OTP and expiration time
      await patient.findOneAndUpdate(
        { mobileNumber: patientLogin.mobileNumber },
        {
          $set: {
            otp,
            otpExpAt: expirationTime,
          },
        }
      );
      const emailTemplatePath = path.join(__dirname, "../../templates/otp_email.ejs");
      const renderedTemplate = await ejs.renderFile(emailTemplatePath, {
        name: loginData.firstName, 
        otp: otp,
      });
      
      // Sending email with rendered template
      await sendEmail({
        from: CONFIG.SMTP_USER,
        to: loginData.email,
        subject: "OTP Verification",
        
        html: renderedTemplate,
      });

            return res.send({ status: 1, message: "OTP sent successfully" });
        }
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
};

//==========================verifyOtp=================================//
const verifyOTPAndGenerateToken = async (req, res) => {
  try {
    const { otp, userId } = req.body;
    const patientData = await patient.findOne({ otp, _id: userId });

    if (!patientData) {
      return res.send({ status: 0, message: "Invalid OTP or User ID" });
    }

    if (new Date() > new Date(patientData.otpExpAt)) {
      return res.send({ status: 0, message: "OTP expired" });
    }

    // Update isVerified to 1 and clear OTP and expiration time after successful verification
    await patient.findOneAndUpdate(
      { otp, _id: userId },
      {
        $set: {
          isVerified: 1,
        },
        $unset: {
          otp: 1,
          otpExpAt: 1,
        },
      }
    );

    // Generate JWT token with userId, role, and other necessary fields
    const token = jwt.sign(
      {
        userId: patientData._id,
        role: patientData.role,
      },
      "your_secret_key",
      { expiresIn: "1h" }
    );
    return res.send({ status: 1, message: "OTP verified successfully", token });
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
};

//==============================Resend Otp=======================//

const resendOTP = async (req, res) => {
  try {
    const { patientId } = req.body;
    // Find the user by userId
    const patientData = await patient.findOne({ _id: patientId }, { email: 1 });
    if (!patientData) {
      return res.send({ status: 0, message: "User not found" });
    }
    // Generate a new OTP and set the expiration time
    const newOTP = common.otpGenerate();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // Set expiration to 10 minutes from now
    // Update user's OTP and expiration time in the database
    await patient.findOneAndUpdate(
      { _id: patientId },
      { $set: { otp: newOTP, otpExpAt: expirationTime } }
    );
    // Send the OTP to the user via email
    await sendEmail({ email: patientData.email, otp: newOTP });
    return res.send({ status: 1, message: "OTP resent successfully" });
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
};

//========================get patient data========================//

const getPatientData = async (req, res) => {
  try {
    const getPatientData = await patient
      .find()
      .select("-updatedAt -createdAt -role -_id");
    if (getPatientData) {
      return res.send({
        status: 1,
        message: "data fetch successfully",
        data: getPatientData,
      });
    } else {
      return res.send({ status: 0, data: "[]" });
    }
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
};

//=========================get pateint by patientID================//

const getPatientDataById = async (req, res) => {
  try {
    let getPatientDataById = req.body,
      getPatientData;
    getPatientData = await patient.findById(
      {
        _id: getPatientDataById.patientId,
      },
      { updatedAt: 0, _id: 0, isVerified: 0 }
    );
    if (getPatientData) {
      return res.send({
        status: 1,
        message: "data fetch successfully",
        data: getPatientData,
      });
    } else {
      return res.send({ status: 0, data: "[]" });
    }
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
};

//======================get patient by status, mobileNumber , patientId

const getPatientDataByFilter = async (req, res) => {
  try {
    const { status, mobileNumber, patientId } = req.body;
    let query = {};
    if (status || mobileNumber || patientId) {
      if (status) {
        query.status = status;
      }
      if (mobileNumber) {
        query.mobileNumber = mobileNumber;
      }
      if (patientId) {
        query.patientId = patientId;
      }
      const filterData = await patient.find(query);
      if (filterData.length > 0) {
        return res.send({
          status: 1,
          message: "Data fetched successfully",
          data: filterData,
        });
      } else {
        return res.send({
          status: 0,
          message: "No data found matching the criteria",
        });
      }
    } else {
      // If no filter criteria provided, return all patients
      const allPatients = await patient.find();
      return res.send({
        status: 1,
        message: "All patients fetched successfully",
        data: allPatients,
      });
    }
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
};

//==============================update mobile number API using email and userId================================//

const updateMobilePhone = async (req, res) => {
  try {
    const updateData = req.body;
    const updateMobileData = await patient.findOneAndUpdate(
      { _id: updateData.patientId, status: 1 },
      { $set: { mobileNumber: updateData.mobileNumber } },
      { new: true }
    );
    if (updateMobileData) {
      return res.send({
        status: 1,
        message: "Data updated successfully",
      });
    } else {
      return res.send({ status: 0, message: "Patient not found" });
    }
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
};

//============================delete API =================================================//

const deletePatient = async (req, res) => {
  try {
    const deletedPatientData = req.body;

    // Assuming you have your Patient model imported as 'patient'
    const patientData = await patient.findByIdAndUpdate(
      { _id: deletedPatientData.patientId },
      { $set: { status: 0 } }
    );

    if (patientData) {
      return res.send({ status: 1, message: "Patient deleted successfully" });
    } else {
      return res.send({
        status: 0,
        message: "Patient not found or something went wrong",
      });
    }
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
};

export default {
  patientLoginOtpGeneration,
  patientRegistration,
  getPatientData,
  verifyOTPAndGenerateToken,
  getPatientDataById,
  resendOTP,
  getPatientDataByFilter,
  updateMobilePhone,
  deletePatient,
};
