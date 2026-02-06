import prisma from "../../config/database/db.config.js";
// const bcrypt = require("bcrypt");
import bcrypt from "bcrypt";

const User = {
    findUserBySocialId: async (socialId) => {
        const user = await prisma.users.findUnique({
            where: { social_id: socialId },
        });
        return user;
    },
    findUserByEmail: async (email) => {
        const user = await prisma.users.findUnique({
            where: { email },
        });
        return user;
    },

    findUserById: async (id) => {
        const user = await prisma.users.findUnique({
            where: { id },
        });
        return user;
    },

    getUserById: async (id) => {
        const user = await prisma.users.findUnique({
            where: { id },
        });
        return user;
    },
    updatePassword: async (id, password) => {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await prisma.users.update({
            where: { id },
            data: { password: hashedPassword },
        });
        return user;
    },
    createUserGoogle: async (fullName, socialId, email, image) => {
        const user = await prisma.users.create({
            data: {
                username: fullName,
                social_id: socialId,
                type: "google",
                is_verify: true,
                image: image || "/img/avatar_placeholder.png",
                is_verify: true,
                email,
            },
        });
        return user;
    },
    createUserGithub: async (fullName, socialId, email, image) => {
        const user = await prisma.users.create({
            data: {
                username: fullName,
                social_id: socialId,
                type: "github",
                is_verify: true,
                image: image || "/img/avatar_placeholder.png",
                is_verify: true,
                email,
            },
        });
        return user;
    },
    createUserLocal: async (email, username, password) => {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await prisma.users.create({
            data: {
                email,
                username,
                password: hashedPassword,
                role: "user",
                is_active: true,
                created_at: new Date(),
            },
        });
        return user;
    },
    findUserByEmailAndPassWord: async (email, password) => {
        const user = await prisma.users.findFirst({
            where: { email },
        });

        if (!user) {
            return null;
        }
        const isMatch = bcrypt.compareSync(password, user.password);
        if (isMatch) {
            return user;
        }

        return null;
    },
    getById: async (id) => {
        const user = await prisma.users.findUnique({
            where: { id },
        });
        return user;
    },
    verifyUser: async (Token) => {
        const user = await prisma.users.findUnique({
            where: { verificationtoken: Token },
        });
        if (!user) {
            return null;
        }
        const updatedUser = await prisma.users.update({
            where: { id: user.id },
            data: {
                is_verify: true,
            },
        });
        return updatedUser;
    },
    storeRefreshToken: async (id, refreshToken) => {
        await prisma.freshtoken.create({
            data: {
                user_id: id,
                token: refreshToken,
                created_at: new Date(),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
    },
    getUserIdByRefreshToken: async (refreshToken) => {
        const tokenRecord = await prisma.freshtoken.findFirst({
            where: { token: refreshToken },
        });
        if (!tokenRecord) {
            return null;
        }
        return tokenRecord.user_id;
    },
};

export default User;
