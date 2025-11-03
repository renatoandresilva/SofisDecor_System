import express from "express";
import { db } from "../../services/firebase";
import {
    addDocFnc
} from '../../utilities/crud/create'
import {
    schemes,
} from "../../utilities/schemes/dataSchemes";

/* Types */
import type {
    SchemeMap,
    SchemeKey,
    InferScheme
} from "../../utilities/schemes/dataSchemes";

const app = express();
const router = express.Router();

app.use(express.json());

router.post('/save', async (req, res) => {
    const { collectionName, structure, attr } = req.body;

    const schema = schemes[collectionName as SchemeKey];
    if (!schema) {
        return res.status(400).json({ msg: "Coleção inválida ou não adiconada ao schemes." });
    }

    const parsed = schema.safeParse(structure);
    if (!parsed.success) {

        return res.status(400).json({ msg: "Dados inválidos", });
    }

    try {

        const result = await addDocFnc<InferScheme<typeof collectionName>>(parsed.data, db, collectionName, attr);
        res.status(200).json(result);

    } catch (error) {

        res.status(500).json({ msg: "Erro ao salvar: " + error });
    }

});

export { router };