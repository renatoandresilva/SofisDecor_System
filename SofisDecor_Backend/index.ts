import express from 'express'
import cors from 'cors'

/* Routes */
import { router as saveDataRouter } from './src/routes/saveData/saveData'

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

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

