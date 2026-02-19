import prisma from "../../config/database/db.config.js";
// const bcrypt = require("bcrypt");
import bcrypt from "bcrypt";

const wordService = {
    addWord: async (userId, word, description, note, ai_content) => {
        const newWord = await prisma.words.create({
            data: {
                user_id: userId,
                word,
                description,
                note,
                ai_content,
            },
        });
        return newWord;
    },
    getWords: async (userId, page, limit) => {
        const offset = (page - 1) * limit;
        const [words, total] = await Promise.all([
            prisma.words.findMany({
                where: { user_id: userId },
                skip: offset,
                take: limit,
                orderBy: {
                    id: "desc",
                },
            }),
            prisma.words.count({
                where: { user_id: userId },
            }),
        ]);
        return { words, total };
    },
    searchWords: async (userId, keyword) => {
        const words = await prisma.words.findMany({
            where: {
                user_id: userId,
                word: {
                    contains: keyword,
                    mode: "insensitive", // case-insensitive search
                },
            },
            orderBy: {
                word: "asc",
            },
            take: 50, // Limit results to 50
        });
        return words;
    },
    removeWord: async (userId, wordId) => {
        const deletedWord = await prisma.words.deleteMany({
            where: {
                id: parseInt(wordId),
                user_id: userId,
            },
        });
        return deletedWord.count > 0;
    },
    changeAiContent: async (userId, wordId, ai_content) => {
        const updatedWord = await prisma.words.updateMany({
            where: {
                id: parseInt(wordId),
                user_id: userId,
            },
            data: {
                ai_content,
            },
        });
        return updatedWord.count > 0;
    },
    updateWord: async (userId, wordId, updateData) => {
        const updatedWord = await prisma.words.updateMany({
            where: {
                id: parseInt(wordId),
                user_id: userId,
            },
            data: updateData,
        });
        return updatedWord.count > 0;
    },
    getQuizWithCountWord: async (userId, startId, endId) => {
        // Lấy các từ trong khoảng id từ startId đến endId
        const quizWords = await prisma.words.findMany({
            where: {
                user_id: userId,
                id: {
                    gte: startId, // greater than or equal
                    lte: endId, // less than or equal
                },
            },
            orderBy: {
                id: "desc",
            },
        });
        return quizWords;
    },
    getWordByOrder: async (userId, order) => {
        // Lấy từ theo vị trí thứ tự (từ id lớn nhất xuống)
        // Order 1 = id lớn nhất, Order 2 = id lớn thứ 2, ...
        // Nếu order lớn hơn tổng số từ, lấy từ cuối cùng
        const totalWords = await prisma.words.count({
            where: {
                user_id: userId,
            },
        });

        if (totalWords === 0) {
            return null;
        }

        // Nếu order lớn hơn tổng số từ, lấy từ cuối cùng
        const actualOrder = Math.min(order, totalWords);

        const word = await prisma.words.findMany({
            where: {
                user_id: userId,
            },
            skip: actualOrder - 1,
            take: 1,
            orderBy: {
                id: "desc",
            },
        });
        return word.length > 0 ? word[0] : null;
    },
    checkWordExists: async (userId, word) => {
        // Tìm tất cả các từ trùng nhau trong database của user
        const existingWords = await prisma.words.findMany({
            where: {
                user_id: userId,
                word: {
                    equals: word,
                    mode: "insensitive", // case-insensitive comparison
                },
            },
            orderBy: {
                id: "desc", // Sắp xếp từ mới nhất xuống
            },
        });

        if (existingWords.length === 0) {
            return {
                exists: false,
                count: 0,
                words: [],
            };
        }

        // Tính order cho từng từ
        const wordsWithOrder = await Promise.all(
            existingWords.map(async (existingWord) => {
                // Đếm số từ có id lớn hơn id của từ này
                const countWordsAbove = await prisma.words.count({
                    where: {
                        user_id: userId,
                        id: {
                            gt: existingWord.id,
                        },
                    },
                });

                // Order = số từ có id lớn hơn + 1
                return {
                    ...existingWord,
                    order: countWordsAbove + 1,
                };
            }),
        );

        return {
            exists: true,
            count: wordsWithOrder.length,
            words: wordsWithOrder,
        };
    },
};

export default wordService;
