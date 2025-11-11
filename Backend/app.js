const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const xml2js = require('xml2js');
const cors = require('cors');
const session = require('express-session');

const app = express();

// --- Middleware ---
// CORS configuration to allow cross-origin requests with credentials (cookies)
app.use(cors({
  origin: 'http://localhost:4200', // Your Angular app's URL
  credentials: true, // This is essential for session cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie'] // Exposing this header is good practice for the browser
}));

app.use(bodyParser.json());

// Session middleware to manage user sessions
app.use(session({
  // IMPORTANT: Use a long, random, and secure key in production
  secret: 'a_very_long_and_secure_random_string_here',
  resave: false, // Don't save session if not modified
  saveUninitialized: false, // Don't create a session until something is stored
  cookie: {
    secure: false, // Set to true if using HTTPS in production
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    sameSite: 'lax', // Lax is a good default for local development. Use 'none' with 'secure: true' for production cross-domain
    maxAge: 24 * 60 * 60 * 1000 // Session expiration time (24 hours)
  },
}));

// Debug middleware to log session info on every request
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Customer ID in session:', req.session?.customerId || 'Not set');
  next();
});

// Test endpoint to verify server is running
app.get('/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// --- SAP Configuration ---
const sapUrlLogin = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_login_psr?sap-client=100';
const sapProfileUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_cus_det_psr?sap-client=100';
const sapInquiryUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zfm_inquiry_psr?sap-client=100';
const sapSalesOrderUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zfm_salesorder_psr?sap-client=100';
const sapDeliveryUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zfm_list_delivery_psr?sap-client=100';
const sapInvoiceUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_invoice_psr?sap-client=100';
const SapInvoicePdf = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_invoice_form_psr?sap-client=100';
const sapPaymentAgingUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zfm_payment_aging_psr?sap-client=100';
const sapCreditDebitUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zfm_credit_debit_memo_psr?sap-client=100';
const sapOverallSalesUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zfm_overall_sales_psr?sap-client=100';


const sapUsername = 'K901698';
const sapPassword = 'Ranjith@2004';

// --- SAP Login Function ---
const loginSAP = async (customerId, passwordInput) => {
  console.log('Attempting SAP login for customer:', customerId);
  console.log('SAP URL:', sapUrlLogin);
  
  const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZFM_CUST_PORTAL>
          <USER_ID>${customerId}</USER_ID>
          <USER_PWD>${passwordInput}</USER_PWD>
        </urn:ZFM_CUST_PORTAL>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  console.log('SOAP Request:', soapRequest);

  const headers = {
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': 'urn:sap-com:document:sap:rfc:functions:ZFM_CUST_PORTAL',
  };

  try {
    console.log('Making SAP request...');
    const response = await axios.post(sapUrlLogin, soapRequest, {
      headers,
      auth: {
        username: sapUsername,
        password: sapPassword,
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('SAP Response Status:', response.status);
    console.log('SAP Response Data:', response.data);

    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    console.log('Parsed Response:', JSON.stringify(parsed, null, 2));

    const result = parsed.Envelope.Body.ZFM_CUST_PORTALResponse;

    return {
      type: result.USER_AUTH_TYPE,
      message: result.USER_AUTH_MSG,
    };
  } catch (error) {
    console.error('SAP Login Error Details:');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Response:', error.response?.data);
    console.error('Error Status:', error.response?.status);
    throw error;
  }
};

// --- Login API ---
app.post('/login', async (req, res) => {
  console.log('Login request received:', { customer_id: req.body.customer_id, password: '*' });
  
  const { customer_id, password } = req.body;

  if (!customer_id || !password) {
    console.log('Missing credentials');
    return res.status(400).json({
      status: 'F',
      message: 'Customer ID and password are required.',
    });
  }

  try {
    console.log('Calling SAP login function...');
    const result = await loginSAP(customer_id, password);
    console.log('SAP login result:', result);

    if (result.type === 'S') {
      req.session.customerId = customer_id;
      console.log('Session updated with customer ID:', customer_id);
    }

    return res.status(200).json({
      status: result.type,
      message: result.message,
    });

  } catch (err) {
    console.error('Login failed with detailed error:');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    if (err.code === 'ECONNREFUSED') {
      return res.status(500).json({
        status: 'F',
        message: 'Unable to connect to SAP server. Please try again later.',
      });
    } else if (err.response?.status === 401) {
      return res.status(401).json({
        status: 'F',
        message: 'Invalid SAP credentials or authentication failed.',
      });
    } else if (err.response?.status === 404) {
      return res.status(500).json({
        status: 'F',
        message: 'SAP service not found. Please contact administrator.',
      });
    } else {
      return res.status(500).json({
        status: 'F',
        message: 'Internal server error or unable to connect to SAP.',
      });
    }
  }
});

// --- User Profile API ---
app.get('/userDetails', async (req, res) => {
  const customerId = req.session.customerId;

  if (!customerId) {
    return res.status(401).json({
      status: 'F',
      message: 'Unauthorized. Please log in first.',
    });
  }

  const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZFM_CUST_DETAILS>
          <USER_ID>${customerId}</USER_ID>
        </urn:ZFM_CUST_DETAILS>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(sapProfileUrl, soapRequest, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:sap-com:document:sap:rfc:functions:ZFM_CUST_DETAILS_PSR',
      },
      auth: {
        username: sapUsername,
        password: sapPassword,
      }
    });

    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    const result = parsed.Envelope.Body.ZFM_CUST_DETAILSResponse;

    return res.status(200).json({
      status: 'S',
      profile: result,
    });

  } catch (error) {
    console.error('User Profile SOAP Error:', error.message);
    return res.status(500).json({
      status: 'F',
      message: 'Could not fetch user profile.',
    });
  }
});

// --- Inquiry API ---
app.get('/inquiry', async (req, res) => {
  const customerId = req.session.customerId;

  if (!customerId) {
    return res.status(401).json({
      status: 'F',
      message: 'Unauthorized. Please log in first.',
    });
  }

  const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZFM_INQUIRY_PSR>
          <USER_ID>${customerId}</USER_ID>
        </urn:ZFM_INQUIRY_PSR>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(sapInquiryUrl, soapRequest, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:sap-com:document:sap:rfc:functions:ZFM_INQUIRY_PSR',
      },
      auth: {
        username: sapUsername,
        password: sapPassword,
      },
    });

    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    const inquiryResult = parsed.Envelope.Body.ZFM_INQUIRY_PSRResponse;

    let inquiryTable = [];

    if (inquiryResult && inquiryResult.USER_INQUIRY_TABLE && inquiryResult.USER_INQUIRY_TABLE.item) {
      inquiryTable = Array.isArray(inquiryResult.USER_INQUIRY_TABLE.item)
        ? inquiryResult.USER_INQUIRY_TABLE.item
        : [inquiryResult.USER_INQUIRY_TABLE.item]; // handle single record
    }

    return res.status(200).json({
      status: 'S',
      data: inquiryTable,
    });

  } catch (error) {
    console.error('Inquiry Error:', error.message);
    return res.status(500).json({
      status: 'F',
      message: 'Could not fetch inquiry data.',
    });
  }
});

// --- Sales Order API ---
app.get('/salesOrders', async (req, res) => {
  const customerId = req.session.customerId;

  if (!customerId) {
    return res.status(401).json({
      status: 'F',
      message: 'Unauthorized. Please log in first.',
    });
  }

  const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZFM_SALESORDER_PSR>
          <USER_ID>${customerId}</USER_ID>
        </urn:ZFM_SALESORDER_PSR>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(sapSalesOrderUrl, soapRequest, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:sap-com:document:sap:rfc:functions:ZFM_SALESORDER_PSR',
      },
      auth: {
        username: sapUsername,
        password: sapPassword,
      },
    });

    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    const result = parsed.Envelope.Body.ZFM_SALESORDER_PSRResponse;

    let salesOrders = [];

    if (result && result.USER_SALESORDER_TABLE && result.USER_SALESORDER_TABLE.item) {
      salesOrders = Array.isArray(result.USER_SALESORDER_TABLE.item)
        ? result.USER_SALESORDER_TABLE.item
        : [result.USER_SALESORDER_TABLE.item];
    }

    return res.status(200).json({
      status: 'S',
      data: salesOrders,
    });

  } catch (error) {
    console.error('Sales Order Error:', error.message);
    return res.status(500).json({
      status: 'F',
      message: 'Could not fetch sales order data.',
    });
  }
});


// --- List of Delivery API ---
app.get('/listDeliveries', async (req, res) => {
  const customerId = req.session.customerId;

  if (!customerId) {
    return res.status(401).json({
      status: 'F',
      message: 'Unauthorized. Please log in first.',
    });
  }

  const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZFM_LIST_DELIVERY_PSR>
          <USER_ID>${customerId}</USER_ID>
        </urn:ZFM_LIST_DELIVERY_PSR>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  console.log('SOAP Request for delivery:', soapRequest);

  try {
    const response = await axios.post(sapDeliveryUrl,
      soapRequest,
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': 'urn:sap-com:document:sap:rfc:functions:ZFM_LIST_DELIVERY_PSR',
        },
        auth: {
          username: sapUsername,
          password: sapPassword,
        }
      }
    );

    console.log('Raw SAP Response:', response.data);

    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    console.log('SAP Response Structure:', JSON.stringify(parsed, null, 2));
    const result = parsed.Envelope.Body.ZFM_LIST_DELIVERY_PSRResponse;
    console.log('Result structure:', JSON.stringify(result, null, 2));

    let deliveryList = [];

    // Try different possible structures
    if (result && result.USER_LIST_DELIVERY_TABLE && result.USER_LIST_DELIVERY_TABLE.item) {
      deliveryList = Array.isArray(result.USER_LIST_DELIVERY_TABLE.item)
        ? result.USER_LIST_DELIVERY_TABLE.item
        : [result.USER_LIST_DELIVERY_TABLE.item];
    } else if (result && result.USER_LIST_DELIVERY_TABLE) {
      // If no item property, the table might be directly accessible
      deliveryList = Array.isArray(result.USER_LIST_DELIVERY_TABLE)
        ? result.USER_LIST_DELIVERY_TABLE
        : [result.USER_LIST_DELIVERY_TABLE];
    } else if (result && result.item) {
      // Direct item access
      deliveryList = Array.isArray(result.item)
        ? result.item
        : [result.item];
    }

    console.log('Final delivery list:', JSON.stringify(deliveryList, null, 2));

    return res.status(200).json({
      status: 'S',
      data: deliveryList,
    });

  } catch (error) {
    if (error.response) {
      console.error('SAP Response Status:', error.response.status);
      console.error('SAP Response Data:', error.response.data);
      console.error('SAP Response Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from SAP. Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up SAP request:', error.message);
    }
    return res.status(500).json({
      status: 'F',
      message: 'Could not fetch delivery list from SAP. Check server logs for details.',
    });
  }
});

// --- Invoice API ---
app.get('/invoices', async (req, res) => {
  const customerId = req.session.customerId;

  if (!customerId) {
    return res.status(401).json({
      status: 'F',
      message: 'Unauthorized. Please log in first.',
    });
  }

  const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZFM_INVOICE_PSR>
          <I_KUNNR>${customerId}</I_KUNNR>
        </urn:ZFM_INVOICE_PSR>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(sapInvoiceUrl, soapRequest, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:sap-com:document:sap:rfc:functions:ZFM_INVOICE_PSR',
      },
      auth: {
        username: sapUsername,
        password: sapPassword,
      },
    });

    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    const result = parsed.Envelope?.Body?.ZFM_INVOICE_PSRResponse;
    let invoiceData = [];

    if (result?.ET_INVOICE_DATA?.item) {
      invoiceData = Array.isArray(result.ET_INVOICE_DATA.item)
        ? result.ET_INVOICE_DATA.item
        : [result.ET_INVOICE_DATA.item];
    }

    return res.status(200).json({
      status: 'S',
      data: invoiceData,
    });

  } catch (error) {
    console.error('Invoice API Error:', error.message);
    return res.status(500).json({
      status: 'F',
      message: 'Could not fetch invoice data.',
      details: error.message,
    });
  }
});

// --- Invoice PDF (Base64) API ---
app.post('/api/customer/invoicePdf', async (req, res) => {
  console.log('Received request for invoice PDF:', req.body);
  const { KUNNR, VBELN } = req.body;

  const kunnr = KUNNR;
  const vbeln = VBELN;

  if (!kunnr || !vbeln) {
    return res.status(400).json({ error: 'Missing KUNNR or VBELN in request body' });
  }

  try {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                        xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZFM_INVOICE_FORM_PSR>
            <IV_KUNNR>${kunnr}</IV_KUNNR>
            <IV_VBELN>${vbeln}</IV_VBELN>
          </urn:ZFM_INVOICE_FORM_PSR>
        </soapenv:Body>
      </soapenv:Envelope>`;

    const { data } = await axios.post(SapInvoicePdf, xml, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'urn:sap-com:document:sap:rfc:functions:ZFM_INVOICE_FORM_PSR',
      },
      auth: {
        username: sapUsername,
        password: sapPassword,
      },
    });

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    const result = await parser.parseStringPromise(data);
    const envelope = result['Envelope'];
    const body = envelope['Body'];
    const response = body['ZFM_INVOICE_FORM_PSRResponse'];

    console.log('SAP PDF response:', response);

    if (!response || !response.EF_PDF) {
      return res.status(500).json({
        error: 'PDF content not found in SAP response',
        sapResponse: data,
      });
    }

    const base64PDF = response.EF_PDF;
    const pdfBuffer = Buffer.from(base64PDF, 'base64');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${vbeln}.pdf`);
    res.send(pdfBuffer);

  } catch (err) {
    console.error('Invoice PDF fetch error:', err.message);
    if (err.response) {
      console.error('SAP response data:', err.response.data);
    }

    res.status(500).json({
      error: 'Failed to process SAP response',
      details: err.message,
      ...(err.response && { sapError: err.response.data }),
    });
  }
});

// --- Payment Aging API ---
app.get('/paymentAging', async (req, res) => {
  const customerId = req.session.customerId;

  if (!customerId) {
    return res.status(401).json({
      status: 'F',
      message: 'Unauthorized. Please log in first.',
    });
  }

  const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZFM_PAYMENT_AGING_PSR>
          <USER_ID>${customerId}</USER_ID>
        </urn:ZFM_PAYMENT_AGING_PSR>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(sapPaymentAgingUrl, soapRequest, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:sap-com:document:sap:rfc:functions:ZFM_PAYMENT_AGING_PSR',
      },
      auth: {
        username: sapUsername,
        password: sapPassword,
      },
    });

    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    const result = parsed.Envelope.Body.ZFM_PAYMENT_AGING_PSRResponse;

    let agingData = [];

    if (result && result.USER_PAYMENT_AGING_TABLE && result.USER_PAYMENT_AGING_TABLE.item) {
      agingData = Array.isArray(result.USER_PAYMENT_AGING_TABLE.item)
        ? result.USER_PAYMENT_AGING_TABLE.item
        : [result.USER_PAYMENT_AGING_TABLE.item];
    }

    return res.status(200).json({
      status: 'S',
      data: agingData,
    });

  } catch (error) {
    console.error('Payment Aging Error:', error.message);
    return res.status(500).json({
      status: 'F',
      message: 'Could not fetch payment aging data.',
    });
  }
});

// --- Credit/Debit Memo API ---
app.get('/creditDebitMemos', async (req, res) => {
  const customerId = req.session.customerId;

  if (!customerId) {
    return res.status(401).json({
      status: 'F',
      message: 'Unauthorized. Please log in first.',
    });
  }

  const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZFM_CREDIT_DEBIT_MEMO_PSR>
          <USER_ID>${customerId}</USER_ID>
        </urn:ZFM_CREDIT_DEBIT_MEMO_PSR>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(
      sapCreditDebitUrl,
      soapRequest,
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': 'urn:sap-com:document:sap:rfc:functions:ZFM_CREDIT_DEBIT_MEMO_PSR',
        },
        auth: {
          username: sapUsername,
          password: sapPassword,
        },
      }
    );

    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    const result = parsed.Envelope.Body.ZFM_CREDIT_DEBIT_MEMO_PSRResponse;

    let memoList = [];

    if (result && result.USER_CREDIT_DEBIT_MEMO_TABLE && result.USER_CREDIT_DEBIT_MEMO_TABLE.item) {
      memoList = Array.isArray(result.USER_CREDIT_DEBIT_MEMO_TABLE.item)
        ? result.USER_CREDIT_DEBIT_MEMO_TABLE.item
        : [result.USER_CREDIT_DEBIT_MEMO_TABLE.item];
    }

    return res.status(200).json({
      status: 'S',
      data: memoList,
    });

  } catch (error) {
    console.error('Credit/Debit Memo Error:', error.message);
    return res.status(500).json({
      status: 'F',
      message: 'Could not fetch credit/debit memo data.',
    });
  }
});

// --- Overall Sales Data API ---
app.get('/overallSales', async (req, res) => {
  const customerId = req.session.customerId;

  if (!customerId) {
    return res.status(401).json({
      status: 'F',
      message: 'Unauthorized. Please log in first.',
    });
  }

  const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZFM_OVERALL_SALES_PSR>
          <USER_ID>${customerId}</USER_ID>
        </urn:ZFM_OVERALL_SALES_PSR>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(sapOverallSalesUrl, soapRequest, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:sap-com:document:sap:rfc:functions:ZFM_OVERALL_SALES_PSR',
      },
      auth: {
        username: sapUsername,
        password: sapPassword,
      },
    });

    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    const result = parsed.Envelope.Body.ZFM_OVERALL_SALES_PSRResponse;

    let salesData = [];

    if (result && result.USER_OVERALL_SALES_TABLE && result.USER_OVERALL_SALES_TABLE.item) {
      salesData = Array.isArray(result.USER_OVERALL_SALES_TABLE.item)
        ? result.USER_OVERALL_SALES_TABLE.item
        : [result.USER_OVERALL_SALES_TABLE.item];
    }

    return res.status(200).json({
      status: 'S',
      data: salesData,
    });

  } catch (error) {
    console.error('Overall Sales Error:', error.message);
    return res.status(500).json({
      status: 'F',
      message: 'Could not fetch overall sales data.',
    });
  }
});

// --- Logout API ---
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }

    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
});


// --- Start Server ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
