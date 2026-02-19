import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    FileText,
    Download,
    FileDown,
    FileType,
} from "lucide-react";
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
import html2pdf from "html2pdf.js";

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
    const [exportMode, setExportMode] = useState<"simple" | "full">("full"); // simple = từ + nghĩa, full = tất cả

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
        textContent += `Chế độ: ${exportMode === "simple" ? "Đơn giản" : "Đầy đủ"}\n`;
        textContent += `Xuất lúc: ${new Date().toLocaleString("vi-VN")}\n`;
        textContent += "=".repeat(50) + "\n\n";

        words.forEach((word, index) => {
            textContent += `${index + 1}. ${word.word.toUpperCase()}\n`;
            if (word.description) {
                textContent += `   Nghĩa: ${word.description}\n`;
            }

            // Chỉ thêm note và ai_content nếu ở chế độ đầy đủ
            if (exportMode === "full") {
                if (word.note) {
                    textContent += `   Ghi chú: ${word.note}\n`;
                }
                if (word.ai_content) {
                    textContent += `   AI Content:\n   ${word.ai_content.replace(/\n/g, "\n   ")}\n`;
                }
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
                            text: `Chế độ: ${exportMode === "simple" ? "Đơn giản" : "Đầy đủ"} | Xuất lúc: ${new Date().toLocaleString("vi-VN")}`,
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

                // Chỉ thêm note và ai_content nếu ở chế độ đầy đủ
                if (exportMode === "full") {
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

    const handleExportPDF = () => {
        if (words.length === 0) return;

        try {
            // Create HTML content
            const content = document.createElement("div");
            content.style.fontFamily = "'Times New Roman', Times, serif";
            content.style.padding = "30px";
            content.style.color = "#000";
            content.style.fontSize = "12pt";
            content.style.lineHeight = "1.6";

            // Title
            const title = document.createElement("h1");
            title.style.textAlign = "center";
            title.style.fontSize = "20pt";
            title.style.fontWeight = "bold";
            title.style.marginBottom = "8px";
            title.textContent = `DANH SÁCH TỪ VỰNG (${words.length} từ)`;
            content.appendChild(title);

            // Subtitle
            const subtitle = document.createElement("p");
            subtitle.style.textAlign = "center";
            subtitle.style.fontSize = "12pt";
            subtitle.style.marginBottom = "5px";
            subtitle.textContent = `Từ vị trí ${startPos} đến ${endPos}`;
            content.appendChild(subtitle);

            // Info
            const info = document.createElement("p");
            info.style.textAlign = "center";
            info.style.fontSize = "10pt";
            info.style.fontStyle = "italic";
            info.style.marginBottom = "20px";
            info.textContent = `Chế độ: ${exportMode === "simple" ? "Đơn giản" : "Đầy đủ"} | Xuất lúc: ${new Date().toLocaleString("vi-VN")}`;
            content.appendChild(info);

            // Separator
            const hr = document.createElement("hr");
            hr.style.border = "none";
            hr.style.borderTop = "2px solid #333";
            hr.style.marginBottom = "20px";
            content.appendChild(hr);

            // Words
            words.forEach((word, index) => {
                // Word container
                const wordDiv = document.createElement("div");
                wordDiv.style.marginBottom = "20px";
                wordDiv.style.pageBreakInside = "avoid";

                // Word title
                const wordTitle = document.createElement("h2");
                wordTitle.style.fontSize = "14pt";
                wordTitle.style.fontWeight = "bold";
                wordTitle.style.color = "#1E40AF";
                wordTitle.style.marginBottom = "8px";
                wordTitle.textContent = `${index + 1}. ${word.word.toUpperCase()}`;
                wordDiv.appendChild(wordTitle);

                // Description
                if (word.description) {
                    const descP = document.createElement("p");
                    descP.style.marginLeft = "15px";
                    descP.style.marginBottom = "8px";
                    const descLabel = document.createElement("strong");
                    descLabel.textContent = "Nghĩa: ";
                    descP.appendChild(descLabel);
                    descP.appendChild(
                        document.createTextNode(word.description),
                    );
                    wordDiv.appendChild(descP);
                }

                // Full mode - Note & AI Content
                if (exportMode === "full") {
                    if (word.note) {
                        const noteP = document.createElement("p");
                        noteP.style.marginLeft = "15px";
                        noteP.style.marginBottom = "8px";
                        noteP.style.fontStyle = "italic";
                        const noteLabel = document.createElement("strong");
                        noteLabel.textContent = "Ghi chú: ";
                        noteP.appendChild(noteLabel);
                        noteP.appendChild(document.createTextNode(word.note));
                        wordDiv.appendChild(noteP);
                    }

                    if (word.ai_content) {
                        const aiDiv = document.createElement("div");
                        aiDiv.style.marginLeft = "15px";
                        aiDiv.style.marginBottom = "8px";
                        const aiLabel = document.createElement("strong");
                        aiLabel.textContent = "AI Content:";
                        aiDiv.appendChild(aiLabel);

                        const aiContent = document.createElement("pre");
                        aiContent.style.fontFamily =
                            "'Times New Roman', Times, serif";
                        aiContent.style.fontSize = "10pt";
                        aiContent.style.whiteSpace = "pre-wrap";
                        aiContent.style.marginTop = "5px";
                        aiContent.style.marginLeft = "10px";
                        aiContent.textContent = word.ai_content;
                        aiDiv.appendChild(aiContent);

                        wordDiv.appendChild(aiDiv);
                    }
                }

                content.appendChild(wordDiv);
            });

            // PDF options
            const opt = {
                margin: [15, 15, 15, 15] as [number, number, number, number],
                filename: `tu-vung-${startPos}-${endPos}.pdf`,
                image: { type: "jpeg" as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: {
                    unit: "mm" as const,
                    format: "a4" as const,
                    orientation: "portrait" as const,
                },
            };

            // Generate PDF
            html2pdf()
                .set(opt)
                .from(content)
                .save()
                .then(() => {
                    toast.success("Đã xuất file PDF thành công!");
                })
                .catch((error: Error) => {
                    console.error("Error exporting PDF:", error);
                    toast.error("Có lỗi khi xuất file PDF!");
                });
        } catch (error) {
            console.error("Error exporting PDF:", error);
            toast.error("Có lỗi khi xuất file PDF!");
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

                        {/* Export Mode Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-3">
                                Chế độ xuất
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setExportMode("simple")}
                                    className={`cursor-pointer flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                                        exportMode === "simple"
                                            ? "border-blue-500 bg-blue-500/20 text-white"
                                            : "border-slate-600 bg-slate-900 text-slate-300 hover:border-slate-500"
                                    }`}
                                >
                                    <div className="text-sm font-medium mb-1">
                                        Đơn giản
                                    </div>
                                    <div className="text-xs opacity-70">
                                        Từ + Nghĩa
                                    </div>
                                </button>
                                <button
                                    onClick={() => setExportMode("full")}
                                    className={`cursor-pointer flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                                        exportMode === "full"
                                            ? "border-blue-500 bg-blue-500/20 text-white"
                                            : "border-slate-600 bg-slate-900 text-slate-300 hover:border-slate-500"
                                    }`}
                                >
                                    <div className="text-sm font-medium mb-1">
                                        Đầy đủ
                                    </div>
                                    <div className="text-xs opacity-70">
                                        Tất cả thông tin
                                    </div>
                                </button>
                            </div>
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
                                    Từ vị trí {startPos} đến {endPos} • Chế độ:{" "}
                                    <span className="text-blue-400 font-medium">
                                        {exportMode === "simple"
                                            ? "Đơn giản"
                                            : "Đầy đủ"}
                                    </span>
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={handleExportWord}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <FileDown className="w-4 h-4" />
                                    <span>Xuất Word</span>
                                </button>
                                <button
                                    onClick={handleExportText}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Xuất TXT</span>
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <FileType className="w-4 h-4" />
                                    <span>Xuất PDF</span>
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

                                {exportMode === "full" && word.note && (
                                    <div className="mb-3">
                                        <p className="text-xs text-slate-400 mb-1">
                                            Ghi chú:
                                        </p>
                                        <p className="text-sm text-slate-300 italic">
                                            {word.note}
                                        </p>
                                    </div>
                                )}

                                {exportMode === "full" && word.ai_content && (
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
