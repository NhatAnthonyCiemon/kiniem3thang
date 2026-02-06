import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useLoginUser } from "../hooks/useLoginUser";
import { useAuthContext } from "../contexts/useAuthContext";

type FormValues = {
    email: string;
    password: string;
};

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuthContext();
    const { mutate, isPending, isError, error } = useLoginUser();
    const [showPassword, setShowPassword] = React.useState(false);

    // ✅ Validation setup
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        mode: "onBlur",
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = (data: FormValues) => {
        mutate(data, {
            onSuccess: (res) => {
                const { access_token, refresh_token } = res;

                if (access_token && refresh_token) {
                    login(access_token, refresh_token);
                    toast.success("Login successful! Redirecting...");
                    setTimeout(() => navigate("/dashboard"), 1500);
                }
            },
        });
    };

    return (
        <div
            className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8 relative"
            style={{ minHeight: "100dvh" }}
        >
            {/* Background Image */}
            <div className="fixed inset-0 z-0">
                <img
                    src="/bg.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg rounded-2xl p-8 w-full max-w-md z-10"
            >
                <Link
                    to="/"
                    className="absolute top-5 left-5 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={18} />
                    Trang chủ
                </Link>

                <div className="mb-8 mt-8 text-center">
                    <h1 className="text-3xl font-bold mb-2 text-slate-800">
                        Đăng nhập
                    </h1>
                    <p className="text-slate-600 text-sm">
                        Chào mừng bạn trở lại!
                    </p>
                </div>

                {/* ✅ Form bắt lỗi đầy đủ */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-5"
                >
                    {/* Email */}
                    <div>
                        <label className="mb-2 font-semibold text-slate-800 text-sm flex items-center gap-2">
                            <Mail size={16} className="text-slate-500" />
                            Email
                        </label>
                        <input
                            {...register("email", {
                                required: "Vui lòng nhập email",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Email không hợp lệ",
                                },
                            })}
                            type="email"
                            inputMode="email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            placeholder="email@example.com"
                            className={`w-full px-4 py-3 rounded-xl bg-white border-2 text-slate-900 outline-none transition-all text-base ${
                                errors.email
                                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                    : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            } placeholder:text-slate-400`}
                        />
                        {errors.email && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-2 font-semibold text-slate-800 text-sm flex items-center gap-2">
                            <Lock size={16} className="text-slate-500" />
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                {...register("password", {
                                    required: "Vui lòng nhập mật khẩu",
                                    minLength: {
                                        value: 6,
                                        message:
                                            "Mật khẩu phải có ít nhất 6 ký tự",
                                    },
                                })}
                                type={showPassword ? "text" : "password"}
                                autoCapitalize="none"
                                autoCorrect="off"
                                placeholder="••••••••"
                                className={`w-full px-4 py-3 rounded-xl bg-white border-2 text-slate-900 outline-none transition-all pr-12 text-base ${
                                    errors.password
                                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                        : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                } placeholder:text-slate-400`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1"
                            >
                                {showPassword ? (
                                    <Eye size={18} />
                                ) : (
                                    <EyeOff size={18} />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Server Error */}
                    {isError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl"
                        >
                            <XCircle size={18} />
                            <p className="text-sm font-medium">
                                {(error as any)?.response?.data?.mes ||
                                    "Đã có lỗi xảy ra."}
                            </p>
                        </motion.div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className={`w-full py-4 rounded-xl font-bold text-base mt-6 transition active:scale-95 min-h-[48px] ${
                            isPending
                                ? "bg-slate-400 cursor-not-allowed text-slate-200"
                                : "bg-blue-600 hover:bg-blue-700 shadow-lg text-white cursor-pointer"
                        }`}
                    >
                        {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>

                <p className="text-center text-slate-600 text-sm mt-6">
                    Chưa có tài khoản?{" "}
                    <Link
                        to="/signup"
                        className="text-blue-600 font-semibold hover:underline hover:text-blue-700"
                    >
                        Đăng ký
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
