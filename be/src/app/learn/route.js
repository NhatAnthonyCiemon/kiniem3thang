import express from "express";
const router = express.Router();
import learnController from "./controller.js";
import middleware from "../../middleware/index.js";

/**
 * @route   POST /learn/words
 * @desc    Add a new word to user's vocabulary
 * @access  Private (requires authentication)
 * @body    { word: string, description?: string, note?: string, ai_content?: string }
 */
router.post("/words", middleware.isAuthenticated, learnController.addWord);

/**
 * @route   DELETE /learn/words/:wordId
 * @desc    Remove a specific word from user's vocabulary
 * @access  Private (requires authentication)
 * @params  wordId - ID of the word to remove
 */
router.delete(
    "/words/:wordId",
    middleware.isAuthenticated,
    learnController.removeWord,
);

/**
 * @route   PATCH /learn/words/:wordId/ai-content
 * @desc    Update AI generated content for a specific word
 * @access  Private (requires authentication)
 * @params  wordId - ID of the word to update
 * @body    { ai_content: string }
 */
router.patch(
    "/words/:wordId/ai-content",
    middleware.isAuthenticated,
    learnController.changeAiContent,
);

/**
 * @route   PATCH /learn/words/:wordId
 * @desc    Update word details (description, note, ai_content)
 * @access  Private (requires authentication)
 * @params  wordId - ID of the word to update
 * @body    { description?: string, note?: string, ai_content?: string }
 */
router.patch(
    "/words/:wordId",
    middleware.isAuthenticated,
    learnController.updateWord,
);

/**
 * @route   GET /learn/words?page=1&limit=10
 * @desc    Get paginated list of user's vocabulary words
 * @access  Private (requires authentication)
 * @query   page - Page number (default: 1)
 * @query   limit - Number of words per page (default: 10)
 */
router.get("/words", middleware.isAuthenticated, learnController.getWords);

/**
 * @route   GET /learn/words/search?keyword=app
 * @desc    Search words by keyword (case-insensitive, LIKE pattern)
 * @access  Private (requires authentication)
 * @query   keyword - Search keyword (required)
 * @returns Array of matching words (max 50 results)
 */
router.get(
    "/words/search",
    middleware.isAuthenticated,
    learnController.searchWords,
);

/**
 * @route   GET /learn/words/order/:order
 * @desc    Get word by position order (from newest to oldest, ignoring deleted IDs)
 * @access  Private (requires authentication)
 * @params  order - Position number (1 = newest, 2 = second newest, etc.)
 * @returns Single word at the specified position
 * @example
 * GET /learn/words/order/4
 * Returns the 4th word when ordered by ID descending
 * If IDs are [10, 9, 8, 6, 5], order 4 returns word with ID 6 (not ID 4)
 */
router.get(
    "/words/order/:order",
    middleware.isAuthenticated,
    learnController.getWordByOrder,
);

/**
 * @route   GET /learn/ai-content?word=example
 * @desc    Get AI generated content for a word
 * @access  Private (requires authentication)
 * @query   word - The word to get AI content for
 */
router.get(
    "/ai-content",
    middleware.isAuthenticated,
    learnController.getAiContent,
);

/**
 * @route   GET /learn/quiz?startId=1&endId=10
 * @desc    Get quiz data with words in the specified id range
 * @access  Private (requires authentication)
 * @query   startId - Starting word ID (inclusive)
 * @query   endId - Ending word ID (inclusive)
 * @example GET /learn/quiz?startId=5&endId=15
 * Returns all words with id between 5 and 15 (inclusive)
 */
router.get(
    "/quiz",
    middleware.isAuthenticated,
    learnController.quizzWithCountWord,
);

/**
 * @route   GET /learn/suggestions?keyword=app
 * @desc    Get word suggestions based on a keyword
 * @access  Private (requires authentication)
 * @query   keyword - The keyword to get suggestions for
 * @returns Array of suggested words with their details
 * @example
 * GET /learn/suggestions?keyword=app
 * Response:
 * [
 *  { word: "apple", score: "11" },
 * { word: "application", score: "23"},
 * ]
 * */
router.get(
    "/suggestions",
    middleware.isAuthenticated,
    learnController.getSuggestedWords,
);

/**
 * @route   GET /learn/words/check?word=example
 * @desc    Check if a word exists in user's vocabulary and return its order positions
 * @access  Private (requires authentication)
 * @query   word - The word to check (required)
 * @returns Object with exists status, count, and array of matching words with their order positions
 * @example
 * GET /learn/words/check?word=apple
 * Response:
 * {
 *   "exists": true,
 *   "count": 2,
 *   "words": [
 *     { id: 25, word: "apple", description: "...", order: 3, ... },
 *     { id: 15, word: "apple", description: "...", order: 12, ... }
 *   ]
 * }
 * Order represents position from newest (1 = newest word, 2 = second newest, etc.)
 * If the same word is saved multiple times, all instances are returned
 */
router.get(
    "/words/check",
    middleware.isAuthenticated,
    learnController.checkWordExists,
);

export default router;
