import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Catalog.module.css'

import { db } from '../../service/dataConnection'
import { getDocsFunc, DataRef, createCharacters } from '../../interfaces/IUtilis/IUtilitis'
import { getfile, checkPermission } from '../../interfaces/IUtilis/IUtilitis'
import { TategoryHome_struc } from '../catalog_home/catalogHomeSetting'

const Catalog = () => {

    const [user, setUser] = useState(false)

    const navigate = useNavigate()

    const handleGoToCatalogDetail = () => {
        navigate(`/catalog_detail/${createCharacters(15)}`)
    }

    const handleCategiriesBtn = (e: FormEvent) => {
        const target = e.target as HTMLSpanElement

        navigate(`/catalog_home/${target.dataset.id}`, { state: target.dataset.id })
    }

    async function getData() {

        try {
            await getDocsFunc(db, 'product', false).then(item => {

                const testData = item as DataRef[]

                testData?.forEach(el => {
                    const data = el.docData as TategoryHome_struc
                    data.docId = el.docId

                    const dataImgs = data.urlImage as string[]

                    const images: string[] = []

                    dataImgs.forEach((element: string) => {

                        getfile(element).then(image => {

                            images.push(image!)
                        })
                    });

                    data.urlImage = images
                })
            })
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getData()
        setUser(checkPermission())

    }, [])

    return (
        <div className={styles.catalog_container}>
            <h1>Catálago</h1>
            {
                user && (<div className={styles.link}>
                    <span onClick={handleGoToCatalogDetail}>Gerenciar Catálogo</span>
                </div>)
            }
            <div className={styles.category_info}>
                <p>Compre em até 12x no <strong>carnê</strong>, à vista <strong>15%</strong> de desconto,</p>
                <p>cartão de crédito <strong>9%</strong>, entrega e montagem gratuitas.</p>
            </div>
            <h4>Categorias</h4>
            <div className={styles.category} onClick={handleCategiriesBtn}>
                <span data-id={'quarto'} className={styles.btn}>Quarto</span>
                <span data-id={'sala'} className={styles.btn}>Sala</span>
                <span data-id={'cozinha'} className={styles.btn}>Cozinha</span>
                <span data-id={'banheiro'} className={styles.btn}>Banheiro</span>
                <span data-id={'área'} className={styles.btn}>Área</span>
                <span data-id={'infantil'} className={styles.btn}>Infantil</span>
            </div>
        </div>
    )
}

export default Catalog