import { NavLink } from "react-router-dom";
import { FaHouseChimneyWindow } from 'react-icons/fa6'

import { checkPermission } from "../../interfaces/IUtilis/IUtilitis";
import Logo from "../logo/Logo";

// Styles
import styles from './Header.module.css';
import { useEffect, useState } from "react";

const Header = () => {

  const [isPermited, setIsPermited] = useState(false)

  useEffect(() => {
    setIsPermited(checkPermission())
  }, [])

  return (
    <header className={styles.container}>
      <nav className={styles.centralizer}>
        <Logo />
        <div className={styles.links}>
          {
            isPermited && (<div>
              <NavLink to='/'><FaHouseChimneyWindow style={{ color: '#165d62', fontSize: '18px' }} /></NavLink>
            </div>)
          }
          {
            isPermited && (<div className={!isPermited ? styles.displaynone : ''}>
              <NavLink to='/client' className={`${!isPermited ? styles.displaynone : ''} links`} > Clintes</NavLink>
            </div>)
          }
          {
            isPermited && (<div className={!isPermited ? styles.displaynone : ''}>
              <NavLink to='/sale' className='links'> Vendas</NavLink>
            </div>)
          }
          {
            isPermited && (<div className={!isPermited ? styles.displaynone : ''}>
              <NavLink to='/cost' className='links'>Custos</NavLink>
            </div>)
          }
          <div className={!isPermited ? styles.displaynone : ''}>
            <NavLink to='/catalog' className='links'>Catálogo</NavLink>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header

/* `${!isPermited ? styles.displaynone : ''} links` */