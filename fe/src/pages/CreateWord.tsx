import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateWord } from "../hooks/useCreateWord";
import { useWordSuggestions } from "../hooks/useWordSuggestions";
import { useGenerateAI } from "../hooks/useGenerateAI";
import { useDebounce } from "../hooks/useDebounce";
import { usePhonetic } from "../hooks/usePhonetic";
import toast from "react-hot-toast";

const CreateWord: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [keyword, setKeyword] = useState("");
    const [selectedWord, setSelectedWord] = useState("");
    const [description, setDescription] = useState("");
    const [note, setNote] = useState("");
    const [aiContent, setAiContent] = useState("");

    // Debounce keyword để tránh gọi API quá nhiều
    const debouncedKeyword = useDebounce(keyword, 500);

    const { data: suggestions, isLoading: isSearching } =
        useWordSuggestions(debouncedKeyword);
    const { mutate: generateAI, isPending: isGenerating } = useGenerateAI();
    const { mutate: createWord, isPending: isSaving } = useCreateWord();
    const { data: phonetic } = usePhonetic(selectedWord);

    const handleSelectWord = (word: string) => {
        setSelectedWord(word);
        setStep(2);
    };

    const handleBackToSearch = () => {
        setStep(1);
        setKeyword("");
        setSelectedWord("");
        setDescription("");
        setNote("");
        setAiContent("");
    };

    const handleSpeak = () => {
        if (!selectedWord) return;

        const utterance = new SpeechSynthesisUtterance(selectedWord);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
    };

    const formatAIContent = (content: string) => {
        if (!content) return content;

        // Split by lines and process each line
        return content.split("\n").map((line, index) => {
            // Check if line starts with "1. ", "2. ", "3. ", or "4. " followed by text
            const match = line.match(/^(\d+\.\s+)(.+)$/);
            if (match) {
                return (
                    <div key={index}>
                        <strong>
                            {match[1]}
                            {match[2]}
                        </strong>
                    </div>
                );
            }
            return <div key={index}>{line || "\u00A0"}</div>;
        });
    };

    const handleGenerateAI = () => {
        if (!selectedWord) return;

        generateAI(selectedWord, {
            onSuccess: (data: any) => {
                setAiContent(data.data);
                toast.success("Đã tạo nội dung AI!");
            },
            onError: () => {
                toast.error("Không thể tạo nội dung AI");
            },
        });
    };

    const handleSave = () => {
        if (!description.trim()) {
            toast.error("Vui lòng nhập mô tả!");
            return;
        }

        createWord(
            {
                word: selectedWord,
                description: description.trim(),
                note: note.trim() || "",
                ai_content: aiContent || "",
            },
            {
                onSuccess: () => {
                    toast.success("Đã lưu từ vựng!");
                    navigate("/words");
                },
                onError: () => {
                    toast.error("Không thể lưu từ vựng");
                },
            },
        );
    };

    return (
        <div
            className="min-h-screen bg-slate-50 pb-2 sm:pb-2"
            style={{ minHeight: "100dvh" }}
        >
            {/* Header */}
            <div className="fixed inset-0 z-0">
                <img
                    src="/bg.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur"></div>
            </div>

            <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-20">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button
                        onClick={() =>
                            step === 1
                                ? navigate("/dashboard")
                                : handleBackToSearch()
                        }
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-200" />
                    </button>
                    <h1 className="text-lg font-semibold text-white">
                        {step === 1 ? "Tìm từ vựng" : "Thêm thông tin"}
                    </h1>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-2xl mx-auto px-4 py-6 relative z-10"
                    >
                        {/* Search Box */}
                        <div className="bg-slate-800/90 rounded-2xl shadow-sm border border-slate-700 p-4 mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        keyword.trim() &&
                                        handleSelectWord(keyword)
                                    }
                                    placeholder="Nhập từ tiếng Anh..."
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 pr-24"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {isSearching && (
                                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    {keyword.trim() && !isSearching && (
                                        <button
                                            onClick={() =>
                                                handleSelectWord(keyword)
                                            }
                                            className="cursor-pointer px-5 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                        >
                                            Tiếp
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Gợi ý sẽ hiện tự động khi bạn gõ, hoặc nhấn
                                Enter để tiếp tục
                            </p>
                        </div>

                        {/* Suggestions */}
                        {suggestions && suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                <h3 className="text-sm  font-medium text-white px-2 mb-3">
                                    Gợi ý từ vựng
                                </h3>
                                {suggestions.map((item: any, index: number) => (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() =>
                                            handleSelectWord(item.word)
                                        }
                                        className="cursor-pointer w-full bg-slate-800/90 border border-slate-700 rounded-xl p-4 hover:border-blue-500 hover:bg-slate-700 transition-all text-left flex items-center justify-between group"
                                    >
                                        <span className="text-white font-medium">
                                            {item.word}
                                        </span>
                                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}

                        {/* Or direct input */}
                        {keyword && !suggestions?.length && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8"
                            >
                                <p className="text-white mb-4">
                                    Không tìm thấy gợi ý
                                </p>
                                <button
                                    onClick={() => handleSelectWord(keyword)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    Tiếp tục với "{keyword}"
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="max-w-2xl mx-auto px-4 py-6 relative z-10"
                    >
                        {/* Selected Word */}
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-sm p-6 mb-6 text-white">
                            <p className="text-sm opacity-90 mb-1">Từ vựng</p>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold mb-1">
                                        {selectedWord}
                                    </h2>
                                    {phonetic && (
                                        <p className="text-sm opacity-90 font-mono">
                                            {phonetic}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleSpeak}
                                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex-shrink-0"
                                    title="Phát âm"
                                >
                                    <Volume2 className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-slate-800/90 rounded-2xl shadow-sm border border-slate-700 p-4 mb-4">
                            <label className="block text-sm font-medium text-slate-200 mb-2">
                                Mô tả / Nghĩa{" "}
                                <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Nhập nghĩa tiếng Việt hoặc mô tả..."
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 resize-none"
                            />
                        </div>

                        {/* Note */}
                        <div className="bg-slate-800/90 rounded-2xl shadow-sm border border-slate-700 p-4 mb-4">
                            <label className="block text-sm font-medium text-slate-200 mb-2">
                                Ghi chú
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Ghi chú cá nhân (không bắt buộc)..."
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 resize-none"
                            />
                        </div>

                        {/* AI Content */}
                        <div className="bg-slate-800/90 rounded-2xl shadow-sm border border-slate-700 p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-slate-200">
                                    Nội dung AI
                                </label>
                                <button
                                    onClick={handleGenerateAI}
                                    disabled={isGenerating}
                                    className="cursor-pointer px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    {isGenerating
                                        ? "Đang tạo..."
                                        : aiContent
                                          ? "Tạo lại"
                                          : "Tạo"}
                                </button>
                            </div>
                            {aiContent && (
                                <div className="mt-3 p-4 bg-slate-900 border border-slate-600 rounded-xl text-slate-200 text-sm">
                                    {formatAIContent(aiContent)}
                                </div>
                            )}
                        </div>

                        {/* Save Button */}
                        <div className=" sm:relative sm:bottom-auto sm:p-0 sm:bg-transparent sm:border-0">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !description.trim()}
                                className="w-full bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium text-base min-h-[48px] active:scale-95"
                            >
                                {isSaving ? "Đang lưu..." : "Lưu từ vựng"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreateWord;
