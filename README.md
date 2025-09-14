# 🚀 Bank Management System API  

A secure and scalable **Bank Management System REST API** built with **Express.js, MongoDB, and JWT authentication**.  
This backend powers features like user authentication, customer management, transactions, loans, and admin controls.  

---

## ✨ Features
- 🔐 **Authentication & Authorization** (JWT-based)
- 👤 **User Management** (Register, Login, Profile, Roles)
- 🧾 **Customer Management** (CRUD operations)
- 💸 **Transactions API** (Send money, deposits, withdrawals)
- 🏦 **Loan Management**
- 👨‍💼 **Admin Panel APIs** (Employees, reports, audit)
- 🛡 **Security**: Helmet, CORS, and environment variables
- 📂 File Uploads (Served via `/uploads`)

---

## 🛠 Tech Stack
- **Backend Framework**: [Express.js](https://expressjs.com/)  
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)  
- **Authentication**: [JWT](https://jwt.io/)  
- **Security**: Helmet, CORS  
- **Logger**: Morgan  

---

## 📂 Project Structure
── routes/
│ ├── auth.js
│ ├── users.js
│ ├── customers.js
│ ├── admin.js
│ ├── transactions.js
│ └── loan.routes.js
├── uploads/ # Static uploaded files
├── server.js # Entry point
├── .env # Environment variables
├── package.json


---

## ⚙️ Installation & Setup

1️⃣ Clone the repository  
```bash
git clone https://github.com/your-username/bank-management-api.git
cd bank-management-api