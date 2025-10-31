import { Outlet } from "react-router-dom";
import Header from "../header/Header";

import styles from './Layout.module.css'

const Layout = () => {
    return (
        <div>
            <Header />
            <div className={styles.container}>
                <Outlet />
            </div>
        </div>
    )
}

export default Layout