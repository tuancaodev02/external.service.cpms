import jwt from 'jsonwebtoken';
import { environment } from '../configs/env.config';
import type { JWTAlgorithm, TokenPair } from '../interfaces/jwt.interface';

export class JWTHelper {
    private static readonly ACCESS_TOKEN_EXPIRES_IN = '3days';
    private static readonly REFRESH_TOKEN_EXPIRES_IN = '30days';
    private static readonly RSA_KEY_MARKERS = {
        BEGIN: '-----BEGIN',
        PRIVATE: 'PRIVATE KEY',
        PUBLIC: 'PUBLIC KEY',
        END: '-----END',
    } as const;

    /**
     * Checks if the provided key is in RSA PEM format
     */
    private isRSAKey(key: string): boolean {
        if (!key) return false;

        const hasBeginMarker = key.includes(JWTHelper.RSA_KEY_MARKERS.BEGIN);
        const hasEndMarker = key.includes(JWTHelper.RSA_KEY_MARKERS.END);
        const hasKeyType = key.includes(JWTHelper.RSA_KEY_MARKERS.PRIVATE) || key.includes(JWTHelper.RSA_KEY_MARKERS.PUBLIC);

        return hasBeginMarker && hasKeyType && hasEndMarker;
    }

    /**
     * Determines the JWT algorithm based on key format
     * RSA keys (PEM format) -> RS256
     * Symmetric keys (simple string) -> HS256
     */
    private getAlgorithm(key: string): JWTAlgorithm {
        return this.isRSAKey(key) ? 'RS256' : 'HS256';
    }

    /**
     * Gets the appropriate key for token verification
     * For RSA: prefers public key, falls back to private key
     * For symmetric: uses the same secret key
     */
    private getVerificationKey(secretKey: string): string {
        const isRSA = this.isRSAKey(secretKey);
        const hasPublicKey = Boolean(environment.AUTH_PUBLIC_KEY);

        if (isRSA && hasPublicKey) {
            return environment.AUTH_PUBLIC_KEY!;
        }

        return secretKey;
    }

    /**
     * Validates that a key is provided and not empty
     */
    private validateKey(key: string, keyName: string): void {
        if (!key || key.trim().length === 0) {
            throw new Error(`${keyName} is required but was empty`);
        }
    }

    /**
     * Generates a pair of access and refresh tokens
     * For RSA: both tokens are signed with private key
     * For symmetric: both tokens are signed with the same secret key
     */
    public generatePairToken<T extends Record<string, unknown>>(payload: T): TokenPair {
        const privateKey = environment.AUTH_PRIVATE_KEY || '';
        const publicKey = environment.AUTH_PUBLIC_KEY || '';

        this.validateKey(privateKey, 'AUTH_PRIVATE_KEY');

        // For RSA: always use private key to sign (public key is only for verification)
        // For symmetric: use the same key for both tokens
        const signingKey = privateKey;
        const algorithm = this.getAlgorithm(privateKey);

        return {
            accessToken: this.signToken(payload, signingKey, {
                expiresIn: JWTHelper.ACCESS_TOKEN_EXPIRES_IN,
                algorithm,
            }),
            refreshToken: this.signToken(payload, signingKey, {
                expiresIn: JWTHelper.REFRESH_TOKEN_EXPIRES_IN,
                algorithm,
            }),
        };
    }

    /**
     * Signs a JWT token with the provided payload and key
     */
    public signToken<T extends Record<string, unknown>>(payload: T, key: string, options?: jwt.SignOptions): string {
        this.validateKey(key, 'Signing key');

        const algorithm = options?.algorithm || this.getAlgorithm(key);
        const signOptions: jwt.SignOptions = { ...options, algorithm };

        return jwt.sign(payload, key, signOptions);
    }

    /**
     * Verifies and decodes a JWT token
     * @throws Error if token is invalid or verification fails
     */
    public verifyToken(token: string, secretKey?: string): string | jwt.JwtPayload {
        const key = secretKey || environment.AUTH_PRIVATE_KEY || '';
        this.validateKey(key, 'Verification key');

        const verifyKey = this.getVerificationKey(key);
        const algorithm = this.getAlgorithm(verifyKey);

        try {
            return jwt.verify(token, verifyKey, { algorithms: [algorithm] });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`JWT verification failed: ${errorMessage}`);
        }
    }
}
