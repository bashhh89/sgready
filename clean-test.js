// Test script to verify module imports
console.log('Starting module import test...');

try {
  const clsx = require('clsx');
  console.log('✓ Successfully imported clsx');

  const tailwindMerge = require('tailwind-merge');
  console.log('✓ Successfully imported tailwind-merge');

  const sonner = require('sonner');
  console.log('✓ Successfully imported sonner');

  console.log('All imports successful!');
} catch (error) {
  console.error('Error importing modules:', error.message);
  console.error('Module path:', error.path);
  process.exit(1);
} 