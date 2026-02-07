import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";
import { useAuthContext } from "../contexts/useAuthContext";

const Home: React.FC = () => {
    const { isAuthenticated } = useAuthContext();
    const navigate = useNavigate();
    if (isAuthenticated) {
        navigate("/dashboard");
    }
    return (
        <div
            className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-8 relative"
            style={{ minHeight: "100dvh" }}
        >
            {/* Background Image */}
            <div className="fixed inset-0 z-0">
                <img
                    src="/bg.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-slate-800/95 backdrop-blur-sm border border-slate-700 shadow-lg rounded-2xl p-10 w-full max-w-md text-center relative z-10"
            >
                <motion.h1
                    className="text-3xl font-bold mb-3 text-slate-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    Học từ vựng 📚
                </motion.h1>

                <motion.p
                    className="text-slate-300 mb-8 text-sm leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Nâng cao vốn từ vựng tiếng Anh của bạn với AI
                </motion.p>

                <motion.div
                    className="flex flex-col gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 py-3 px-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all"
                    >
                        <LogIn size={18} />
                        Đăng nhập
                    </Link>

                    <Link
                        to="/signup"
                        className="flex items-center justify-center gap-2 py-3 px-6 w-full bg-slate-700 border-2 border-blue-500 text-blue-400 hover:bg-slate-700/70 font-semibold rounded-xl transition-all"
                    >
                        <UserPlus size={18} />
                        Đăng ký
                    </Link>
                </motion.div>

                <p className="text-xs text-slate-400 mt-8">
                    Made with ❤️ by Nguyen Thanh Nhat
                </p>
            </motion.div>
        </div>
    );
};

export default Home;
