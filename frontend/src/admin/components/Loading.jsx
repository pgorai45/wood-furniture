import React from 'react';

const Loading = ({ message = 'Loading store operations...' }) => {
  return (
    <div className="admin-loading-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div
        className="admin-spinner"
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTopColor: 'var(--admin-accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }}
      />
      <p style={{ color: 'var(--admin-text-muted)', fontSize: '14px', fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;
