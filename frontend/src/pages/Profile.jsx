import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout, openLogin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('1998-05-15');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    if (user) {
      const updatedUser = { ...user, name: fullName, email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    alert('Profile changes saved successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <main className="profile-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <strong>My Profile</strong>
      </div>

      {/* Heading */}
      <div className="profile-heading">
        <h1>My Profile</h1>
        <p>Manage your personal information, contact details and saved address.</p>
      </div>

      <div className="profile-container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-user">
            <div className="profile-image">
              <img
                src="/img/logo/logo1.png"
                alt="User"
                style={{ objectFit: 'contain', background: '#fff' }}
              />
              <button className="edit-photo" type="button" onClick={() => alert('Photo upload not available.')}>
                <i className="fa-solid fa-pen"></i>
              </button>
            </div>

            <h3>{fullName || 'Your Name'}</h3>
            <p>{email || 'your@email.com'}</p>
          </div>

          {/* Strength */}
          <div className="profile-strength">
            <div className="strength-title">
              <span>PROFILE STRENGTH</span>
              <strong>85%</strong>
            </div>
            <div className="strength-bar">
              <span style={{ width: '85%' }}></span>
            </div>
          </div>

          {/* Menu */}
          <ul className="profile-menu">
            <li
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
              style={{ cursor: 'pointer' }}
            >
              <i className="fa-regular fa-user"></i> My Profile
            </li>

            <li
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
              style={{ cursor: 'pointer' }}
            >
              <i className="fa-solid fa-box"></i> My Orders
            </li>

            <li
              className={activeTab === 'address' ? 'active' : ''}
              onClick={() => setActiveTab('address')}
              style={{ cursor: 'pointer' }}
            >
              <i className="fa-solid fa-location-dot"></i> Saved Address
            </li>

            <li
              className={activeTab === 'password' ? 'active' : ''}
              onClick={() => setActiveTab('password')}
              style={{ cursor: 'pointer' }}
            >
              <i className="fa-solid fa-lock"></i> Change Password
            </li>

            <li
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
              style={{ cursor: 'pointer' }}
            >
              <i className="fa-solid fa-gear"></i> Account Settings
            </li>

            <hr />

            <li className="logout" onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </li>
          </ul>
        </aside>

        {/* Right Side */}
        <section className="profile-content">
          {!user && (
            <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', marginBottom: '20px' }}>
              You are currently viewing guest profile.{' '}
              <button
                onClick={openLogin}
                style={{ background: 'none', border: 'none', color: '#b97a57', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
              >
                Log In
              </button>{' '}
              to sync your orders and addresses.
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSave}>
              {/* Personal Information */}
              <div className="profile-card">
                <div className="card-header">
                  <h2>Personal Information</h2>
                  <p>Your name and basic details</p>
                </div>

                <div className="card-body">
                  <div className="profile-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="profile-row">
                    <div className="profile-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                    </div>

                    <div className="profile-group">
                      <label>Gender</label>
                      <div className="gender-box">
                        {['Male', 'Female', 'Other'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            className={`gender ${gender === g ? 'active' : ''}`}
                            onClick={() => setGender(g)}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="profile-card">
                <div className="card-header">
                  <h2>Contact Details</h2>
                  <p>How we reach you about orders and offers</p>
                </div>

                <div className="card-body">
                  <div className="profile-row">
                    <div className="profile-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="profile-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="profile-card">
                <div className="card-header">
                  <h2>Address</h2>
                  <p>Used as your default delivery address</p>
                </div>

                <div className="card-body">
                  <div className="profile-group">
                    <label>Full Address</label>
                    <textarea
                      rows="5"
                      placeholder="House / Flat No, Street, City, State, PIN Code"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="profile-action">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    if (user) {
                      setFullName(user.name || '');
                      setEmail(user.email || '');
                    }
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'orders' && (
            <div className="profile-card">
              <div className="card-header">
                <h2>My Orders</h2>
                <p>Track and view history of your recent furniture orders</p>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <p>No recent orders found. Browse our collections to start decorating!</p>
                <Link to="/living" style={{ display: 'inline-block', marginTop: '10px', color: '#b97a57', fontWeight: 600 }}>
                  Explore Collections →
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="profile-card">
              <div className="card-header">
                <h2>Saved Addresses</h2>
                <p>Manage multiple shipping addresses</p>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <p>{address ? address : 'No saved address yet. Please add an address in personal details.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="profile-card">
              <div className="card-header">
                <h2>Change Password</h2>
                <p>Update your account security credentials</p>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div className="profile-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="Enter current password" />
                </div>
                <div className="profile-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>
                <button
                  type="button"
                  className="save-btn"
                  style={{ marginTop: '15px' }}
                  onClick={() => alert('Password update request processed.')}
                >
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="profile-card">
              <div className="card-header">
                <h2>Account Settings</h2>
                <p>Manage notifications and privacy options</p>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Receive email updates on furniture arrivals & discounts
                </label>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Profile;
