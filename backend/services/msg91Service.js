const https = require('https');

// Read dynamic OTP_MODE and MSG91 variables
const getOtpMode = () => (process.env.OTP_MODE || 'demo').toLowerCase().trim();
const getMsg91AuthKey = () => process.env.MSG91_AUTH_KEY || '';
const getMsg91TemplateId = () => process.env.MSG91_OTP_TEMPLATE_ID || process.env.MSG91_TEMPLATE_ID || '';
const getMsg91SenderId = () => process.env.MSG91_SENDER_ID || '';

/**
 * Helper to execute an HTTPS request
 */
function makeHttpRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: { message: body } });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

/**
 * Send OTP (Supports both Demo Mode and MSG91 Production Mode)
 * @param {string} mobile 10-digit Indian mobile number
 * @param {string} purpose 'login' | 'signup'
 */
async function sendMsg91Otp(mobile, purpose = 'login') {
  const cleanedDigits = mobile.replace(/\D/g, '').slice(-10);
  const normalizedMobile = `91${cleanedDigits}`;
  const otpMode = getOtpMode();

  // ================= 1. DEVELOPMENT / DEMO MODE =================
  if (otpMode !== 'production') {
    console.log(`[OTP Service] [MODE: DEMO] Simulated OTP requested for +91 ******${cleanedDigits.slice(-4)} (Purpose: ${purpose})`);
    return {
      success: true,
      message: 'OTP sent successfully! (Development Mode: Use Demo OTP 123456)',
      isDemoMode: true,
      demoOtp: '123456',
    };
  }

  // ================= 2. PRODUCTION MODE (MSG91 REAL SMS) =================
  const authKey = getMsg91AuthKey();
  const templateId = getMsg91TemplateId();
  const senderId = getMsg91SenderId();

  console.log('[OTP Service] [MODE: PRODUCTION] === MSG91 OTP Dispatch Initiated ===');
  console.log(`[OTP Service] Target Mobile: +91 ******${cleanedDigits.slice(-4)}`);

  if (!authKey) {
    console.error('[OTP Service] Production Failure: MSG91_AUTH_KEY is not configured in backend/.env');
    return {
      success: false,
      message: 'SMS provider authentication key is not configured in backend/.env',
    };
  }

  if (!templateId) {
    console.error('[OTP Service] Production Failure: MSG91_OTP_TEMPLATE_ID is not configured in backend/.env');
    return {
      success: false,
      message: 'MSG91 OTP Template ID is not configured in backend/.env',
    };
  }

  try {
    let url = `https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(
      templateId
    )}&mobile=${encodeURIComponent(normalizedMobile)}&authkey=${encodeURIComponent(
      authKey
    )}&otp_expiry=10`;

    if (senderId) {
      url += `&sender=${encodeURIComponent(senderId)}`;
    }

    const response = await makeHttpRequest(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: authKey,
        },
      },
      {}
    );

    const httpStatus = response.status;
    const responseData = response.data || {};
    const requestId = responseData.request_id || responseData.requestId || responseData.message_id || 'N/A';
    const responseType = responseData.type || (httpStatus === 200 ? 'success' : 'error');
    const responseMessage = responseData.message || (typeof responseData === 'string' ? responseData : 'No message returned');

    console.log(`[OTP Service] MSG91 HTTP Status: ${httpStatus}`);
    console.log(`[OTP Service] MSG91 Response Type: ${responseType}`);
    console.log(`[OTP Service] MSG91 Request ID: ${requestId}`);

    const isAccepted = httpStatus === 200 && (responseType === 'success' || String(responseMessage).toLowerCase().includes('success'));

    if (isAccepted) {
      return {
        success: true,
        message: 'OTP sent successfully to your mobile number',
        requestId: requestId,
        isDemoMode: false,
      };
    }

    return {
      success: false,
      message: responseMessage || 'Failed to send OTP via SMS provider',
    };
  } catch (error) {
    console.error('[OTP Service] Network / Provider Error:', error.message);
    return {
      success: false,
      message: 'Unable to connect to SMS provider. Please try again later.',
    };
  }
}

/**
 * Resend OTP (Supports Demo Mode and MSG91 Production Mode)
 * @param {string} mobile 10-digit Indian mobile number
 * @param {string} purpose 'login' | 'signup'
 */
async function resendMsg91Otp(mobile, purpose = 'login') {
  const cleanedDigits = mobile.replace(/\D/g, '').slice(-10);
  const normalizedMobile = `91${cleanedDigits}`;
  const otpMode = getOtpMode();

  // 1. DEMO MODE
  if (otpMode !== 'production') {
    console.log(`[OTP Service] [MODE: DEMO] Resending simulated OTP for +91 ******${cleanedDigits.slice(-4)} (Purpose: ${purpose})`);
    return {
      success: true,
      message: 'OTP resent successfully! (Development Mode: Use Demo OTP 123456)',
      isDemoMode: true,
      demoOtp: '123456',
    };
  }

  // 2. PRODUCTION MODE
  const authKey = getMsg91AuthKey();
  if (!authKey) {
    return {
      success: false,
      message: 'MSG91_AUTH_KEY is not configured in backend/.env',
    };
  }

  try {
    const url = `https://control.msg91.com/api/v5/otp/retry?authkey=${encodeURIComponent(
      authKey
    )}&mobile=${encodeURIComponent(normalizedMobile)}&retrytype=text`;

    const response = await makeHttpRequest(url, {
      method: 'GET',
      headers: {
        authkey: authKey,
      },
    });

    if (
      response.data &&
      (response.data.type === 'success' ||
        response.status === 200 ||
        (response.data.message && response.data.message.toLowerCase().includes('success')))
    ) {
      return { success: true, message: response.data.message || 'OTP resent successfully', isDemoMode: false };
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to resend OTP via SMS provider',
    };
  } catch (error) {
    console.error('[OTP Service] Resend OTP Error:', error.message);
    return { success: false, message: 'Unable to connect to SMS provider. Please try again later.' };
  }
}

/**
 * Verify OTP (Supports Demo Mode and MSG91 Production Mode)
 * @param {string} mobile 10-digit Indian mobile number
 * @param {string} otp OTP code entered by user
 * @param {string} purpose 'login' | 'signup'
 */
async function verifyMsg91Otp(mobile, otp, purpose = 'login') {
  const cleanedDigits = mobile.replace(/\D/g, '').slice(-10);
  const normalizedMobile = `91${cleanedDigits}`;
  const otpMode = getOtpMode();

  // ================= 1. DEVELOPMENT / DEMO MODE =================
  if (otpMode !== 'production') {
    console.log(`[OTP Service] [MODE: DEMO] Verifying OTP for +91 ******${cleanedDigits.slice(-4)} (Purpose: ${purpose})`);
    if (otp && otp.trim() === '123456') {
      return { success: true, message: 'OTP verified successfully' };
    }
    return {
      success: false,
      message: 'Incorrect OTP code. In Development / Demo Mode, please enter OTP: 123456',
    };
  }

  // ================= 2. PRODUCTION MODE (MSG91 REAL VERIFICATION) =================
  const authKey = getMsg91AuthKey();
  if (!authKey) {
    return {
      success: false,
      message: 'MSG91_AUTH_KEY is not configured in backend/.env',
    };
  }

  try {
    const url = `https://control.msg91.com/api/v5/otp/verify?otp=${encodeURIComponent(
      otp.trim()
    )}&mobile=${encodeURIComponent(normalizedMobile)}`;

    const response = await makeHttpRequest(url, {
      method: 'GET',
      headers: {
        authkey: authKey,
      },
    });

    if (
      response.data &&
      (response.data.type === 'success' ||
        (response.data.message && response.data.message.toLowerCase().includes('success')))
    ) {
      return { success: true, message: 'OTP verified successfully' };
    }

    let errMsg = response.data?.message || 'Invalid or expired OTP code';
    if (errMsg.toLowerCase().includes('otp not match') || errMsg.toLowerCase().includes('invalid')) {
      errMsg = 'Incorrect OTP code. Please enter the valid code sent to your mobile.';
    } else if (errMsg.toLowerCase().includes('expired')) {
      errMsg = 'OTP has expired. Please request a new OTP.';
    }

    return { success: false, message: errMsg };
  } catch (error) {
    console.error('[OTP Service] Verify OTP Error:', error.message);
    return { success: false, message: 'SMS verification service error. Please try again.' };
  }
}

module.exports = {
  sendMsg91Otp,
  resendMsg91Otp,
  verifyMsg91Otp,
};
