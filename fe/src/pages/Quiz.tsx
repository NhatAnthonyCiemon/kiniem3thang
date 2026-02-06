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
            <div
                className="h-screen bg-slate-50 relative flex flex-col overflow-hidden"
                style={{
                    height: "100vh",
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
                {/* Background Image */}
                {/* <div className="fixed inset-0 z-0">
                    <img
                        src="/bg.jpg"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                </div> */}
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
                            Luyện tập Quiz
                        </h1>
                    </div>
                </div>

                <div className="max-w-2xl sm:mx-auto sm:w-[80%] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-3 sm:px-4 py-8 sm:py-12 relative z-10 overflow-y-auto flex-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/90 rounded-xl sm:rounded-2xl shadow-sm border border-slate-700 p-6 sm:p-8 text-center"
                    >
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                            Bắt đầu Quiz
                        </h2>
                        <p className="text-sm sm:text-base text-slate-200 mb-5 sm:mb-6">
                            Nhập vị trí bắt đầu và kết thúc
                        </p>
                        <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-2">
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
                                    className="w-full max-w-xs mx-auto px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900 border border-slate-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 text-center text-sm sm:text-base"
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
                                <label className="block text-sm font-medium text-slate-200 mb-2">
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
                                    className="w-full max-w-xs mx-auto px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 text-center text-base"
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
                            className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium min-h-[44px] sm:min-h-[48px] active:scale-98 text-sm sm:text-base"
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
            <div
                className="h-screen bg-slate-50 relative flex flex-col overflow-hidden"
                style={{
                    height: "100vh",
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
                {/* Background Image */}
                {/* <div className="fixed inset-0 z-0">
                    <img
                        src="/bg.jpg"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                </div> */}
                <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-20">
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
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-200" />
                        </button>
                        <h1 className="text-lg font-semibold text-white">
                            Kết quả
                        </h1>
                    </div>
                </div>

                <div className="sm:mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:w-[80%] max-w-2xl  px-4 py-6 relative z-10 overflow-y-auto flex-1">
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
                                className={`bg-slate-800/90 rounded-xl border-2 p-4 ${
                                    isCorrect(question)
                                        ? "border-green-500"
                                        : "border-red-500"
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
                                        <p className="text-white font-medium mb-2">
                                            {question.word}
                                        </p>
                                        <p className="text-sm text-slate-200">
                                            Đáp án đúng:{" "}
                                            <span className="font-semibold text-green-400">
                                                {question.correctAnswer}
                                            </span>
                                        </p>
                                        {!isCorrect(question) && (
                                            <p className="text-sm text-slate-200 mt-1">
                                                Bạn chọn:{" "}
                                                <span className="font-semibold text-red-400">
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
        <div
            className="h-screen bg-slate-50 relative flex flex-col overflow-hidden"
            style={{
                height: "100vh",
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
            {/* Background Image */}
            {/* <div className="fixed inset-0 z-0">
                <img
                    src="/bg.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            </div> */}
            {/* Header */}
            <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-20">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-200" />
                        </button>
                        <h1 className="text-lg font-semibold text-white">
                            Câu {currentIndex + 1}/{questions.length}
                        </h1>
                        <div className="w-9"></div> {/* Spacer for alignment */}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
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
                    className="sm:mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:w-[80%] max-w-2xl px-4 py-6 relative z-10 overflow-y-auto flex-1"
                >
                    {/* Question */}
                    <div className="bg-slate-800/90 rounded-2xl shadow-sm border border-slate-700 p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4">
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
                                            ? "border-green-500 bg-green-500/20"
                                            : showFeedback &&
                                                isSelected &&
                                                !isCorrectOption
                                              ? "border-red-500 bg-red-500/20"
                                              : isSelected
                                                ? "border-blue-500 bg-blue-500/20"
                                                : "border-slate-700 bg-slate-800/90 hover:border-blue-500"
                                    } ${showFeedback ? "cursor-not-allowed" : ""}`}
                                >
                                    <span className="text-white font-medium">
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
                            className="px-6 py-3 bg-slate-800/90 border border-slate-700 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
