import {
    Firestore,
    collection,
    addDoc,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    DocumentData,
    query,
    where,
} from "firebase/firestore"

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    StorageReference,
} from "firebase/storage"

import isObjtEquals from 'lodash';

// Types
export type IFirestore = Firestore
type Fields = {}
export type DataRef = {
    docId: string,
    docData: DocumentData,
}
export type Document<T> = {
    docData: T,
    docId: string,
}
export const accountNames = ['Renato', 'Ismael']

export const months = [
    {
        cod: 1,
        stamp: 'Jan'
    },
    {
        cod: 2,
        stamp: 'Fev'
    },
    {
        cod: 3,
        stamp: 'Mar'
    },
    {
        cod: 4,
        stamp: 'Abr'
    },
    {
        cod: 5,
        stamp: 'Mai'
    },
    {
        cod: 6,
        stamp: 'Jun'
    },
    {
        cod: 7,
        stamp: 'Jul'
    },
    {
        cod: 8,
        stamp: 'Ago'
    },
    {
        cod: 9,
        stamp: 'Set'
    },
    {
        cod: 10,
        stamp: 'Out'
    },
    {
        cod: 11,
        stamp: 'Nov'
    },
    {
        cod: 12,
        stamp: 'Dez'
    }
]

/*Biblioteca */
import Decimal from 'decimal.js';

// Database Actions 
export const getDocFnc = async (db: Firestore, collectionName: string, id: string) => {

    const collec = collection(db, collectionName)

    const docRef = await getDoc(doc(collec, id))

    if (!docRef.exists()) {
        return console.log('Documento inexistente');
    }

    return docRef.data()

}

export const getDocsFunc = async (
    db: Firestore,
    docName: string,
    isFilter: boolean,
    field?: string,
    confer?: string,
) => {

    try {

        const collect = collection(db, docName)

        // Return all docs
        if (!isFilter) {

            const allDocs = await getDocs(collect)

            const listDocs: DataRef[] = []

            allDocs.docs.forEach(doc => {

                if (!doc.exists) {
                    console.error('Document not exist');
                }

                const refRef: DataRef = {
                    docData: doc.data(),
                    docId: doc.id
                }

                listDocs.push(refRef)
            })

            const unique = listDocs.reduce((acc: DataRef[], curr) => {

                const index = acc.find(el => el.docId === curr.docId)

                if (!index) {
                    acc.push(curr)
                }

                return acc
            }, [])

            return unique
        }

        if (isFilter) {

            const filter = query(collect, where(field!, '==', confer))
            const docsFiltered = await getDocs(filter)

            const listDocs: DataRef[] = []

            docsFiltered.docs.forEach(doc => {

                if (!doc.exists) {
                    console.error('Document not exist');
                }

                const refRef: DataRef = {
                    docData: doc.data(),
                    docId: doc.id
                }

                listDocs.push(refRef)
            })

            const unique = listDocs.reduce((acc: DataRef[], curr) => {

                const index = acc.find(el => el.docId === curr.docId)

                if (!index) {
                    acc.push(curr)
                }

                return acc
            }, [])

            return unique
        }

    } catch (error) {
        return error

    }
}

export const updateDocFunc = async (db: Firestore, collection: string, id: string, content: Fields): Promise<{ msg: string, success: boolean }> => {

    const docRef = doc(db, collection, id)

    try {

        await updateDoc(docRef, content)
        return {
            msg: 'Atualizado com sucesso.',
            success: true
        }

    } catch (error) {

        return {
            msg: `Falha ao atualizar dados: ${error}`,
            success: true
        }

    }

}

export async function deleteFunc(db: Firestore, collection: string, id: string): Promise<{ msg: string, success: boolean }> {

    try {

        await deleteDoc(doc(db, collection, id))
        return {
            msg: 'Excluido com sucesso.',
            success: true
        }

    } catch (error) {

        return {
            msg: `Falha ao excluir registro: ${error}`,
            success: false
        }


    }

}

export async function saveFile(fileList: globalThis.File[], folder: string, isCreation: boolean, oldUrlImgs?: string[]) {
    const storage = getStorage()

    const storageListRef: StorageReference[] = []

    fileList.forEach(file => {

        storageListRef.push(ref(storage, `catalog/${folder}/${file.name}`))
    })

    try {

        if (!isCreation) {

            oldUrlImgs!.forEach(pathImage => {
                deleteFile(pathImage)
            })
        }

        let index = 0

        while (index < storageListRef.length) {

            const snapshot = await uploadBytes(storageListRef[index], fileList[index])

            console.log('Sucess to upload file: ' + snapshot.metadata);

            index++
        }

    } catch (error) {
        console.error(error);
    }
}

export async function getfile(path: string) {

    try {
        const storage = getStorage()
        const fileRef = ref(storage, path)
        const urlImg = await getDownloadURL(fileRef)

        return urlImg

    } catch (err) {
        console.log(err);
    }
}

export async function deleteFile(path: string) {

    try {
        const storage = getStorage()
        const fileRef = ref(storage, path)

        await deleteObject(fileRef);

    } catch (err) {
        console.log(err);
    }
}

// Utilities Functions
export function getCurrentMonthAndYear() {

    const currTime = {
        currMonth: new Date().getMonth() + 1,
        currYear: new Date().getFullYear(),
        currDate: new Date().getDate()
    }

    const monthName = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

    return {

        nameMonth: monthName[currTime.currMonth - 1]
    }

}

export function formatedNumber(number: number) {

    if (Number.isNaN(number)) {
        return 0
    }

    const price = Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: "BRL",
        minimumFractionDigits: 2
    })

    return price.format(number)
}

export function checkPermission(): boolean {

    const userDate = localStorage.getItem("@user:")
    const data = JSON.parse(userDate!)

    return data.isPermeted
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

export function splitDate(date: string, formated: boolean = false, setZero: boolean = false) {

    if (setZero) {

        const symbol = date.charAt(date.indexOf('/')) == '/' ? '/' : '-'
        let splitedDate = date.split(symbol)

        if (Number(splitedDate[0]) < Number(splitedDate[2])) {

            splitedDate = date.split(symbol).reverse()
        }

        return {
            year: Number(splitedDate[0]),
            month: Number(splitedDate[1]),
            date: Number(splitedDate[2]),
            stampDate: `${splitedDate[0]}-${splitedDate[1]}-${splitedDate[2]}`
        }

    }

    if (formated) {

        const symbol = date.charAt(date.indexOf('/')) == '/' ? '/' : '-'
        const splitedDate = date.split(symbol).reverse()

        return {
            year: Number(splitedDate[0]),
            month: Number(splitedDate[1]),
            date: Number(splitedDate[2]),
            stampDate: `${Number(splitedDate[0])}/${Number(splitedDate[1])}/${Number(splitedDate[2])}`
        }
    }

    const symbol = date.charAt(date.indexOf('/')) == '/' ? '/' : '-'
    const splitedDate = date.split(symbol)

    return {
        year: Number(splitedDate[0]),
        month: Number(splitedDate[1]),
        date: Number(splitedDate[2]),
        stampDate: `${Number(splitedDate[0])}-${Number(splitedDate[1])}-${Number(splitedDate[2])}`
    }

}

export function formatCEP(character: string): string {
    const cep = character.trim()

    if (cep.length !== 8 || isNaN(Number(cep))) {
        return ''
    }

    const formatedZicode = `${cep.slice(0, 5)}-${cep.slice(-3)}`

    return formatedZicode
}

export function formatCellPhone(character: string) {
    const phoneNumber = character.trim()

    if (phoneNumber.length !== 11 || isNaN(Number(phoneNumber))) {
        return ''
    }

    const formatedZicode = `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(-4)}`

    return formatedZicode

}

export function formatCPF(character: string) {

    const data = character.trim()

    if (data.length === 0 || isNaN(Number(data))) {
        return ''
    }

    if (data.length === 11) {

        const formatedCPF = `${data.slice(0, 3)}.${data.slice(3, 6)}.${data.slice(6, 9)}-${data.slice(9)}`

        return formatedCPF
    }

    if (data.length === 14) {

        const formatedCNPJ = `${data.slice(0, 2)}.${data.slice(2, 5)}.${data.slice(5, 8)}/${data.slice(8, 12)}-${data.slice(12)}`
        return formatedCNPJ
    }

}

export function isEmpty(obj: any) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            return false;
        }
    }
    return JSON.stringify(obj) === JSON.stringify({});
}

export function diffDays(date1: string, date2: string): number {

    const dateStamp2 = new Date(date2).valueOf()
    const dateStamp1 = new Date(date1).valueOf()

    const diffStamps = dateStamp2 - dateStamp1

    const result = Math.floor(diffStamps / (1000 * 60 * 60 * 24))

    return result;
}

export function isArrayEqual(arr1: any[], arr2: any[]): boolean {

    if (arr1.length !== arr2.length) {
        return false;
    }

    return arr1.every((valor, indice) => valor === arr2[indice]);

}

export function isLater(date: string): boolean {

    const stamp = splitDate_1(date, false).date.stampDate

    /* Verify day/s */
    if (splitDate_1(stamp, false).date.year === splitDate_1('', false).currentDate.currentDate_year && splitDate_1(stamp, false).date.month === splitDate_1('', false).currentDate.currentDate_month && splitDate_1(stamp, false).date.day < splitDate_1('', false).currentDate.currentDate_day) {
        return true
    }

    /* Verify month/s and years */
    if (splitDate_1(stamp, false).date.year <= splitDate_1('', false).currentDate.currentDate_year && splitDate_1(stamp, false).date.month < splitDate_1('', false).currentDate.currentDate_month) {
        return true
    }

    return false
}

export function splitDate_1(date: string, localStemp: boolean) {

    let symbol = ''
    let date_1: string[] = []

    if (date) {

        symbol = date.charAt(date.indexOf('/')) !== '' ? '/' : '-'
        date_1 = date.split(symbol)

        if (Number(date_1![0]) < Number(date_1![2])) {
            date_1!.reverse()
        }
    }

    const year = Number(date_1![0]) || 0
    const month = Number(date_1![1]) || 0
    const day = Number(date_1![2]) || 0

    let stamp = `${year}-${month}-${day}`

    if (localStemp) {
        stamp = `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${date_1![0]}`
    }

    /* Current Date */
    const date_2 = new Date()

    const date_3 = `${date_2.getFullYear()}-${date_2.getMonth() + 1}-${date_2.getDate()}`
    const date_4 = `${date_2.getDate() < 10 ? "0" + date_2.getDate() : date_2.getDate()}/${date_2.getMonth() < 10 ? "0" + (date_2.getMonth() + 1) : (date_2.getMonth() + 1)}/${date_2.getFullYear()}`

    const date_5 = date_2.getFullYear()
    const date_6 = date_2.getMonth() + 1
    const date_7 = date_2.getDate()

    return {

        date: {
            year: year,
            month: month,
            day: day,
            stampDate: stamp,
        },

        currentDate: {
            currentDate_es: date_3,
            currentDate_pt: date_4,
            currentDate_year: date_5,
            currentDate_month: date_6,
            currentDate_day: date_7,
        }

    }
}

export function getDatesFromDate(date: string, number: number) {

    /* Curreent Date splitted */
    let year = splitDate_1(date, false).date.year
    const month = splitDate_1(date, false).date.month
    const day = splitDate_1(date, false).date.day

    let count = 0
    let setMonth = month

    const dates: string[] = []

    do {

        date = `${year}-${setMonth}-${day}`

        const arrDate = date.split('-')

        if (Number(arrDate[1]) * 1 === 12) {

            setMonth = 0
            year += 1
        }

        dates.push(date)

        setMonth++
        count++

    } while (count < number);

    return dates
}

export function validarCPF(cpf: string): boolean {

    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]+/g, '');

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }

    const calcularDigito = (base: number): number => {
        let soma = 0;
        for (let i = 0; i < base; i++) {
            soma += parseInt(cpf.charAt(i)) * (base + 1 - i);
        }
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };

    const digito1 = calcularDigito(9);
    const digito2 = calcularDigito(10);

    return digito1 === parseInt(cpf.charAt(9)) && digito2 === parseInt(cpf.charAt(10));
}

export function validarCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

    const calcularDigito = (base: number): number => {
        const pesos = base === 12
            ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
            : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        let soma = 0;
        for (let i = 0; i < pesos.length; i++) {
            soma += parseInt(cnpj.charAt(i)) * pesos[i];
        }

        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };

    const digito1 = calcularDigito(12);
    const digito2 = calcularDigito(13);

    return digito1 === parseInt(cnpj.charAt(12)) && digito2 === parseInt(cnpj.charAt(13));
}

export interface KeyTest<U, S> {
    prop1: keyof U | null;
    prop2: S | S[] | null;
    objKey: string;
    left: string[] | null;
    noVerify: boolean;
}

export const _addDocFnc = async <T extends object, S = unknown>(
    structure: T,
    db: Firestore,
    collectionName: string,
    attr?: KeyTest<T, S>
): Promise<{ msg: string; isSaved: boolean }> => {

    try {
        const list = collection(db, collectionName);
        const docs = (await getDocs(list)).docs;

        const getSameRecord = docs.filter((el) => {

            const dataRef = el.data() as T;

            const keys = Object.keys(dataRef)
            let controller: boolean[] = []

            keys.forEach(key => {

                const prop: keyof T = key as keyof T

                if (Array.isArray(dataRef[prop]) && Array.isArray(attr?.prop2 as S[])) {
                    attr?.prop2 as S[]
                    if (attr!.left !== null && prop === attr!.left.find(el => el === prop)) {

                        controller.push(false)

                    } else {

                        const array = dataRef[prop]

                        /* Check if it's array ofthe objects */
                        if (isArrayOfObjects(array)) {

                            if (Array.isArray(array)) {

                                const cleanTarget = array.map((el) => removePropFromObject<S>(el, attr!.objKey as keyof S));

                                const cleanProp2 = (attr?.prop2 as S[]).map((el) => removePropFromObject<S>(el, attr!.objKey as keyof S));

                                controller.push(areArraysOfObjectsEquals(cleanTarget, cleanProp2));
                            }

                        } else {

                            if (attr!.left !== null && prop === attr!.left.find(el => el === prop)) {

                                controller.push(false)

                            } else {

                                /* If it is an array of other type */
                                const _struc: { [key: string]: any } = structure;
                                const struc = Object.keys(structure)
                                const strucKey = struc.find(el => el === prop)

                                if (areArraysOfObjectsEquals(dataRef[prop], _struc[strucKey!])) {

                                    controller.push(true);
                                }
                            }
                        }
                    }

                } else {

                    if (attr!.left !== null && prop === attr!.left.find(el => el === prop)) {

                        controller.push(false)

                    } else {

                        /* If it's not array */
                        const _data = dataRef[prop]
                        const strucObj = structure[key as keyof T]

                        if (
                            typeof _data === 'object' && _data !== null && !Array.isArray(_data) &&
                            typeof strucObj === 'object' && strucObj !== null && !Array.isArray(strucObj)
                        ) {

                            const propRemoved_1 = removePropFromObject<S>(_data as S, attr!.objKey as keyof S);
                            const propRemoved_2 = removePropFromObject<S>(strucObj as S, attr!.objKey as keyof S);

                            if (isObjtEquals.isEqual(propRemoved_1, propRemoved_2)) {

                                controller.push(true);
                            }

                        } else {

                            if (!attr!.noVerify) {

                                controller.push(false);

                            } else {

                                const dynamicObj: Record<string, any> = {}
                                const fromData: Record<string, any> = {}

                                const propertties = Object.keys(removePropFromObject<T>(structure as T, attr!.objKey as keyof T))

                                propertties.forEach(prop => {

                                    const typeRef = structure[prop as keyof T]

                                    if (typeof typeRef !== 'object') {

                                        dynamicObj[prop] = structure[prop as keyof T]

                                        fromData[prop] = dataRef[prop as keyof T]

                                    }

                                })

                                if (isObjtEquals.isEqual(dynamicObj, fromData)) {

                                    controller.push(true);
                                }
                            }
                        }
                    }
                }

            });

            if (controller.some(el => el === true)) {

                return el
            }
        });

        if (getSameRecord.length > 0) {
            return {
                isSaved: false,
                msg: 'Já consta esse registro no banco de dados.',
            };
        }

        const ids = docs.map((item) => item.data().id);
        const uniqueIds = Array.from(new Set(ids));

        let newId = '';
        do {
            newId = createCharacters(10);
        } while (uniqueIds.includes(newId));

        const data = { ...structure, id: newId };
        await addDoc(collection(db, collectionName), data);

        return {
            isSaved: true,
            msg: 'Salvo com sucesso.',
        };

    } catch (err) {

        throw new Error('Não foi possível executar essa operação: ' + err);
    }

};

export const get_DocsFunc = async <T>(
    db: Firestore,
    docName: string,
    isFilter: boolean,
    field?: string,
    confer?: string
): Promise<(T & { docId: string })[]> => {

    try {

        const collect = collection(db, docName)

        const docs_Query = isFilter ? (() => {

            if (!field || !confer) throw new Error("Parâmetros do filter ausentes");

            return query(collect, where(field, '==', confer))
        })() : collect

        const docs = await getDocs(docs_Query)

        return docs.docs.map(doc => ({
            ...doc.data() as T,
            docId: doc.id,
        }))

    } catch (error) {

        throw new Error("Exceção mal sucedida" + error);
    }
}

export function objetosIguais(a: any, b: any): boolean {

    return JSON.stringify(a) === JSON.stringify(b);
}

export function arraysDeObjetosIguais<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (!objetosIguais(a[i], b[i])) return false;
    }

    return true;
}

export function roundToTwoDecimals(input: string | number): number {
    let value: Decimal;

    if (typeof input === 'number') {
        value = new Decimal(input);
    } else if (typeof input === 'string') {
        const trimmed = input.trim();

        // Trata porcentagem (ex: "25%")
        if (trimmed.endsWith('%')) {
            const percent = new Decimal(trimmed.slice(0, -1));
            value = percent.div(100);
        }
        // Trata fração (ex: "3/4")
        else if (/^\d+\/\d+$/.test(trimmed)) {
            const [numerador, denominador] = trimmed.split('/').map(Number);
            if (denominador === 0) throw new Error('Divisão por zero');
            value = new Decimal(numerador).div(denominador);
        }
        // Trata número decimal como string (ex: "2.718")
        else {
            value = new Decimal(trimmed);
        }
    } else {
        throw new Error(`Tipo não suportado: ${typeof input}`);
    }

    // Arredondamento exato para duas casas decimais
    return Number(value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP));
}

export function getUniqueItemsByKey<T>(items: T[], key: keyof T): T[] {
    return items.reduce((acc: T[], curr) => {
        const exists = acc.some(item => item[key] === curr[key]);
        if (!exists) {
            acc.push(curr);
        }
        return acc;
    }, []);
}

export function getRepeatedItems<T>(items: T[], key: keyof T): T[] {
    return items.reduce((acc: T[], curr) => {
        const exists = acc.some(item => item[key] === curr[key]);
        if (exists) {
            acc.push(curr);
        }
        return acc;
    }, []);
}

export function dateFormat_PT(da_te: string) {

    const date = splitDate_1(da_te, false).date.stampDate

    const symbol = date.indexOf('/') !== -1 ? '/' : '-'

    const date_ = date.split(symbol)

    let value_1 = Number(date_[0])
    let value_2 = Number(date_[1])
    let value_3 = Number(date_[2])

    if (date_[0].length == 4) {

        let date_1 = date_[2].length > 1 ? value_3 : '0' + value_3
        let date_2 = date_[1].length > 1 ? value_2 : '0' + value_2
        let date_3 = value_1

        return `${date_1}/${date_2}/${date_3}`

    } else {

        let date_1 = date_[0].length > 1 ? value_1 : '0' + value_1
        let date_2 = date_[1].length > 1 ? value_2 : '0' + value_2
        let date_3 = value_3

        return `${date_1}/${date_2}/${date_3}`
    }


}

export function sumProps<T>(array: T[], chave: keyof T): number {
    return array.reduce((soma, item) => {
        const valor = item[chave];
        return soma + (typeof valor === 'number' ? valor : 0);
    }, 0);
}

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

export function areArraysOfObjectsEquals(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;

    return arr1.every((obj, index) => objEquals(obj, arr2[index]));
}

type Atrit<T> = { [key in keyof T]: any }

export function removePropFromObject<T>(content: Atrit<T>, attrib: keyof T) {

    if (content) {

        if (!content.hasOwnProperty(attrib)) return content;

        const removedProp: keyof T = attrib

        delete content[removedProp]

    }

    return content
}

function isArrayOfObjects<T>(arr: T[]): boolean {
    if (!Array.isArray(arr)) return false;

    return arr.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));
}
