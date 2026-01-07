// adminSeed.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Replace with your MongoDB URI
const MONGO_URI = process.env.MONGO_URI;

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin' },
});

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  seedAdmin();
}).catch(err => console.error('MongoDB connection error:', err));

// Seed function to create admin
async function seedAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@inventory.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('admin', 10);

    const admin = new User({
      name: 'admin',
      email: 'admin@inventory.com',
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin user created successfully');
    process.exit();
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}
