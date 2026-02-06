import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import GoogleStrategy from "passport-google-oauth20";
import GitHubStrategy from "passport-github2";
import User from "../app/auth/service.js";
import dotenv from "dotenv";
dotenv.config();

import passport from "passport";

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

const strategy = new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.getById(jwt_payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
});

passport.use(strategy);

export default passport;
