import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"
import { mailtrapClient, sender } from "./mailtrap.config.js"


export const sendVerificationEmail = async(email, verficationToken) => {
  const recipient = [{email}]
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject:"Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verficationToken),
      category:"Email Verification"
    })
  } catch (error) {
    console.error(`Error sending verification mail`, error);
    throw new Error(`Error sending verification email: ${error}`)
  }
}

export const sendWelcomeEmail = async(email, name) => {
  const recipient = [{email}];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "d7e9b0cc-b80d-47fd-91a8-c079d455b1ab",
      template_variables: {
      "first_name": name
    }
    })
    console.log("Welcome Email sent successfully", email);
  } catch (error) {
    console.log(`Error sending welcome email: ${error}`)
  }
}