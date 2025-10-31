import { ReactNode, useState, useEffect } from 'react';
import { auth } from '../service/dataConnection';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';

interface PrivateProps {
    children: ReactNode
}

const Private = ({ children }: PrivateProps): any => {
    const [loading, setLoading] = useState(true);
    const [signed, setSigned] = useState(false);

    useEffect(() => {

        const unsub = onAuthStateChanged(auth, (user) => {

            if (user) {

                const userData = {
                    uid: user?.uid,
                    email: user?.email
                }

                localStorage.setItem('@sofisDecor', JSON.stringify(userData))
                setLoading(false)
                setSigned(true)
            } else {
                setLoading(false)
                setSigned(false)
            }
        })

        return () => {
            unsub()
        }

    }, [])

    if (loading) {
        return <div><h1>Carregando</h1></div>
    }

    if (!signed) {
        return <Navigate to='/login' />
    }
    return children
}

export default Private