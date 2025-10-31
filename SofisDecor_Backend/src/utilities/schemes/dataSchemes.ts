import { z, ZodError } from "zod";

export type SchemeMap = typeof schemes;
export type SchemeKey = keyof SchemeMap;
export type InferScheme<T extends SchemeKey> = z.infer<SchemeMap[T]>;

export const schemes = {

    client: z.object({
        name: z.string(),
        cpf: z.string(),
        whatsapp: z.string(),
        residence: z.string(),
        address: z.object({
            zipcode: z.string(),
            street: z.string(),
            neighborhood: z.string(),
            city: z.string(),
        }),
        id: z.string().optional(),
        docId: z.string().optional(),
    }),

    // Adicione outros esquemas conforme necessário
};

