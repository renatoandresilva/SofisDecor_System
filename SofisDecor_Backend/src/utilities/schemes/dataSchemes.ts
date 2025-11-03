import { z, ZodError } from "zod";

export type SchemeMap = typeof schemes;
export type SchemeKey = keyof SchemeMap;
export type InferScheme<T extends SchemeKey> = z.infer<SchemeMap[T]>;

const IndeterminateCostSchema = z.object({
    destiny: z.string(),
    price: z.number(),
    isPaid: z.boolean(),
    dueDay: z.number(),
    id: z.string(),
    isActive: z.boolean(),
    date: z.string(),
    category: z.string().optional(),
});

const DeterminateCostSchema = z.object({
    destiny: z.string(),
    price: z.number(),
    isPaid: z.boolean(),
    date: z.string(),
    fee_over: z.number(),
    valuePaid: z.number(),
    id: z.string(),
    isActive: z.boolean(),
    category: z.string().optional(),
});

const VariableCostSchema = z.object({
    destiny: z.string(),
    price: z.number(),
    date: z.string(),
    id: z.string(),
    isActive: z.boolean(),
    category: z.string().optional(),
});


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
        docs: z.object({

        })
    }),
    _cost: z.object({
        category: z.string(),
        isActive: z.boolean(),
        docs: z.union([
            IndeterminateCostSchema,
            z.array(DeterminateCostSchema),
            VariableCostSchema,
        ]),
        type: z.string().optional(),
        total: z.number().optional(),
        totalLeft: z.number().optional(),
        responsible: z.string().optional(),

    })
    // Adicione outros esquemas conforme necessário
};

