import { NextResponse } from 'next/server';
import { sendSMSAlert } from '@/lib/twilio';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { soilMoisture, temperature, humidity, nitrogen, phosphorus, potassium } = body;

    const alerts = [];

    // Soil Moisture Thresholds
    if (soilMoisture !== undefined) {
      if (soilMoisture > 80) alerts.push("CRITICAL: Soil moisture is too high (>80%). Risk of root rot. Stop watering immediately.");
      else if (soilMoisture < 20) alerts.push("ALERT: Soil moisture is low (<20%). Crops need water immediately.");
    }

    // Temperature Thresholds
    if (temperature !== undefined) {
      if (temperature > 35) alerts.push("WARNING: High temperature detected (>35°C). Ensure adequate irrigation.");
      else if (temperature < 10) alerts.push("WARNING: Low temperature detected (<10°C). Protect crops from frost.");
    }

    // Humidity Thresholds
    if (humidity !== undefined) {
      if (humidity < 30) alerts.push("WARNING: Low humidity (<30%). Risk of dehydration.");
      else if (humidity > 90) alerts.push("WARNING: High humidity (>90%). Risk of fungal diseases.");
    }

    // NPK Thresholds (Generic low check)
    if (nitrogen !== undefined && nitrogen < 20) alerts.push("ALERT: Nitrogen levels are critically low. Consider fertilization.");
    if (phosphorus !== undefined && phosphorus < 20) alerts.push("ALERT: Phosphorus levels are critically low.");
    if (potassium !== undefined && potassium < 20) alerts.push("ALERT: Potassium levels are critically low.");

    // Send alerts if any
    if (alerts.length > 0) {
      // Join multiple alerts into one message or send separately. 
      // Twilio messages are limited in length, but one combined message is usually better/cheaper.
      const message = `Bhoomi Dut Alert:\n${alerts.join('\n')}`;
      await sendSMSAlert(message);
    }

    return NextResponse.json({ success: true, alertsSent: alerts.length });
  } catch (error) {
    console.error('Error in alerts API:', error);
    return NextResponse.json({ error: 'Failed to process alert' }, { status: 500 });
  }
}
