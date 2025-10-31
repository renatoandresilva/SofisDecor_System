import { Repost_Value } from '../catalog_detail/catalogSetting'

export type TategoryHome_struc = {
    id: string,
    docId?: string,
    fileName: string,
    category: string,
    class: string,
    infoSaleValue: Repost_Value[],
    installment_value: number,
    ProductDescription: string,
    urlImage: string[],
}

export type Doc = {
    id: string,
    fileName: string,
    category: string,
    class: string,
    infoSaleValue: Repost_Value[],
    ProductDescription: string,
    urlImage: string[],
}

export type Imgs = {
    class: string,
    id: string,
    index: number,
    url: string,
}

export type ImgsDoc = {
    class: string,
    objList: string,
    index: number,
    hasUrl: boolean
}



