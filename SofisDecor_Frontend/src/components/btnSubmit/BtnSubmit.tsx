import { IButton } from "./submitSetting"

import styles from "./BtnSubmit.module.css"

const BtnSubmit = (props: IButton) => {

    return (
        <>
            {
                !props.isSandData ? (<button
                    type="submit"
                    className={styles.btn_submit}

                >{props.title}</button>) : (

                    <div className={styles.loader}></div>
                )
            }
        </>
    )
}

export default BtnSubmit