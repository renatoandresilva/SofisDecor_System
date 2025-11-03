import express from 'express';
import { deleteDocFnc } from '../../utilities/crud/delete'
import { db } from "../../services/firebase";

const router = express.Router();

router.delete('/delete/:collection', async (req, res) => {

    const collectionName = req.params.collection;
    const { docId, filter, deleteAll } = req.body;

    try {
        const result = await deleteDocFnc(db, collectionName, {
            docId,
            deleteAll,
            filter: Array.isArray(filter) ? filter : undefined
        });

        res.status(200).json(result);

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ msg: 'Erro ao excluir documentos.', error: error.message });
        } else {
            res.status(500).json({ msg: 'Erro ao excluir documentos.', error: String(error) });
        }
    }
});

export { router };

/*
    Exemplo de chamada do frontend
    
    🔹 Excluir por ID:
    DELETE /delete/clientes
    Content-Type: application/json
    {
    "docId": "abc123"
    }

    🔹 Excluir por filtro
    DELETE /delete/logs
    Content-Type: application/json
    {
    "deleteAll": true
    }

    🔹 Excluir toda a coleção
    DELETE /delete/logs
    Content-Type: application/json

    {
    "deleteAll": true
    }

  ---------------------------------------------------------------------------------------------------------------------
  Função a ser Implementada no futuro. Exige permissão do usauário

    import express from 'express';
    import { deleteDocFnc } from './deleteDocFnc';
    import { db } from './firebase';
    import { authMiddleware } from './middlewares/auth'; // seu middleware de autenticação

    const router = express.Router();

    // 🔐 Aplica autenticação antes da rota
    router.delete('/delete/:collection', authMiddleware, async (req, res) => {
    const collectionName = req.params.collection;
    const { docId, filter, deleteAll } = req.body;

    // ✅ Verifica se o usuário é admin
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ msg: 'Acesso negado. Permissão de administrador necessária.' });
    }

    try {
        const result = await deleteDocFnc(db, collectionName, {
        docId,
        deleteAll,
        filter: Array.isArray(filter) ? filter : undefined
        });

        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(500).json({ msg: 'Erro ao excluir documentos.', error: errMsg });
    }
    });

    export default router;

*/

