import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function generateRSAKeyPair(): void {
    console.log('🔐 Generating RSA key pair...\n');

    // Generate RSA key pair (2048 bits is standard, 4096 for higher security)
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // 2048 bits is standard, can use 4096 for higher security
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    });

    console.log('✅ Key pair generated successfully!\n');
    console.log('='.repeat(80));
    console.log('PRIVATE KEY (AUTH_PRIVATE_KEY):');
    console.log('='.repeat(80));
    console.log(privateKey);
    console.log('\n');

    console.log('='.repeat(80));
    console.log('PUBLIC KEY (AUTH_PUBLIC_KEY):');
    console.log('='.repeat(80));
    console.log(publicKey);
    console.log('\n');

    // Save to files (optional)
    try {
        const keysDir = path.join(process.cwd(), 'keys');
        if (!fs.existsSync(keysDir)) {
            fs.mkdirSync(keysDir, { recursive: true });
        }

        const privateKeyPath = path.join(keysDir, 'private-key.pem');
        const publicKeyPath = path.join(keysDir, 'public-key.pem');

        fs.writeFileSync(privateKeyPath, privateKey, 'utf8');
        fs.writeFileSync(publicKeyPath, publicKey, 'utf8');

        console.log('📁 Keys saved to:');
        console.log(`   Private Key: ${privateKeyPath}`);
        console.log(`   Public Key:  ${publicKeyPath}\n`);
    } catch (error) {
        console.log('⚠️  Could not save keys to file (keys are displayed above)\n');
    }

    console.log('💡 Add these to your .env file:');
    console.log('   AUTH_PRIVATE_KEY="' + privateKey.replace(/\n/g, '\\n') + '"');
    console.log('   AUTH_PUBLIC_KEY="' + publicKey.replace(/\n/g, '\\n') + '"');
    console.log('\n');

    // Also generate a simple secret key for symmetric signing (HS256)
    const symmetricSecret = crypto.randomBytes(64).toString('base64');
    console.log('='.repeat(80));
    console.log('BONUS: Symmetric Secret Key (for HS256 algorithm):');
    console.log('='.repeat(80));
    console.log(symmetricSecret);
    console.log('\n');
    console.log('💡 For symmetric signing (HS256), use:');
    console.log(`   AUTH_PRIVATE_KEY="${symmetricSecret}"`);
    console.log('\n');
}

// Run the generator
generateRSAKeyPair();
