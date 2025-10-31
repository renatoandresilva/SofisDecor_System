import { InputHTMLAttributes } from 'react'

import styles from './Checkbox.module.css'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label?: string,
}

const Checkbox_v2 = (props: Props) => {

    return (

        <label className={styles.box} >
            <span className={styles.check_title}>{!props.label ? 'Ativo' : props.label}</span>
            <div className={styles.check_input}>
                <input
                    {...props}
                />
            </div>
        </label>

    )
}

export default Checkbox_v2

