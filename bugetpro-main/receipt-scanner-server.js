/**
 * BudgetPro - Receipt Scanner OCR Backend
 * 
 * Instructions to run:
 * 1. Install dependencies: `npm install express multer @google-cloud/vision firebase-admin`
 * 2. Setup your Google Cloud Vision API credentials.
 *    Set the GOOGLE_APPLICATION_CREDENTIALS environment variable to your JSON key file.
 * 3. Start the server: `node receipt-scanner-server.js`
 * 4. Configure BudgetPro frontend to POST to `/api/scan-receipt`
 */

const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
// const admin = require('firebase-admin');

// Initialize Firebase Admin (Uncomment and configure with your service account)
// admin.initializeApp();
// const db = admin.firestore();

const app = express();
const upload = multer({ dest: 'uploads/' }); // Stores temporary receipt images

// Initialize Google Cloud Vision OCR Client
// Ensure GOOGLE_APPLICATION_CREDENTIALS points to an active Google Cloud key.
const client = new vision.ImageAnnotatorClient();

app.post('/api/scan-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No receipt image uploaded.');

    console.log(`Scanning receipt from file: ${req.file.path}`);
    
    // 1. Google Cloud Vision Text Detection API
    const [result] = await client.textDetection(req.file.path);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      return res.status(400).json({ error: 'No text extracted. Please capture a clearer image.' });
    }

    const fullText = detections[0].description;
    console.log('--- Extracted Receipt Text ---');
    console.log(fullText);

    // 2. Data Extraction Strategy (Heuristics & RegEx)
    const amountRegex = /(?:total|amount|amt|amt\.)\s*(?:rs|inr|₹|$)?\s*:?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi;
    const vendorRegex = /(.*)\n(.*)(?:gst|tax|date)/i; // A crude vendor extraction strategy
    
    // Find biggest match for amount
    let largestAmount = 0;
    let match;
    while ((match = amountRegex.exec(fullText)) !== null) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      if (val > largestAmount) Math.max(largestAmount, val); // Logic safely assumes Largest amount is Grand Total
      largestAmount = val || largestAmount;
    }
    
    // Fallback search everywhere if keyword parsing failed
    if (largestAmount === 0) {
        const anyNumberRegex = /₹?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/g;
        while ((m = anyNumberRegex.exec(fullText)) !== null) {
          const val = parseFloat(m[1].replace(/,/g, ''));
          if (val > largestAmount) largestAmount = val;
        }
    }

    // Attempt resolving a rough Vendor Name using line 1
    const vendorName = fullText.split('\n')[0].substring(0, 30) || 'Unknown Store';
    const transactionDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    // 3. Form transaction
    const scannedTransaction = {
      name: `Scanner - ${vendorName}`,
      amount: -largestAmount,
      category: 'Other',
      method: 'Cash/Card',
      status: 'Completed',
      date: transactionDate,
      createdAt: new Date(),
      uid: req.body.userId || 'guest'
    };

    // 4. Save to Firebase 
    // await db.collection('transactions').add(scannedTransaction);

    res.status(200).json({ 
        message: 'Successfully scanned and parsed receipt', 
        extracted: scannedTransaction,
        rawTextDetected: fullText
    });
    
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Receipt Scanner Server running on port ${PORT}`);
});
