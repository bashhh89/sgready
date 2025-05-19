const React = require('react');
const ReactDom = require('react-dom');
const Next = require('next');
const firebase = require('firebase/app');
const firebaseAdmin = require('firebase-admin');
const pdflibModule = require('pdf-lib');
const markdownIt = require('markdown-it');
const openai = require('openai');

console.log('React version:', React.version);
console.log('ReactDOM version:', ReactDom.version);
console.log('Next.js version:', require('next/package.json').version);
console.log('Firebase version:', firebase.SDK_VERSION);
console.log('Firebase Admin version:', firebaseAdmin.SDK_VERSION);
console.log('PDF-lib version:', pdflibModule.version);
console.log('Markdown-it version:', markdownIt.version);
console.log('OpenAI package version:', require('openai/package.json').version);

console.log('All dependencies loaded successfully!'); 