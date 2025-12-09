interface TwilioConfig {
  accountSid: string;
  authToken: string;
  toPhone: string;
}

export async function sendSMSAlert(message: string) {
  const config: TwilioConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    toPhone: '+919733557339' // Hardcoded as per user request for farmer's number
  };

  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
  const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'To': config.toPhone,
        'From': '+919330248225', // Replace with your Twilio phone number
        'Body': message
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send SMS: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('SMS sent successfully:', data.sid);
    return data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}
