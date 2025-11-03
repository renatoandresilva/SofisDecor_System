import {
  useState,
  useEffect
} from 'react';

import { useNavigate } from 'react-router-dom';
import { db } from "../../service/dataConnection";
import styles from './Client.module.css'
import '../../App.css'

import {
  deleteFunc,
  createCharacters,
  get_DocsFunc,
  getRepeatedItems,
  getUniqueItemsByKey,
  fetchUpdateOrDeleteFnc
} from '../../interfaces/IUtilis/IUtilitis';
import {
  ClientData,
  Data_Structure
} from '../client_detail/ClientSetting';
import { UpdateOrDelete } from '../../interfaces/InterTypes/Types';

const Client = () => {

  const [filter, setFilter] = useState('')

  const [filterd, setFiltered] = useState<ClientData[]>([])
  const [table, setTable] = useState<ClientData[]>([])

  const navigate = useNavigate()

  // Functions
  const handleFilterByLattter = (letter: string) => {
    setFilter(letter)
  }

  const handleBtnActionsEdit = (id: string) => {
    const characters = createCharacters(70)
    navigate(`/client_detail/${characters}`, { state: id })

  }

  const handleBtnActionsDelete = async (id: string) => {

    if (!confirm('Esta ação não poderá ser desfeita. Continuar?')) return

    try {

      const data: UpdateOrDelete = {
        action: 'delete',
        collection: 'client',
        method: 'DELETE',
        header: {
          "Content-Type": "application/json"
        },
        body: {
          docId: id
        }
      }

      const fetchDate = await fetchUpdateOrDeleteFnc(
        data.action,
        data.collection,
        data.method,
        data.header,
        data.body
      ) as { msg: string, sucess: boolean }

      if (fetchDate.sucess) {
        alert(fetchDate.msg)
      } else {

        alert(fetchDate.msg)
      }

    } catch (error) {
      throw new Error(`Erro ao executar essa operação: ${error}`);
    }
  }

  // Use Effects
  useEffect(() => {

    const docsBase = async () => {

      try {

        await get_DocsFunc<Data_Structure>(db, 'client', false)
          .then(docBase => {

            let docs = docBase as Data_Structure[]

            const repeated = getRepeatedItems(docs, 'cpf')

            if (repeated.length !== 0) {

              repeated.forEach(item => {

                const removeItems = async () => {
                  try {

                    await deleteFunc(db, 'client', item.docId)

                  } catch (error) {

                    throw new Error("Erro ao excluir dados repetidos : " + error);

                  }
                }

                removeItems()
              })

              const filterd = getUniqueItemsByKey(docs, 'cpf')
              docs = filterd
            }

            setTable(docs)

          })

      } catch (error) {

        throw new Error("Erro ao buscar clientes" + error);

      }
    }

    docsBase()
  }, [])

  useEffect(() => {

    const filterTable = table.filter((el) => {
      const A = el.name.toLocaleLowerCase().trim()
      const B = filter.toLocaleLowerCase().trim()

      if (A.indexOf(B) !== -1) {
        return el
      }
    })

    // setFiltered([])
    const unique = filterTable.reduce((acc: ClientData[], curr: ClientData) => {

      const index = acc.find(item => item.id === curr.id)

      if (!index) {
        acc.push(curr)
      }

      return acc
    }, [])

    setFiltered(unique)
  }, [filter])

  return (
    <div className={styles.wrapper}>
      <h1>Lista de Clientes</h1>
      <div className={styles.getPage}>
        <span onClick={() => navigate('/client_detail/0')}>Cadastrar</span>
      </div>
      <div className={styles.table}>
        <div className={styles.filter}>
          <input
            type='text'
            placeholder='Pesquisar cliente...'
            value={filter}
            onChange={(e) => handleFilterByLattter(e.target.value)}
          />
        </div>
        <div className={styles.head}>
          <div>
            <span>Nome</span>
          </div>
          <div>
            <span>Whatsapp</span>
          </div>
          <div>
            <span>Residência</span>
          </div>
          <div>
            <span>Rua</span>
          </div>
          <div>
            <span>Bairro</span>
          </div>
          <div>
            <span>Cidade</span>
          </div>
          <div className={styles.empty}>
            <span>-----</span>
            <span>-----</span>
          </div>
        </div>
        < ul className={styles.table_list}>
          {
            filterd.length === 0 ? table.map((doc, index) => (
              <li key={index} className={styles.table_list_item}>
                <div className={styles.item_col1}>
                  <span>{doc.name}</span>
                  <span>{doc.whatsapp}</span>
                  <span>{doc.residence}</span>
                  <span>{doc.address.street}</span>
                  <span>{doc.address.neighborhood}</span>
                  <span>{doc.address.city}</span>
                </div>
                <div className={styles.item_col2}>
                  <button className={styles.edit} onClick={() => handleBtnActionsEdit(doc.docId!)}>Editar</button>
                  <button className={styles.trash} onClick={() => handleBtnActionsDelete(doc.docId!)}>Excluir</button>
                </div>
              </li>
            )) : filterd.map((doc, index) => (
              <li key={index} className={styles.table_list_item}>
                <div className={styles.item_col1}>
                  <span>{doc.name}</span>
                  <span>{doc.whatsapp}</span>
                  <span>{doc.residence}</span>
                  <span>{doc.address.street}</span>
                  <span>{doc.address.neighborhood}</span>
                  <span>{doc.address.city}</span>
                </div>
                <div className={styles.item_col2}>
                  <button className={styles.edit} onClick={() => handleBtnActionsEdit(doc.docId!)}>Editar</button>
                  <button className={styles.trash} onClick={() => handleBtnActionsDelete(doc.docId!)}>Excluir</button>
                </div>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  )
}

export default Client
