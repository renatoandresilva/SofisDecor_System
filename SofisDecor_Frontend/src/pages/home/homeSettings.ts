import { PaymentInfo } from "../sale/saleSettings"
import {
    DeterminateCost,
    IndeterminateCost,
    VariableCost,
    FormDocument
} from "../cost_detail/settingDetail"
import { SaleStruc } from "../sale/saleSettings"

export type Info = {
    paymentDate: string,
    numberInstallment: number,
    account_name: string,
    initValue: number,
    valuePaid: number,
    installment?: number,
    isPaid?: boolean,
    valueLeft?: number,
    client?: string,
    rest?: number,
    id?: string
    repeated?: string,
    installmentOrder: number
}

export type DataSale = {
    totalsales: number,
    sales_true: Info[],
    sales_false: Info[],
    renato_Account: number,
    ismael_Account: number,
}

export type Determinates = {

    costs_true: DeterminateCost[],
    costs_false: DeterminateCost[],
}

export type Others = {

    variable: {
        _false: VariableCost[],
        _true: VariableCost[],
    }

    indeterminate: {
        _false: IndeterminateCost[],
        _true: IndeterminateCost[],
    }
}

export type DataCost = {

    determinate: Determinates,
    others: Others

}

export type MainDoc_sale = {
    sales: DataSale,
}

export type MainDoc_cost = {
    costs: DataCost
}

export type Forecast = {
    shortTime: PaymentInfo[],
    longTime: PaymentInfo[],
}

export type ListInfo = {
    date: string,
    price: number,
    fee_day: number,
    currentPrice: number,
    isLater: boolean,
    _id: string,
    isPaid: boolean,
}

export type ListInfo_1 = {
    destiny: string;
    price: number;
    date: string;
    _id: string;
    isActive: boolean;

}

export type ListInfo_2 = {
    destiny: string;
    price: number;
    isPaid: boolean;
    dueDay: number;
    _id: string;
    isActive: boolean;
}

export type CostView = {
    destiny: string,
    list: ListInfo | ListInfo_1 | ListInfo_2,
    id: string,
    order?: number,
    day?: number,
    _date?: string,
    has_date: boolean,
    fee_day: number,
    currentPrice: number,
    isPaid: boolean,
    isLater: boolean,
}

export type Deposit = {
    product: string,
    price: number,
    id?: string,
    date: string,
    return: boolean,
    valueBack?: number,
    isActive: boolean,
}

export type Deplicates = {
    elements: SaleStruc[],
    id?: string,
}

export type ProductBack = {
    product: string,
    price: number,
    date: string,
    active: boolean,
}

/*----------------------------------------------------------*/
export type DocShot = SaleStruc & { docId: string }
export type CostShot = FormDocument & { docId: string }
export type docType = {
    destiny: string;
    valuePaid?: number;
    _isLater: boolean;
    price: number;
    date: string;
    id: string;
    isActive: boolean;
    category: string | undefined;
    isPaid?: boolean;
    dueDay?: number;
    fee_over?: number;
    idRef: string;
}

export type BalanceOfTheMonth = {
    initValueIn: number,
    installmentsIn: number,
}

export interface TypeCostStructure {
    'Variavel': CostShot[],
    'Fixo Determinado': CostShot[],
    'Fixo Indeterminado': CostShot[],
}

export const typeCostList = [
    'VariableCost',
    'indeterminate',
    'indeterminate',
]

export type _Payment = PaymentInfo & { installmentOrder: number, orderId: string, accountName: string, docId: string }

