import { InputHTMLAttributes } from 'react';

import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input = (props: InputProps) => {

    return (

        <label className={styles.container}>
            <span className={styles.title}>{props.label}</span>
            <input  {...props} />
        </label>
    )
}

export default Input


// const selectStyle: CSSProperties = {
//     flex: "1 0 60%",
//     height: "40px",
//     width: "100%",
//     padding: ".7rem 2em",
//     border: ".8px solid #ccc",
//     borderRadius: "6px",
// }
