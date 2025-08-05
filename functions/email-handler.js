const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  // 1. Method Validation
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // 2. Input Parsing with Error Handling
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Invalid request format',
        details: 'Request body must be valid JSON'
      })
    };
  }

  // 3. Required Field Validation
  const requiredFields = ['name', 'email', 'contactType'];
  const missingFields = requiredFields.filter(field => !payload[field]);
  
  if (missingFields.length > 0) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Missing required fields',
        missing: missingFields,
        required: requiredFields
      })
    };
  }

  // 4. Email Format Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Invalid email address',
        received: payload.email
      })
    };
  }

  // 5. Initialize Email Transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Added connection timeout
    connectionTimeout: 5000,
    // Added transport options for better reliability
    pool: true,
    maxConnections: 1,
    rateDelta: 20000,
    rateLimit: 5
  });

  // 6. Format Date
  const submissionDate = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Kampala'
  });

  try {
    // 7. Send Confirmation Email
    const userMailPromise = transporter.sendMail({
      from: `"Edwin Kambale" <${process.env.EMAIL_USER}>`,
      to: payload.email,
      subject: 'Message Received - Edwin Kambale',
      text: `Hi ${payload.name},\n\nThank you for contacting me...`, // Keep your existing text
      html: `<p>Hi ${payload.name},...</p>` // Keep your existing HTML
    });

    // 8. Send Notification Email
    const adminMailPromise = transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact: ${payload.contactType} from ${payload.name}`,
      text: `New message from ${payload.name} (${payload.email})...` // Keep your existing text
    });

    // 9. Execute both email sends in parallel
    await Promise.all([userMailPromise, adminMailPromise]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'Emails sent successfully',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Email delivery failed:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
