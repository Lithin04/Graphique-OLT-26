import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import Razorpay from 'razorpay';

dotenv.config();
// Try loading from backend/.env if not found in root
dotenv.config({ path: 'backend/.env' });

const spreadsheetId = process.env.SPREADSHEET_ID || '1LfK8kuq172eaDvsPLSswWzSu8h8vrMB5XMI-J9ket2c';
const googleClientId = process.env.GOOGLE_CLIENT_ID || '1071467950240-os0gsqd8scogivkfvnh9ckubj228ng1q.apps.googleusercontent.com';
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_SeGSjBujn5Tfjv';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'PfYDmgQ6XsOAi23q0Kk7nc4z';

console.log('--- Environment Diagnostics ---');
console.log('SPREADSHEET_ID:', process.env.SPREADSHEET_ID ? 'PRESENT' : 'USING FALLBACK');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'PRESENT' : 'USING FALLBACK');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'PRESENT' : 'USING FALLBACK');
console.log('SERVICE_ACCOUNT:', (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.SERVICE_ACCOUNT_PATH || './service-account.json') ? 'PRESENT' : 'MISSING');
console.log('-------------------------------');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to get Google Auth
const getGoogleAuth = () => {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    try {
      const credentials = JSON.parse(serviceAccountJson);
      return new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } catch (e) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e);
    }
  }

  // Fallback to file path for local development
  const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || './service-account.json';
  return new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

// Diagnostic endpoint
app.get('/api/debug', async (req, res) => {
  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.get({ spreadsheetId });

    res.json({
      success: true,
      message: 'Connected to Google Sheets API!',
      sheets: response.data.sheets?.map(s => s.properties?.title),
      serviceAccount: 'authenticated'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data?.error || 'No detailed error message'
    });
  }
});

const client = new OAuth2Client(googleClientId);

// Verify Google Token
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    res.json({ success: true, user: payload });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// Save or Update Order in Google Sheets
app.post('/api/orders', async (req, res) => {
  const { orderId, paymentId, userName, userEmail, phone, teeDetails, varsityDetails, slamDetails, totalPrice, status } = req.body;

  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;
    console.log(`Searching for InCart draft for ${userEmail}...`);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:K',
    });

    let rows = response.data.values || [];

    // Auto-initialize headers if sheet is empty
    if (rows.length === 0) {
      console.log('Sheet is empty. Initializing headers...');
      const headers = ['Timestamp', 'Order ID', 'User Name', 'User Email', 'Phone', 'T-Shirt (Size & Qty)', 'Varsity (Size & Qty)', 'Slam Book (Qty)', 'Total Price', 'Status', 'Payment ID'];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:K1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [headers] },
      });
      rows = [headers];
    }

    let rowIndex = -1;
    if (rows.length > 0) {
      // Find row by Email (Col 3) and Status (Col 9)
      rowIndex = rows.findIndex(row => row[3] === userEmail && row[9] === 'InCart');
    }

    const rowData = [
      new Date().toISOString(),
      orderId,
      userName,
      userEmail,
      phone || '',
      teeDetails || '',
      varsityDetails || '',
      slamDetails || '',
      totalPrice,
      status || 'InCart',
      paymentId || ''
    ];

    if (rowIndex !== -1) {
      console.log(`Found existing draft at row ${rowIndex + 1}. Updating...`);
      const range = `Sheet1!A${rowIndex + 1}:K${rowIndex + 1}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      });
      console.log(`Successfully updated draft for ${userEmail}`);
    } else {
      console.log(`No existing draft found. Appending new row...`);
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:K',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      });
      console.log(`Successfully appended draft for ${userEmail}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Sheets Sync Error:', error.message);
    if (error.response) {
      console.error('API Response Error:', error.response.data);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to sync with Google Sheets',
      details: error.message
    });
  }
});

// Fetch Orders from Google Sheets
app.get('/api/orders', async (req, res) => {
  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:K',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.json({ success: true, orders: [] });
    }

    // Convert rows to objects
    const headers = rows[0];
    const orders = rows.slice(1).map(row => {
      const order: any = {};
      headers.forEach((header, index) => {
        order[header.toLowerCase()] = row[index];
      });
      return order;
    });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Sheets Fetch Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order history' });
  }
});

app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_SeGSjBujn5Tfjv',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'PfYDmgQ6XsOAi23q0Kk7nc4z'
    });
    const options = {
      amount: parseInt(amount) * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ success: false, error: 'Razorpay order creation failed' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
