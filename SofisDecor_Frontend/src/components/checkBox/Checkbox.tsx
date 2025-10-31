import { ChangeEvent, HtmlHTMLAttributes, useState, useEffect, useRef } from 'react'

import styles from './Checkbox.module.css'

interface Props extends HtmlHTMLAttributes<HTMLInputElement> {
    isUpdate: boolean,
    input_check: boolean,
    change_fnc: (check: boolean) => void
    label?: string,
    icon_style?: string,
    lablel?: string,
}

const Checkbox = (props: Props) => {

    const [update, setUpdate] = useState(false)

    const inputRef = useRef<null | HTMLInputElement>(null)

    const handleChange = (e: ChangeEvent) => {
        const target = e.target as HTMLInputElement

        props.change_fnc(target.checked)
    }

    useEffect(() => {

        setUpdate(props.isUpdate)

    }, [])

    useEffect(() => {

        if (props.input_check) {

            inputRef.current!.click();
        }
    }, [update]);

    return (

        <label className={styles.box} >
            <span className={styles.check_title}>{!props.label ? 'Ativo' : props.label}</span>
            <div className={styles.check_input}>
                <input
                    {...props}
                    type='checkbox'
                    value={`${props.input_check}`}
                    onChange={(e) => handleChange(e)}
                    ref={inputRef}

                />
            </div>
        </label>

    )
}

export default Checkbox

