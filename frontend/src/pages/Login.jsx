import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../lib/axios"; 
import { Lock, Mail, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowRight, AlertTriangle } from "lucide-react";

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
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16">
            {/* Clickable Logo */}
            <Link to="/" className="flex items-center gap-3 w-fit group">
                <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <span className="text-2xl font-extrabold text-white tracking-tight">TechVault</span>
            </Link>

            <div className="space-y-6">
                <h1 className="text-5xl font-extrabold text-white leading-tight">
                    Equip Your <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Digital Arsenal.</span>
                </h1>
                <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                    Join thousands of gamers and developers upgrading their setup with TechVault's premium collection.
                </p>
                {/* Social Proof / Trust */}
                <div className="flex items-center gap-4 pt-4">
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <img key={i} className="w-10 h-10 rounded-full border-2 border-slate-900" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                        ))}
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Trusted by 10k+ Techies</p>
                </div>
            </div>

            <div className="text-xs text-slate-500">
                © 2026 TechVault Inc.
            </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        
        {/* Mobile Logo (Visible only on small screens) */}
        <Link to="/" className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
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
                        <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot password?</Link>
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

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-500">Or continue with</span></div>
            </div>

            {/* Social Logins (Visual Only) */}
            <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-medium text-sm text-slate-700">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-medium text-sm text-slate-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                    GitHub
                </button>
            </div>

            <p className="text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition">Create free account</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;