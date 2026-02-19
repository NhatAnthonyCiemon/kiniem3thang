import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Download, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWordByOrder } from "../hooks/useWordByOrder";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
    HeadingLevel,
} from "docx";
import { saveAs } from "file-saver";

interface Word {
    id: number;
    word: string;
    description: string;
    note: string;
    ai_content: string;
    created_at: string;
}

const ExportWords: React.FC = () => {
    const navigate = useNavigate();
    const [startPos, setStartPos] = useState("");
    const [endPos, setEndPos] = useState("");
    const [startId, setStartId] = useState<number | null>(null);
    const [endId, setEndId] = useState<number | null>(null);
    const [words, setWords] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

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

    const handleLoad = async () => {
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

        setIsLoading(true);
        try {
            const response = await axiosInstance.get(
                `/learn/quiz?startId=${actualStartId}&endId=${actualEndId}`,
            );

            if (response.data.data && response.data.data.length > 0) {
                setWords(response.data.data);
                setHasLoaded(true);
                toast.success(`Đã tải ${response.data.data.length} từ vựng!`);
            } else {
                toast.error("Không có từ vựng nào!");
                setWords([]);
                setHasLoaded(false);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi tải danh sách!");
            setWords([]);
            setHasLoaded(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportText = () => {
        if (words.length === 0) return;

        let textContent = `DANH SÁCH TỪ VỰNG (${words.length} từ)\n`;
        textContent += `Từ vị trí ${startPos} đến ${endPos}\n`;
        textContent += `Xuất lúc: ${new Date().toLocaleString("vi-VN")}\n`;
        textContent += "=".repeat(50) + "\n\n";

        words.forEach((word, index) => {
            textContent += `${index + 1}. ${word.word.toUpperCase()}\n`;
            if (word.description) {
                textContent += `   Nghĩa: ${word.description}\n`;
            }
            if (word.note) {
                textContent += `   Ghi chú: ${word.note}\n`;
            }
            if (word.ai_content) {
                textContent += `   AI Content:\n   ${word.ai_content.replace(/\n/g, "\n   ")}\n`;
            }
            textContent += "\n";
        });

        const blob = new Blob([textContent], {
            type: "text/plain;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tu-vung-${startPos}-${endPos}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Đã xuất file TXT thành công!");
    };

    const handleExportWord = async () => {
        if (words.length === 0) return;

        try {
            const children: Paragraph[] = [];

            // Title
            children.push(
                new Paragraph({
                    text: `DANH SÁCH TỪ VỰNG (${words.length} từ)`,
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }),
            );

            // Subtitle
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Từ vị trí ${startPos} đến ${endPos}`,
                            bold: true,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                }),
            );

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Xuất lúc: ${new Date().toLocaleString("vi-VN")}`,
                            italics: true,
                            size: 20,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
            );

            // Words
            words.forEach((word, index) => {
                // Word title
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${index + 1}. ${word.word.toUpperCase()}`,
                                bold: true,
                                size: 28,
                                color: "1E40AF",
                            }),
                        ],
                        spacing: { before: 300, after: 150 },
                    }),
                );

                // Description
                if (word.description) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Nghĩa: ",
                                    bold: true,
                                }),
                                new TextRun({
                                    text: word.description,
                                }),
                            ],
                            spacing: { after: 100 },
                        }),
                    );
                }

                // Note
                if (word.note) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Ghi chú: ",
                                    bold: true,
                                }),
                                new TextRun({
                                    text: word.note,
                                    italics: true,
                                }),
                            ],
                            spacing: { after: 100 },
                        }),
                    );
                }

                // AI Content
                if (word.ai_content) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "AI Content:",
                                    bold: true,
                                }),
                            ],
                            spacing: { after: 50 },
                        }),
                    );

                    const aiLines = word.ai_content.split("\n");
                    aiLines.forEach((line) => {
                        children.push(
                            new Paragraph({
                                text: line || " ",
                                spacing: { after: 50 },
                            }),
                        );
                    });
                }

                // Separator
                children.push(
                    new Paragraph({
                        text: "",
                        spacing: { after: 200 },
                    }),
                );
            });

            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: children,
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `tu-vung-${startPos}-${endPos}.docx`);
            toast.success("Đã xuất file Word thành công!");
        } catch (error) {
            console.error("Error exporting Word:", error);
            toast.error("Có lỗi khi xuất file Word!");
        }
    };

    const formatAIContent = (content: string) => {
        if (!content) return null;
        return content.split("\n").map((line, index) => {
            const match = line.match(/^(\d+\.\s+)(.+)$/);
            if (match) {
                return (
                    <div key={index} className="font-medium">
                        {match[1]}
                        {match[2]}
                    </div>
                );
            }
            return line ? (
                <div key={index}>{line}</div>
            ) : (
                <div key={index}>&nbsp;</div>
            );
        });
    };

    return (
        <div
            className="h-screen bg-slate-50 flex flex-col overflow-hidden"
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
                backgroundAttachment: "scroll",
            }}
        >
            {/* Header */}
            <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-20">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-200" />
                    </button>
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <h1 className="text-lg font-semibold text-white">
                            Xuất danh sách từ vựng
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl sm:mx-auto sm:w-[80%] px-3 sm:px-4 py-6 relative z-10 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/90 rounded-xl sm:rounded-2xl shadow-sm border border-slate-700 p-4 sm:p-6 mb-4"
                >
                    <h2 className="text-base sm:text-lg font-semibold text-white mb-4">
                        Chọn khoảng vị trí từ vựng
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-2">
                                Từ vị trí (mới nhất = 1)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={startPos}
                                onChange={(e) => setStartPos(e.target.value)}
                                placeholder="VD: 1"
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            />
                            {startPosNum > 0 && startWord && (
                                <p className="text-xs text-green-400 mt-1">
                                    ✓ Từ tìm thấy:{" "}
                                    <strong>{startWord.word}</strong>
                                </p>
                            )}
                            {startPosNum > 0 &&
                                !startWord &&
                                !isLoadingStart && (
                                    <p className="text-xs text-red-400 mt-1">
                                        ✗ Không tìm thấy từ ở vị trí này
                                    </p>
                                )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-2">
                                Đến vị trí
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={endPos}
                                onChange={(e) => setEndPos(e.target.value)}
                                placeholder="VD: 50"
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            />
                            {endPosNum > 0 && endWord && (
                                <p className="text-xs text-green-400 mt-1">
                                    ✓ Từ tìm thấy:{" "}
                                    <strong>{endWord.word}</strong>
                                </p>
                            )}
                            {endPosNum > 0 && !endWord && !isLoadingEnd && (
                                <p className="text-xs text-red-400 mt-1">
                                    ✗ Không tìm thấy từ ở vị trí này
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleLoad}
                            disabled={
                                isLoading ||
                                !startId ||
                                !endId ||
                                isLoadingStart ||
                                isLoadingEnd
                            }
                            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isLoading ? "Đang tải..." : "Tải danh sách"}
                        </button>
                    </div>
                </motion.div>

                {/* Words List */}
                {hasLoaded && words.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Export Button */}
                        <div className="bg-slate-800/90 rounded-xl border border-slate-700 p-4">
                            <div className="mb-3">
                                <p className="text-white font-medium">
                                    Tìm thấy {words.length} từ vựng
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Từ vị trí {startPos} đến {endPos}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={handleExportWord}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <FileDown className="w-4 h-4" />
                                    <span>Xuất Word</span>
                                </button>
                                <button
                                    onClick={handleExportText}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Xuất TXT</span>
                                </button>
                            </div>
                        </div>

                        {/* Word Cards */}
                        {words.map((word, index) => (
                            <motion.div
                                key={word.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-slate-800/90 rounded-xl border border-slate-700 p-4 sm:p-5"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-slate-400 font-mono">
                                                #{parseInt(startPos) + index}
                                            </span>
                                            <h3 className="text-xl sm:text-2xl font-bold text-white">
                                                {word.word}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {word.description && (
                                    <div className="mb-3">
                                        <p className="text-xs text-slate-400 mb-1">
                                            Nghĩa:
                                        </p>
                                        <p className="text-sm sm:text-base text-slate-200">
                                            {word.description}
                                        </p>
                                    </div>
                                )}

                                {word.note && (
                                    <div className="mb-3">
                                        <p className="text-xs text-slate-400 mb-1">
                                            Ghi chú:
                                        </p>
                                        <p className="text-sm text-slate-300 italic">
                                            {word.note}
                                        </p>
                                    </div>
                                )}

                                {word.ai_content && (
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">
                                            AI Content:
                                        </p>
                                        <div className="text-xs sm:text-sm text-slate-300 bg-slate-900/50 rounded-lg p-3">
                                            {formatAIContent(word.ai_content)}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {hasLoaded && words.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-slate-800/90 rounded-xl border border-slate-700 p-8 text-center"
                    >
                        <p className="text-slate-400">
                            Không tìm thấy từ vựng nào trong khoảng này
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ExportWords;
