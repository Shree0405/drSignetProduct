import patient from "../../schemas/pateint.js";
import moment from "moment";
import jwt from "jsonwebtoken";
import CONFIG from "../../config/config.js";
import common from "../../utils/common.js";
import sendEmail from "../../utils/nodemailer.js";

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
      { email: 1 }
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

      // Send OTP via email
      await sendEmail({ email: loginData.email, otp: otp });

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
// const getPatientDataById = async (req, res) => {
//   try {
//     const getPatientDataById = req.body;
//   } catch (error) {
//     return res.send({ status: 0, message: error.message });
//   }
// };

export default {
  patientLoginOtpGeneration,
  patientRegistration,
  getPatientData,
  verifyOTPAndGenerateToken,
};
