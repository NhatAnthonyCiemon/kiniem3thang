import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { usePhonetic } from "../hooks/usePhonetic";

interface WordCardProps {
    word: any;
    index: number;
    displayNumber: number;
    onClick: () => void;
}

const WordCard: React.FC<WordCardProps> = ({
    word,
    index,
    displayNumber,
    onClick,
}) => {
    const { data: phonetic } = usePhonetic(word.word);

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!word.word) return;

        const utterance = new SpeechSynthesisUtterance(word.word);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
    };

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="w-full bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all text-left"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-slate-600">
                            {displayNumber}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-slate-800">
                                {word.word}
                            </h3>
                            {phonetic && (
                                <span className="text-xs text-slate-500 font-mono">
                                    {phonetic}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">
                            {word.description || "Không có mô tả"}
                        </p>
                        {word.note && (
                            <p className="text-xs text-slate-500 mt-2 italic">
                                📝 {word.note}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleSpeak}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors flex-shrink-0"
                    title="Phát âm"
                >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                </button>
            </div>
        </motion.button>
    );
};

export default WordCard;
