const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && authToken && !accountSid.includes('ACXXX'))
    ? twilio(accountSid, authToken)
    : null;

const sendSMS = async (to, message) => {
    try {
        if (!client) {
            console.log(`[AUTOMATED SOS - SIMULATION] To: ${to} | Message: ${message}`);
            console.warn('[WARNING] Twilio credentials missing in backend/.env. SMS NOT PHYSICALLY SENT.');
            return true;
        }

        const response = await client.messages.create({
            body: message,
            from: twilioNumber,
            to: to
        });

        console.log(`[AUTOMATED SOS - SUCCESS] Message SID: ${response.sid} sent to ${to}`);
        return true;
    } catch (error) {
        console.error(`[AUTOMATED SOS - FAILED] Error sending to ${to}:`, error.message);
        return false;
    }
};

module.exports = { sendSMS };
