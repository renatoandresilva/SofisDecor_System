import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Databse
import { db } from "../../service/dataConnection"
import {
    deleteFunc,
    formatedNumber,
    createCharacters,
    get_DocsFunc,
    sumProps,
} from "../../interfaces/IUtilis/IUtilitis"

import styles from './Cost.module.css'
import '../../App.css'

// Settings and types
import { FormDocument } from '../cost_detail/settingDetail'

type Structure = FormDocument & { docId: string }
type Table = {
    destiny: string,
    total: number,
    categ: string,
    Intallments: number,
    isActive: boolean,
    docId: string,
}

const Cost = () => {

    const navigate = useNavigate()

    const [filter, setFilter] = useState('')

    const [filterd, setFiltered] = useState<Table[]>([])
    const [table, setTable] = useState<Table[]>([])

    const handleFilter = (value: string) => {

        setFilter(value)
    }

    const handleBtnActionsEdit = (key: string) => {

        const id = key.slice(0, key.length - 1)

        navigate(`/cost/${createCharacters(50)}`, { state: id })
    }

    const handleBtnActionsDelete = (key: string) => {

        const id = key.slice(0, key.length - 1)

        if (confirm('Esta ação não poderá ser desfeita. continuar?')) {

            deleteFunc(db, '_cost', id)
        }
    }

    // Use Effect
    useEffect(() => {

        get_DocsFunc<Structure>(db, '_cost', false)
            .then(docsRef => {

                const tabeleRef: Table[] = []

                docsRef.forEach(docBaseRef => {

                    if (Array.isArray(docBaseRef.docs)) {

                        const obj: Table = {
                            destiny: docBaseRef.docs[0].destiny,
                            categ: docBaseRef.category,
                            Intallments: docBaseRef.docs.length,
                            total: sumProps(docBaseRef.docs, 'price'),
                            isActive: docBaseRef.isActive,
                            docId: docBaseRef.docId

                        }

                        tabeleRef.push(obj);
                    }

                    if (!Array.isArray(docBaseRef.docs)) {

                        const obj: Table = {
                            categ: docBaseRef.category,
                            destiny: docBaseRef.docs.destiny,
                            Intallments: 0,
                            isActive: docBaseRef.isActive,
                            total: docBaseRef.docs.price,
                            docId: docBaseRef.docId,
                        }

                        tabeleRef.push(obj);

                    }


                })

                setTable(tabeleRef)

            })

    }, [])

    useEffect(() => {

        const newList = table.filter(item => {
            const name1 = item.destiny.toLocaleLowerCase().trim()
            const name2 = filter.toLocaleLowerCase().trim()

            if (name1.indexOf(name2) !== -1) {
                return item
            }
        })

        setFiltered(newList)
    }, [filter])

    useEffect(() => {
        if (filter === "") {
            setFiltered([])
        }
    }, [filter])

    return (
        <main>
            <h1>Gerenciar Custo</h1>
            <div className={styles.out_page}>
                <span onClick={() => navigate('/cost/0')}>Cadastrar Custo</span>
            </div>
            <section className={styles.table_container}>
                <div className={styles.wrapper}>
                    <div className={styles.table_filter}>
                        <input
                            type='text'
                            placeholder='Buscar por...'
                            value={filter.trim()}
                            onChange={(e) => handleFilter(e.target.value)}
                        />
                    </div>
                    <div className={styles.table_header}>
                        <div className={styles.header_content}>
                            <span>Custo com</span>
                            <span>Valor</span>
                            <span>Categoria</span>
                            <span>Parcelas</span>
                            <span>Ativo</span>
                        </div>
                        <div className={styles.header_untitle}>
                            <span>---</span>
                            <span>---</span>
                        </div>
                    </div>
                    <ul className={styles.table}>
                        {
                            filterd.length === 0 ? table.map((doc) => (
                                <li key={doc.docId}>
                                    <div className={styles.li_content}>
                                        <span>{doc.destiny}</span>
                                        <span>{formatedNumber(doc.total)}</span>
                                        <span>{doc.destiny}</span>
                                        <span>{doc.Intallments > 0 ? doc.Intallments : '---'}</span>
                                        <span>{doc.isActive ? 'Sim' : 'Não'}</span>
                                    </div>
                                    <div className={styles.li_actions}>
                                        <button className={styles.edit} onClick={() => handleBtnActionsEdit(doc.docId! + 1)}>Editar</button>
                                        <button className={styles.trash} onClick={() => handleBtnActionsDelete(doc.docId! + 2)}>Excluir</button>
                                    </div>
                                </li>
                            )) : filterd.map((doc) => (
                                <li key={doc.docId}>
                                    <div className={styles.li_content}>
                                        <span>{doc.destiny}</span>
                                        <span>{formatedNumber(doc.total)}</span>
                                        <span>{doc.destiny}</span>
                                        <span>{doc.Intallments > 0 ? doc.Intallments : '---'}</span>
                                        <span>{doc.isActive ? 'Sim' : 'Não'}</span>
                                    </div>
                                    <div className={styles.li_actions}>
                                        <button className={styles.edit} onClick={() => handleBtnActionsEdit(doc.docId! + 1)}>Editar</button>
                                        <button className={styles.trash} onClick={() => handleBtnActionsDelete(doc.docId! + 2)}>Excluir</button>
                                    </div>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </section>
        </main>
    )
}

export default Cost




