/**
 * Firebase Admin SDK Configuration Test Script
 * 
 * This script tests if your Firebase Admin SDK configuration is correctly set up
 * for PDF generation. It will attempt to initialize Firebase Admin and connect to Firestore.
 * 
 * Usage:
 *   node test-firebase-admin.js
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

console.log('Testing Firebase Admin SDK configuration...');

// Check for required environment variables
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId) {
  console.error('❌ ERROR: Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local');
  process.exit(1);
}

// Initialize credential object
let credential;

// Check if using service account key (Base64 encoded JSON)
if (serviceAccountKey) {
  console.log('✅ Found FIREBASE_SERVICE_ACCOUNT_KEY in environment variables.');
  try {
    const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(decodedKey);
    credential = admin.credential.cert(serviceAccount);
    console.log('✅ Successfully decoded service account key from Base64.');
  } catch (error) {
    console.error('❌ ERROR: Failed to decode or parse FIREBASE_SERVICE_ACCOUNT_KEY:');
    console.error(error.message);
    process.exit(1);
  }
} 
// Check if using client email and private key
else if (clientEmail && privateKey) {
  console.log('✅ Found FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in environment variables.');
  credential = admin.credential.cert({
    projectId,
    clientEmail,
    privateKey
  });
} 
// No valid credentials found
else {
  console.error('❌ ERROR: No valid Firebase credentials found.');
  console.error('Please provide either:');
  console.error('  1. FIREBASE_SERVICE_ACCOUNT_KEY (Base64 encoded service account JSON)');
  console.error('  OR');
  console.error('  2. Both FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

// Try to initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: credential
    });
    console.log('✅ Firebase Admin SDK initialized successfully.');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:');
  console.error(error.message);
  process.exit(1);
}

// Try to connect to Firestore
try {
  const db = admin.firestore();
  console.log('✅ Firestore connection established.');
  
  // Try a simple query to verify connection
  db.collection('test-connection').limit(1).get()
    .then(() => {
      console.log('✅ Firestore query executed successfully.');
      console.log('\n✅ SUCCESS: Your Firebase Admin SDK configuration is working correctly!');
      console.log('PDF generation should work properly with this configuration.');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Firestore query failed:');
      console.error(error.message);
      console.error('\nYour Firebase Admin SDK credentials may not have sufficient permissions.');
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Firestore connection failed:');
  console.error(error.message);
  process.exit(1);
} 