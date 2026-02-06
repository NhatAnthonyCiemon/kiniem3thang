import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Mail,
    User,
    Lock,
    ArrowLeft,
} from "lucide-react";
import { useRegisterUser } from "../hooks/useRegisterUser";

type FormValues = {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
};

const SignUp: React.FC = () => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
        },
    });

    const { mutate, isPending, isError, isSuccess, error } = useRegisterUser();

    const onSubmit = (data: FormValues) => {
        mutate({
            email: data.email,
            password: data.password,
            username: data.username,
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative bg-white border border-slate-200 shadow-lg rounded-2xl p-8 w-full max-w-md"
            >
                <Link
                    to="/"
                    className="absolute top-5 left-5 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={18} />
                    Trang chủ
                </Link>

                <div className="mb-8 text-center mt-8">
                    <h1 className="text-3xl font-bold mb-2 text-slate-800">
                        Đăng ký
                    </h1>
                    <p className="text-slate-600 text-sm">
                        Tạo tài khoản mới để bắt đầu!
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="mb-2 font-medium text-slate-700 text-sm flex items-center gap-2">
                            <Mail size={18} /> Email
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
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 text-base"
                        />
                        {errors.email && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Username */}
                    <div>
                        <label className="mb-2 font-medium text-slate-700 text-sm flex items-center gap-2">
                            <User size={16} /> Tên người dùng
                        </label>
                        <input
                            {...register("username", {
                                required: "Vui lòng nhập tên người dùng",
                            })}
                            type="text"
                            autoCapitalize="words"
                            placeholder="Tên của bạn"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 text-base"
                        />
                        {errors.username && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-2 font-medium text-slate-700 text-sm flex items-center gap-2">
                            <Lock size={16} /> Mật khẩu
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
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 pr-12 text-base"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
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

                    {/* Confirm Password */}
                    <div>
                        <label className="mb-2 font-medium text-slate-700 text-sm flex items-center gap-2">
                            <Lock size={16} /> Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                {...register("confirmPassword", {
                                    required: "Vui lòng xác nhận mật khẩu",
                                    validate: (val) =>
                                        val === watch("password") ||
                                        "Mật khẩu không khớp",
                                })}
                                type={showConfirmPassword ? "text" : "password"}
                                autoCapitalize="none"
                                autoCorrect="off"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 pr-12 text-base"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword((prev) => !prev)
                                }
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                            >
                                {showConfirmPassword ? (
                                    <Eye size={18} />
                                ) : (
                                    <EyeOff size={18} />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {/* ⚠️ Server Error */}
                    {isError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl"
                        >
                            <XCircle size={18} />
                            <p className="text-sm">
                                {(error as any)?.response?.data?.mes ||
                                    "Đã có lỗi xảy ra."}
                            </p>
                        </motion.div>
                    )}

                    {/* ✅ Success */}
                    {isSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl"
                        >
                            <CheckCircle size={18} />
                            <p className="text-sm">
                                Đăng ký thành công!{" "}
                                <Link
                                    to="/login"
                                    className="underline ml-1 font-semibold"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </motion.div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className={`w-full py-4 rounded-xl font-semibold text-base mt-6 transition active:scale-95 min-h-[48px] ${
                            isPending
                                ? "bg-slate-300 cursor-not-allowed text-slate-500"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        }`}
                    >
                        {isPending ? "Đang đăng ký..." : "Đăng ký"}
                    </button>
                </form>

                <p className="text-center text-slate-600 text-sm mt-6">
                    Đã có tài khoản?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Đăng nhập
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default SignUp;
