import styles from './Model.module.css'
import { formatedNumber } from '../../interfaces/IUtilis/IUtilitis'
import { Product } from '../../pages/sale/saleSettings';
import { FormEvent, useEffect, useState } from 'react';

import { AiTwotoneCheckCircle, AiTwotoneCloseCircle } from "react-icons/ai"

type Header = string[]

interface IModel {
    header: Header;
    isOpened: boolean;
    content_list: Product[];
    sumOfList: number;
    isOpen_fnc: (isOpen: boolean) => void;
    action?: (e: FormEvent) => void;
    delete_fnc?: (e: FormEvent) => void;
}

type Element = { name: string, price: number }

const Model = (props: IModel) => {
    const data = props.content_list

    const [list, setList] = useState<number[]>([])

    const handleClouseModal = () => {
        props.isOpen_fnc(!props.isOpened)
    }

    useEffect(() => {

        const arrNum: Element[] = []

        data.forEach(item => arrNum.push({ name: item.product, price: Number(item.price) }))

        const nums = arrNum.reduce((acc: Element[], curr: Element) => {
            const index = acc.find(el => el.name === curr.name)

            if (!index) {
                acc.push(curr)
            }

            return acc
        }, [])

        const arrFinal: number[] = []
        nums.forEach(item => arrFinal.push(Number(item.price)))

        setList(arrFinal)
    }, [])

    if (props.isOpened) {

        return (
            <div className={styles.wrapper}>

                <div className={styles.wrapper_list}>
                    <div className={styles.list_header}>
                        <ul className={styles.titles}>

                            {
                                props.header.map((item, index) => (<li key={index} className={styles.first_element}>{item}</li>))
                            }

                        </ul>
                        <div>
                            <span onClick={handleClouseModal}>Fechar</span>
                        </div>
                    </div>
                    <ul className={styles.list} onClick={props.action}>
                        {
                            data && data.length > 0 && data.map((item, index) => (
                                <li key={index} className={styles.list_content} >
                                    <div>
                                        <span>{item.product}</span>
                                        <span>{formatedNumber(item.price)}</span>
                                        {
                                            props.header.length > 2 && list.length > 0 && (<span>{item.IsPaid ? <AiTwotoneCheckCircle className={styles.checked} /> : <AiTwotoneCloseCircle className={styles.unchecked} />}</span>)
                                        }
                                    </div>
                                    <div>
                                        <span data-name='edit' data-id={index} className={styles.edit}>Editar</span>
                                        <span data-name='remove' data-id={index} className={styles.delete}>Excluir</span>
                                    </div>
                                </li>
                            ))
                        }
                    </ul>
                </div>
                <div className={styles.sum}>
                    <span>Total</span>
                    <span>{props.sumOfList ? formatedNumber(props.sumOfList) : 0}</span>
                </div>
            </div>
        )

    }


}

export default Model

