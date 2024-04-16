import authorize from "../utils/auth.js"
//Controller
import controllerPatient from "../controllers/patient/patient.js";
//Validations
import validationPateint from "../validations/patient/patientValidation.js";

const patient = (app) => {
  try {
    // Registered API
    app.post("/registeredPatient", validationPateint.patientValidation, controllerPatient.patientRegistration);

    app.post("/loginOtpGeneration",validationPateint.otpGenerationValidation, controllerPatient.patientLoginOtpGeneration);

    app.post("/verifyOTP",validationPateint.verifyOTP,controllerPatient.verifyOTPAndGenerateToken)

    app.get("/getPatientData",controllerPatient.getPatientData)

  } catch (error) {
    console.log(error.message);
  }
};
export default patient;
