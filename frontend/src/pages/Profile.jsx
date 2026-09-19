import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getMyOrders,
  uploadUserAvatar,
  getAvatarUrl,
} from '../services/api';

const Profile = () => {
  const { user, token, setUser, logout, openLogin } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: '', text: '' });

  // Avatar Upload & Preview states
  const fileInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Inline edit states for cards
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // User Stats & Orders
  const [stats, setStats] = useState({
    totalOrders: 0,
    profileStrength: 85,
    savedAddressesCount: 0,
    memberSince: '',
  });
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const showToast = (text, type = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage({ type: '', text: '' });
    }, 4000);
  };

  // Fetch real profile data from database
  const loadProfileData = async () => {
    const currentToken = token || localStorage.getItem('userToken');
    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      const data = await getUserProfile(currentToken);
      if (data.success && data.user) {
        const u = data.user;
        setUser(u);
        setFullName(u.name || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
        setDob(u.dob || '');
        setGender(u.gender || 'Male');
        setAddress(u.address || '');

        // Calculate dynamic profile strength
        let filled = 0;
        if (u.name) filled++;
        if (u.email) filled++;
        if (u.phone) filled++;
        if (u.dob) filled++;
        if (u.gender) filled++;
        if (u.address) filled++;
        const strength = Math.round((filled / 6) * 100);

        if (data.stats) {
          setStats({
            ...data.stats,
            profileStrength: strength || data.stats.profileStrength || 80,
            savedAddressesCount: u.address ? 1 : 0,
          });
        } else {
          setStats((prev) => ({
            ...prev,
            profileStrength: strength || 80,
            savedAddressesCount: u.address ? 1 : 0,
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real user orders from database
  const loadUserOrders = async () => {
    const currentToken = token || localStorage.getItem('userToken');
    if (!currentToken) return;

    setLoadingOrders(true);
    try {
      const data = await getMyOrders(currentToken);
      if (data.success && data.orders) {
        setUserOrders(data.orders);
        setStats((prev) => ({ ...prev, totalOrders: data.orders.length }));
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const tabParam = searchParams.get('tab') || location.state?.tab;
    if (tabParam && ['profile', 'orders', 'address', 'password'].includes(tabParam)) {
      setActiveTab(tabParam);
      if (tabParam === 'orders') {
        loadUserOrders();
      }
    }
  }, [searchParams, location]);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDob(user.dob || '');
      setGender(user.gender || 'Male');
      setAddress(user.address || '');
    }
    loadProfileData();
    loadUserOrders();
  }, [token]);

  // Handle Save Profile Changes
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const currentToken = token || localStorage.getItem('userToken');

    if (!currentToken) {
      showToast('Authentication required. Please log in.', 'error');
      openLogin();
      return;
    }

    if (!fullName.trim()) {
      showToast('Full Name cannot be empty.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: fullName.trim(),
        phone: phone.trim(),
        dob: dob.trim(),
        gender,
        address: address.trim(),
      };

      const res = await updateUserProfile(payload, currentToken);
      if (res.success) {
        if (res.user) {
          setUser(res.user);
        }
        showToast('Profile updated successfully in database!');
        setIsEditingPersonal(false);
        setIsEditingContact(false);
        setIsEditingAddress(false);
        loadProfileData();
      } else {
        showToast(res.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      showToast(err.response?.data?.message || 'Server error saving profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    const currentToken = token || localStorage.getItem('userToken');

    if (!currentToken) {
      showToast('Authentication required.', 'error');
      return;
    }

    if (!currentPassword || !newPassword) {
      showToast('Please fill in all password fields.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await changeUserPassword(
        { currentPassword, newPassword },
        currentToken
      );
      if (res.success) {
        showToast('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message || 'Failed to change password.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error changing password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  // Avatar file selection and preview
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate image mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a valid image (JPG, PNG, or WEBP).', 'error');
      return;
    }

    // Validate max file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB. Please choose a smaller photo.', 'error');
      return;
    }

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    showToast('Image preview ready! Click "Save Photo" to apply.', 'success');
  };

  const handleCancelAvatarPreview = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    const currentToken = token || localStorage.getItem('userToken');

    if (!currentToken) {
      showToast('Authentication required. Please log in.', 'error');
      openLogin();
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const res = await uploadUserAvatar(formData, currentToken);
      if (res.success) {
        if (res.user) {
          setUser(res.user);
        }
        showToast('Profile picture uploaded and updated successfully in database!');
        handleCancelAvatarPreview();
        loadProfileData();
      } else {
        showToast(res.message || 'Failed to update profile picture.', 'error');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      showToast(err.response?.data?.message || 'Server error uploading profile picture.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Format Member Since date
  const formatMemberDate = (dateStr) => {
    if (!dateStr) return '12 Jan 2024';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '12 Jan 2024';
    }
  };

  // Format INR currency
  const formatINR = (amt) => {
    return `₹${Number(amt || 0).toLocaleString('en-IN')}`;
  };

  const userInitial = fullName ? fullName.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'U');

  return (
    <div className="profile-page-wrapper">
      {/* Toast Feedback Notification */}
      {toastMessage.text && (
        <div
          style={{
            position: 'fixed',
            top: '85px',
            right: '25px',
            zIndex: 99999,
            backgroundColor: toastMessage.type === 'error' ? '#dc2626' : '#059669',
            color: '#fff',
            padding: '12px 22px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {toastMessage.type === 'error' ? '✕' : '✓'} {toastMessage.text}
        </div>
      )}

      {!user ? (
        <div
          style={{
            maxWidth: '600px',
            margin: '80px auto',
            background: '#fff',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: '50px', marginBottom: '16px' }}>👤</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px' }}>
            Please Log In
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            You need to be signed in to view your profile, orders, addresses, and wishlist.
          </p>
          <button
            type="button"
            onClick={openLogin}
            style={{
              background: '#b8633b',
              color: '#fff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign In Now
          </button>
        </div>
      ) : (
        <div className="profile-main-layout">
          {/* ===================================================
              LEFT SIDEBAR
          =================================================== */}
          <aside className="profile-sidebar-card">
            <ul className="profile-sidebar-menu">
              <li>
                <button
                  type="button"
                  className={`profile-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <span className="menu-icon">
                    <i className="fa-solid fa-id-card"></i>
                  </span>
                  <span>My Profile</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`profile-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('orders');
                    loadUserOrders();
                  }}
                >
                  <span className="menu-icon">
                    <i className="fa-solid fa-bag-shopping"></i>
                  </span>
                  <span>My Orders</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`profile-menu-item ${activeTab === 'address' ? 'active' : ''}`}
                  onClick={() => setActiveTab('address')}
                >
                  <span className="menu-icon">
                    <i className="fa-solid fa-location-dot"></i>
                  </span>
                  <span>Saved Address</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`profile-menu-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                  onClick={() => navigate('/wishlist')}
                >
                  <span className="menu-icon">
                    <i className="fa-solid fa-heart"></i>
                  </span>
                  <span>Wishlist</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`profile-menu-item ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  <span className="menu-icon">
                    <i className="fa-solid fa-key"></i>
                  </span>
                  <span>Change Password</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`profile-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <span className="menu-icon">
                    <i className="fa-solid fa-sliders"></i>
                  </span>
                  <span>Account Settings</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="profile-menu-item logout"
                  onClick={handleLogout}
                >
                  <span className="menu-icon">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  </span>
                  <span>Logout</span>
                </button>
              </li>
            </ul>

            {/* Sidebar Bottom Promo Card with existing furniture image */}
            <div
              className="sidebar-promo-card"
              style={{ backgroundImage: `url('/img/sofa/sofa1.jpg')` }}
            >
              <div className="sidebar-promo-overlay"></div>
              <div className="sidebar-promo-content">
                <h4>Good Furniture Better Living</h4>
                <p>Style Your Space With Bidyut</p>
              </div>
            </div>
          </aside>

          {/* ===================================================
              RIGHT CONTENT AREA
          =================================================== */}
          <section className="profile-content-area">
            {/* ===================================================
                HERO / BANNER SECTION
            =================================================== */}
            <div
              className="profile-hero-banner"
              style={{ backgroundImage: `url('/img/living room/living room1.jpg')` }}
            >
              <div className="profile-hero-overlay"></div>
              <div className="profile-hero-inner">
                {/* Left: User Avatar & Info */}
                <div className="profile-hero-user-block">
                  <div className="hero-avatar-wrapper">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="hero-avatar-img"
                      />
                    ) : user?.avatar ? (
                      <img
                        src={getAvatarUrl(user.avatar)}
                        alt={fullName || user.name || 'User Avatar'}
                        className="hero-avatar-img"
                      />
                    ) : (
                      <div className="hero-avatar-img">
                        {userInitial}
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                      onChange={handleAvatarFileSelect}
                      style={{ display: 'none' }}
                    />

                    <button
                      type="button"
                      className="hero-camera-badge"
                      title="Update Profile Picture"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="fa-solid fa-camera"></i>
                    </button>
                  </div>

                  <div className="hero-user-info">
                    <span className="hero-user-greeting">Hello,</span>
                    <div className="hero-user-name-row">
                      <span className="hero-user-name">{fullName || user?.name || 'Valued Customer'}</span>
                      <span className="hero-role-badge">
                        <i className="fa-solid fa-crown" style={{ fontSize: '10px' }}></i>
                        {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                      </span>
                    </div>
                    <p className="hero-quote">Crafting comfort and style for every home.</p>

                    {avatarPreview ? (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          type="button"
                          className="hero-edit-btn"
                          style={{ background: '#059669', borderColor: '#059669' }}
                          onClick={handleSaveAvatar}
                          disabled={uploadingAvatar}
                        >
                          <i className="fa-solid fa-check"></i>
                          <span>{uploadingAvatar ? 'Uploading...' : 'Save Photo'}</span>
                        </button>
                        <button
                          type="button"
                          className="hero-edit-btn"
                          style={{ background: '#64748b', borderColor: '#64748b' }}
                          onClick={handleCancelAvatarPreview}
                          disabled={uploadingAvatar}
                        >
                          <i className="fa-solid fa-xmark"></i>
                          <span>Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="hero-edit-btn"
                        onClick={() => {
                          setIsEditingPersonal(true);
                          setIsEditingContact(true);
                          setIsEditingAddress(true);
                          setActiveTab('profile');
                        }}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Script Heading Branding */}
                <div className="profile-hero-script-brand">
                  <div className="hero-script-heading">Design Your Dream Space</div>
                  <div className="hero-script-sub">BIDYUT FURNITURE</div>
                </div>
              </div>
            </div>

            {/* ===================================================
                4 STATS CARDS ROW
            =================================================== */}
            <div className="profile-stats-row">
              {/* Card 1: Total Orders */}
              <div className="stat-card-box">
                <div className="stat-icon-circle stat-icon-orders">
                  <i className="fa-solid fa-bag-shopping"></i>
                </div>
                <div className="stat-body">
                  <div className="stat-number-title">
                    <span className="stat-number">{stats.totalOrders}</span>
                  </div>
                  <span className="stat-title">Total Orders</span>
                  <button
                    type="button"
                    className="stat-action-link"
                    onClick={() => {
                      setActiveTab('orders');
                      loadUserOrders();
                    }}
                  >
                    View all orders →
                  </button>
                </div>
              </div>

              {/* Card 2: Wishlist */}
              <div className="stat-card-box">
                <div className="stat-icon-circle stat-icon-wishlist">
                  <i className="fa-solid fa-heart"></i>
                </div>
                <div className="stat-body">
                  <div className="stat-number-title">
                    <span className="stat-number">{wishlistCount}</span>
                  </div>
                  <span className="stat-title">Saved Items</span>
                  <button
                    type="button"
                    className="stat-action-link"
                    onClick={() => navigate('/wishlist')}
                  >
                    View wishlist →
                  </button>
                </div>
              </div>

              {/* Card 3: Saved Address */}
              <div className="stat-card-box">
                <div className="stat-icon-circle stat-icon-address">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div className="stat-body">
                  <div className="stat-number-title">
                    <span className="stat-number">{address ? 1 : 0}</span>
                  </div>
                  <span className="stat-title">Saved Address</span>
                  <button
                    type="button"
                    className="stat-action-link"
                    onClick={() => {
                      setActiveTab('profile');
                      setIsEditingAddress(true);
                    }}
                  >
                    Manage address →
                  </button>
                </div>
              </div>

              {/* Card 4: Profile Strength */}
              <div className="stat-card-box">
                <div className="stat-icon-circle stat-icon-strength">
                  <i className="fa-solid fa-star"></i>
                </div>
                <div className="stat-body">
                  <div className="stat-number-title">
                    <span className="stat-number">{stats.profileStrength}%</span>
                  </div>
                  <span className="stat-title">Profile Strength</span>
                  <div className="stat-strength-bar">
                    <div
                      className="stat-strength-fill"
                      style={{ width: `${stats.profileStrength}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================
                TAB: PROFILE (DEFAULT TWO-COLUMN DASHBOARD)
            =================================================== */}
            {activeTab === 'profile' && (
              <div className="profile-dashboard-grid">
                {/* ---------------- LEFT COLUMN ---------------- */}
                <div className="dashboard-left-col">
                  {/* Card 1: Personal Information */}
                  <div className="profile-section-card">
                    <div className="profile-section-header">
                      <div className="section-header-title-block">
                        <div className="section-header-icon">
                          <i className="fa-solid fa-user"></i>
                        </div>
                        <div>
                          <h3>Personal Information</h3>
                          <p>Update your personal details</p>
                        </div>
                      </div>
                      <div className="section-header-actions">
                        <button
                          type="button"
                          className="btn-card-edit"
                          onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                          <span>{isEditingPersonal ? 'Close' : 'Edit'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="form-grid-2col">
                      <div>
                        <label className="field-label">Full Name</label>
                        <div className="input-with-icon">
                          <i className="fa-regular fa-user input-icon-left"></i>
                          <input
                            type="text"
                            className="form-control-input"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={!isEditingPersonal}
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="field-label">Date of Birth</label>
                        <div className="input-with-icon">
                          <i className="fa-regular fa-calendar input-icon-left"></i>
                          <input
                            type="date"
                            className="form-control-input"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            disabled={!isEditingPersonal}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <label className="field-label">Gender</label>
                      <div className="gender-selector-row">
                        {['Male', 'Female', 'Other'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            className={`gender-pill-btn ${gender === g ? 'selected' : ''}`}
                            onClick={() => isEditingPersonal && setGender(g)}
                            style={{
                              cursor: isEditingPersonal ? 'pointer' : 'default',
                              opacity: !isEditingPersonal && gender !== g ? 0.6 : 1,
                            }}
                          >
                            <span className="gender-dot"></span>
                            <span>{g}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {isEditingPersonal && (
                      <div className="edit-actions-bar">
                        <button
                          type="button"
                          className="btn-cancel-secondary"
                          onClick={() => setIsEditingPersonal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-save-primary"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Contact Details */}
                  <div className="profile-section-card">
                    <div className="profile-section-header">
                      <div className="section-header-title-block">
                        <div className="section-header-icon">
                          <i className="fa-solid fa-envelope"></i>
                        </div>
                        <div>
                          <h3>Contact Details</h3>
                          <p>Manage your contact info</p>
                        </div>
                      </div>
                      <div className="section-header-actions">
                        <button
                          type="button"
                          className="btn-card-edit"
                          onClick={() => setIsEditingContact(!isEditingContact)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                          <span>{isEditingContact ? 'Close' : 'Edit'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="form-grid-2col">
                      <div>
                        <label className="field-label">Email Address</label>
                        <div className="input-with-icon">
                          <i className="fa-regular fa-envelope input-icon-left"></i>
                          <input
                            type="email"
                            className="form-control-input"
                            value={email}
                            disabled={true}
                            title="Email address is tied to your account login"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="field-label">Phone Number</label>
                        <div className="input-with-icon">
                          <i className="fa-solid fa-phone input-icon-left"></i>
                          <input
                            type="tel"
                            className="form-control-input"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={!isEditingContact}
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>
                    </div>

                    {isEditingContact && (
                      <div className="edit-actions-bar">
                        <button
                          type="button"
                          className="btn-cancel-secondary"
                          onClick={() => setIsEditingContact(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-save-primary"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Address */}
                  <div className="profile-section-card">
                    <div className="profile-section-header">
                      <div className="section-header-title-block">
                        <div className="section-header-icon">
                          <i className="fa-solid fa-house"></i>
                        </div>
                        <div>
                          <h3>Address</h3>
                          <p>Your default delivery destination</p>
                        </div>
                      </div>
                      <div className="section-header-actions">
                        {address && (
                          <span className="default-badge-pill">
                            <i className="fa-solid fa-check"></i> Default Address
                          </span>
                        )}
                        <button
                          type="button"
                          className="btn-card-edit"
                          onClick={() => setIsEditingAddress(!isEditingAddress)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                          <span>{isEditingAddress ? 'Close' : 'Edit'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="input-with-icon">
                        <i className="fa-solid fa-location-dot input-icon-left" style={{ top: '16px' }}></i>
                        <textarea
                          className="form-control-textarea"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          disabled={!isEditingAddress}
                          placeholder="Enter your street address, apartment, city, state and PIN code"
                          rows={2}
                        />
                      </div>
                    </div>

                    {isEditingAddress && (
                      <div className="edit-actions-bar">
                        <button
                          type="button"
                          className="btn-cancel-secondary"
                          onClick={() => setIsEditingAddress(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-save-primary"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bottom Banner Strip */}
                  <div className="bottom-banner-strip">
                    <div className="strip-left">
                      <img
                        src="/img/table/table1.jpg"
                        alt="Furniture Banner"
                        className="strip-thumb"
                      />
                      <div className="strip-text">
                        <h4>Furniture that fits your life.</h4>
                        <p>Comfort • Quality • Style</p>
                      </div>
                    </div>
                    <Link to="/roomcollection" className="strip-btn">
                      <span>Explore More</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>

                {/* ---------------- RIGHT COLUMN ---------------- */}
                <div className="dashboard-right-col">
                  {/* Card 1: Be a Part of A Better Tomorrow */}
                  <div className="better-tomorrow-card">
                    <div
                      className="tomorrow-top-banner"
                      style={{ backgroundImage: `url('/img/outdoor/outdoor1.jpg')` }}
                    >
                      <div className="tomorrow-banner-overlay"></div>
                      <div className="tomorrow-banner-content">
                        <h4>Be a Part of A Better Tomorrow</h4>
                        <p>Sustainable living with every craft</p>
                      </div>
                    </div>

                    <div className="account-specs-list">
                      <div className="account-spec-item">
                        <span className="account-spec-label">
                          <i className="fa-regular fa-user"></i> Account Type
                        </span>
                        <span className="spec-role-pill">
                          {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                        </span>
                      </div>

                      <div className="account-spec-item">
                        <span className="account-spec-label">
                          <i className="fa-regular fa-calendar"></i> Member Since
                        </span>
                        <span className="account-spec-value">
                          {formatMemberDate(user?.created_at || stats.memberSince)}
                        </span>
                      </div>

                      <div className="account-spec-item">
                        <span className="account-spec-label">
                          <i className="fa-regular fa-clock"></i> Last Login
                        </span>
                        <span className="account-spec-value">Today</span>
                      </div>

                      <div className="account-spec-item">
                        <span className="account-spec-label">
                          <i className="fa-regular fa-circle-check"></i> Account Status
                        </span>
                        <span className="spec-active-badge">
                          <span style={{ fontSize: '7px' }}>●</span> Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Quick Actions */}
                  <div className="quick-actions-card">
                    <div className="quick-actions-header">
                      <i className="fa-solid fa-bolt"></i>
                      <span>Quick Actions</span>
                    </div>

                    <div className="quick-actions-grid">
                      <div
                        className="quick-action-tile"
                        onClick={() => {
                          setActiveTab('orders');
                          loadUserOrders();
                        }}
                      >
                        <i className="fa-solid fa-bag-shopping"></i>
                        <span>My Orders</span>
                      </div>

                      <div
                        className="quick-action-tile"
                        onClick={() => {
                          setActiveTab('profile');
                          setIsEditingAddress(true);
                        }}
                      >
                        <i className="fa-solid fa-location-dot"></i>
                        <span>Saved Address</span>
                      </div>

                      <div
                        className="quick-action-tile"
                        onClick={() => navigate('/wishlist')}
                      >
                        <i className="fa-solid fa-heart"></i>
                        <span>Wishlist</span>
                      </div>

                      <div
                        className="quick-action-tile"
                        onClick={() => setActiveTab('password')}
                      >
                        <i className="fa-solid fa-key"></i>
                        <span>Change Password</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Need Help */}
                  <div className="need-help-card">
                    <div className="help-left">
                      <div className="help-icon-circle">
                        <i className="fa-solid fa-headset"></i>
                      </div>
                      <div className="help-text">
                        <h4>Need Help?</h4>
                        <p>We're here 24/7 for you</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="help-btn"
                      onClick={() => navigate('/stores')}
                    >
                      Contact Support →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================
                TAB: MY ORDERS
            =================================================== */}
            {activeTab === 'orders' && (
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <div className="section-header-title-block">
                    <div className="section-header-icon">
                      <i className="fa-solid fa-bag-shopping"></i>
                    </div>
                    <div>
                      <h3>My Orders</h3>
                      <p>View your past purchases and track order status</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-card-edit"
                    onClick={() => setActiveTab('profile')}
                  >
                    ← Back to Profile
                  </button>
                </div>

                {loadingOrders ? (
                  <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Loading your orders...
                  </p>
                ) : userOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛍️</div>
                    <h4>No Orders Placed Yet</h4>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: '8px 0 16px' }}>
                      Explore our handcrafted wooden collections and start your journey.
                    </p>
                    <Link
                      to="/roomcollection"
                      className="btn-save-primary"
                      style={{ textDecoration: 'none', display: 'inline-flex' }}
                    >
                      Explore Furniture
                    </Link>
                  </div>
                ) : (
                  <div className="orders-table-container">
                    <table className="profile-orders-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Shipping Address</th>
                          <th>Total Amount</th>
                          <th>Payment</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userOrders.map((ord) => {
                          const statusText = ord.status || ord.order_status || 'Pending';
                          let badgeBg = '#fef9ee';
                          let badgeColor = '#d97706';
                          if (statusText.toLowerCase() === 'delivered') {
                            badgeBg = '#ecfdf5';
                            badgeColor = '#059669';
                          } else if (statusText.toLowerCase() === 'confirmed') {
                            badgeBg = '#f5f3ff';
                            badgeColor = '#6d28d9';
                          } else if (statusText.toLowerCase() === 'shipped') {
                            badgeBg = '#eff6ff';
                            badgeColor = '#2563eb';
                          } else if (statusText.toLowerCase() === 'cancelled') {
                            badgeBg = '#fef2f2';
                            badgeColor = '#dc2626';
                          }

                          return (
                            <tr key={ord.id}>
                              <td style={{ fontWeight: 600, color: '#b8633b' }}>
                                #{ord.order_number || ord.id}
                              </td>
                              <td>
                                {new Date(ord.created_at || Date.now()).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td>{ord.items?.length || ord.total_items || 1} item(s)</td>
                              <td>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    color: '#475569',
                                    maxWidth: '220px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={ord.shipping_address || 'Standard Delivery'}
                                >
                                  {ord.shipping_address || (ord.shipping_name ? `${ord.shipping_name} (Address on File)` : 'Standard Delivery')}
                                </div>
                              </td>
                              <td style={{ fontWeight: 700 }}>
                                {formatINR(ord.total_amount || ord.total_price)}
                              </td>
                              <td>
                                <span style={{ textTransform: 'capitalize', fontSize: '12px' }}>
                                  {ord.payment_method || 'Cash on Delivery'}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{
                                    background: badgeBg,
                                    color: badgeColor,
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    display: 'inline-block',
                                  }}
                                >
                                  ● {statusText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ===================================================
                TAB: SAVED ADDRESS
            =================================================== */}
            {activeTab === 'address' && (
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <div className="section-header-title-block">
                    <div className="section-header-icon">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                      <h3>Manage Saved Addresses</h3>
                      <p>View and update your primary delivery addresses</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-card-edit"
                    onClick={() => setActiveTab('profile')}
                  >
                    ← Back to Profile
                  </button>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <label className="field-label">Delivery Address</label>
                  <div className="input-with-icon">
                    <i className="fa-solid fa-location-dot input-icon-left" style={{ top: '16px' }}></i>
                    <textarea
                      className="form-control-textarea"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your complete delivery address"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="edit-actions-bar">
                  <button
                    type="button"
                    className="btn-save-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Update Address'}
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================
                TAB: CHANGE PASSWORD
            =================================================== */}
            {activeTab === 'password' && (
              <div className="profile-section-card" style={{ maxWidth: '650px' }}>
                <div className="profile-section-header">
                  <div className="section-header-title-block">
                    <div className="section-header-icon">
                      <i className="fa-solid fa-key"></i>
                    </div>
                    <div>
                      <h3>Change Password</h3>
                      <p>Ensure your account is using a secure password</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-card-edit"
                    onClick={() => setActiveTab('profile')}
                  >
                    ← Back to Profile
                  </button>
                </div>

                <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                  <div>
                    <label className="field-label">Current Password</label>
                    <div className="input-with-icon">
                      <i className="fa-solid fa-lock input-icon-left"></i>
                      <input
                        type="password"
                        className="form-control-input"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="field-label">New Password</label>
                    <div className="input-with-icon">
                      <i className="fa-solid fa-key input-icon-left"></i>
                      <input
                        type="password"
                        className="form-control-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 6 characters)"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Confirm New Password</label>
                    <div className="input-with-icon">
                      <i className="fa-solid fa-circle-check input-icon-left"></i>
                      <input
                        type="password"
                        className="form-control-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                      />
                    </div>
                  </div>

                  <div className="edit-actions-bar">
                    <button
                      type="submit"
                      className="btn-save-primary"
                      disabled={changingPassword}
                    >
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ===================================================
                TAB: ACCOUNT SETTINGS
            =================================================== */}
            {activeTab === 'settings' && (
              <div className="profile-section-card" style={{ maxWidth: '650px' }}>
                <div className="profile-section-header">
                  <div className="section-header-title-block">
                    <div className="section-header-icon">
                      <i className="fa-solid fa-sliders"></i>
                    </div>
                    <div>
                      <h3>Account Settings</h3>
                      <p>Manage notifications, privacy, and preferences</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-card-edit"
                    onClick={() => setActiveTab('profile')}
                  >
                    ← Back to Profile
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>Order Notifications</h4>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>Receive SMS and email updates on your order shipments</p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#b8633b', cursor: 'pointer' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>Promotional Offers</h4>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>Receive updates about festive sales and seasonal discounts</p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#b8633b', cursor: 'pointer' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#dc2626' }}>Deactivate Account</h4>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>Temporarily disable your customer account profile</p>
                    </div>
                    <button
                      type="button"
                      style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      onClick={() => alert('Please contact customer care to deactivate your account.')}
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Profile;
