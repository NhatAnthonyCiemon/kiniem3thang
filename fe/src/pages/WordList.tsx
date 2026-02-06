import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Plus,
    ChevronLeft,
    ChevronRight,
    Volume2,
    Sparkles,
    Save,
    Edit2,
    Search,
    X,
    Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWords } from "../hooks/useWords";
import { useGenerateAI } from "../hooks/useGenerateAI";
import { useUpdateWord } from "../hooks/useUpdateWord";
import { useDeleteWord } from "../hooks/useDeleteWord";
import { usePhonetic } from "../hooks/usePhonetic";
import { useSearchWords } from "../hooks/useSearchWords";
import WordCard from "../components/WordCard";
import toast from "react-hot-toast";

const WordList: React.FC = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [selectedWord, setSelectedWord] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editDescription, setEditDescription] = useState("");
    const [editNote, setEditNote] = useState("");
    const [editAiContent, setEditAiContent] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const limit = 20;

    const { data: words, isLoading } = useWords(page, limit);
    const { data: searchResults, isLoading: isSearching } =
        useSearchWords(searchKeyword);
    const { mutate: generateAI, isPending: isGenerating } = useGenerateAI();
    const { mutate: updateWord, isPending: isSaving } = useUpdateWord();
    const { mutate: deleteWord, isPending: isDeleting } = useDeleteWord();
    const { data: phonetic } = usePhonetic(selectedWord?.word || "");

    const handleSelectWord = (word: any) => {
        setSelectedWord(word);
        setIsEditing(false);
        setEditDescription(word.description || "");
        setEditNote(word.note || "");
        setEditAiContent(word.ai_content || "");
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!selectedWord) return;

        deleteWord(selectedWord.id, {
            onSuccess: () => {
                toast.success("Đã xóa từ vựng!");
                setSelectedWord(null);
                setShowDeleteModal(false);
            },
            onError: () => {
                toast.error("Không thể xóa từ vựng");
                setShowDeleteModal(false);
            },
        });
    };

    const handleGenerateAI = () => {
        if (!selectedWord) return;

        generateAI(selectedWord.word, {
            onSuccess: (data: any) => {
                setEditAiContent(data.data);
                toast.success("Đã tạo nội dung AI!");
            },
            onError: () => {
                toast.error("Không thể tạo nội dung AI");
            },
        });
    };

    const handleSave = () => {
        if (!selectedWord) return;

        updateWord(
            {
                id: selectedWord.id,
                description: editDescription.trim(),
                note: editNote.trim(),
                ai_content: editAiContent,
            },
            {
                onSuccess: () => {
                    toast.success("Đã cập nhật từ vựng!");
                    setSelectedWord({
                        ...selectedWord,
                        description: editDescription.trim(),
                        note: editNote.trim(),
                        ai_content: editAiContent,
                    });
                    setIsEditing(false);
                },
                onError: () => {
                    toast.error("Không thể cập nhật từ vựng");
                },
            },
        );
    };

    const handleSpeak = (word: string) => {
        if (!word) return;

        const utterance = new SpeechSynthesisUtterance(word);
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

    const handleClearSearch = () => {
        setSearchKeyword("");
        setPage(1);
    };

    // Determine which data to display
    const displayWords = searchKeyword.trim() ? searchResults : words;
    const displayLoading = searchKeyword.trim() ? isSearching : isLoading;

    return (
        <div
            className="min-h-screen bg-slate-50 pb-24 sm:pb-20"
            style={{ minHeight: "100dvh" }}
        >
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <h1 className="text-lg font-semibold text-slate-800">
                                Từ vựng của tôi
                            </h1>
                        </div>
                        <button
                            onClick={() => navigate("/create-word")}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="Tìm kiếm từ vựng..."
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 text-base"
                        />
                        {searchKeyword && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {displayLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-xl p-4 animate-pulse"
                            >
                                <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : displayWords && displayWords.length > 0 ? (
                    <>
                        <div className="space-y-3 mb-6">
                            {displayWords.map((word: any, index: number) => {
                                const displayNumber = searchKeyword.trim()
                                    ? index + 1
                                    : (page - 1) * limit + index + 1;
                                return (
                                    <WordCard
                                        key={word.id}
                                        word={word}
                                        index={index}
                                        displayNumber={displayNumber}
                                        onClick={() => handleSelectWord(word)}
                                    />
                                );
                            })}
                        </div>

                        {/* Pagination - only show when not searching */}
                        {!searchKeyword.trim() && (
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={page === 1}
                                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                                </button>
                                <span className="text-sm text-slate-600 font-medium">
                                    Trang {page}
                                </span>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={!words || words.length < limit}
                                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>
                        )}

                        {/* Search results count */}
                        {searchKeyword.trim() && (
                            <p className="text-center text-sm text-slate-600">
                                Tìm thấy {displayWords.length} kết quả
                            </p>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-600 mb-4">
                            {searchKeyword.trim()
                                ? "Không tìm thấy từ vựng nào"
                                : "Chưa có từ vựng nào"}
                        </p>
                        {searchKeyword.trim() ? (
                            <button
                                onClick={handleClearSearch}
                                className="px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors inline-flex items-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                Xóa tìm kiếm
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate("/create-word")}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Thêm từ vựng
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Word Detail Modal */}
            <AnimatePresence>
                {selectedWord && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedWord(null)}
                            className="fixed inset-0 bg-black/50 z-40"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed inset-x-4 bottom-4 max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-slate-800 mb-1">
                                            {selectedWord.word}
                                        </h2>
                                        {phonetic && (
                                            <p className="text-sm text-slate-600 font-mono">
                                                {phonetic}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                handleSpeak(selectedWord.word)
                                            }
                                            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors flex-shrink-0"
                                            title="Phát âm"
                                        >
                                            <Volume2 className="w-5 h-5 text-blue-600" />
                                        </button>
                                        {!isEditing && (
                                            <>
                                                <button
                                                    onClick={handleEdit}
                                                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors flex-shrink-0"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 className="w-5 h-5 text-slate-600" />
                                                </button>
                                                <button
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}
                                                    className="p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-5 h-5 text-red-600" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-600 mb-2">
                                            Nghĩa
                                        </h3>
                                        {isEditing ? (
                                            <textarea
                                                value={editDescription}
                                                onChange={(e) =>
                                                    setEditDescription(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Nhập nghĩa tiếng Việt hoặc mô tả..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 resize-none"
                                            />
                                        ) : (
                                            <p className="text-slate-800">
                                                {selectedWord.description ||
                                                    "Không có"}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-slate-600 mb-2">
                                            Ghi chú
                                        </h3>
                                        {isEditing ? (
                                            <textarea
                                                value={editNote}
                                                onChange={(e) =>
                                                    setEditNote(e.target.value)
                                                }
                                                placeholder="Ghi chú cá nhân (không bắt buộc)..."
                                                rows={2}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 resize-none"
                                            />
                                        ) : (
                                            <p className="text-slate-800">
                                                {selectedWord.note ||
                                                    "Không có ghi chú"}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium text-slate-600">
                                                Nội dung AI
                                            </h3>
                                            {isEditing && (
                                                <button
                                                    onClick={handleGenerateAI}
                                                    disabled={isGenerating}
                                                    className="cursor-pointer px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    {isGenerating
                                                        ? "Đang tạo..."
                                                        : editAiContent
                                                          ? "Tạo lại"
                                                          : "Tạo"}
                                                </button>
                                            )}
                                        </div>
                                        {editAiContent ? (
                                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-slate-700 text-sm">
                                                {formatAIContent(editAiContent)}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 text-sm italic">
                                                Chưa có nội dung AI
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-medium"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            {isSaving ? "Đang lưu..." : "Lưu"}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setSelectedWord(null)}
                                        className="mt-6 w-full py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors font-medium"
                                    >
                                        Đóng
                                    </button>
                                )}
                            </div>

                            {/* Delete Confirmation Modal */}
                            <AnimatePresence>
                                {showDeleteModal && selectedWord && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() =>
                                                setShowDeleteModal(false)
                                            }
                                            className="fixed inset-0 bg-black/50 z-50"
                                        />
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                scale: 0.95,
                                            }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                                        >
                                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Trash2 className="w-6 h-6 text-red-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-slate-800">
                                                            Xác nhận xóa
                                                        </h3>
                                                        <p className="text-sm text-slate-600">
                                                            Hành động này không
                                                            thể hoàn tác
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-slate-700 mb-6">
                                                    Bạn có chắc muốn xóa từ{" "}
                                                    <span className="font-semibold text-slate-900">
                                                        "{selectedWord.word}"
                                                    </span>{" "}
                                                    khỏi danh sách từ vựng của
                                                    bạn?
                                                </p>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() =>
                                                            setShowDeleteModal(
                                                                false,
                                                            )
                                                        }
                                                        className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-medium"
                                                    >
                                                        Hủy
                                                    </button>
                                                    <button
                                                        onClick={confirmDelete}
                                                        disabled={isDeleting}
                                                        className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        {isDeleting
                                                            ? "Đang xóa..."
                                                            : "Xóa"}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WordList;
