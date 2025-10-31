export const selectionList: string[] = [
    'Variavel',
    'Fixo Determinado',
    'Fixo Indeterminado',
]

export type InfoPayment_struc = {
    paymentDate: string,
    value: number,
    isPaid: boolean,
    fee_over?: number,
    id?: string,
    destiny?: string,
    identifier?: string,
}

export type FormStruc = {
    destiny: string,
    category: string,
    isActive: boolean,
    info_payment: InfoPayment_struc[],
    difference?: number,
    fee?: number,
    determinate_time: number,
    dateCost: string,
    docId?: string,
    id?: string,
}

export type VariableCost = {
    destiny: string,
    price: number,
    date: string
    id: string,
    isActive: boolean,
    category?: string,
}

export type IndeterminateCost = {
    destiny: string,
    price: number,
    isPaid: boolean,
    dueDay: number,
    id: string,
    isActive: boolean,
    category?: string,
    date: string,
}

export type DeterminateCost = {
    destiny: string,
    price: number,
    isPaid: boolean,
    date: string,
    fee_over: number,
    valuePaid: number,
    id: string,
    isActive: boolean,
    category?: string,
}

export type DatabaseStructure = {
    destiny: string,
    price: number,
    date: string,
    dueDay: number,
    fee_over: number,
    valuePaid: number,
    id: string,
    isPaid: boolean,
    isActive: boolean,
}

export type FormDocument = {
    category: string,
    isActive: boolean,
    docs: IndeterminateCost | DeterminateCost[] | VariableCost;
    type?: string,
    total?: number,
    totalLeft?: number,
    responsible?: string,
}



