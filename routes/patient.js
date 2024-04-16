import authorize from "../utils/auth.js";
//Controller
import controllerPatient from "../controllers/patient/patient.js";
//Validations
import validationPateint from "../validations/patient/patientValidation.js";

const patient = (app) => {
  try {
    // Registered API
    app.post(
      "/registeredPatient",
      validationPateint.patientValidation,
      controllerPatient.patientRegistration
    );
    app.post(
      "/loginOtpGeneration",
      validationPateint.otpGenerationValidation,
      controllerPatient.patientLoginOtpGeneration
    );
    app.post(
      "/verifyOTP",
      validationPateint.verifyOTP,
      controllerPatient.verifyOTPAndGenerateToken
    );
    app.post(
      "/getDataByPatientId",
      validationPateint.patientIdValidation,
      controllerPatient.getPatientDataById
    );
    app.post(
      "/resendOtp",
      validationPateint.patientIdValidation,
      controllerPatient.resendOTP
    );
    app.post(
      "/getPatientDataByFilter",
      controllerPatient.getPatientDataByFilter
    );
    app.post(
      "/updateMobilePhone",
      validationPateint.patientIdValidation,
      controllerPatient.updateMobilePhone
    );

    app.post(
      "/deletePatient",
      validationPateint.patientIdValidation,
      controllerPatient.deletePatient
    );
    
    app.get("/getPatientData", controllerPatient.getPatientData);
  } catch (error) {
    console.log(error.message);
  }
};
export default patient;
