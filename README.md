# Wood Furniture 🪑

A full-stack furniture e-commerce web application built with **React, Node.js, Express, and MySQL**. The project includes customer authentication, product browsing, cart and wishlist management, user profiles, order management, and a separate admin panel.

## ✨ Features

### Customer
- User registration and login
- Email + password authentication
- Mobile OTP authentication with Demo OTP mode
- Forgot Password and Reset Password
- Profile management
- Profile avatar upload
- Product browsing
- Product search/details
- Cart management
- Wishlist management
- Checkout and order management
- My Orders
- Order status tracking

### Admin
- Protected Admin Panel
- Dashboard
- Product management
- Add/Edit products
- Inventory management
- Order management
- User management
- Admin profile

### 🔐 Security
- JWT-based authentication
- bcrypt password hashing
- Role-based admin authorization
- Protected user routes
- Parameterized MySQL queries
- Input validation
- CORS allowlist
- Helmet security headers
- API rate limiting
- Secure password reset tokens
- User-specific cart/order/profile access
- Environment variables for sensitive credentials
- `.env` files excluded from Git

## 🛠️ Tech Stack

**Frontend**
- React
- Vite
- JavaScript / JSX
- CSS

**Backend**
- Node.js
- Express.js
- JWT
- bcryptjs
- Multer

**Database**
- MySQL

**Development**
- Git
- GitHub
- VS Code

## 📁 Project Structure

```text
wood-furniture/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── scripts/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/pgorai45/wood-furniture.git
cd wood-furniture
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file from `.env.example` and configure your local MySQL/database and authentication settings.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_secure_random_secret

OTP_MODE=demo
```

> Never commit the real `.env` file or any secret credentials to GitHub.

### 3. Start backend

```bash
node server.js
```

The backend runs on the configured port, commonly:

```text
http://localhost:5000
```

### 4. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will provide the frontend URL shown in the terminal.

## 📱 Demo OTP

For development/testing, the project supports Demo OTP mode.

```env
OTP_MODE=demo
```

Demo OTP:

```text
123456
```

For production, disable Demo OTP and configure the appropriate real authentication/SMS provider.

## 🔑 Environment Variables

Sensitive values should remain in `backend/.env`.

A safe example file is provided:

```text
backend/.env.example
```

Never commit:

```text
.env
backend/.env
frontend/.env
```

## 🧪 Testing

The project has been tested for:

- Email/password login
- Mobile OTP login
- Wrong OTP handling
- OTP resend
- Change mobile number
- Forgot Password
- Password reset
- Logout
- Admin authorization
- User data isolation
- Cart ownership protection
- Order ownership protection
- Password hashing
- SQL injection protection
- File upload validation
- Frontend production build
- Backend startup and MySQL connection

## 🔒 Production Notes

Before deploying:

1. Use a strong random `JWT_SECRET`.
2. Configure production database credentials through environment variables.
3. Disable Demo OTP mode.
4. Configure a real SMS/email provider if required.
5. Configure production frontend/backend CORS origins.
6. Use HTTPS.
7. Keep all secrets outside the Git repository.
8. Review rate limits for the expected production traffic.

## 📌 Future Improvements

- Online payment integration
- Product reviews and ratings
- Advanced search and filters
- Order email notifications
- Real-time order tracking
- Production SMS OTP
- Deployment and cloud database
- Analytics dashboard

## 👨‍💻 Project

**Wood Furniture** — Full-stack furniture e-commerce application.

GitHub: https://github.com/pgorai45/wood-furniture

---

⭐ If you find this project useful, consider giving the repository a star.
