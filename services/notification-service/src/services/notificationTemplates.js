class NotificationTemplates {
  
  static getAppointmentBookedTemplate(data) {
    const emailTemplate = {
      subject: 'Appointment Confirmed - TeleHealX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Appointment Confirmed</h1>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
           
            <p>Your appointment has been successfully booked with the following details:</p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Appointment Details</h3>
              <p><strong>Doctor:</strong> Dr. ${data.doctorName}</p>
              <p><strong>Patient:</strong> ${data.patientName}</p>
              <p><strong>Specialization:</strong> ${data.specialization}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Time:</strong> ${data.time}</p>
              <p><strong>Appointment ID:</strong> ${data.appointmentId}</p>
            </div>
            
            <p>Please join the video consultation 5 minutes before the scheduled time.</p>
            <p>For any queries, contact our support team.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.consultationLink || '#'}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Join Consultation</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              This is an automated message from TeleHealX. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `
        Appointment Confirmed - TeleHealX
        
        
        
        Your appointment has been successfully booked with the following details:
        
        Doctor: Dr. ${data.doctorName}
        Specialization: ${data.specialization}
        Date: ${data.date}
        Time: ${data.time}
        Appointment ID: ${data.appointmentId}
        Patient: ${data.patientName}
        
        Please join the video consultation 5 minutes before the scheduled time.
        
        For any queries, contact our support team.
        
        This is an automated message from TeleHealX.
      `
    };

    const smsTemplate = `TeleHealX: Appointment confirmed! Dr. ${data.doctorName} (${data.specialization}) on ${data.date} at ${data.time}. ID: ${data.appointmentId}. Join link: ${data.consultationLink || 'Login to app'}`;

    return { email: emailTemplate, sms: smsTemplate };
  }

  static getAppointmentAcceptedTemplate(data) {
    const emailTemplate = {
      subject: 'Appointment Accepted - TeleHealX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Appointment Accepted</h1>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
            
            <p>Your appointment has been accepted by Dr. ${data.doctorName}.</p>

            <div style="background: white; padding: 15px; border-left: 4px solid #10B981; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Appointment Details</h3>
              <p><strong>Doctor:</strong> Dr. ${data.doctorName}</p>
              <p><strong>Specialization:</strong> ${data.specialization}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Time:</strong> ${data.time}</p>
              <p><strong>Appointment ID:</strong> ${data.appointmentId}</p>
            </div>

            <p>Please wait for the doctor to create or share the meeting room if it is not available yet.</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              This is an automated message from TeleHealX. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `
        Appointment Accepted - TeleHealX

       

        Your appointment has been accepted by Dr. ${data.doctorName}.

        Doctor: Dr. ${data.doctorName}
        Specialization: ${data.specialization}
        Date: ${data.date}
        Time: ${data.time}
        Appointment ID: ${data.appointmentId}

        Please wait for the doctor to create or share the meeting room if it is not available yet.

        This is an automated message from TeleHealX.
      `
    };

    const smsTemplate = `TeleHealX: Appointment accepted by Dr. ${data.doctorName} (${data.specialization}) on ${data.date} at ${data.time}. ID: ${data.appointmentId}.`;

    return { email: emailTemplate, sms: smsTemplate };
  }

  static getConsultationCompletedTemplate(data) {
    const emailTemplate = {
      subject: 'Consultation Completed - TeleHealX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Consultation Completed</h1>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
           
            <p>Your consultation with Dr. ${data.doctorName} has been completed successfully.</p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Consultation Summary</h3>
              <p><strong>Doctor:</strong> Dr. ${data.doctorName}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Duration:</strong> ${data.duration || '30 minutes'}</p>
              <p><strong>Appointment ID:</strong> ${data.appointmentId}</p>
            </div>
            
            ${data.prescriptionIssued ? `
            <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">Prescription Available</h4>
              <p style="margin: 0;">Your digital prescription has been issued. You can view it in your TeleHealX account.</p>
            </div>
            ` : ''}
            
            <p>Thank you for using TeleHealX. Your health records have been updated.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.recordsLink || '#'}" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Medical Records</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              This is an automated message from TeleHealX. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `
        Consultation Completed - TeleHealX
        
       
        
        Your consultation with Dr. ${data.doctorName} has been completed successfully.
        
        Doctor: Dr. ${data.doctorName}
        Date: ${data.date}
        Duration: ${data.duration || '30 minutes'}
        Appointment ID: ${data.appointmentId}
        
        ${data.prescriptionIssued ? 'Your digital prescription has been issued and is available in your account.' : ''}
        
        Thank you for using TeleHealX.
      `
    };

    const smsTemplate = `TeleHealX: Consultation completed with Dr. ${data.doctorName} on ${data.date}. ${data.prescriptionIssued ? 'Prescription issued. ' : ''}View records: ${data.recordsLink || 'Login to app'}`;

    return { email: emailTemplate, sms: smsTemplate };
  }

  static getAppointmentCancelledTemplate(data) {
    const emailTemplate = {
      subject: 'Appointment Cancelled - TeleHealX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Appointment Cancelled</h1>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
            
            <p>Your appointment has been cancelled with the following details:</p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Cancelled Appointment</h3>
              <p><strong>Doctor:</strong> Dr. ${data.doctorName}</p>
              <p><strong>Specialization:</strong> ${data.specialization}</p>
              <p><strong>Originally Scheduled:</strong> ${data.date} at ${data.time}</p>
              <p><strong>Appointment ID:</strong> ${data.appointmentId}</p>
              <p><strong>Reason:</strong> ${data.reason || 'Not specified'}</p>
            </div>
            
            <p>We apologize for any inconvenience. Please book a new appointment at your convenience.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.bookingLink || '#'}" style="background: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Book New Appointment</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              This is an automated message from TeleHealX. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `
        Appointment Cancelled - TeleHealX
        
       
        
        Your appointment has been cancelled:
        
        Doctor: Dr. ${data.doctorName}
        Specialization: ${data.specialization}
        Originally Scheduled: ${data.date} at ${data.time}
        Appointment ID: ${data.appointmentId}
        Reason: ${data.reason || 'Not specified'}
        
        We apologize for any inconvenience. Please book a new appointment at your convenience.
        
        This is an automated message from TeleHealX.
      `
    };

    const smsTemplate = `TeleHealX: Appointment cancelled. Dr. ${data.doctorName} on ${data.date} at ${data.time}. Reason: ${data.reason || 'Not specified'}. Book new: ${data.bookingLink || 'Login to app'}`;

    return { email: emailTemplate, sms: smsTemplate };
  }

  static getPrescriptionIssuedTemplate(data) {
    const emailTemplate = {
      subject: 'New Prescription Available - TeleHealX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Prescription Issued</h1>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
            
            <p>Dr. ${data.doctorName} has issued a new prescription for you.</p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #FF9800; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Prescription Details</h3>
              <p><strong>Doctor:</strong> Dr. ${data.doctorName}</p>
              <p><strong>Date Issued:</strong> ${data.date}</p>
              <p><strong>Prescription ID:</strong> ${data.prescriptionId}</p>
              <p><strong>Valid Until:</strong> ${data.validUntil}</p>
            </div>
            
            <p>You can view and download your prescription from your TeleHealX account.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.prescriptionLink || '#'}" style="background: #FF9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Prescription</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              This is an automated message from TeleHealX. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `
        New Prescription Available - TeleHealX
        
        Dr. ${data.doctorName} has issued a new prescription for you.
        
        Doctor: Dr. ${data.doctorName}
        Date Issued: ${data.date}
        Prescription ID: ${data.prescriptionId}
        Valid Until: ${data.validUntil}
        
        You can view and download your prescription from your TeleHealX account.
        
        This is an automated message from TeleHealX.
      `
    };

    const smsTemplate = `TeleHealX: New prescription issued by Dr. ${data.doctorName}. ID: ${data.prescriptionId}. View: ${data.prescriptionLink || 'Login to app'}`;

    return { email: emailTemplate, sms: smsTemplate };
  }
}

module.exports = NotificationTemplates;
