import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoveMessage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen bg-slate-50 relative"
            style={{ minHeight: "100dvh" }}
        >
            {/* Background Image */}
            <div className="fixed inset-0 z-0">
                <img
                    src="/bg.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur"></div>
            </div>

            {/* Header */}
            <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-20">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-200" />
                    </button>
                    <h1 className="text-lg font-semibold text-white">
                        Lời gửi của anh
                    </h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/90 rounded-2xl shadow-lg border border-slate-700 p-8"
                >
                    {/* Header with hearts */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Heart className="w-6 h-6 text-pink-400 fill-pink-400 animate-pulse" />
                        <h2 className="text-2xl font-bold text-white text-center">
                            Bé yêu của anh
                        </h2>
                        <Heart className="w-6 h-6 text-pink-400 fill-pink-400 animate-pulse" />
                    </div>

                    {/* Message content */}
                    <div className="space-y-4 text-slate-200 leading-relaxed">
                        <p className="text-base">
                            Vậy là mình đã bước sang tháng thứ 3 rồi nè. Nhìn
                            lại thời gian qua, có lúc zui, có lúc buồn, nhưng
                            với anh, từng khoảnh khắc đều rất đáng trân trọng vì
                            lúc nào cũng có bé ở bên. Anh thấy mình thật may mắn
                            và hạnh phúc khi được đồng hành cùng bé.
                        </p>
                        <p className="text-base">
                            Anh hi vọng tụi mình sẽ còn đi cùng nhau thật lâu
                            nữa, cùng tạo ra thật nhiều kỷ niệm đẹp và nắm tay
                            nhau vượt qua mọi thử thách phía trước.
                        </p>
                        <p className="text-base text-center font-medium text-pink-300">
                            Iuuuuuuuuu bé nhiều lắm luôn 🥺💖
                        </p>
                    </div>

                    {/* Decorative hearts */}
                    <div className="mt-8 flex justify-center gap-2">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: 0.5 + i * 0.1,
                                    type: "spring",
                                }}
                            >
                                <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Date */}
                    <p className="text-center text-sm text-slate-400 mt-6 italic">
                        Ngày 6, Tháng 2, 2025
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoveMessage;
