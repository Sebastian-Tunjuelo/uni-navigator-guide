import { supabase } from '@/config/supabase';
import logger from '@/config/logger';
import { AuthUser, AuthRequest, AuthResponse } from '@/types/auth';

export class AuthService {
  /**
   * Signup new user
   */
  static async signup(email: string, password: string): Promise<AuthResponse> {
    logger.info(`Auth: Signup attempt for ${email}`);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      logger.error(`Auth signup error: ${error.message}`);
      throw new Error(`Signup failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Signup failed: User not created');
    }

    logger.info(`Auth: User ${data.user.id} signed up successfully`);

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        user_metadata: data.user.user_metadata,
        created_at: data.user.created_at,
      },
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }
        : undefined,
    };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    logger.info(`Auth: Login attempt for ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error(`Auth login error: ${error.message}`);
      throw new Error(`Login failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Login failed: User not found');
    }

    logger.info(`Auth: User ${data.user.id} logged in successfully`);

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        user_metadata: data.user.user_metadata,
        created_at: data.user.created_at,
      },
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }
        : undefined,
    };
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    logger.info('Auth: Logout');
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error(`Auth logout error: ${error.message}`);
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      user_metadata: data.user.user_metadata,
      created_at: data.user.created_at,
    };
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email || '',
        user_metadata: data.user.user_metadata,
        created_at: data.user.created_at,
      };
    } catch (err) {
      logger.error(`Token verification failed: ${err}`);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResponse | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.user) {
        return null;
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata,
          created_at: data.user.created_at,
        },
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }
          : undefined,
      };
    } catch (err) {
      logger.error(`Token refresh failed: ${err}`);
      return null;
    }
  }
}
