import { Link } from "react-router-dom";

import styles from "./Logo.module.css";
import logo from "../../assets/logo-img.png";

const Logo = () => {
    return (
        <div className={styles.logo_container}>
            <Link to='/'>
                <img src={logo} alt="Imegem do logo" className={styles.img_logo} />
                <span>Sofis<span className={styles.logo_hightlight}>Decor</span> Móveis</span>
            </Link>
        </div>
    )
}

export default Logo;


