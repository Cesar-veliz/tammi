import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthResponse, LoginRequest } from '../types';

const prisma = new PrismaClient();

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { username, password } = credentials;

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      this.JWT_SECRET as jwt.Secret,
      { expiresIn: this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        role: user.role as 'ADMIN' | 'USER'
      },
      token
    };
  }

  static async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async createUser(userData: {
    username: string;
    password: string;
    role: 'ADMIN' | 'USER';
    name: string;
  }) {
    const hashedPassword = await this.hashPassword(userData.password);

    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });
  }
}