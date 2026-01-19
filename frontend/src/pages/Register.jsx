import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/axios"; 
import { User, Lock, Mail, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  
  // Form State
  const [formData, setFormData] = useState({ 
      username: "", 
      email: "", 
      password: "", 
      confirmPassword: "" 
  });

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    // 1. Client-side Validation
    if (formData.password !== formData.confirmPassword) {
        setStatus("error");
        setErrorMessage("Passwords do not match.");
        return;
    }

    if (formData.password.length < 6) {
        setStatus("error");
        setErrorMessage("Password must be at least 6 characters.");
        return;
    }

    try {
      // 2. Prepare Payload 
      const payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: "CUSTOMER" // Default role
      };

      // 3. API Call
      await api.post("/auth/register", payload);

      // 4. Success Handling
      setStatus("success");
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error(err);
      setStatus("error");
      // Try to get specific error message from backend
      setErrorMessage(err.response?.data?.message || "Registration failed. Email or Username might already exist.");
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      
      {/* --- LEFT SIDE: VISUAL & BRANDING --- */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=2662&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16">
            <Link to="/" className="flex items-center gap-3 w-fit group">
                <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <span className="text-2xl font-extrabold text-white tracking-tight">TechVault</span>
            </Link>

            <div className="space-y-6">
                <h1 className="text-5xl font-extrabold text-white leading-tight">
                    Join the <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Tech Revolution.</span>
                </h1>
                <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                    Create an account to unlock exclusive member deals, track your orders, and build your dream setup.
                </p>
                <div className="flex flex-col gap-3 pt-4">
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                        <CheckCircle className="w-5 h-5 text-green-500" /> <span>Member-only pricing</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                        <CheckCircle className="w-5 h-5 text-green-500" /> <span>Faster checkout</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                        <CheckCircle className="w-5 h-5 text-green-500" /> <span>Order tracking</span>
                    </div>
                </div>
            </div>

            <div className="text-xs text-slate-500">
                © 2026 TechVault Inc.
            </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative overflow-y-auto">
        
        {/* Mobile Logo */}
        <Link to="/" className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <span className="text-xl font-bold text-slate-900">TechVault</span>
        </Link>

        <div className="w-full max-w-md space-y-8 mt-16 lg:mt-0">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create an account</h2>
                <p className="mt-2 text-slate-500">Enter your details to get started.</p>
            </div>

            {/* ERROR ALERT */}
            {status === "error" && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 text-sm animate-shake">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* SUCCESS ALERT */}
            {status === "success" && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-700 text-sm animate-fade-in">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-bold">Account created! Redirecting to login...</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* USERNAME */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            name="username"
                            required
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={status === "loading" || status === "success"}
                        />
                    </div>
                </div>

                {/* EMAIL */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={status === "loading" || status === "success"}
                        />
                    </div>
                </div>

                {/* PASSWORD */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={status === "loading" || status === "success"}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                    <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            required
                            className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={status === "loading" || status === "success"}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                >
                    {status === "loading" ? (
                        <> <Loader2 className="w-5 h-5 animate-spin" /> Creating Account... </>
                    ) : status === "success" ? (
                        <> <CheckCircle className="w-5 h-5" /> Success </>
                    ) : (
                        <> Create Account <ArrowRight className="w-4 h-4" /> </>
                    )}
                </button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-500">Already a member?</span></div>
            </div>

            <div className="text-center">
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition">Log in to your account</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Register;