import User from "./service.js";
import Crypto from "../../utils/crypto.js";

import {
    createResponse,
    createErrorResponse,
} from "../../utils/responseAPI.js";
import { generateScript } from "./ai-content.js";
import { suggestWords } from "./suggetion.js";

const learnController = {
    addWord: async (req, res) => {
        const userId = req.user.id;
        const { word, description = "", note = "", ai_content = "" } = req.body;
        if (!word) {
            return res
                .status(400)
                .json(createErrorResponse(400, "Word is required"));
        }
        const newWord = await User.addWord(
            userId,
            word,
            description,
            note,
            ai_content,
        );
        return res
            .status(201)
            .json(createResponse(201, "Word added successfully", newWord));
    },
    removeWord: async (req, res) => {
        try {
            const userId = req.user.id;
            const { wordId } = req.params;
            if (!wordId) {
                return res
                    .status(400)
                    .json(createErrorResponse(400, "Word ID is required"));
            }
            const isSuccess = await User.removeWord(userId, wordId);
            if (isSuccess) {
                return res
                    .status(200)
                    .json(
                        createResponse(200, "Word removed successfully", null),
                    );
            }
            return res
                .status(404)
                .json(createErrorResponse(404, "Word not found"));
        } catch (error) {
            return res
                .status(500)
                .json(createErrorResponse(500, "Internal server error"));
        }
    },
    getWords: async (req, res) => {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;
            const currentPage = parseInt(page);
            const pageLimit = parseInt(limit);
            const { words, total } = await User.getWords(
                userId,
                currentPage,
                pageLimit,
            );
            const totalPages = Math.ceil(total / pageLimit);
            return res.status(200).json(
                createResponse(200, "Words retrieved successfully", {
                    words,
                    curPage: currentPage,
                    totalPage: totalPages,
                    total,
                }),
            );
        } catch (error) {
            return res
                .status(500)
                .json(createErrorResponse(500, "Internal server error"));
        }
    },
    searchWords: async (req, res) => {
        try {
            const userId = req.user.id;
            const { keyword } = req.query;

            if (!keyword) {
                return res
                    .status(400)
                    .json(createErrorResponse(400, "Keyword is required"));
            }

            const words = await User.searchWords(userId, keyword);
            return res
                .status(200)
                .json(
                    createResponse(200, "Words searched successfully", words),
                );
        } catch (error) {
            return res
                .status(500)
                .json(createErrorResponse(500, "Internal server error"));
        }
    },
    changeAiContent: async (req, res) => {
        try {
            const userId = req.user.id;
            const { wordId } = req.params;
            const { ai_content } = req.body;
            if (!wordId) {
                return res
                    .status(400)
                    .json(createErrorResponse(400, "Word ID is required"));
            }
            const isSuccess = await User.changeAiContent(
                userId,
                wordId,
                ai_content,
            );
            if (isSuccess) {
                return res
                    .status(200)
                    .json(
                        createResponse(
                            200,
                            "AI content updated successfully",
                            null,
                        ),
                    );
            }
            return res
                .status(404)
                .json(createErrorResponse(404, "Word not found"));
        } catch (error) {
            return res
                .status(500)
                .json(createErrorResponse(500, "Internal server error"));
        }
    },
    updateWord: async (req, res) => {
        try {
            const userId = req.user.id;
            const { wordId } = req.params;
            const { description, note, ai_content } = req.body;

            if (!wordId) {
                return res
                    .status(400)
                    .json(createErrorResponse(400, "Word ID is required"));
            }

            // Build update data object with only provided fields
            const updateData = {};
            if (description !== undefined) updateData.description = description;
            if (note !== undefined) updateData.note = note;
            if (ai_content !== undefined) updateData.ai_content = ai_content;

            if (Object.keys(updateData).length === 0) {
                return res
                    .status(400)
                    .json(createErrorResponse(400, "No fields to update"));
            }

            const isSuccess = await User.updateWord(userId, wordId, updateData);
            if (isSuccess) {
                return res
                    .status(200)
                    .json(
                        createResponse(200, "Word updated successfully", null),
                    );
            }
            return res
                .status(404)
                .json(createErrorResponse(404, "Word not found"));
        } catch (error) {
            return res
                .status(500)
                .json(createErrorResponse(500, "Internal server error"));
        }
    },
    getSuggestedWords: async (req, res) => {
        try {
            const { keyword } = req.query;
            if (!keyword) {
                return res
                    .status(400)
                    .json(createErrorResponse(400, "Keyword is required"));
            }
            const suggestions = await suggestWords(keyword);
            return res
                .status(200)
                .json(
                    createResponse(
                        200,
                        "Suggested words retrieved successfully",
                        suggestions,
                    ),
                );
        } catch (error) {
            return res
                .status(500)
                .json(createErrorResponse(500, "Internal server error"));
        }
    },
    getAiContent: async (req, res) => {
        try {
            const { word } = req.query;
            if (!word) {
                return res
                    .status(400)
                    .json(createErrorResponse(400, "Word is required"));
            }
            const aiContent = await generateScript(word);
            return res
                .status(200)
                .json(
                    createResponse(
                        200,
                        "AI content retrieved successfully",
                        aiContent,
                    ),
                );
        } catch (error) {
            return res
                .status(500)
                .json(createErrorResponse(500, "Internal server error"));
        }
    },
    quizzWithCountWord: async (req, res) => {
        try {
            const userId = req.user.id;
            const { startId, endId } = req.query;

            if (!startId || !endId || isNaN(startId) || isNaN(endId)) {
                return res
                    .status(400)
                    .json(
                        createErrorResponse(
                            400,
                            "startId and endId must be valid numbers",
                        ),
                    );
            }

            const start = parseInt(startId);
            const end = parseInt(endId);

            if (start > end) {
                return res
                    .status(400)
                    .json(
                        createErrorResponse(
                            400,
                            "startId must be less than or equal to endId",
                        ),
                    );
            }

            const quizData = await User.getQuizWithCountWord(
                userId,
                start,
                end,
            );
            return res
                .status(200)
                .json(
                    createResponse(
                        200,
                        "Quiz data retrieved successfully",
                        quizData,
                    ),
                );
        } catch (error) {
            return res
                .status(500)
                .json(createErrorResponse(500, "Internal server error"));
        }
    },
    getWordByOrder: async (req, res) => {
        try {
            const userId = req.user.id;
            const { order } = req.params;

            if (!order || isNaN(order) || order <= 0) {
                return res
                    .status(400)
                    .json(
                        createErrorResponse(
                            400,
                            "Order must be a positive number",
                        ),
                    );
            }

            const word = await User.getWordByOrder(userId, parseInt(order));

            if (!word) {
                return res
                    .status(404)
                    .json(
                        createErrorResponse(
                            404,
                            "Word not found at this order",
                        ),
                    );
            }

            return res
                .status(200)
                .json(createResponse(200, "Word retrieved successfully", word));
        } catch (error) {
            return res
                .status(500)
                .json(createErrorResponse(500, "Internal server error"));
        }
    },
};

export default learnController;
