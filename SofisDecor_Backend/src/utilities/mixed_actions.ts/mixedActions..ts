type Atrit<T> = { [key in keyof T]: any }

export function removePropFromObject<T>(content: Atrit<T>, attrib: keyof T) {

    if (content) {

        if (!content.hasOwnProperty(attrib)) return content;

        const removedProp: keyof T = attrib

        delete content[removedProp]

    }

    return content
}

export function createCharacters(lenth: number): string {

    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
    let resultado = '';

    for (let i = 0; i < lenth; i++) {

        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        resultado += caracteres.charAt(indiceAleatorio);
    }

    return resultado;
}
