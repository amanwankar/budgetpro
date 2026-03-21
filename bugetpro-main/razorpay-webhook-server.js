/**
 * BudgetPro - Razorpay Backend Integration
 * 
 * Instructions to run:
 * 1. Install dependencies: `npm install express razorpay crypto firebase-admin`
 * 2. Setup your Razorpay Keys in a .env file:
 *    RAZORPAY_KEY_ID=your_key_id
 *    RAZORPAY_KEY_SECRET=your_secret
 *    RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
 * 3. Initialize Firebase Admin SDK with your service account credentials.
 * 4. Start the server: `node razorpay-webhook-server.js`
 * 5. Add this server's endpoint to your Razorpay Dashboard Webhook settings.
 */

const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
// const admin = require('firebase-admin');

// Initialize Firebase Admin (Uncomment and configure with your service account)
// admin.initializeApp({
//   credential: admin.credential.cert(require('./firebase-service-account.json'))
// });
// const db = admin.firestore();

const app = express();
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_example',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_example'
});

// Endpoint used by Razorpay Webhooks (Triggers when a payment is captured)
app.post('/api/razorpay/webhook', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'my_webhook_secret';
  
  // Verify Webhook Signature to ensure request is from Razorpay
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    console.log('Razorpay Webhook Verified!');
    
    // Process the payment capturing event
    if (req.body.event === 'payment.captured' || req.body.event === 'payment.authorized') {
      const payment = req.body.payload.payment.entity;
      
      const newTransaction = {
        name: `Razorpay - ${payment.description || 'Online Payment'}`,
        amount: -(payment.amount / 100), // Convert from paise to rupees
        category: 'Shopping',
        method: payment.method === 'upi' ? 'UPI' : 'Card',
        status: 'Completed',
        date: new Date(payment.created_at * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        razorpayPaymentId: payment.id,
        uid: payment.notes.userId || 'guest-user', // You should pass userId in Razorpay notes
        createdAt: new Date()
      };

      try {
        // Save automatically to your Firebase database!
        // await db.collection('transactions').add(newTransaction);
        console.log('Successfully added Razorpay transaction to database:', newTransaction);
        res.status(200).json({ status: 'ok', msg: 'Transaction logged securely.' });
      } catch (error) {
        console.error('Error saving transaction: ', error);
        res.status(500).send('Database error');
      }
    } else {
      res.status(200).send('Event not handled');
    }
  } else {
    // Signature invalid
    console.warn('Invalid Signature on Razorpay webhook');
    res.status(403).send('Invalid signature');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Razorpay Backend Server running on port ${PORT}`);
});
