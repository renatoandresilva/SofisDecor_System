import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './saleList.module.css'
import { custom_style } from "../../interfaces/custom_styles/genral"
import { listStruc } from './saleListSettings'
import {
    deleteFunc,
    formatedNumber,
    createCharacters,
    get_DocsFunc,
    getRepeatedItems,
} from '../../interfaces/IUtilis/IUtilitis'
import { db, /*functions*/ } from '../../service/dataConnection'
import Input from '../../components/Input/Input'
// import {
//     httpsCallable
// } from "firebase/functions";

const SaleList = () => {

    const [data, setData] = useState<listStruc[]>([])
    const [dataFiltered, setDataFiltered] = useState<listStruc[]>([])
    const [filter, setFilter] = useState('')

    const navigate = useNavigate()

    const handleGoToSale = (id: string) => {

        navigate(`/sale/${createCharacters(70)}`, { state: id })
    }

    // Use Effect
    useEffect(() => {

        const fatch = async () => {

            try {

                await get_DocsFunc<listStruc>(db, 'sale', false)
                    .then(item => {

                        const docs = item as listStruc[]

                        const duplicates = getRepeatedItems<listStruc>(docs, 'clientName')

                        duplicates.forEach(element => {

                            const remove = async () => {

                                try {

                                    await deleteFunc(db, 'sale', element.docId)

                                } catch (error) {

                                    throw new Error("Não foi possível remover os duplicados " + error);

                                }
                            }

                            remove()
                        })

                        setData(docs)
                    })

            } catch (error) {

                throw new Error("Não foi possível obter os dados " + error);

            }
        }

        fatch()

    }, [])

    useEffect(() => {

        const filtered = data.filter(el => {
            const a = el.clientName.toLocaleLowerCase().trim()
            const b = filter.toLocaleLowerCase().trim()

            if (a.indexOf(b) !== -1) {
                return el
            }
        })

        const unique = filtered.reduce((acc: listStruc[], curr: listStruc) => {

            if (acc.every(el => el.clientName !== curr.clientName)) {

                acc.push(curr)
            }

            return acc
        }, [])

        setDataFiltered(unique)

    }, [filter])

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Lista de Vendas</h1>
            <div className={styles.action_link} onClick={() => navigate(`/sale/${createCharacters(70)}`)}>
                <span>Cadastrar</span>
            </div>
            <div className={styles.filter}>
                <Input
                    type='text'
                    placeholder='Buscar pelo clinte...'
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={custom_style}
                    className={styles.new_style}
                />
            </div>
            <div className={styles.table_header}>
                <span>Cliente</span>
                <span>Entrada</span>
                <span>$ Parcela</span>
                <span>Qtd Parcela</span>
                <span>Vencimento</span>
                <span>Data</span>
                <span>Pix</span>
            </div>
            <ul className={styles.table}>
                {
                    dataFiltered.length > 0 ? dataFiltered.map((item) => (<li key={item.id} className={styles.table_body}>
                        <span onClick={() => handleGoToSale(item.docId)}>{item.clientName}</span>
                        <span>{formatedNumber(item.initValue)}</span>
                        <span>{formatedNumber(item.valueInstallment)}</span>
                        <span>{item.qtdInstallment}</span>
                        <span>{item.dueDate}</span>
                        <span>{item.purchcaseDate}</span>
                        <span>{item.paymentAccount}</span>
                    </li>)) : data.length !== 0 && data.map((item, index) => (<li key={index} className={styles.table_body}>
                        <span onClick={() => handleGoToSale(item.docId)}>{item.clientName}</span>
                        <span>{formatedNumber(item.initValue)}</span>
                        <span>{formatedNumber(item.valueInstallment)}</span>
                        <span>{item.qtdInstallment}</span>
                        <span>{item.dueDate}</span>
                        <span>{item.purchcaseDate}</span>
                        <span>{item.paymentAccount}</span>
                    </li>))
                }
            </ul>
        </div>
    )
}

export default SaleList

// Use Effect
// useEffect(() => {

//     const fatch = async () => {

//         try {

//             const removeDuplicates = httpsCallable(functions, "removeDuplicates");

//             const data = {
//                 collection: 'sale',
//                 field: 'clientName'
//             }

//             await removeDuplicates(data)
//                 .catch(err => {

//                     throw new Error(`${err}`);
//                 })
//         } catch (error) {

//             throw new Error("Não foi possível remover os duplicados " + error);

//         }
//     }

//     fatch()
// }, [])
