import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0a0806',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f2ece2',
          fontFamily: 'Arial, sans-serif',
          padding: '20px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'rgba(255,0,0,0.1)',
            borderRadius: '20px',
            border: '2px solid rgba(255,0,0,0.3)',
            maxWidth: '600px'
          }}>
            <h1 style={{ fontSize: '36px', marginBottom: '20px', color: '#ff6b6b' }}>⚠️ Application Error</h1>
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>
              Something went wrong loading the application.
            </p>
            <details style={{ textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>Error Details</summary>
              <pre style={{ fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
