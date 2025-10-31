import { useEffect, useState } from 'react'
import styles from './Dropdown.module.css'
import { FaX } from 'react-icons/fa6'
import { InputHTMLAttributes } from "react"
import Input from '../Input/Input';

//Dopdown
export interface Dopdown extends InputHTMLAttributes<HTMLInputElement> {
    contents: string[];
    label?: string;
    value?: string;
    placeholder?: string;
    out_style?: string;
    xmark_clean?: string;
    prop_content: string
    change?: (value: string, value2: string) => void;
}

const Dropdown = (props: Dopdown) => {

    const [showOptions, setShowOptions] = useState(false)

    const [filter, setFilter] = useState<string>('')
    const [filterList, setFilterList] = useState<string[]>([])

    const handleShowOptions = () => {
        setShowOptions(!showOptions)
    }

    useEffect(() => {

        if (!filter) return

        const str_1 = filter.toLowerCase().trim()

        const filtered = props.contents.filter(el => {
            const _el = el.toLowerCase()

            if (_el.indexOf(str_1) !== -1) {
                return el
            }
        })

        setFilterList(filtered)

    }, [filter])


    const handleClean = () => {
        props.change!('', props.prop_content)
    }

    const handleDefault = () => {
        setFilterList([])
    }

    return (

        <label className={styles.dropdown_input}>
            <span className={styles.label}>{props.label}</span>
            <div className={styles.dropdown_input_container}>
                <input
                    {...props}
                    className={styles.input}
                    onClick={handleShowOptions}
                />
                <button type='button' onClick={handleClean} className={`${styles.clean} ${props.xmark_clean}`}>
                    <FaX />
                </button>
            </div>
            {
                showOptions && (<ul className={`${styles.options} ${props.out_style}`}>
                    {showOptions && filterList.length === 0 ? props.contents?.map((content) => (<li key={content} onClick={() => props.change!(content, props.prop_content)}>
                        <span>{content}</span>
                    </li>)) : filterList.map((content) => (<li key={content} onClick={() => props.change!(content, props.prop_content)}>
                        <span>{content}</span>
                    </li>))

                    }
                    <li className={`${styles.options_filter}`}>
                        <div className={`${styles.filter_content}`}>
                            <Input
                                type='text'
                                placeholder='Buscar...'
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                onDoubleClick={handleDefault}
                            />
                        </div>
                    </li>
                </ul>)
            }
        </label>

    )
}

export default Dropdown
