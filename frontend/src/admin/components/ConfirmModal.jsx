import React from 'react';

const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  warningText = 'This action cannot be undone.',
  itemDetails = null,
  onConfirm,
  onCancel,
  confirmText = 'Yes, Delete Permanently',
  cancelText = 'Cancel',
  isConfirming = false,
  confirmBtnStyle = { background: '#dc2626' },
  formatImageUrl = (p) => p || '/img/placeholder.jpg',
  formatINR = (amt) => `₹${Number(amt || 0).toLocaleString('en-IN')}`,
}) => {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div
        className="admin-modal-card"
        style={{ maxWidth: '460px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <h3 style={{ color: '#dc2626' }}>{title}</h3>
          <button className="admin-modal-close-btn" onClick={onCancel}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <p style={{ fontSize: '14px', marginBottom: '16px' }}>{message}</p>
          {itemDetails && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#fef2f2',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #fee2e2',
              }}
            >
              {itemDetails.image && (
                <img
                  src={formatImageUrl(itemDetails.image)}
                  alt={itemDetails.name}
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                  onError={(e) => {
                    e.target.src = '/img/bed/bed1.jpg';
                  }}
                />
              )}
              <div>
                <strong>{itemDetails.name}</strong>
                <div style={{ fontSize: '12px', color: '#dc2626' }}>
                  ID: #{itemDetails.id}
                  {itemDetails.price !== undefined && ` • Price: ${formatINR(itemDetails.price)}`}
                </div>
              </div>
            </div>
          )}
          {warningText && (
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
              ⚠️ {warningText}
            </p>
          )}
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="admin-btn-outline" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className="admin-btn-primary"
            style={confirmBtnStyle}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
