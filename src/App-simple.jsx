import React from 'react';

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '20px',
        maxWidth: '600px'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎮 KIBORI GAMES</h1>
        <p style={{ fontSize: '20px', marginBottom: '10px' }}>React is loading successfully!</p>
        <p style={{ fontSize: '16px', opacity: 0.8 }}>The black screen issue is being fixed...</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '30px',
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
          Reload Page
        </button>
      </div>
    </div>
  );
}
