export const normalizeKey = (key: string | undefined): string | undefined => {
    if (!key) return key;
    // Convert literal \n to actual newlines (for RSA PEM keys from .env)
    return key.replace(/\\n/g, '\n');
};
