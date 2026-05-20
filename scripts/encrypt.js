class FileService {

    static async fileToDataUrl(file) {
        return new Promise(resolve => {

            const reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result);
            };

            reader.readAsDataURL(file);

        });
    }

    static download(filename, content) {
        const blob = new Blob(
            [content],
            {
                type: 'application/json'
            }
        );

        const link =
            document.createElement('a');

        link.href =
            URL.createObjectURL(blob);

        link.download = filename;

        link.click();
    }

}

class EncryptionFile {

    constructor({
        login,
        password,
        text,
        imageFile
    }) {
        this.login = login;
        this.password = password;
        this.text = text;
        this.imageFile = imageFile;
    }

    async generate() {
        const normalizedLogin =
            Utils.normalizeStr(this.login);

        const filename =
            await Utils.sha256(
                normalizedLogin
            );

        const image =
            await FileService.fileToDataUrl(
                this.imageFile
            );

        const payload = {
            text: this.text,
            image
        };

        const encrypted =
            await CryptoService.encrypt(
                payload,
                this.password
            );

        FileService.download(
            `${filename}.enc`,
            JSON.stringify(encrypted)
        );
    }

}

async function createEncryptedFile(data) {
    const file =
        new EncryptionFile(data);

    await file.generate();
}

async function handleEncrypt() {
    const login =
        document.getElementById('login').value;

    const password =
        document.getElementById('password').value;

    const text =
        document.getElementById('text').value;

    const imageFile =
        document.getElementById('choosen-image').files[0];

    if (!login || !password || !imageFile) {
        alert('Заполни всё');
        return;
    }

    await createEncryptedFile({
        login,
        password,
        text,
        imageFile
    });
}