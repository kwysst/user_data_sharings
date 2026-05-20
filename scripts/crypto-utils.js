const ITERATIONS = 300000;

class Utils {

    static normalizeStr(str) {
        return str
            .trim()
            .toLowerCase()
            .normalize('NFKC')
            .replace(/\s+/g, '');
    }

    static async sha256(text) {
        const data = new TextEncoder().encode(text);

        const hash = await crypto.subtle.digest(
            'SHA-256',
            data
        );

        return [...new Uint8Array(hash)]
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    static bufferToBase64(buffer) {
        return btoa(
            String.fromCharCode(
                ...new Uint8Array(buffer)
            )
        );
    }

    static base64ToBuffer(base64) {
        const binary = atob(base64);

        return Uint8Array.from(
            binary,
            c => c.charCodeAt(0)
        );
    }

}

class CryptoService {

    static async deriveKey(password, salt, op) {
        const keyMaterial =
            await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(password),
                'PBKDF2',
                false,
                ['deriveKey']
            );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt,
                iterations: ITERATIONS,
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: 'AES-GCM',
                length: 256
            },
            false,
            [op]
        );
    }

    static async encrypt(payload, password) {
        const salt = crypto.getRandomValues(
            new Uint8Array(16)
        );

        const iv = crypto.getRandomValues(
            new Uint8Array(12)
        );

        const key =
            await this.deriveKey(Utils.normalizeStr(password), salt, 'encrypt');

        const encoded =
            new TextEncoder().encode(
                JSON.stringify(payload)
            );

        const ciphertext =
            await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv
                },
                key,
                encoded
            );

        return {
            v: 1,
            alg: 'AES-GCM',
            kdf: 'PBKDF2-SHA256',
            iterations: ITERATIONS,
            salt: Utils.bufferToBase64(salt),
            iv: Utils.bufferToBase64(iv),
            ciphertext:
                Utils.bufferToBase64(ciphertext)
        };
    }

    static async decrypt(data, password) {
        const salt =
            Utils.base64ToBuffer(data.salt);

        const iv =
            Utils.base64ToBuffer(data.iv);

        const ciphertext =
            Utils.base64ToBuffer(data.ciphertext);

        const key =
            await this.deriveKey(Utils.normalizeStr(password), salt, 'decrypt');

        const decrypted =
            await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv
                },
                key,
                ciphertext
            );

        console.log(decrypted);

        return JSON.parse(
            new TextDecoder().decode(decrypted)
        );
    }

}