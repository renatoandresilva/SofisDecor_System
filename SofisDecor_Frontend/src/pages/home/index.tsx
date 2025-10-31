import { FormEvent, useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import { db } from "../../service/dataConnection";
import {
  getCurrentMonthAndYear,
  formatedNumber,
  createCharacters,
  checkPermission,
  updateDocFunc,
  isLater,
  diffDays,
  splitDate_1,
  get_DocsFunc,
  roundToTwoDecimals,
  dateFormat_PT,
  deleteFunc,
  _addDocFnc,
  KeyTest,
} from "../../interfaces/IUtilis/IUtilitis";
import {
  DocShot,
  CostShot,
  TypeCostStructure,
  BalanceOfTheMonth,
  docType,
  _Payment,

} from './homeSettings'
import {
  PaymentInfo,
} from "../sale/saleSettings";
import {
  FormDocument,
  selectionList,
  IndeterminateCost,
  VariableCost,
  DeterminateCost
} from "../cost_detail/settingDetail";
import { Data_Structure } from "../client_detail/ClientSetting"

// Styles
import styles from './Home.module.css'
import Input from "../../components/Input/Input";
import BtnSubmit from "../../components/btnSubmit/BtnSubmit";

type Balance = {
  tutor: string,
  value: number,
  date: string,
  isActive: boolean,
  docId: string,
  provideLimit: number,
  limitLeft: number,
  billMonth: number
}

type Stock = {
  product: string,
  value: number,
  date: string,
  qtd: number,
  description: string,
  isActive: boolean,
}

type Struc = Stock & { docId: string }

type BalanceType = Balance & { docId: string }

type BalanceDoc = Balance & { docId: string }

const balanceData: Balance = {
  tutor: '',
  value: 0,
  date: '',
  isActive: false,
  docId: '',
  provideLimit: 0,
  limitLeft: 0,
  billMonth: 0
}

const _Stock: Stock = {
  product: '',
  value: 0,
  qtd: 1,
  date: '',
  description: '',
  isActive: true,

}

const costTitle = [
  {
    title: 'Cartão',
    code: 'C-',
    order: 1,
  },
  {
    title: 'Boletos',
    code: 'B-',
    order: 1,
  },
  {
    title: 'Gastos Fixos',
    code: 'F-',
    order: 2,
  },
  {
    title: 'Gastos Aleatórios',
    code: 'V-',
    order: 1,
  },
]

const Home = () => {

  const [id, setId] = useState<string>()
  const [_id, set_Id] = useState<string>('')
  const [hide, setHide] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [isMark, setIsMark] = useState<boolean>(false)
  const [showForm, setShowForm] = useState<boolean>(false)
  const [sandDate, setSandDate] = useState<boolean>(false)
  const [desc_filter, setDesc_filter] = useState<string>('')
  const [isSandData, setIsSandData] = useState<boolean>(false)

  const [form, setForm] = useState<Stock>(_Stock)
  const [balance, setBalance] = useState<Balance>(balanceData)

  const [forecast, setForecast] = useState<string[]>([])
  const [CostView, setCostView] = useState<docType[]>([])
  const [listInfo, setListInfo] = useState<_Payment[]>([])
  const [costShot, setCostShot] = useState<CostShot[]>([])
  const [stock, setStock] = useState<Struc[]>([])
  const [listLaters, setListLaters] = useState<_Payment[]>([])
  const [saleDocShot, setSaleDocShot] = useState<DocShot[]>([])
  const [listInfoOfDay, setListInfoOfDay] = useState<_Payment[]>([])
  const [getListBalance, setGetListBalance] = useState<Balance[]>([])
  const [listInfo_Filter, setListInfo_Filter] = useState<docType[]>([])

  const [costStructure, setCostStructure] = useState<TypeCostStructure | null>(null)

  const [balanceMonth, setBalanceMonth] = useState<BalanceOfTheMonth | null>(null)
  const [totalClients, setTotalClients] = useState(0)

  const navigate = useNavigate()

  /*Handles Functions*/
  const handelBalanceToUpdate = (tutor: string) => {

    const indexContent = getListBalance.find(el => el.tutor.toLocaleLowerCase() === tutor.toLocaleLowerCase())

    if (indexContent) {
      setBalance(indexContent)
      setId(indexContent.docId)
      setHide(false)
    }

  }

  const handleRegisterBalance = async (e: FormEvent) => {
    e.preventDefault()

    if (balance.tutor.trim() === '' || balance.value === 0) {
      return alert('Preenchimento dos campos, é obrigatório.')
    }

    setSandDate(true)
    try {

      if (id) {

        alert((await updateDocFunc(db, 'balance', id, balance)).msg)

        setSandDate(false)
        setBalance(balanceData)

        return
      }

      const compare: KeyTest<Balance, string> = {
        prop1: 'tutor' as keyof Balance,
        prop2: balance.tutor,
        objKey: 'id',
        left: null,
        noVerify: false,
      }

      alert((await _addDocFnc<Balance>(balance, db, 'balance', compare)).msg)

      setSandDate(false)
      setBalance(balanceData)

    } catch (error) {

    }
  }

  const handleLiAction = (docId: string) => {

    set_Id(docId)
    setIsMark(true)

  }

  const handleDatabaseRef = async (e: FormEvent, _id?: string) => {

    const btn = e.target as HTMLButtonElement

    if (btn.name === 'save') {
      setForm(_Stock)
      setShowForm(true)
      return
    }

    if (btn.name === 'edit') {

      if (!_id) return alert('Clique na lista correspondente')

      const getRecord = stock.find(el => el.docId === _id)
      getRecord!.date = splitDate_1(`${getRecord?.date}`, false).date.stampDate

      setShowForm(true)
      setForm(getRecord as Stock)
      return
    }

    if (btn.name === 'delete') {

      if (!_id) return alert('Clique na lista correspondente')

      if (confirm('Esta ação não poderá ser desfeita. Continuar?')) {

        try {

          await deleteFunc(db, 'stock', _id!)
            .then(resp => {

              alert(resp.msg)
              set_Id('')
              return
            })

        } catch (error) {

          throw new Error(` an error occurred: ${error}`);

        }

      }

    }

  }

  const handleSaveDate = async (e: FormEvent) => {
    e.preventDefault()

    if (form.product === '') return alert('Informe o produto')
    if (form.value === 0) return alert('Informe o preço')
    if (form.date === '') return alert('Informe a data')
    if (form.description === '') return alert('Informe a descrição')

    setIsSandData(true)

    try {

      if (!_id) {

        const compare: KeyTest<Stock, string> = {
          prop1: 'product' as keyof Stock,
          prop2: form.product as string,
          objKey: 'id',
          left: null,
          noVerify: false,
        }

        await _addDocFnc<Stock>(form, db, 'stock', compare)
          .then(resp => {

            if (resp.isSaved) {

              alert(resp.msg)
              setForm(_Stock)
              setShowForm(false)
              setIsSandData(false)
            }

            alert(resp.msg)
            setIsSandData(false)
          })

      }

      await updateDocFunc(db, 'stock', _id, form)
        .then(resp => {

          setForm(_Stock)
          setShowForm(false)
          setIsSandData(false)
          alert(resp.msg)

        })

    } catch (error) {

      throw new Error("Não foi possível executar essa ação: " + error);

    }

  }

  const handleCloseForm = () => {
    set_Id('')
    setShowForm(false)
  }

  const handleGetInfo = (id: string) => {

    if (!checkPermission()) return

    navigate(`/sale/${createCharacters(15)}`, { state: id })
  }

  /*Functions*/
  async function getMain_sale() {
    try {

      await get_DocsFunc<DocShot>(db, 'sale', false)
        .then(doc => {

          const docsShot = doc as DocShot[]
          setSaleDocShot(docsShot)
        })

    } catch (error) {

      throw new Error("An error occured: " + error);

    }
  }

  async function getMain_cost() {

    try {

      await get_DocsFunc<FormDocument>(db, '_cost', false)
        .then(docs => {

          const list = docs as CostShot[]

          setCostShot(list)
        })

    } catch (error) {

      throw new Error("An error occured: " + error);

    }
  }

  async function getStock() {

    try {

      await get_DocsFunc<Struc>(db, 'stock', false)
        .then(docs => {

          const list = docs as Struc[]

          setStock(list)
        })

    } catch (error) {

      throw new Error("An error occured: " + error);

    }
  }

  async function getBalance() {

    try {

      await get_DocsFunc<BalanceDoc>(db, 'balance', false)
        .then(docs => {
          const docsBase = docs as BalanceDoc[]

          setGetListBalance(docsBase)

        })

    } catch (error) {

      throw new Error("An error occured: " + error);

    }
  }

  function getPrevion(name: string) {

    if (!name) return {
      total: 0,
      name: ''
    }

    const currMonthOfListInfo = listInfo.filter(info => {

      const monthOfPayment = splitDate_1(info.paymentDate, false).date.month
      const yearOfPayment = splitDate_1(info.paymentDate, false).date.year

      const currMonth = splitDate_1('', false).currentDate.currentDate_month
      const currYear = splitDate_1('', false).currentDate.currentDate_year

      if (name !== null && name === info.accountName && monthOfPayment === currMonth && yearOfPayment === currYear) {
        return info
      }

    })

    let count = 0
    if (saleDocShot.length !== 0) {
      count = saleDocShot.filter(account => account.paymentAccount === name).length

    }
    const sum = currMonthOfListInfo.reduce((acc, curr) => {
      return acc + Number(curr.installment)
    }, 0)

    return {
      total: sum || 0,
      name: count
    }

  }

  function get_Balance(tutor: string) {

    return getListBalance.filter(el => el.tutor.toLowerCase() === tutor.toLowerCase())[0].value

  }

  function subString(str: string, init: number, end: number | null) {

    let subString = ''

    if (end !== null) {

      subString = str.slice(init, end)

    } else {

      subString = str.slice(init)
    }

    return subString
  }

  function sumEntriesPlusInstallmentsPaid() {

    return balanceMonth?.initValueIn! + balanceMonth?.installmentsIn!
  }

  function getTotalOut() {

    let sum = 0

    costTitle.forEach(title => {

      title.order == 1 ? sum += getCurrentCost(title.code).month : sum += getCurrentCost(title.code).total

    })

    return sum
  }

  function calcFeeOver(date: string, fee: number, value: number = 0) {

    if (!isLater(date)) return 0

    const currDate = splitDate_1('', false).currentDate.currentDate_es

    const result = Number(((diffDays(date, currDate) * fee) + Number(value)).toFixed(2))

    return result
  }

  function calcCosts() {

    /* Map all determinado costs of the month and calc */
    const costDeterm = costStructure?.["Fixo Determinado"].map(el => el.docs as DeterminateCost[])

    const newArr = costDeterm?.map(el => {

      return el.filter(ele => {

        if (splitDate_1(ele.date, false).date.month === splitDate_1('', false).currentDate.currentDate_month && !ele.isPaid) {

          return el
        }

      })

    })

    let list1: DeterminateCost[] = []

    newArr?.forEach(el => {
      list1 = [...list1, ...el]
    })

    const costDetermCalc = list1.reduce((acc: number, curr: DeterminateCost) => {
      return acc + Number(curr.price)
    }, 0)

    /* Map all indeterminate costs  and calc*/
    const costIndetrm = costStructure?.["Fixo Indeterminado"]

    const costIndetrmCalc = costIndetrm?.reduce((acc: number, curr: CostShot) => {

      const doc = curr.docs as IndeterminateCost
      return acc + Number(doc.price) || 0

    }, 0)

    /* Map all variable costs  and calc*/
    const costVarible = costStructure?.Variavel

    const newVariable = costVarible?.filter(el => {
      if (el.isActive === true) {
        return el
      }
    })

    const costVaribleCalc = newVariable?.reduce((acc: number, curr: CostShot) => {

      const doc = curr.docs as VariableCost
      return acc + Number(doc.price) || 0

    }, 0)

    return costDetermCalc + costIndetrmCalc! + costVaribleCalc!
  }

  function checkIndeterminateCostPaid(day: number, date: string, isPaid: boolean) {

    if (day) {

      const currDay = splitDate_1('', false).currentDate.currentDate_day

      if (currDay > day && !isPaid) {
        return true
      }

    }

    if (date) {

      const currDay = isLater(date)

      if (currDay && !isPaid) {
        return true
      }

    }

  }

  function getCurrentCost(cod: string) {

    let sum = {
      month: 0,
      total: 0,
    }

    if (cod === 'F-') {

      const costIndeterminate = costStructure?.["Fixo Indeterminado"]

      costIndeterminate?.forEach(el => {

        const data = el.docs as IndeterminateCost

        if (data.isPaid) {

          sum.total = roundToTwoDecimals(sum.total + Number(data.price))

        }
      })

    } else if (cod === 'V-') {

      const costIndeterminate = costStructure?.Variavel

      costIndeterminate?.forEach(el => {

        const data = el.docs as VariableCost

        const month = splitDate_1(data.date, false).date.month
        const currentMonth = splitDate_1('', false).currentDate.currentDate_month

        if (month === currentMonth && el.isActive) {
          sum.month = roundToTwoDecimals(sum.month + Number(data.price))
        }
      })

    } else {

      const costDeteminates = costStructure?.["Fixo Determinado"]

      costDeteminates?.forEach(el => {

        if (Array.isArray(el.docs)) {

          el.docs.filter(elem => {

            const month = splitDate_1(elem.date, false).date.month
            const currentMonth = splitDate_1('', false).currentDate.currentDate_month

            if (elem.destiny.slice(0, 2) === cod) {

              (month === currentMonth && elem.isPaid) ? sum.month = roundToTwoDecimals(sum.month + Number(elem.price)) : sum.month += 0

              sum.total = roundToTwoDecimals(sum.total + Number(elem.price))
            }

          })
        }
      })
    }

    return sum

  }

  function getBalanceOfTheMonth() {

    const list = saleDocShot.filter(el => {

      if (splitDate_1(el.purchcaseDate, false).date.month === splitDate_1('', false).currentDate.currentDate_month) {
        return el
      }
    })

    const list_1 = listInfo.filter(el => {

      if (splitDate_1(el.paymentDate, false).date.month === splitDate_1('', false).currentDate.currentDate_month && el.isPaid) {
        return el
      }
    })

    const sum = list.reduce((acc, curr: DocShot) => {
      return acc + Number(curr.initValue)
    }, 0)

    const sum_1 = list_1.reduce((acc, curr: PaymentInfo) => {
      return acc + Number(curr.installment)
    }, 0)

    const _obj: BalanceOfTheMonth = {
      initValueIn: sum,
      installmentsIn: sum_1
    }

    setBalanceMonth(_obj)
  }

  function getMonthPrevision() {

    const list = listInfo.filter(info => {

      const monthOfPayment = splitDate_1(info.paymentDate, false).date.month
      const yearOfPayment = splitDate_1(info.paymentDate, false).date.year

      const currMonth = splitDate_1('', false).currentDate.currentDate_month
      const currYear = splitDate_1('', false).currentDate.currentDate_year

      if (monthOfPayment === currMonth && yearOfPayment === currYear) {
        return info
      }

    })

    return list.reduce((acc, curr) => {
      return acc + Number(curr.installment)
    }, 0)
  }

  function geLimit(name: string) {

    const obj = getListBalance.find(el => el.tutor === name)

    return {
      supplier: obj?.provideLimit || 0,
      limit: obj?.limitLeft || 0,
      billMonth: obj?.billMonth || 0,
    }
  }

  function sliceText(name: string): string {

    return name.slice(3)

  }

  function calcStock(): number {

    return stock.reduce((acc: number, curr: Struc) => {
      return acc + Number(curr.value)
    }, 0)

  }

  function calcDebtors(): number {

    return listLaters.reduce((acc: number, curr: _Payment) => {
      return acc + Number(curr.installment)
    }, 0)

  }

  function calcInstallments(): number {

    return listInfoOfDay.reduce((acc: number, curr: _Payment) => {
      return acc + Number(curr.installment)
    }, 0)

  }

  // Effects
  useEffect(() => {

    /* Calc Provider Limit */
    const fetchData = async () => {
      try {

        await get_DocsFunc<CostShot>(db, '_cost', true, 'type', 'boleto')
          .then(docsRef => {
            const docsBase = docsRef as CostShot[]

            get_DocsFunc<BalanceType>(db, 'balance', false)
              .then(_docRef => {

                const _docsBase = _docRef as BalanceType[]

                _docsBase.map(item => {

                  const list1 = docsBase.filter(el => {
                    if (item.isActive && el.responsible?.toLowerCase() === item.tutor.toLowerCase()) {
                      return el
                    }
                  })

                  let structure: DeterminateCost[] = []

                  list1.map(_item => {

                    const _structure = [
                      ...structure, ...(_item.docs as DeterminateCost[]).filter(el => el.isPaid === false)
                    ]

                    structure = _structure
                  })

                  const calc = structure.reduce((acc: number, curr: DeterminateCost) => {
                    return acc + Number(curr.price)
                  }, 0)

                  const getCurrMonthPayment = structure.filter(el => {

                    const monthFromdate = splitDate_1(el.date, false).date.month
                    const month = splitDate_1('', false).currentDate.currentDate_month

                    if (monthFromdate === month) {
                      return el
                    }

                  })
                    .reduce((acc: number, curr: DeterminateCost) => {
                      return acc + Number(curr.price)
                    }, 0)

                  item.billMonth = getCurrMonthPayment
                  item.limitLeft = roundToTwoDecimals(item.provideLimit - calc)

                  const updated = async () => {

                    await updateDocFunc(db, 'balance', item.docId, item)
                  }

                  updated()

                })

              })
          })

      } catch (error) {

        throw new Error(`Erro ao buscar dados: ${error}`);

      }
    };

    fetchData();

  }, [])

  useEffect(() => {

    const fetchData = async () => {

      try {
        await getBalance()
        await getMain_sale()
        await getMain_cost()
        await getStock()

        await get_DocsFunc<Data_Structure>(db, 'client', false)
          .then(docs => {
            const docsBase = docs as Data_Structure[]
            setTotalClients(docsBase.length)
          })

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();

  }, [])

  useEffect(() => {

    if (saleDocShot.length !== 0) {

      const accountNames = saleDocShot.reduce((acc: string[], curr: DocShot) => {

        if (acc.every(el => el !== curr.paymentAccount)) {
          acc.push(curr.paymentAccount)
        }

        return acc
      }, [])

      const list: _Payment[] = []

      saleDocShot.forEach(item => {

        item.paymentInfoList.forEach((el, index) => {

          const obj_: _Payment = {

            paymentDate: el.paymentDate,
            numberInstallment: el.numberInstallment,
            installment: el.installment,
            valuePaid: el.valuePaid,
            isPaid: el.isPaid,
            valueLeft: el.valueLeft,
            client: el.client,
            rest: el.rest,
            id: el.id,
            repeated: el.repeated,
            installmentOrder: index + 1,
            orderId: createCharacters(10) + index,
            accountName: item.paymentAccount,
            docId: item.docId,
          }

          list.push(obj_)
        })
      })

      const unique = list.reduce((acc: _Payment[], curr) => {

        if (acc.every(el => el.id !== curr.id)) {
          acc.push(curr)
        }

        return acc
      }, [])

      setListInfo(unique)
      getBalanceOfTheMonth()
      setForecast(accountNames)
    }

    if (costShot.length !== 0) {

      let obj: TypeCostStructure = {
        "Fixo Determinado": [],
        "Fixo Indeterminado": [],
        "Variavel": []
      }

      selectionList.forEach((category) => {

        const list = costShot.filter(el => el.category === category)

        obj[category as keyof typeof obj] = list

      })

      setCostStructure(obj)
    }
  }, [saleDocShot, costShot])

  useEffect(() => {

    if (costStructure === null) return

    let _docBase: docType[] = []

    costStructure["Fixo Determinado"].forEach(element => {

      const elem = element.docs as DeterminateCost[]
      const list: docType[] = []

      elem.forEach(el => {

        if (el.isActive) {

          const obj: docType = {

            date: el.date,
            destiny: el.destiny,
            fee_over: el.fee_over,
            id: el.id,
            isActive: el.isActive,
            _isLater: isLater(el.date),
            isPaid: el.isPaid,
            price: el.price,
            valuePaid: el.valuePaid,
            category: element.category,
            idRef: createCharacters(10)
          }

          list.push(obj)
        }

      })

      list.sort((a, b) => {

        const date1 = new Date(a.date)
        const date2 = new Date(b.date)

        return date2.getTime() - date1.getTime()
      })

      _docBase = [..._docBase, ...list]

    })

    costStructure["Fixo Indeterminado"].forEach(element => {

      const elem = element.docs as IndeterminateCost

      const obj: docType = {

        date: elem.date,
        destiny: elem.destiny,
        id: elem.id,
        isActive: elem.isActive,
        _isLater: isLater(elem.date),
        isPaid: elem.isPaid,
        price: elem.price,
        category: element.category,
        dueDay: elem.dueDay,
        idRef: createCharacters(10)
      }

      _docBase.push(obj)
    })

    costStructure.Variavel.forEach(element => {

      const elem = element.docs as VariableCost

      if (elem.isActive) {

        const obj: docType = {
          date: elem.date,
          destiny: elem.destiny,
          id: elem.id,
          isActive: elem.isActive,
          isPaid: elem.isActive,
          price: elem.price,
          category: element.category,
          _isLater: elem.isActive,
          idRef: createCharacters(10)
        }

        _docBase.push(obj)
      }

    })

    setCostView(_docBase)

  }, [costStructure])

  useEffect(() => {

    /*Installments ofthe day*/
    if (saleDocShot.length !== 0) {

      const installOfDay = listInfo.filter(el => {

        const _date = splitDate_1(el.paymentDate, false).date.stampDate
        const _date1 = splitDate_1('', false).currentDate.currentDate_es

        if (_date === _date1) {

          return el
        }

      })

      installOfDay.sort(((a, b) => a.client!.localeCompare(b.client!)))
      setListInfoOfDay(installOfDay)
    }

    /*Installments later*/
    if (listInfo.length !== 0) {

      const installLater = listInfo.filter(el => {

        const _dateMonth = splitDate_1(el.paymentDate, false).date.month
        const _dateDay = splitDate_1(el.paymentDate, false).date.day
        const _dateYear = splitDate_1(el.paymentDate, false).date.year

        const _date1Month = splitDate_1('', false).currentDate.currentDate_month
        const _date1Day = splitDate_1('', false).currentDate.currentDate_day
        const _date1Year = splitDate_1('', false).currentDate.currentDate_year

        if ((_dateMonth < _date1Month && _dateYear <= _date1Year && !el.isPaid) || _dateMonth === _date1Month && _dateYear === _date1Year && _dateDay < _date1Day && !el.isPaid) {

          return el
        }

      })

      const unique = installLater.reduce((acc: _Payment[], curr) => {

        if (acc.every(el => el.id !== curr.id)) {
          acc.push(curr)
        }

        return acc
      }, [])

      unique.sort(((a, b) => a.client!.localeCompare(b.client!)))

      setListLaters(unique)

    }

  }, [listInfo])

  useEffect(() => {

    if (desc_filter === '') return setListInfo_Filter([])

    const filtered = CostView.filter(el => {

      const _filter = desc_filter.toLowerCase().trim()
      let _el = `${splitDate_1(el.date!, true).date.stampDate || el.dueDay}`

      if (_el.indexOf(_filter) !== -1) {
        return el
      }

      if (el.destiny.toLowerCase().indexOf(_filter) !== -1) {

        return el
      }
    })

    setListInfo_Filter(filtered)

  }, [desc_filter])

  return (
    <div className={styles.container}>
      <h1>Quadro Geral</h1>
      <div className={`${styles.balance} ${styles.item_container}`}>
        <h3 className={styles.balance_title}>Relatório</h3>
        <ul className={`${styles.balance_list}`}>
          {
            forecast.length > 0 && forecast.map((item, index) => (<li key={index} className={styles.balance_list_item}>
              <h5 className={styles.balance_list_item_title}>{item}</h5>
              <div>
                <span>Saldo em Conta</span>
                <span>{formatedNumber(get_Balance(item)) || "R$ 0,00"}</span>
              </div>
              <div>
                <span>Previsão Mês</span>
                <span className={styles.ligth}>{formatedNumber(getPrevion(item).total!)}</span>
              </div>
              <div>
                <span>Pagmtos na Conta</span>
                <span>{getPrevion(item).name}</span>
              </div>
              <div>
                <span>Limite Fornecedor</span>
                <span>{formatedNumber(geLimit(item).supplier)}</span>
              </div>
              <div>
                <span>Limite Disponível</span>
                <span>{formatedNumber(geLimit(item).limit)}</span>
              </div>
              <div>
                <span>Boletos não pg /mês</span>
                <span>{formatedNumber(geLimit(item).billMonth)}</span>
              </div>
            </li>
            ))
          }
        </ul>
        <div className={styles.total_sum}>
          <h5>Resumo Geral</h5>
          <ul>
            <li>
              <span>Clientes</span>
              <span>{totalClients}</span>
            </li>
            <li>
              <span>Vendas</span>
              <span>{saleDocShot.length}</span>
            </li>
            <li>
              <span>Previsão Total</span>
              <span className={styles.hightlight_1}>{formatedNumber(getMonthPrevision())}</span>
            </li>
            <li>
              <span>Dívida mensal</span>
              <span className={styles.hightlight_2}>{formatedNumber(calcCosts())}</span>
            </li>
          </ul>
        </div>
      </div>
      < div className={`${styles.in_ativities} ${styles.item_container}`}>
        <h3 className={styles.in_title}> Atividades em {getCurrentMonthAndYear().nameMonth}</h3>
        <ul className={styles.in_list}>
          <li>
            <span>Entradas Recebidas</span>
            <span>{formatedNumber(balanceMonth?.initValueIn!)}</span>
          </li>
          <li>
            <span>Parcelas Recebidas</span>
            <span>{formatedNumber(balanceMonth?.installmentsIn!)}</span>
          </li>
          {
            costTitle.length !== 0 && costTitle.map((item, index) => (
              <li key={index}>
                <span>{subString(item.title, 0, null)}</span>
                <span>{(item.order === 1) ? formatedNumber(getCurrentCost(item.code).month) : formatedNumber(getCurrentCost(item.code).total)}</span>
              </li>
            ))
          }
        </ul>
        <div className={styles.summary} >
          <div className={styles.summary_col1}>
            <div>
              <span>Entradas</span>
              <span>{formatedNumber(sumEntriesPlusInstallmentsPaid())} </span>
            </div>
            <div>
              <span>Saídas</span>
              <span>
                {formatedNumber(getTotalOut())}
              </span>
            </div>
          </div>
          <div className={styles.summary_col2}>
            <div>
              <span>Saldo em {getCurrentMonthAndYear().nameMonth}</span>
              <span className={sumEntriesPlusInstallmentsPaid() - getTotalOut() < 0 ? `${styles.hightlight_2}` : `${styles.hightlight_1}`}>{formatedNumber(sumEntriesPlusInstallmentsPaid() - getTotalOut())}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles.descriptions_container} ${styles.item_container}`}>
        <h3 className={styles.desc_title}>Descrição dos Custos</h3>
        <div className={styles.desc_filter}>
          <Input
            type="text"
            placeholder="Pesquise por data..."
            value={desc_filter || ''}
            onChange={(e) => setDesc_filter(e.target.value)}
          />
        </div>
        <ul className={styles.descriptions}>
          {
            listInfo_Filter.length === 0 ? CostView.map((item) => (
              <li key={item.idRef} className={styles.descriptions_content}>
                <div className={styles.descriptions_title_totalPrice}>
                  <h4>{item.destiny}</h4>
                </div>
                {
                  (<ul className={styles.content_desc}>
                    <li className={styles.li_header}>
                      <span>Venc.</span>
                      <span>$Preço</span>
                      <span>Multa/Dia</span>
                      <span>$ Alterado</span>
                    </li>
                    <li key={item.id} className={`${styles.content_desc_li} ${(checkIndeterminateCostPaid(item.dueDay!, item.date, item.isPaid!)) ? 'hightlight-red' : ''}`}>
                      <span>{item.date !== '' ? dateFormat_PT(item.date!) : item.dueDay}</span>
                      <span>{formatedNumber(item.price)}</span>
                      <span>{formatedNumber(Number(item.fee_over))}</span>
                      <span>{formatedNumber(calcFeeOver(item.date, item.fee_over!, item.price))}</span>
                    </li>
                  </ul>)
                }
              </li>
            )) : listInfo_Filter.map((item) => (
              <li key={item.idRef} className={styles.descriptions_content}>
                <div className={styles.descriptions_title_totalPrice}>
                  <h4>{item.destiny}</h4>
                </div>
                {
                  (<ul className={styles.content_desc}>
                    <li className={styles.li_header}>
                      <span>Venc.</span>
                      <span>$Preço</span>
                      <span>Multa/Dia</span>
                      <span>$ Alterado</span>
                    </li>
                    <li key={item.id} className={`${styles.content_desc_li} ${(checkIndeterminateCostPaid(item.dueDay!, item.date, item.isPaid!)) ? 'hightlight-red' : ''}`}>
                      <span>{item.date !== '' ? dateFormat_PT(item.date!) : item.dueDay}</span>
                      <span>{formatedNumber(item.price)}</span>
                      <span>{formatedNumber(Number(item.fee_over))}</span>
                      <span>{formatedNumber(calcFeeOver(item.date, item.fee_over!, item.price))}</span>
                    </li>
                  </ul>)
                }
              </li>
            ))
          }
        </ul>
      </div>
      <div className={`${styles.installments_day} ${styles.item_container}`}>
        <h3 className={`${styles.installments_title}`}>Parcelas Diária a Receber</h3>
        <div className={styles.installments_header}>
          <span>Cliente</span>
          <span>Nº da Parcela</span>
          <span>Valor</span>
        </div>
        <ul className={styles.installments}>
          {
            listInfoOfDay && listInfoOfDay!.map((item, index) => (
              <li key={index}>
                <span onClick={() => handleGetInfo(item.docId)} className={!checkPermission() ? '' : `${styles._mark}`}>{item.client}</span>
                <span>{item.installmentOrder}</span>
                <span>{formatedNumber(item.installment!)}</span>
              </li>
            ))
          }
        </ul>
        <div className={`${styles.sum}`}>
          <span>Total:</span>
          <span className={`${styles.installments_mark}`}>{formatedNumber(calcInstallments())}</span>
        </div>
      </div>
      <div className={`${styles.late_payment} ${styles.item_container}`}>
        <h3 className={`${styles.late_title}`}>Clientes em Atraso</h3>
        <div className={styles.late_header}>
          <span>Cliente</span>
          <span>Nº da Parcela</span>
          <span>Valor</span>
        </div>
        <ul className={`${styles.debtors}`}>
          {
            listLaters && listLaters.map((item, index) => (
              <li key={index}>
                <span onClick={() => handleGetInfo(item.docId)} className={!checkPermission() ? '' : `${styles._mark}`}>
                  {item.client}
                </span>
                <span>{item.installmentOrder}</span>
                <span>{formatedNumber(item.installment!)}</span>
              </li>
            ))
          }
        </ul>
        <div className={`${styles.sum}`}>
          <span>Total:</span>
          <span className={`${styles.late_mark}`}>
            {formatedNumber(calcDebtors())}
          </span>
        </div>
      </div>
      <div className={`${styles.out_ativities} ${styles.item_container}`}>
        <h3 className={`${styles.out_title}`}>Estoque e Devolução</h3>
        <div className={`${styles.out_container}`}>
          <div className={`${styles.out_list_header}`}>

            <span>Produto</span>
            <span>Valor</span>
            <span>Qtd</span>
            <span>data</span>
            <span>Descição</span>

          </div>
          <ul className={`${styles.out_list}`}>
            {
              stock.length !== 0 && stock.map(dataRef =>
              (<li key={dataRef.docId} data-id={createCharacters(10)} onClick={() => handleLiAction(dataRef.docId)} className={(isMark && _id === dataRef.docId) ? styles.backg : ''}>

                <span className={`${styles.out_list_content}`}>{dataRef.product}</span>
                <span className={`${styles.out_list_content}`}>{formatedNumber(dataRef.value)}</span>
                <span>{dataRef.qtd}</span>
                <span className={`${styles.out_list_content}`}>{sliceText(dateFormat_PT(dataRef.date))}</span>
                <span className={`${styles.out_list_content}`}>{dataRef.description}</span>

              </li>))
            }
          </ul>
        </div>
        <div className={`${styles.out_list_summary}`}>
          <div className={`${styles.out_list_col1}`}>
            <span>Total:</span>
            <span>{formatedNumber(calcStock())}</span>
          </div>
          {
            checkPermission() && (<div className={`${styles.out_list_action}`}>
              <div className={`${styles.out_action}`}>
                <button type="button" name='delete' onClick={(e) => handleDatabaseRef(e, _id)}>Excluir</button>
                <button type="button" name='edit' onClick={(e) => handleDatabaseRef(e, _id)}>Editar</button>
                <button type="button" name='save' onClick={(e) => handleDatabaseRef(e)}>Adicionar</button>
              </div>
            </div>)
          }
        </div>
        {
          showForm && (<form className={`${styles.out_form}`} onSubmit={handleSaveDate}>
            <div>
              <Input
                type="text"
                placeholder="Digite o nome do produto..."
                value={form.product ?? ''}
                onChange={(e) => setForm({ ...form, ['product']: e.target.value })}
              />
            </div>
            <div>
              <Input
                type="number"
                value={form.value ?? ''}
                onChange={(e) => setForm({ ...form, ['value']: Number(e.target.value) })}
              />
            </div>
            <div>
              <Input
                type="number"
                min={1}
                value={form.qtd || 1}
                onChange={(e) => setForm({ ...form, ['qtd']: Number(e.target.value) })}
              />
            </div>
            <div>
              <Input
                type="date"
                value={form.date ?? ''}
                onChange={(e) => setForm({ ...form, ['date']: e.target.value })}
              />
            </div>
            <div>
              <Input
                type="textarea"
                placeholder="Descrição. Ex: 5 bocas, preto..."
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, ['description']: e.target.value })}
              />
            </div>
            <div className={`${styles.out_form_action}`}>
              <span onClick={() => handleCloseForm()}>Cancelar</span>
              <BtnSubmit title={_id ? 'Atualizar' : 'Salvar'} isSandData={isSandData} />
            </div>
          </form>)
        }
      </div>
      {
        checkPermission() && (< div className={`${styles.form_container} ${styles.item_container}`}>
          <div className={`${styles.wrap_form}`}>
            {hide && <div className={styles.filter}>
              <Input
                type="text"
                placeholder="Buscar balanço em nome de..."
                value={search || ''}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={(e) => handelBalanceToUpdate(e.target.value)}
              />
            </div>}
            {!hide && <form className={`${styles.form}`} onSubmit={handleRegisterBalance}>
              <div>
                <div>
                  <Input
                    type="text"
                    placeholder="Responsável... "
                    value={balance.tutor || ''}
                    onChange={(e) => setBalance({ ...balance, ['tutor']: e.target.value })}
                  />
                </div>
              </div>
              <div className={`${styles.form_secEl}`}>
                <div className={`${styles.form_secEl}`}>
                  <Input
                    type="number"
                    label="Saldo em conta"
                    value={balance.value ?? 0}
                    onChange={(e) => setBalance({ ...balance, ['value']: Number(e.target.value) })}
                  />
                </div>
                <div className={`${styles.form_secEl}`}>
                  <Input
                    type="number"
                    label="Limite Fornecedors"
                    value={balance.provideLimit || 0}
                    onChange={(e) => setBalance({ ...balance, ['provideLimit']: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className={styles.date_checkbox}>
                <div>
                  <Input
                    type="date"
                    label="Data"
                    value={balance.date || ''}
                    onChange={(e) => setBalance({ ...balance, ['date']: e.target.value })}
                  />
                </div>
                <div className={styles.checkbox}>
                  <Input
                    type="checkbox"
                    label="Ativo?"
                    value={balance.date || ''}
                    onChange={(e) => setBalance({ ...balance, ['isActive']: Boolean(e.target.value) })}
                  />
                </div>
              </div>
              <div className={`${styles.actions}`}>
                <div> <BtnSubmit title='Salvar' isSandData={sandDate} /></div>
                <div><button type="button" className={styles.cancel} onClick={() => setHide(true)}>Voltar</button></div>
              </div>
            </form>}
          </div>
        </div>)
      }
    </div>
  )
}

export default Home

