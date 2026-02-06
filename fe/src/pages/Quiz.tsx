import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWordByOrder } from "../hooks/useWordByOrder";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

interface QuizQuestion {
    word: string;
    correctAnswer: string;
    options: string[];
    userAnswer?: string;
}

const Quiz: React.FC = () => {
    const navigate = useNavigate();
    const [startPos, setStartPos] = useState("");
    const [endPos, setEndPos] = useState("");
    const [startId, setStartId] = useState<number | null>(null);
    const [endId, setEndId] = useState<number | null>(null);
    const [started, setStarted] = useState(false);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

    const startPosNum = parseInt(startPos) || 0;
    const endPosNum = parseInt(endPos) || 0;

    const { data: startWord, isLoading: isLoadingStart } =
        useWordByOrder(startPosNum);
    const { data: endWord, isLoading: isLoadingEnd } =
        useWordByOrder(endPosNum);

    useEffect(() => {
        if (startWord) {
            setStartId(startWord.id);
        }
    }, [startWord]);

    useEffect(() => {
        if (endWord) {
            setEndId(endWord.id);
        }
    }, [endWord]);

    const generateQuestions = (words: any[]): QuizQuestion[] => {
        if (words.length < 2) {
            toast.error("Cần ít nhất 2 từ để tạo quiz!");
            return [];
        }

        return words.map((word) => {
            // Lấy các từ khác làm đáp án nhiễu (loại bỏ cả từ có word giống nhau)
            const otherWords = words.filter(
                (w) => w.id !== word.id && w.word !== word.word,
            );
            const shuffledOthers = otherWords
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            // Tạo 4 đáp án và xáo trộn
            const options = [
                word.word,
                ...shuffledOthers.map((w) => w.word),
            ].sort(() => Math.random() - 0.5);

            return {
                word: word.description || word.word,
                correctAnswer: word.word,
                options,
            };
        });
    };

    const handleStart = async () => {
        if (!startId || !endId) {
            toast.error("Vui lòng nhập vị trí hợp lệ!");
            return;
        }

        // Tự động đổi chỗ nếu startId > endId
        let actualStartId = startId;
        let actualEndId = endId;
        if (startId > endId) {
            actualStartId = endId;
            actualEndId = startId;
        }

        // Fetch quiz data với đúng thứ tự ID
        setIsLoadingQuiz(true);
        try {
            const response = await axiosInstance.get(
                `/learn/quiz?startId=${actualStartId}&endId=${actualEndId}`,
            );

            if (response.data.data && response.data.data.length > 0) {
                const quizQuestions = generateQuestions(response.data.data);
                if (quizQuestions.length > 0) {
                    setQuestions(quizQuestions);
                    setStarted(true);
                    setCurrentIndex(0);
                }
            } else {
                toast.error("Không có từ vựng nào!");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi tải quiz!");
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    const handleAnswer = (answer: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[currentIndex].userAnswer = answer;
        setQuestions(updatedQuestions);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowResult(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const canNext = questions[currentIndex]?.userAnswer !== undefined;

    const correctCount = questions.filter(
        (q) => q.userAnswer === q.correctAnswer,
    ).length;

    const isCorrect = (question: QuizQuestion) =>
        question.userAnswer === question.correctAnswer;

    if (!started) {
        return (
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-800">
                            Luyện tập Quiz
                        </h1>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center"
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trophy className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">
                            Bắt đầu Quiz
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Nhập vị trí bắt đầu và kết thúc
                        </p>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Vị trí bắt đầu
                                </label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={startPos}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (
                                            value === "" ||
                                            parseInt(value) >= 0
                                        ) {
                                            setStartPos(value);
                                        }
                                    }}
                                    placeholder="VD: 1"
                                    min="1"
                                    className="w-full max-w-xs mx-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 text-center text-base"
                                />
                                {isLoadingStart && (
                                    <p className="text-sm text-blue-600 mt-2">
                                        Đang tải từ...
                                    </p>
                                )}
                                {startWord && (
                                    <p className="text-sm text-green-600 mt-2 font-medium">
                                        ✓ {startWord.word}:{" "}
                                        {startWord.description}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Vị trí kết thúc
                                </label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={endPos}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (
                                            value === "" ||
                                            parseInt(value) >= 0
                                        ) {
                                            setEndPos(value);
                                        }
                                    }}
                                    placeholder="VD: 10"
                                    min="1"
                                    className="w-full max-w-xs mx-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 text-center text-base"
                                />
                                {isLoadingEnd && (
                                    <p className="text-sm text-blue-600 mt-2">
                                        Đang tải từ...
                                    </p>
                                )}
                                {endWord && (
                                    <p className="text-sm text-green-600 mt-2 font-medium">
                                        ✓ {endWord.word}: {endWord.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleStart}
                            disabled={
                                isLoadingQuiz ||
                                !startId ||
                                !endId ||
                                isLoadingStart ||
                                isLoadingEnd
                            }
                            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium min-h-[48px] active:scale-95 text-base"
                        >
                            {isLoadingQuiz ? "Đang tải..." : "Bắt đầu"}
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (showResult) {
        const percentage = Math.round((correctCount / questions.length) * 100);

        return (
            <div className="min-h-screen bg-slate-50">
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                        <button
                            onClick={() => {
                                setStarted(false);
                                setShowResult(false);
                                setQuestions([]);
                                setStartPos("");
                                setEndPos("");
                                setStartId(null);
                                setEndId(null);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-800">
                            Kết quả
                        </h1>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center mb-6"
                    >
                        <Trophy className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">Hoàn thành!</h2>
                        <p className="text-xl mb-4">
                            {correctCount}/{questions.length} câu đúng
                        </p>
                        <div className="text-4xl font-bold">{percentage}%</div>
                    </motion.div>

                    <div className="space-y-3">
                        {questions.map((question, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-xl border-2 p-4 ${
                                    isCorrect(question)
                                        ? "border-green-300"
                                        : "border-red-300"
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            isCorrect(question)
                                                ? "bg-green-100 text-green-600"
                                                : "bg-red-100 text-red-600"
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-slate-800 font-medium mb-2">
                                            {question.word}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            Đáp án đúng:{" "}
                                            <span className="font-semibold text-green-600">
                                                {question.correctAnswer}
                                            </span>
                                        </p>
                                        {!isCorrect(question) && (
                                            <p className="text-sm text-slate-600 mt-1">
                                                Bạn chọn:{" "}
                                                <span className="font-semibold text-red-600">
                                                    {question.userAnswer}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setStarted(false);
                            setShowResult(false);
                            setQuestions([]);
                            setStartPos("");
                            setEndPos("");
                            setStartId(null);
                            setEndId(null);
                        }}
                        className="w-full mt-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                        Làm quiz mới
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-800">
                            Câu {currentIndex + 1}/{questions.length}
                        </h1>
                        <div className="w-9"></div> {/* Spacer for alignment */}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-w-2xl mx-auto px-4 py-6"
                >
                    {/* Question */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">
                            {currentQuestion.word}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected =
                                currentQuestion.userAnswer === option;
                            const isCorrectOption =
                                currentQuestion.correctAnswer === option;
                            const showFeedback =
                                currentQuestion.userAnswer !== undefined;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(option)}
                                    disabled={showFeedback}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                        showFeedback && isCorrectOption
                                            ? "border-green-500 bg-green-50"
                                            : showFeedback &&
                                                isSelected &&
                                                !isCorrectOption
                                              ? "border-red-500 bg-red-50"
                                              : isSelected
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-slate-200 bg-white hover:border-blue-300"
                                    } ${showFeedback ? "cursor-not-allowed" : ""}`}
                                >
                                    <span className="text-slate-800 font-medium">
                                        {option}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!canNext}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            {currentIndex === questions.length - 1
                                ? "Xem kết quả"
                                : "Tiếp theo"}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Quiz;
