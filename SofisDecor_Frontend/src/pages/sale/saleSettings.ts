import { CSSProperties } from "react";

export const dispay_none: CSSProperties = {
    display: 'none',
}

export type PaymentInfo = {
    paymentDate: string,
    numberInstallment: number,
    installment?: number,
    valuePaid: number,
    isPaid?: boolean,
    valueLeft?: number,
    client?: string,
    rest?: number,
    id?: string,
    repeated?: string // verificar uso
}

export type Product = {
    product: string,
    price: number,
    IsPaid?: boolean
    id?: string
}

export type PieceOfSale = {
    info_product: Product,
    payment_info: PaymentInfo,
}

export type SaleStruc = {
    products: Product[],
    initValue: number,
    purchcaseDate: string,
    qtdInstallment: number,
    valueInstallment: number,
    paymentAccount: string,
    dueDate: string,
    paymentInfoList: PaymentInfo[],
    clientName: string,
    id?: string,
    docId?: string,
}

