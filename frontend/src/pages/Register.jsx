import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'CUSTOMER' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert("Account created! Please login.");
      navigate('/login');
    } catch (err) {
      alert("Registration failed. Email might already exist.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Create Account</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="email" required placeholder="Email address" className="w-full p-3 border rounded-lg"
            onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="password" required placeholder="Password" className="w-full p-3 border rounded-lg"
            onChange={(e) => setFormData({...formData, password: e.target.value})} />
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold">Register</button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-indigo-600 font-bold">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;