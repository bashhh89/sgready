export default function SimpleTest() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple PDF Test</h1>
      <p>Click the link below to test the PDF generation:</p>
      <a 
        href="/api/pdfmake-test" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          display: 'inline-block', 
          padding: '10px 20px', 
          backgroundColor: 'blue', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '4px'
        }}
      >
        View PDF
      </a>
    </div>
  );
} 