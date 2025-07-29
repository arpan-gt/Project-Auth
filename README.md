# Project-Auth
# 🔐 Authentication API Backend

A simple Node.js authentication backend built using Express, MongoDB, and Zod for validation.

---

## 🧱 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- Zod for validation
- Dotenv for config
- Bcrypt (optional: for password hashing)
- JWT (optional: for login tokens)

---

## 📁 Project Structure

auth/
├── controllers/
│ └── authController.js
├── models/
│ └── User.models.js
├── schemas/
│ └── userSchema.js
├── routes/
│ └── user.routes.js
├── utils/
│ └── db.js
├── index.js
├── .env
├── .env.sample
├── .gitignore
├── package.json




---

## ⚙️ How to Run

### 1. Clone this repo or open the folder

```bash
cd ~/Desktop/auth

2. Install all dependencies
   npm install

3. Create .env file
   Create a file named .env in the root
    _________________________
    |     PORT=             |                                                  
    |     MONGO_URL=        |
    |_______________________|
   Replace values as needed.


4. Run the server (dev mode)
      _________________
      |  npm run dev  |
      |_______________|             |