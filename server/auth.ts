import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { pool } from "./db";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const PostgresSessionStore = connectPg(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateAccountId(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function generateSeedPhrase(): string {
  // Simple seed phrase generation - in production use a proper library
  const words = [
    'apple', 'banana', 'cherry', 'dog', 'elephant', 'flower', 'garden', 'house',
    'island', 'jungle', 'kitchen', 'lemon', 'mountain', 'notebook', 'ocean', 'piano'
  ];
  return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "thaibc-thailand-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({ 
      pool: pool as any,
      createTableIfMissing: true 
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !user.isActive || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }

        // Автоматически устанавливаем админские права для указанного email
        if ((email === "yyobibenb@gmail.com" || email === "admin@thaibc.com") && !user.isAdmin) {
          await storage.updateUser(user.id, { isAdmin: true });
          user.isAdmin = true;
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, name, phoneNumber, dateOfBirth, language, seedPhrase } = req.body;
      
      if (!email || !password || !name || !phoneNumber || !dateOfBirth) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const accountId = generateAccountId();
      const user = await storage.createUser({
        email,
        password: await hashPassword(password),
        name,
        phoneNumber,
        dateOfBirth,
        accountId,
        language: language || "th",
        seedPhrase: seedPhrase || generateSeedPhrase(),
      });

      // Автоматически устанавливаем админские права для указанного email
      if (email === "yyobibenb@gmail.com" || email === "admin@thaibc.com") {
        await storage.updateUser(user.id, { isAdmin: true });
        user.isAdmin = true;
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ 
          id: user.id, 
          email: user.email, 
          accountId: user.accountId,
          balance: user.balance,
          language: user.language,
          isAdmin: user.isAdmin 
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    const user = req.user!;
    res.status(200).json({ 
      id: user.id, 
      email: user.email, 
      accountId: user.accountId,
      balance: user.balance,
      language: user.language,
      isAdmin: user.isAdmin 
    });
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user!;
    res.json({ 
      id: user.id, 
      email: user.email, 
      accountId: user.accountId,
      balance: user.balance,
      language: user.language,
      isAdmin: user.isAdmin,
      seedPhrase: user.seedPhrase
    });
  });

  // Change password endpoint
  app.post("/api/user/change-password", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Update password
      const hashedNewPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedNewPassword });

      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Password recovery with seed phrase
  app.post("/api/recover-password", async (req, res, next) => {
    try {
      const { email, seedPhrase, newPassword } = req.body;
      
      if (!email || !seedPhrase || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(404).json({ message: "User not found or account is inactive" });
      }

      // Verify seed phrase
      if (user.seedPhrase !== seedPhrase) {
        return res.status(400).json({ message: "Invalid recovery phrase" });
      }

      // Update password
      const hashedNewPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedNewPassword });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error('Password recovery error:', error);
      res.status(500).json({ message: "Failed to recover password" });
    }
  });
}
