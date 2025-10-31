export type Address = {

    zipcode: string;
    street: string;
    neighborhood: string;
    city: string;
}

export type ClientData = {
    name: string;
    cpf: string,
    whatsapp: string;
    residence: string;
    address: Address
    id?: string,
    docId?: string,
}

export type API_Struc = {
    cep: string,
    logradouro: string,
    bairro: string,
    localidade: string,
}

export type Data_Structure = ClientData & { docId: string }

