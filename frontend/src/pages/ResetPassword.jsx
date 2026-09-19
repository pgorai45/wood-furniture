import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyResetTokenApi, resetPasswordApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../assets/css/login.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { openLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('No reset token provided in the URL. Please request a new password reset link.');
      return;
    }

    const checkToken = async () => {
      try {
        const res = await verifyResetTokenApi(token);
        if (res.success) {
          setTokenValid(true);
          setEmail(res.email || '');
        } else {
          setTokenValid(false);
          setTokenError(res.message || 'Invalid or expired reset token.');
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError(err.response?.data?.message || 'Invalid or expired reset token (valid for 15 minutes).');
      } finally {
        setVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPasswordApi(token, newPassword, confirmPassword);
      if (res.success) {
        setSuccessMessage('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          openLogin();
          navigate('/');
        }, 1500);
      } else {
        setErrorMessage(res.message || 'Failed to update password.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Server error resetting password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '480px', width: '100%', background: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)', padding: '36px 32px', border: '1px solid #e2e8f0' }}>
        
        {/* Header Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '20px' }}>
          <span>🛠️</span>
          <span>Development / Demo Only</span>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
          Reset Password
        </h2>

        {verifying ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
            <p>Verifying reset token...</p>
          </div>
        ) : !tokenValid ? (
          <div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
              ⚠️ {tokenError}
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Reset links expire after 15 minutes and can only be used once.
            </p>
            <button
              type="button"
              onClick={() => {
                openLogin();
                navigate('/');
              }}
              className="login-btn"
              style={{ width: '100%' }}
            >
              Back to Login / Request New Link
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              Set a new secure password for account: <strong style={{ color: '#1e293b' }}>{email}</strong>
            </p>

            {errorMessage && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                ⚠️ {errorMessage}
              </div>
            )}

            {successMessage && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                ✅ {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-box" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div className="input-box" style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={submitting}
                style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 600 }}
              >
                {submitting ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link to="/" style={{ color: '#d4704c', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                Cancel & Return to Store
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
