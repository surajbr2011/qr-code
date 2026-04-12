const QRCode = require('qrcode');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// Key must be exactly 32 bytes for aes-256-cbc
const rawKey = process.env.ENCRYPTION_KEY || 'default_secret_key_32_chars_long_';
const ENCRYPTION_KEY = rawKey.padEnd(32, ' ').slice(0, 32);
const IV_LENGTH = 16;

class QRCodeGenerator {

    // Encrypt data for QR token
    static encrypt(text) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            Buffer.from(ENCRYPTION_KEY),
            iv
        );

        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    // Decrypt QR token
    static decrypt(text) {
        try {
            const parts = text.split(':');
            const iv = Buffer.from(parts.shift(), 'hex');
            const encryptedText = Buffer.from(parts.join(':'), 'hex');

            const decipher = crypto.createDecipheriv(
                'aes-256-cbc',
                Buffer.from(ENCRYPTION_KEY),
                iv
            );

            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            return decrypted.toString();
        } catch (error) {
            throw new Error('Decryption failed');
        }
    }

    // Generate secure token for QR code
    static generateToken(tableData) {
        const payload = {
            tableId: tableData.tableId,
            roomId: tableData.roomId || null,
            tableName: tableData.tableName || tableData.metadata?.tableName,
            zone: tableData.zone || 'indoor',
            timestamp: Date.now(),
            random: crypto.randomBytes(8).toString('hex')
        };

        const jsonPayload = JSON.stringify(payload);
        return this.encrypt(jsonPayload);
    }

    // Validate and decode QR token
    static validateToken(token) {
        try {
            const decrypted = this.decrypt(token);
            const payload = JSON.parse(decrypted);

            // Check if token is too old (optional - 24 hours)
            const tokenAge = Date.now() - payload.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            // Uncomment to enable token expiration
            // if (tokenAge > maxAge) {
            //   return { valid: false, error: 'Token expired' };
            // }

            return {
                valid: true,
                data: payload
            };
        } catch (error) {
            return {
                valid: false,
                error: 'Invalid token'
            };
        }
    }

    // Generate QR code image (Base64)
    static async generateQRImage(token, baseUrl) {
        const url = `${baseUrl}?token=${encodeURIComponent(token)}`;

        try {
            // Generate as Data URL (Base64)
            const qrDataUrl = await QRCode.toDataURL(url, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            return qrDataUrl;
        } catch (error) {
            throw new Error('Failed to generate QR code image');
        }
    }

    // Generate session token (JWT)
    static generateSessionToken(sessionData) {
        return jwt.sign(
            {
                sessionId: sessionData._id,
                tableId: sessionData.tableId,
                roomId: sessionData.roomId,
                zone: sessionData.zone
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    // Verify session token
    static verifySessionToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }
}

module.exports = QRCodeGenerator;
