import mongoose from "mongoose";
const patientSchema = new mongoose.Schema(
  {
    patientId: {  //[note:"auto generated and should be unique"]
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
    },
    title: {
      type: String, //["0":Mr." "1": "Mrs.","2" : "Ms","3" : "Er.","4": "Dr.","5" : "Prof."]
      enum: ["Mr.", "Mrs.", "Ms.", "Er.", "Dr.", "Prof."],
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      //[note:"mobile no should be unique"]
      type: String,
      required: true,
    },
    mobileCode: {
      type: String,
      required: true,
    },
    email: {
      //[note:"email should be unique"]
      type: String,
      required: true,
      lowercase: true,
    },
    gender: {
      type: String,
      enum: ["Male", "female", "others"],
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    height: {
      type: String,
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      required: true,
    },
    allergy: {
      type: Array,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
    addressType: {
      type: String,
      enum: ["work", "home"],
      required: true,
    },
    otp: {
      type: String,
    },
    role: {
      type: String,
      enum: [0, 1, 2], //"0" [Note: "Patient"] ,"1" [Note: "SuperAdmin"],"2" [Note: "Admin"]
      default: 0,
    },
    otpExpAt: {
      type: String,
    },
    status: {
      type: Number,
      enum: [0, 1, 2], //"0" [Note:"Delete"] "1" [Note:"Active"] "2" [Note:"Inactive"]
    },
    isVerified:{
      type: Number,
      enum:[0,1], //0:Not verified, 1:verified
      default:0
    }
  },
  { timestamps: true, versionKey: false }
);
export default mongoose.model("pateint", patientSchema);
