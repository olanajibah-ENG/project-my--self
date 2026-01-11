// src/components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'student' });
    const [showPassword, setShowPassword] = useState(false);

        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await authService.register(formData);
            alert("Account created successfully!");
            onSuccess();
        } catch (err) { alert("Error during registration"); }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
                <FaUser className="input-icon" />
                <input type="text" placeholder="Username" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, username: e.target.value})} required />
            </div>
            <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input type="email" placeholder="Email" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="input-group password-group">
                <FaLock className="input-icon" />
                <input type={showPassword ? "text" : "password"} placeholder="Password" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})} required />
                <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
            <select value={formData.role} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, role: e.target.value})}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
            </select>
            <button type="submit" className="auth-btn">Sign Up</button>
        </form>
    );
};
export default RegisterForm;
