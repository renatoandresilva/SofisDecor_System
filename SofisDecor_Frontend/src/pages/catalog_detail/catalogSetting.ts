
/* Types */
export type Repost_Value = {
    addInfo?: string,
    fee: number,
    purchcasePrice: number,
    salePrice: number
    addition?: number,
    installments: number,
    installment_value: number,
}

export type Product = {
    fileName: string,
    category: string,
    class: string,
    infoSaleValue: Repost_Value[],
    ProductDescription?: string,
    urlImage?: string[],
}

export type LockedFields = {
    fileName: boolean,
    purchcasePrice: boolean,
    fee: boolean,
    installments: boolean,
    installment_value: boolean,
    class: boolean,
    category: boolean,
}

export type DetailStructure = {
    docId: string;
    hasImg: boolean;
}

type ArrayType = string[] | number[] | [{}]

export function equalsArray(array1: ArrayType, array2: ArrayType) {

    const array2Sorted = array2.slice().sort();

    const result = array1.length === array2.length && array1.slice().sort().every(function (value, index) {
        return value === array2Sorted[index];
    });

    return result
}


//         type ObjType = { [key: string]: string | number | [] }
//         interface IObjType extends Product { }
//         const newObj1: IObjType = obj1
