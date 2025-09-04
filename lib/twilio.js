// Twilio SMS utility
import twilio from 'twilio'
import { secrets } from './secrets'

const client = twilio(secrets.twilioAccountSid, secrets.twilioAuthToken)

export async function sendSMS({ to, body }) {
  await client.messages.create({
    body,
    from: secrets.twilioFrom,
    to
  })
}
