import express from 'express'
import cors from 'cors'

/* Routes */
import {
    router as saveDataRouter,
} from './src/routes/saveData/saveData'
import {
    router as updateDataRouter,
} from './src/routes/updateData/updateData'
import {
    router as deleteDataRouter,
} from './src/routes/deleteData/deleteData'

const app = express()
const PORT = 3000

/* Middlewares */
app.use(cors({
    origin: 'http://localhost:5173', // ou use '*' para permitir qualquer origem (não recomendado em produção)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json())
console.log('testando no index');

/* Routes */
app.use('/sofisdecor', saveDataRouter)
app.use('/sofisdecor', updateDataRouter)
app.use('/sofisdecor', deleteDataRouter)

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

