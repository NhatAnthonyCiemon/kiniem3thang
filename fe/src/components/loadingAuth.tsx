import { motion } from "framer-motion";
import React from "react";

const LoadingAuth: React.FC = () => {
    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-8 relative"
            style={{
                height: "100dvh",
                backgroundImage: `
                    linear-gradient(
                        rgba(15, 23, 42, 0.55),
                        rgba(15, 23, 42, 0.55)
                    ),
                    url('/bg.jpg')
                    `,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "scroll" /* QUAN TRỌNG */,
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 bg-slate-800/90 border border-slate-700 shadow-lg rounded-2xl p-10 w-full max-w-md text-center"
            >
                {/* 🔐 Animated padlock icon */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                    }}
                    className="mx-auto mb-6 flex items-center justify-center bg-blue-600/20 rounded-full w-20 h-20"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-10 h-10 text-blue-400"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 10.5V6a4.5 4.5 0 00-9 0v4.5M5.25 10.5h13.5a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V12a1.5 1.5 0 011.5-1.5z"
                        />
                    </svg>
                </motion.div>

                {/* ✨ Animated loading text */}
                <motion.h1
                    className="text-2xl font-bold mb-3 text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    Đang tải...
                </motion.h1>

                <motion.p
                    className="text-slate-200 text-sm"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    Vui lòng đợi trong giây lát
                </motion.p>

                {/* 💫 Progress bar shimmer */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: ["0%", "100%"] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="mt-6 h-1.5 rounded-full bg-blue-500"
                />

                {/* 🖋️ Branding (optional) */}
                <p className="text-xs text-slate-400 mt-8">
                    Made with ❤️ by Nguyen Thanh Nhat
                </p>
            </motion.div>
        </div>
    );
};

export default LoadingAuth;
