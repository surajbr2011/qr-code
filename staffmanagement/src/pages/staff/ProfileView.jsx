import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { FiChevronLeft, FiLogOut, FiUser, FiMail, FiHash, FiShield } from "react-icons/fi";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function ProfileView() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/auth/profile');
                setUser(data);
            } catch (err) {
                console.error("Profile fetch error", err);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate('/staff/login');
    };

    if (loading) {
        return (
            <PageWrapper className="bg-[#F5F7FB] min-h-screen max-w-[430px] mx-auto flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium tracking-tight">Loading Profile...</p>
                </div>
            </PageWrapper>
        );
    }

    if (!user) {
        return (
            <PageWrapper className="bg-[#F5F7FB] min-h-screen max-w-[430px] mx-auto flex flex-col items-center justify-center p-6 text-center">
                <p className="text-gray-500 mb-4">No profile data found.</p>
                <button onClick={() => navigate('/staff/login')} className="bg-black text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-black/10">Login</button>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="bg-[#F5F7FB] min-h-screen max-w-[430px] mx-auto">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-1">
                    <FiChevronLeft size={28} className="text-black" />
                </button>
                <h1 className="text-xl font-bold text-black flex-1 text-center pr-8">My Profile</h1>
            </div>

            <div className="p-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-10 mt-4 animate-card">
                    <div className="relative">
                        <div className="w-28 h-28 bg-gradient-to-tr from-orange-100 to-orange-50 rounded-full flex items-center justify-center text-4xl font-bold text-orange-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-4 ring-white">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-black mt-4">{user.name}</h2>
                    <span className="text-orange-600 font-bold text-xs bg-orange-100 px-4 py-1.5 rounded-full mt-2 uppercase tracking-widest shadow-sm">
                        {user.role || 'Staff'}
                    </span>
                </div>

                {/* Details Section */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-50 space-y-6 animate-card delay-100">
                    <ProfileRow icon={<FiHash className="text-blue-500" />} label="Employee ID" value={user.employeeId || "EP-001"} />
                    <ProfileRow icon={<FiMail className="text-purple-500" />} label="Email Address" value={user.email || "N/A"} />
                    <ProfileRow icon={<FiShield className="text-green-500" />} label="System Access" value={user.role === 'admin' ? 'Full Control' : 'Standard'} />
                    <ProfileRow icon={<FiUser className="text-gray-400" />} label="Account ID" value={`#${user._id.slice(-6).toUpperCase()}`} />
                </div>

                {/* Account Actions */}
                <div className="mt-8 space-y-4 animate-card delay-200">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-white text-red-500 border border-red-50 py-4 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-3 hover:bg-red-50 transition-all duration-300 active:scale-[0.98]"
                    >
                        <FiLogOut size={20} />
                        Logout Session
                    </button>
                    <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-tighter opacity-50">
                        App Version 2.4.0 • Build ID: CV-992
                    </p>
                </div>

            </div>
        </PageWrapper>
    );
}

function ProfileRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-bold text-black truncate mt-0.5">{value}</p>
            </div>
        </div>
    );
}
