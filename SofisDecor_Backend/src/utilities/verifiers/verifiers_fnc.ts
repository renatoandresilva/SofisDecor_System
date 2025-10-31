
export function objEquals(obj1: any, obj2: any): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => {
        const val1 = obj1[key];
        const val2 = obj2[key];

        if (typeof val1 === 'object' && typeof val2 === 'object') {
            return objEquals(val1, val2); // recursivo para objetos aninhados
        }

        return val1 === val2;
    });
}

export function isArrayOfObjects<T>(arr: T[]): boolean {
    if (!Array.isArray(arr)) return false;

    return arr.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));
}

export function areArraysOfObjectsEquals(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;

    return arr1.every((obj, index) => objEquals(obj, arr2[index]));
}