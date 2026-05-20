class AuthService {

    static async resolveFilename(login) {
        const normalized =
            Utils.normalizeStr(login);

        return Utils.sha256(normalized);
    }

    static async fetchEncryptedFile(filename) {
        const response = await fetch(
            `data/${filename}.enc`
        );

        if (!response.ok) {
            throw new Error('not found');
        }

        return response.json();
    }

}

class UI {

    static showError(message) {
        document.getElementById(
            'error'
        ).textContent = message;
    }

    static showContent(payload) {
        document.getElementById(
            'login-box'
        ).style.display = 'none';

        document.getElementById(
            'content'
        ).style.display = 'flex';

        window.text_config = payload.text;

        document.getElementById(
            'image'
        ).src = payload.image;
    }

}

class App {
    static async login() {
        const login =
            document.getElementById('login').value;

        const password =
            document.getElementById('password').value;

        UI.showError('');

        try {

            const filename =
                await AuthService.resolveFilename(login);

            const encrypted =
                await AuthService.fetchEncryptedFile(
                    filename
                );

            const payload =
                await CryptoService.decrypt(
                    encrypted,
                    password
                );

            UI.showContent(payload);

        } catch (e) {

            UI.showError(
                'Неверный логин или пароль'
            );

        }
    }

}