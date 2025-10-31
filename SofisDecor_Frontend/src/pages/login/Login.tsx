import { useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";

import Input from "../../components/Input/Input";

import { auth } from "../../service/dataConnection";
import { signInWithEmailAndPassword } from "firebase/auth";

import styles from "./Login.module.css"

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = (e: FormEvent) => {
        e.preventDefault();

        if (email === "" || password === "") {
            return alert('Preencha os campos obrigatórios');
        }

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {

                navigate('/', { replace: true })
            })
            .catch((error) => {
                alert(`Usuario não autenticado. Erro: ${error}`)
            })
    }

    return (
        <>
            <h1>Acessar ao Sitema</h1>
            <form className={styles.form} onSubmit={handleRegister}>
                <div>
                    <Input
                        type="text"
                        placeholder="Digite seu email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <Input
                        type="password"
                        placeholder="******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <button type="submit">Acessar</button>
                </div>
            </form>
        </>
    )
}

export default Login;