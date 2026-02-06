import { motion } from "framer-motion";
import { LogOut, BookOpen, List, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/useAuthContext";
import { useUser } from "../hooks/useUser";
import toast from "react-hot-toast";

const Dashboard: React.FC = () => {
    const { logout } = useAuthContext();
    const navigate = useNavigate();
    const { data: user, isLoading } = useUser();

    const handleLogout = () => {
        logout();
        toast.success("Đăng xuất thành công!");
        navigate("/login");
    };

    const menuItems = [
        {
            icon: BookOpen,
            title: "Tạo từ vựng",
            description: "Thêm từ mới vào danh sách",
            color: "from-blue-500 to-cyan-500",
            path: "/create-word",
        },
        {
            icon: List,
            title: "Danh sách từ",
            description: "Xem tất cả từ đã lưu",
            color: "from-purple-500 to-pink-500",
            path: "/words",
        },
        {
            icon: Brain,
            title: "Luyện tập Quiz",
            description: "Kiểm tra kiến thức của bạn",
            color: "from-orange-500 to-red-500",
            path: "/quiz",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">
                            Học từ vựng
                        </h1>
                        {user && (
                            <p className="text-sm text-slate-600 mt-1">
                                Xin chào, {user.username || user.email}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Đăng xuất"
                    >
                        <LogOut className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white cursor-pointer rounded-2xl p-6 animate-pulse"
                            >
                                <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4"></div>
                                <div className="h-6 bg-slate-200 rounded w-1/2 mb-2"></div>
                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {menuItems.map((item, index) => (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => navigate(item.path)}
                                className="w-full bg-white hover:shadow-lg transition-all rounded-2xl p-6 text-left border border-slate-200 group cursor-pointer"
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                                    >
                                        <item.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
