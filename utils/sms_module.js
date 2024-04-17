import axios from "axios";

const smsModule = {
    sendMessage: async (mobileNumber,otp) => {
        try {
            const otpURL = `http://app.rpsms.in/api/push.json?apikey=605c5cbbc7476&sender=DRSIGN&mobileno=${mobileNumber}with${otp}`;
            const response = await axios.get(otpURL);
            return response.status === 200 ? "Sent successfully" : "Error in sending. Please try again.";
        } catch (error) {
            console.error("Error in sending SMS:", error);
            throw error;
        }
    }
};

export default smsModule;
