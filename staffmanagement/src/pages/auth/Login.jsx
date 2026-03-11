import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, ChefHat } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            toast.success("Welcome back, Chef!");
            navigate("/staff/orders");
        } catch (err) {
            console.error(err);
            toast.error(typeof err === 'string' ? err : "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-center px-6 relative overflow-hidden">
            {/* BACKGROUND ELEMENTS */}
            <div className="absolute top-[-10%] right-[-20%] w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-20%] w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-[80px]" />

            <div className="z-10 w-full max-w-[400px] mx-auto">
                {/* LOGO AREA */}
                <div className="mb-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-red-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/20">
                        <ChefHat size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Staff Portal</h1>
                    <p className="text-gray-400">Manage orders efficiently</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* EMAIL */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 pl-1 uppercase tracking-wider">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                required
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 text-white placeholder:text-zinc-600 transition-all"
                                placeholder="staff@restaurant.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 pl-1 uppercase tracking-wider">Password</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 text-white placeholder:text-zinc-600 transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* FORGOT PASS */}
                    <div className="flex justify-end">
                        <Link to="#" className="text-xs text-orange-500 font-medium hover:text-orange-400 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-[0.98] transition-all duration-300
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? "Verifying..." : "Login to Dashboard"}
                    </button>
                </form>

                {/* FOOTER */}
                <p className="text-center mt-8 text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link to="/staff/signup" className="text-white font-medium hover:underline">
                        Contact Admin
                    </Link>
                </p>
            </div>
        </div>
    );
}
