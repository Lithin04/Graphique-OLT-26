import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

dotenv.config();

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
  const spreadsheetId = process.env.SPREADSHEET_ID;
  
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

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google Token
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
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
  const { orderId, userName, userEmail, phone, items, totalPrice, status } = req.body;
  
  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;
    console.log(`Searching for InCart draft for ${userEmail}...`);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:H',
    });

    let rows = response.data.values || [];
    
    // Auto-initialize headers if sheet is empty
    if (rows.length === 0) {
      console.log('Sheet is empty. Initializing headers...');
      const headers = ['Timestamp', 'Order ID', 'User Name', 'User Email', 'Phone', 'Items', 'Total Price', 'Status'];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:H1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [headers] },
      });
      rows = [headers];
    }

    let rowIndex = -1;
    if (rows.length > 0) {
      rowIndex = rows.findIndex(row => row[3] === userEmail && row[7] === 'InCart');
    }

    const rowData = [
      new Date().toISOString(), 
      orderId, 
      userName, 
      userEmail, 
      phone || '', 
      items, 
      totalPrice, 
      status || 'InCart'
    ];

    if (rowIndex !== -1) {
      console.log(`Found existing draft at row ${rowIndex + 1}. Updating...`);
      const range = `Sheet1!A${rowIndex + 1}:H${rowIndex + 1}`;
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
        range: 'Sheet1!A:H',
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
      range: 'Sheet1!A:H',
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
