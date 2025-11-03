ESTRUTURA SOFISDECOR_SYSTEM

# SofisDecor_System
    # SofisDecor_Backend 
        * SRC 
            * Confi
            * Controllers
            * Middlewares
            * Models
            * Routes
                * deleData -> deleData.ts
                * saveDate -> saveDate.ts
                * updateDate -> updateDate.ts
            * Service
                * firebase.ts
            * Utilities
                * CRUD
                    * create.ts
                    * delete.ts
                    * update.ts 
        * index.ts
    # SofisDecor_Frontend
    # README.md


# frontend:

await fetch('/sofisdecor/delete/client', {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            docId: id,
        })
    }
)

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
        '/sofisdecor': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            secure: false
        }
        }
    }
})

# Backend:

deleteData.ts
  
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

------------------------------------------------------------------------------

index.ts
 
import express from 'express'
import cors from 'cors'

/* Routes */
import {
    router as saveDataRouter,
    router as updateDataRouter,
    router as deleteDataRouter,
} from './src/routes/saveData/saveData'

const app = express()
const PORT = 3000
    
/* Middlewares */
app.use(cors({
    origin: 'http://localhost:5173', // ou use '*' para permitir qualquer origem (não recomendado em produção)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json())

/* Routes */
app.use('/sofisdecor', saveDataRouter)
app.use('/sofisdecor', updateDataRouter)
app.use('/sofisdecor', deleteDataRouter)

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
