export type Attr = {
    prop: Object | any[] | null;
    objKey: string;
    left?: string[];
    noVerify: boolean;
}

export type IData = {
    action: string,
    method: string,
    header: HeadersInit | undefined,
    body: Object
}

export type UpdateOrDelete = {
    action: string,
    collection: string,
    method: string,
    header: HeadersInit | undefined,
    body: Object
}

/*
    {
        prop2: null, // ou os dados a comparar
        objKey: "id",
        left: ['address'], // propriedades que não devem ser verificadas
        noVerify: true
    }

*/