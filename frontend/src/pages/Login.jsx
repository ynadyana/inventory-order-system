import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../lib/axios"; 
import { Lock, Mail, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowRight, AlertTriangle } from "lucide-react";
import logo from "../assets/logo_remove.png"; // Import the logo

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); 
  const [errorMessage, setErrorMessage] = useState("");

  // Check if redirected from session expiry
  const sessionExpiredMessage = location.state?.message;
  const returnPath = location.state?.from || "/";

  useEffect(() => {
    if (sessionExpiredMessage) {
      setStatus("session_expired");
    }
  }, [sessionExpiredMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await api.post("/auth/login", formData);
      const { token, role, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      if(user) localStorage.setItem("user", JSON.stringify(user));

      setStatus("success");

      setTimeout(() => {
        // If came from session expiry, return to that page
        if (location.state?.from) {
          navigate(location.state.from, { replace: true });
        } else if (role === "STAFF" || role === "ROLE_STAFF") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.response?.data?.message || "Invalid email or password.");
    } finally {
        if (status !== "success") setLoading(false);
    }
  };

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      if (status === "error" || status === "session_expired") setStatus("idle");
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      
      {/* --- LEFT SIDE: VISUAL & BRANDING (Hidden on Mobile) --- */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16">
            {/* Clickable Logo */}
            <Link to="/" className="flex items-center gap-3 w-fit group">
                <img src={logo} alt="TechVault Logo" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300" />
                <span className="text-2xl font-extrabold text-white tracking-tight">TechVault</span>
            </Link>

            <div className="space-y-6">
                <h1 className="text-4xl font-extrabold text-white leading-tight">
                    Powering Your <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Digital World.</span>
                </h1>
                <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                    Your one-stop destination for premium hardware, peripherals, and enterprise solutions.
                </p>
                {/* Social Proof / Trust */}
                <div className="flex items-center gap-4 pt-4">
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <img key={i} className="w-10 h-10 rounded-full border-2 border-slate-900" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                        ))}
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Trusted by 10k+ Professionals</p>
                </div>
            </div>

            <div className="text-xs text-slate-500">
                © 2026 TechVault Inc. All rights reserved.
            </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        
        {/* Mobile Logo (Visible only on small screens) */}
        <Link to="/" className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
            <img src={logo} alt="TechVault Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-slate-900">TechVault</span>
        </Link>

        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                <p className="mt-2 text-slate-500">Please enter your details to sign in.</p>
            </div>

            {/* Session Expired Warning */}
            {status === "session_expired" && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-sm animate-fade-in">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold mb-1">Session Expired</p>
                        <p className="text-xs">{sessionExpiredMessage}</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {status === "error" && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 text-sm animate-shake">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Success Message */}
            {status === "success" && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-700 text-sm animate-fade-in">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-bold">Login Successful! Redirecting...</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={status === "loading" || status === "success"}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-semibold text-slate-700">Password</label>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-slate-400"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={status === "loading" || status === "success"}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                >
                    {status === "loading" ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                        </>
                    ) : status === "success" ? (
                        <>
                            <CheckCircle className="w-5 h-5" /> Success
                        </>
                    ) : (
                        <>
                            Sign in to account <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-8">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition">Create free account</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;