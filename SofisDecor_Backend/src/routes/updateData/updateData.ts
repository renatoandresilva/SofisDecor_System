import express from 'express';
import { updateDocFnc } from '../../utilities/crud/update';
import { db } from '../../services/firebase'; // instância do Firestore
// import { authMiddleware } from './middlewares/auth'; // middleware de autenticação

const router = express.Router();

router.put('/update/:collection', /*authMiddleware,*/ async (req, res) => {
    const collectionName = req.params.collection;
    const { docId, filter, onlyIfChanged, newData } = req.body;

    // 🔐 Verifica se o usuário é admin
    //   if (!req.user || !req.user.isAdmin) {
    //     return res.status(403).json({ msg: 'Acesso negado. Permissão de administrador necessária.' });
    //   }

    // 🧼 Validação básica
    if (!newData || typeof newData !== 'object') {
        return res.status(400).json({ msg: 'Dados de atualização inválidos ou ausentes.' });
    }

    try {
        const result = await updateDocFnc(db, collectionName, newData, {
            docId,
            filter,
            onlyIfChanged
        });

        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(500).json({ msg: 'Erro ao atualizar documento.', error: errMsg });
    }
});

export { router };

/* 
    ✅ Exemplo de chamada do frontend
    🔹 Atualizar por ID:
    PUT /update/clientes
    Content-Type: application/json
    Authorization: Bearer <token>

    {
        "docId": "abc123",
        "newData": {
            "nome": "Renato",
            "ativo": true
        },
        "onlyIfChanged": true
    }

    🔹 Atualizar por filtro
    PUT /update/clientes
    Content-Type: application/json
    Authorization: Bearer <token>

    {
        "filter": { "email": "renato@email.com" },
        "newData": {
            "ativo": false
        }
    }

    
*/