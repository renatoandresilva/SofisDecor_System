import { FormEvent, useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { FaCheck } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

import { db } from "../../service/dataConnection"
import {
  getDocFnc,
  updateDocFunc,
  accountNames,
  createCharacters,
  formatedNumber,
  deleteFunc,
  getDatesFromDate,
  splitDate_1,
  _addDocFnc,
  arraysDeObjetosIguais,
  get_DocsFunc,
  KeyTest
} from "../../interfaces/IUtilis/IUtilitis"

import Dropdown from "../../components/dropdown/Dropdown"
import Model from "../../components/Model/Model"
import Checkbox_v2 from "../../components/checkBox _v2/Checkbox_v2"
import BtnSubmit from "../../components/btnSubmit/BtnSubmit"

import Input from "../../components/Input/Input"

import styles from "./Sale.module.css";
import { custom_style } from "../../interfaces/custom_styles/genral"
import '../../App.css'

// Interfaces and Types
import { SaleStruc, PieceOfSale, PaymentInfo, Product } from './saleSettings'
import { Data_Structure } from "../client_detail/ClientSetting";

const saleForm: SaleStruc = {
  products: [],
  initValue: 0,
  purchcaseDate: "",
  qtdInstallment: 0,
  valueInstallment: 0,
  paymentAccount: '',
  dueDate: '',
  paymentInfoList: [],
  clientName: '',
}

const pieceOfSale: PieceOfSale = {
  info_product: {
    product: '',
    price: 0,
  },

  payment_info: {
    paymentDate: '',
    numberInstallment: 0,
    installment: 0,
    valuePaid: 0,
    isPaid: false,
    client: '',
    rest: 0,
  }
}

const Sale = () => {

  const [formInput, setFormInput] = useState(saleForm)
  const [piece_ofSale, setPiece_ofSale] = useState(pieceOfSale)

  const [markLi, setMarkLi] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isPaidTag, setisPaidTag] = useState(false)
  const [isVerified, setIsVerified] = useState(true)

  const [clientName, setClietName] = useState('')
  const [listCalc, setListCalc] = useState(0)
  const [nameAccount, setNameAccount] = useState('')
  const [indexLi, setIndexLi] = useState<null | number>(null)
  const [correctProduct, setCorrectProduct] = useState<null | number>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [clientList, setClientList] = useState<string[]>([])
  const [paymentList, setPaymentList] = useState<PaymentInfo[]>([])

  const header = ['Produto', 'Preço']
  const location = useLocation()
  const nevigate = useNavigate()

  /* HANDLE FUCNTIONS */
  const handleSubmitData = async (e: FormEvent) => {
    e.preventDefault()

    try {

      // Validate fields
      if (!validateForm().valid && !location.state) {
        return alert(validateForm().msg)
      }

      const oldData = localStorage.getItem('@Data')
      const _oldData = JSON.parse(oldData!) as SaleStruc

      setLoading(true)

      // Updated
      if (location.state) {

        if (indexLi === null) {

          if (!arraysDeObjetosIguais<PaymentInfo>(formInput.paymentInfoList, _oldData.paymentInfoList) || !arraysDeObjetosIguais<Product>(products, _oldData.products)
          ) {

            formInput.products = products
            formInput.paymentInfoList = paymentList

            await deleteFunc(db, 'sale', location.state)

            await _addDocFnc<SaleStruc>(formInput, db, 'sale')

            alert("Atualizado com sucesso.")

            localStorage.removeItem('@Data')

            nevigate('/sale')
            return
          }

          await updateDocFunc(db, 'sale', location.state, formInput)
          localStorage.removeItem('@Data')
          alert("Atualizado com sucesso.")

          nevigate('/sale')
          return
        }

        if (piece_ofSale.payment_info.valuePaid === 0) {
          setLoading(false)
          return alert('Campo Valo Pago deve ser preenchido.')
        }

        if (!piece_ofSale.payment_info.isPaid) {
          setLoading(false)
          return alert('Campo Ativo deve ser preenchido.')
        }

        await updateDocFunc(db, 'sale', location.state, formInput)
        nevigate('/sale')
        return
      }

      // Create
      const compare: KeyTest<SaleStruc, PaymentInfo[]> = {
        prop1: 'paymentInfoList' as keyof SaleStruc,
        prop2: formInput.paymentInfoList as PaymentInfo[],
        objKey: 'id',
        left: null,
        noVerify: true,
      }

      await _addDocFnc<SaleStruc>(formInput, db, 'sale', compare)
        .then(resp => {

          if (!resp.isSaved) return alert(resp.msg)

          alert(resp.msg)
        })

      nevigate('/sale')

    } catch (error) {

      throw new Error("An error occurred: " + error);

    }
  }

  const handleInputChange = (e: FormEvent) => {
    const target = e.target as HTMLInputElement

    if (target.dataset.piece) {

      if (Number(target.dataset.piece) < 5) {

        const result = { ...piece_ofSale.info_product, [target.name]: target.value }

        setPiece_ofSale({ ...piece_ofSale, ['info_product']: result })

        return
      }

      const result = { ...piece_ofSale.payment_info, [target.name]: target.value }

      setPiece_ofSale({ ...piece_ofSale, ['payment_info']: result })

      return

    }

    setFormInput({ ...formInput, [target.name]: target.value })
  }

  const handleInsertItemInList = () => {

    if (piece_ofSale.info_product.product === '' || piece_ofSale.info_product.price === 0) {
      return alert('Campo produto e preço devem ser preenchidos.')
    }

    if (correctProduct !== null) {
      products.splice(correctProduct, 1, piece_ofSale.info_product)

      let calc = 0
      products.forEach(acc => {

        calc += Number(acc.price)

      })

      setListCalc(calc)
      setCorrectProduct(null)
      setPiece_ofSale(pieceOfSale)
      return
    }

    setProducts(item => [...item, piece_ofSale.info_product])
    setIsVerified(false)
  }

  const handleCreateInstallmens = (date: string) => {

    getDatesFromDate(date, formInput.qtdInstallment)

    if (!date) return

    const list: PaymentInfo[] = []
    const dates = getDatesFromDate(date, formInput.qtdInstallment)

    dates!.forEach(item => {
      const Info_installments: PaymentInfo = {
        paymentDate: item as string,
        numberInstallment: formInput.qtdInstallment,
        installment: formInput.valueInstallment,
        valuePaid: 0,
        isPaid: false,
        client: formInput.clientName,
        rest: 0,
        id: createCharacters(dates?.length!),
        repeated: item as string
      }

      list.push(Info_installments)
    })

    const uniqueItems = list.reduce((acc: PaymentInfo[], curr) => {

      if (acc.every(el => el.id !== curr.id)) {
        acc.push(curr)
      }

      return acc

    }, [])

    setPaymentList(uniqueItems)

  }

  const handleEditOrRemoveDataInModel = (e: FormEvent) => {
    const target = e.target as HTMLSpanElement

    if (target.dataset.name === 'edit') {

      const elementId = Number(target.dataset.id)

      const currEl = products[elementId]

      setPiece_ofSale({ ...pieceOfSale, ['info_product']: currEl })
      setCorrectProduct(elementId)
      return
    }

    if (target.dataset.name === 'remove') {

      if (location.state) {
        return alert('Ação não executada. Pois os dados já estão cadastrados.')
      }

      const elementId = Number(target.dataset.id)

      const list = products
      list.splice(elementId, 1)

      let calc = 0
      list.forEach(acc => {

        calc += Number(acc.price)

      })

      setProducts(list)
      setListCalc(calc)
      return

    }

  }

  const handleDeleRecord = () => {

    if (confirm('Esta ação não poderá ser desfeita. Continuar?')) {
      deleteFunc(db, 'sale', location.state)
      nevigate('/sale')
    }
  }

  const handleUpdateInfo = (index: number, value: number) => {

    const element = paymentList[index]

    const data = {
      ...element,
      ['valuePaid']: value
    }

    setIndexLi(index)
    setMarkLi(!markLi)
    setisPaidTag(!isPaidTag)
    setPiece_ofSale({ ...piece_ofSale, ['payment_info']: data })
  }

  const handlePieceOfSale = (e: FormEvent) => {
    const target = e.target as HTMLInputElement

    const obj = piece_ofSale.payment_info

    const debts = paymentList.reduce((acc: number, cur) => {
      return acc + Number(cur.installment)
    }, 0)

    const sumValuePaid = paymentList.reduce((acc: number, cur) => {
      return acc + Number(cur.valuePaid)
    }, 0)

    const newData = {
      ...obj,
      ['isPaid']: target.checked,
      ['rest']: piece_ofSale.payment_info.installment! - piece_ofSale.payment_info.valuePaid,
      ['valueLeft']: debts - sumValuePaid
    }

    if (indexLi !== null) {

      paymentList[indexLi] = newData

    } else {
      paymentList[indexLi!] = obj
    }

    setPiece_ofSale({ ...piece_ofSale, ['payment_info']: newData })

  }

  const handleDropdownContent = (value: string, value2: string) => {
    setFormInput({ ...formInput, [value2]: value })

  }

  /* FUNCTIONS */
  function validateForm() {

    if (piece_ofSale.info_product.product === '') {
      return {
        valid: false,
        msg: 'Informe o produto'
      }
    }

    if (piece_ofSale.info_product.price < 500) {
      return {
        valid: false,
        msg: 'Informe o preço do produto ou valor do inferior a 500'
      }
    }

    if (formInput.initValue < 0) {
      return {
        valid: false,
        msg: 'Valor de entrada não pode ser negativo'
      }
    }

    if (formInput.valueInstallment < 130) {
      return {
        valid: false,
        msg: 'Parcela mínima: R$ 130,00'
      }
    }

    if (formInput.qtdInstallment < 1) {
      return {
        valid: false,
        msg: 'Qtd deve ser maior que zero'
      }
    }

    if (formInput.dueDate === '') {
      return {
        valid: false,
        msg: 'Informe o vencimento'
      }
    }

    if (formInput.clientName === '') {
      return {
        valid: false,
        msg: 'Informe o cliente'
      }
    }

    if (formInput.paymentAccount === '') {
      return {
        valid: false,
        msg: 'Informe a conta bancária'
      }
    }

    if (formInput.purchcaseDate === '') {
      return {
        valid: false,
        msg: 'Data da compra'
      }
    }

    return {

      valid: true,
      msg: ''
    }

  }

  /* EFFECTS */
  useEffect(() => {

    const data = async () => {
      try {

        /* get client names */
        await get_DocsFunc<Data_Structure>(db, 'client', false)
          .then(docs => {

            const docsbase = docs as Data_Structure[]

            const names = docsbase.reduce((acc: string[], curr: Data_Structure) => {

              if (acc.every(name => name !== curr.name)) {
                acc.push(curr.name)
              }

              return acc
            }, [])

            setClientList(names)
          })

        /* Sale by Id*/
        if (location.state) {

          await getDocFnc(db, 'sale', location.state).then(doc => {
            const data = doc as SaleStruc

            setFormInput(data)
            setClietName(data.clientName)
            setNameAccount(data.paymentAccount)
            setProducts(data.products)
            setPaymentList(data.paymentInfoList)
            setIsOpen(true)

            localStorage.setItem('@Data', JSON.stringify(data))
          })
        }


      } catch (error) {

        throw new Error("Error to fetch data: " + error);

      }
    }

    data()
  }, [])

  useEffect(() => {

    setFormInput({ ...formInput, ['clientName']: clientName, ['paymentAccount']: nameAccount })

  }, [clientName, nameAccount])

  useEffect(() => {

    if (products.length !== 0) {

      setIsOpen(true)
      setFormInput({ ...formInput, ['products']: products })

      const nums = products.reduce((acc: Product[], curr: Product) => {

        if (acc.every(el => el.product !== curr.product)) {

          acc.push(curr)
        }

        return acc
      }, [])

      const arrFinal: number[] = []
      nums.forEach(item => arrFinal.push(Number(item.price)))

      if (isVerified) {
        formInput.products = products
        setIsVerified(false)
      }

      const sum = arrFinal.reduce((acc: number, curr) => acc + Number(curr), 0)

      setListCalc(sum)

    }

    if (paymentList.length > 0) {

      setFormInput({ ...formInput, ['paymentInfoList']: paymentList })
    }

  }, [products, paymentList])

  return (
    <div className={styles.container}>
      <h1>Informações de Vendas</h1>
      <div className={styles.actions}>
        <button onClick={handleDeleRecord}>Excluir</button>
        <button onClick={() => setIsOpen(!isOpen)}>Ver Lista</button>
      </div>
      <div className={styles.form_content}>
        <form onSubmit={handleSubmitData} className={styles.form}>

          <fieldset className={styles.column_1}>
            <div>
              <Input
                type='text'
                label="Produto:"
                name="product"
                data-piece='1'
                placeholder='Nome do produto...'
                style={custom_style}
                value={piece_ofSale.info_product.product.trim() || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                type='number'
                label="Preço:"
                name="price"
                data-piece='2'
                min={0}
                placeholder='Valor do produto...'
                style={custom_style}
                value={piece_ofSale.info_product.price || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <button type="button" className={styles.button} onClick={handleInsertItemInList}>
                Inserir
              </button>
            </div>
          </fieldset>

          <fieldset className={styles.column_2}>
            <div>
              <Input
                type='number'
                label='Entrada'
                name='initValue'
                min={0}
                value={formInput.initValue || ''}
                style={custom_style}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                type='number'
                label="Valor da parcela:"
                name="valueInstallment"
                min={0}
                style={custom_style}
                value={formInput.valueInstallment || ''}
                onChange={handleInputChange}
                disabled={isVerified}
              />
            </div>
            <div>
              <Input
                type='number'
                name='qtdInstallment'
                label="Qtd"
                min={0}
                max={30}
                value={formInput.qtdInstallment || ''}
                style={custom_style}
                onChange={handleInputChange}
                disabled={isVerified}
              />
            </div>
            <div>
              <Input
                type='number'
                label='Dia Venc.'
                name="dueDate"
                min={0}
                max={31}
                style={custom_style}
                value={formInput.dueDate || ''}
                onChange={handleInputChange}
                disabled={isVerified}
              />
            </div>
            <div className={styles.dropdown}>
              <Dropdown
                type='text'
                label="Cliente"
                placeholder="Selecione crédito em conta de.."
                contents={clientList}
                value={formInput.clientName.trim()}
                prop_content="clientName"
                onChange={(e) => setFormInput({ ...formInput, ['clientName']: e.target.value })}
                change={handleDropdownContent}
                autoComplete="off"
                disabled={isVerified}
                out_style={styles.regular_top1}
              />
            </div>

            <div className={styles.dropdown}>
              <Dropdown
                type='text'
                label="C. Bancária"
                placeholder="Selecione o cliente..."
                contents={accountNames}
                value={formInput.paymentAccount.trim()}
                prop_content="paymentAccount"
                onChange={(e) => setFormInput({ ...formInput, ['paymentAccount']: e.target.value })}
                change={handleDropdownContent}
                out_style={styles.regular_top}
                autoComplete="off"
                disabled={isVerified}
              />
            </div>
            <div>
              <Input
                type='date'
                label='Data da Compra'
                name='purchcaseDate'
                style={custom_style}
                value={formInput.purchcaseDate || ''}
                onChange={handleInputChange}
                onBlur={(e) => handleCreateInstallmens(e.target.value)}
              />
            </div>
          </fieldset>
          {
            (location.state) && (<fieldset className={styles.column_3}>
              <legend>Informar Pagamento</legend>
              <div>
                <Input
                  type='number'
                  label='Valor Pago:'
                  name="valuePaid"
                  data-piece='5'
                  style={custom_style}
                  value={piece_ofSale.payment_info.valuePaid || ''}
                  onChange={handleInputChange}
                  disabled={indexLi !== null ? false : true}
                />
              </div>
              <div className={styles.column_3_lastchild}>
                <Checkbox_v2
                  type="checkbox"
                  checked={piece_ofSale.payment_info.isPaid}
                  value={`${piece_ofSale.payment_info.isPaid}` || ''}
                  onChange={handlePieceOfSale}
                  disabled={indexLi !== null ? false : true}
                />
              </div>
            </fieldset>)
          }
          <div className={styles.submit}>
            <span onClick={() => nevigate('/sale')} className={styles.cancel} >Cancelar</span>
            <BtnSubmit title='Confirmar' isSandData={loading} />
          </div>
        </form>
        {
          (location.state || paymentList.length > 0) && (<div className={styles.paymentInfo_container}>
            <div className={styles.paymentInfo_header}>
              <span>Vencimento</span>
              <span>Parcela</span>
              <span>Valor Pago</span>
              <span>Pago?</span>
            </div>
            <ul className={styles.paymentInfo_list}>
              {
                paymentList.length > 0 && paymentList.map((item, index) => (<li
                  key={index}
                  data-index={index}
                  className={`${styles.paymentInfo_content} ${item.isPaid ? styles.mark : ''} ${(markLi && !item.isPaid && index == indexLi) ? styles.info_mark : ''}`}
                  onClick={() => handleUpdateInfo(index, item.installment!)}
                >
                  <span>{splitDate_1(item.paymentDate, true).date.stampDate}</span>
                  <span>{index + 1}</span>
                  <span>{formatedNumber(item.valuePaid)}</span>
                  <span>{item.isPaid ? <FaCheck className={styles.checked} /> : <IoMdClose className={styles.unchecked} />}</span>
                </li>))
              }
            </ul>
          </div>)
        }
      </div>
      <Model
        header={header}
        isOpened={isOpen}
        content_list={products}
        isOpen_fnc={setIsOpen}
        action={handleEditOrRemoveDataInModel}
        sumOfList={listCalc || 0}
      />
    </div>
  )

}

export default Sale

