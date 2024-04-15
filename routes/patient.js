//Controller
import controllerPatient from "../controllers/patient/patient.js";
//Validations
import validationPateint from "../validations/patient/patientValidation.js";

const patient = (app) => {
  try {
    // Registered API
    app.post("/registeredPatient", validationPateint, controllerPatient.patientRegistration);

    app.post("/loginOtpGeneration", controllerPatient.patientLogin);

    app.get("/getPatientData",controllerPatient.getPatientData)

  } catch (error) {
    console.log(error.message);
  }
};
export default patient;
