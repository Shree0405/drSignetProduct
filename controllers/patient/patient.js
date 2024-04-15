import patient from "../../schemas/pateint.js";
import moment from "moment";
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

const patientLogin = async (req, res) => {
  let patientLogin = req.body,
    loginData,
    otp,
    otpExpAt;
  loginData = await patient.findOne(
    { mobileNumber: patientLogin.mobileNumber },
    { email: 1 }
  );
  if (!loginData) {
    return res.send({ status: 0, message: "you are not registered" });
  } else if (loginData) {
    patientLogin.otp = common.otpGenerate();
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
    await sendEmail(loginData.email, otp);

    return res.send({ status: 1, message: "OTP sent successfully" });
  }
};

//==========================verifyOtp=================================//

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
    const getPatientDataById = req.body
    
  } catch (error) {
    return res.send({ status: 0, message: error.message });
  }
};
export default { patientLogin, patientRegistration, getPatientData };
