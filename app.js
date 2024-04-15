// app.js
import express from "express";
import mongoose from "mongoose";
import CONFIG from "./config/config.js";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin:
      CONFIG.NODE_ENV === "development"
        ? CONFIG.UI_URL
        : "http://localhost:5173",
  })
);

app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(CONFIG.MONGOURL)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Handle connection events
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.on("reconnect", () => {
  console.log("Reconnected to MongoDB!");
});

import patientRoutes from "./routes/patient.js";

patientRoutes(app);

app.listen(CONFIG.PORT, () => {
  console.log(`Server is turned on ${CONFIG.NODE_ENV} mode on ${CONFIG.PORT}`);
});
