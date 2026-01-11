import { sendSmsNotification } from "./notifications";

export async function sendOTP(userId:string|null, phoneNumber:string,otp:string,purpose :'registration'|'login'|'pin_reset') {

    const message = buildOTPMessage(otp,purpose);
    await sendSmsNotification (
        userId,phoneNumber,message,'otp'


    );
};
function buildOTPMessage(otp: string, purpose: string) {
    const brand = 'HopemobilityKE';
  
    switch (purpose) {
      case 'registration':
        return `${brand} registration code: ${otp}. Valid for 5 minutes. Do not share this code.`;
  
      case 'login':
        return `${brand} login code: ${otp}. Do not share this code.`;
  
      case 'pin_reset':
        return `${brand} PIN reset code: ${otp}. Valid for 5 minutes. Do not share this code.`;
  
      default:
        return `${brand} verification code: ${otp}. Do not share this code.`;
    }
  }
  