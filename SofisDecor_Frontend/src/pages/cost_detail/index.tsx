import { useState, FormEvent, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaTrashArrowUp } from 'react-icons/fa6'
import { AiTwotoneCheckCircle, AiTwotoneCloseCircle } from "react-icons/ai"
import { selectionList } from './settingDetail'

import styles from './CostDetail.module.css'
import { custom_style } from '../../interfaces/custom_styles/genral'

import Input from '../../components/Input/Input'
import Checkbox_v2 from '../../components/checkBox _v2/Checkbox_v2'
import BtnSubmit from '../../components/btnSubmit/BtnSubmit'
import Dropdown from '../../components/dropdown/Dropdown'
import {
    FormDocument,
    DeterminateCost,
    DatabaseStructure,
} from './settingDetail'
import { db } from '../../service/dataConnection'
import {
    _addDocFnc,
    updateDocFunc,
    getDocFnc,
    deleteFunc,
    formatedNumber,
    createCharacters,
    splitDate_1,
    dateFormat_PT,
    getDatesFromDate,
    KeyTest,

} from '../../interfaces/IUtilis/IUtilitis'

const data_center: DatabaseStructure = {
    destiny: '',
    price: 0,
    date: '',
    dueDay: 0,
    isPaid: false,
    fee_over: 0,
    valuePaid: 0,
    id: '',
    isActive: true
}

const doc_Form: FormDocument = {
    category: '',
    docs: [],
    isActive: true,
    type: '',
    responsible: '',
}

const CostDetail = () => {

    const [docForm, setDocForm] = useState<FormDocument>(doc_Form)
    const [dataCenter, setDataCenter] = useState<DatabaseStructure>(data_center)

    const [generator, setGenerator] = useState<number>(0)
    const [_docs, set_Docs] = useState<DeterminateCost[]>([])
    const [_docsUP, set_DocsUP] = useState<boolean>(false)
    const [insert, setInsert] = useState<boolean>(false)

    const [updateListById, setUpdateListById] = useState<null | number>(null)

    const [isSave, setIsSave] = useState(false)

    const location = useLocation()
    const navigate = useNavigate()

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!validate(docForm.category)?.isValid) {
            return alert(validate(docForm.category)?.msg)
        }

        if (docForm.category !== selectionList[1] && location.state === null) {
            docForm.docs = dataCenter
            dataCenter.id = createCharacters(10)
        }

        setIsSave(true)

        try {

            if (insert) {

                setIsSave(false)
                return alert('Insira na lista')
            }

            /* Creating record*/
            if (location.state === null) {

                const compare: KeyTest<FormDocument, DeterminateCost[]> = {
                    prop1: 'docs' as keyof FormDocument,
                    prop2: docForm.docs as DeterminateCost[],
                    objKey: 'id',
                    left: null,
                    noVerify: false,
                }

                alert((await _addDocFnc<FormDocument, DeterminateCost[]>(docForm, db, '_cost', compare)).msg)

                setDocForm(doc_Form)
                setDataCenter(data_center)
                navigate('/cost')
                setIsSave(false)
                return
            }

            /* Updateing record*/
            if (Array.isArray(docForm.docs)) {

                if ((await deleteFunc(db, '_cost', location.state)).success) {

                    const compare: KeyTest<FormDocument, DeterminateCost[]> = {
                        prop1: 'docs' as keyof FormDocument,
                        prop2: docForm.docs as DeterminateCost[],
                        objKey: 'id',
                        left: null,
                        noVerify: false,
                    }

                    if ((await _addDocFnc<FormDocument>(docForm, db, '_cost', compare)).isSaved) {

                        alert('Registro atualizado.')

                        navigate('/cost')

                        return
                    }

                    alert('Atualização falhou.')
                    setIsSave(false)

                    return
                }
            }

            alert((await updateDocFunc(db, '_cost', location.state, docForm)).msg)
            navigate('/cost')

        } catch (error) {

            throw new Error("An error hapened: " + error);

        }

    }

    const handleFieldsToUpdate = (index: number) => {

        const obj = _docs[index] as DatabaseStructure

        const month = splitDate_1(obj.date, false).date.month < 10 ? '0' + splitDate_1(obj.date, false).date.month : splitDate_1(obj.date, false).date.month

        const day = splitDate_1(obj.date, false).date.day < 10 ? '0' + splitDate_1(obj.date, false).date.day : splitDate_1(obj.date, false).date.day

        const _date = `${splitDate_1(obj.date, false).date.year}-${month}-${day}`

        setDataCenter({
            ...obj,
            ['destiny']: obj.destiny,
            ['price']: obj.price,
            ['fee_over']: obj.fee_over,
            ['valuePaid']: obj.valuePaid,
            ['isPaid']: obj.isPaid,
            ['date']: _date,

        })

        setUpdateListById(index)
        setInsert(true)

    }

    const handleInsertInList = () => {

        if (location.state !== null) {
            localStorage.setItem('@List:', JSON.stringify(_docs))
        }

        if (updateListById === null) {

            if (generator < 1) return alert('Campo "Ocorrência" deve ser preenchido.')
            if (dataCenter.date === '') return alert('Campo "Data deve ser" preenchido.')
            if (dataCenter.price < 1) return alert('Campo "Valor do Custo" deve ser preenchido.')

            const elements: DeterminateCost[] = []

            const _date = splitDate_1(dataCenter.date, false).date.stampDate
            const installments = getDatesFromDate(_date, generator)

            installments?.forEach(date1 => {

                const obj: DatabaseStructure = {
                    date: dateFormat_PT(date1),
                    destiny: dataCenter.destiny,
                    dueDay: dataCenter.dueDay,
                    fee_over: dataCenter.fee_over,
                    id: dataCenter.id,
                    isActive: dataCenter.isActive,
                    isPaid: dataCenter.isPaid,
                    price: dataCenter.price,
                    valuePaid: dataCenter.valuePaid,
                }

                elements.push(obj)

            })


            set_DocsUP(false)
            set_Docs(elements)
            setDocForm({ ...docForm, ['docs']: elements })
            setInsert(false)
            return
        }

        if (generator < 1) return alert('Campo "Ocorrência" deve ser preenchido.')
        if (dataCenter.date === '') return alert('Campo "Data deve ser" preenchido.')
        if (dataCenter.price < 1) return alert('Campo "Valor do Custo" deve ser preenchido.')

        let elements = _docs[updateListById]

        elements = dataCenter

        _docs[updateListById] = elements

        set_DocsUP(true)
        return

    }

    const handleDelete = async () => {
        if (!confirm('Está ação não poderá ser desfeita. Continuar?')) {
            return
        }

        try {

            deleteFunc(db, '_cost', location.state)
            navigate('/cost')

        } catch (error) {

            throw new Error("An error occured: " + error);

        }
    }

    const handleSetPrefix = (value: string) => {

        const catgry = docForm.category.charAt(0)

        if (value.charAt(0) === catgry && value.charAt(1) === '-') return

        const newValue = `${catgry}- ${value}`

        setDataCenter({ ...dataCenter, ['destiny']: newValue })

    }

    const handleCheckbox = (e: FormEvent) => {

        const target = e.target as HTMLInputElement

        if (target.name === 'isPaid') {

            setDataCenter({ ...dataCenter, ['isPaid']: target.checked })

        }

        if (target.name === 'isActive') {

            if (docForm.category === 'Variavel') {

                setDataCenter({ ...dataCenter, ['isPaid']: target.checked, ['isActive']: target.checked })
                setDocForm({ ...docForm, ['isActive']: target.checked })
            }

            setDocForm({ ...docForm, ['isActive']: target.checked })
        }

    }

    const handleDropdownContent = (value: string, value1: string) => {

        setDocForm({ ...docForm, [value1]: value })

    }

    // Functions
    function getValuesFromList() {

        const sum = _docs.reduce((acc: number, curr) => {

            return acc + Number(curr.price)

        }, 0) || 0

        return sum
    }

    function validate(category: string) {

        if (category === selectionList[0]) {

            if (dataCenter.destiny === '') {

                return {
                    msg: 'Campo Destino precisa ser preenchido',
                    isValid: false
                }
            }

            if (dataCenter.price === 0) {

                return {
                    msg: 'Campo Valor do Custo precisa ser preenchido',
                    isValid: false
                }
            }

            if (dataCenter.date === '') {

                return {
                    msg: 'Campo Data precisa ser preenchido',
                    isValid: false
                }
            }

            return {
                msg: '',
                isValid: true
            }
        }

        if (category === selectionList[1]) {

            if (dataCenter.destiny === '') {

                return {
                    msg: 'Campo Destino precisa ser preenchido',
                    isValid: false
                }
            }

            if (dataCenter.price === 0) {

                return {
                    msg: 'Campo Valor do Custo precisa ser preenchido',
                    isValid: false
                }
            }

            if (dataCenter.date === '') {

                return {
                    msg: 'Campo Data precisa ser preenchido',
                    isValid: false
                }
            }

            if (_docs.length === 0) {

                if (dataCenter.valuePaid === 0) {

                    return {
                        msg: 'Insira os dados da lista',
                        isValid: false
                    }
                }

                if (!dataCenter.isPaid) {

                    return {
                        msg: 'Campo Pago precisa ser preenchido',
                        isValid: false
                    }
                }
            }

            return {
                msg: '',
                isValid: true
            }
        }

        if (category === selectionList[2]) {

            if (dataCenter.destiny === '') {

                return {
                    msg: 'Campo Destino precisa ser preenchido',
                    isValid: false
                }
            }

            if (dataCenter.price === 0) {

                return {
                    msg: 'Campo Valor do Custo precisa ser preenchido',
                    isValid: false
                }
            }

            return {
                msg: '',
                isValid: true
            }
        }
    }

    // Effects
    useEffect(() => {

        if (location.state) {

            getDocFnc(db, '_cost', location.state)
                .then(doc => {
                    const currDoc = doc as FormDocument

                    if (currDoc.category === selectionList[1]) {

                        const docs = currDoc.docs as DeterminateCost[]

                        set_Docs(docs)
                        setGenerator(docs.length)
                    }

                    setDocForm(currDoc)

                    if (currDoc.category !== selectionList[1]) {
                        setDataCenter(currDoc.docs as DatabaseStructure)
                    }
                })
        }

    }, [])

    useEffect(() => {

        setDocForm({ ...docForm, ['docs']: dataCenter })

    }, [dataCenter])

    useEffect(() => {

        getValuesFromList()

    }, [_docs])

    useEffect(() => {

        if (_docsUP) {
            set_Docs(_docs)
            set_DocsUP(false)

            setDocForm({ ...docForm, ['docs']: _docs })
            setInsert(false)
        }

    }, [_docsUP])

    return (
        <div className={styles.wrappr}>
            <div className={styles.title}>
                <h1>Detalhes do Custo</h1>
                <div className={styles.action} onClick={handleDelete}>
                    <FaTrashArrowUp size={20} />
                </div>
            </div>
            <div className={styles.form_container}>
                <form className={`${styles.form} ${styles.form_wrappr}`} onSubmit={handleFormSubmit}>

                    <div className={styles.container}>
                        <Dropdown
                            type='text'
                            label='Categoria'
                            placeholder="Selecione a categoria..."
                            contents={selectionList}
                            value={docForm.category.trim() || ''}
                            prop_content="category"
                            onChange={(e) => setDocForm({ ...docForm, ['category']: e.target.value })}
                            change={handleDropdownContent}
                            out_style={styles.regular_top}
                            autoComplete="off"
                        />
                    </div>
                    {
                        (docForm.category === selectionList[1] || (docForm.category === selectionList[1] && location.state !== null)) && (<div className={styles.container_1}>
                            <Input
                                type='text'
                                label='Tipo'
                                name='type'
                                style={custom_style}
                                placeholder='Ex: boleto, cartão,...'
                                value={docForm.type?.toLowerCase().trim() ?? ''}
                                onChange={(e) => setDocForm({ ...docForm, ['type']: e.target.value })}
                            />
                        </div>)
                    }
                    {
                        (docForm.category === selectionList[1] || (docForm.category === selectionList[1] && location.state !== null)) && (<div className={styles.container_1}>
                            <Input
                                type='text'
                                label='Responsável'
                                name='responsible'
                                style={custom_style}
                                placeholder='Ex: Debora, Renato, Ismael...'
                                value={docForm.responsible?.toLowerCase().trim() ?? ''}
                                onChange={(e) => setDocForm({ ...docForm, ['responsible']: e.target.value })}
                            />
                        </div>)
                    }

                    {
                        docForm.category !== '' && (<div className={styles.first_element}>
                            <Input
                                type='text'
                                label='Destino'
                                name='destiny'
                                style={custom_style}
                                placeholder='Ex: aluguel, luz, combustível, boletos,...'
                                value={dataCenter.destiny.trim() || ''}
                                onChange={(e) => setDataCenter({ ...dataCenter, ['destiny']: e.target.value })}
                                onBlur={(e) => handleSetPrefix(e.target.value)}
                            />
                        </div>)
                    }

                    {
                        docForm.category !== '' && (<div className={styles.cost_value}>
                            <Input
                                type='number'
                                label='Valor do Custo'
                                name='value'
                                style={custom_style}
                                value={dataCenter.price || ''}
                                onChange={(e) => setDataCenter({ ...dataCenter, ['price']: Number(e.target.value) })}
                            />
                        </div>)
                    }

                    {
                        docForm.category !== '' && docForm.category !== selectionList[2] && (<div className={styles.date}>
                            <Input
                                type='date'
                                label='Data'
                                name='dateCost'
                                style={custom_style}
                                value={dataCenter.date || ''}
                                onChange={(e) => setDataCenter({ ...dataCenter, ['date']: e.target.value })}
                            />
                        </div>)
                    }

                    {
                        docForm.category !== '' && docForm.category === selectionList[2] && (<div className={styles.fee}>
                            <Input
                                type='number'
                                label='Vencimento'
                                style={custom_style}
                                value={dataCenter.dueDay || ''}
                                onChange={(e) => setDataCenter({ ...dataCenter, ['dueDay']: Number(e.target.value) })}
                            />
                        </div>)
                    }

                    {
                        docForm.category !== '' && docForm.category !== selectionList[0] && (<div className={styles.fee}>
                            <Input
                                type='number'
                                label='Juros'
                                name='fee'
                                style={custom_style}
                                value={dataCenter.fee_over || ''}
                                onChange={(e) => setDataCenter({ ...dataCenter, ['fee_over']: Number(e.target.value) })}
                            />
                        </div>)
                    }

                    {
                        docForm.category !== '' && docForm.category == selectionList[1] && (<div className={styles.determinate_time}>
                            <Input
                                type='number'
                                label='Ocorrência'
                                name='determinate_time'
                                style={custom_style}
                                value={generator || ''}
                                onChange={(e) => setGenerator(Number(e.target.value))}
                            />
                        </div>)
                    }

                    {
                        location.state && updateListById !== null && docForm.category !== '' && docForm.category == selectionList[1] && (<div className={styles.cost_value}>
                            <Input
                                type='number'
                                label='Valor Pago'
                                name='value'
                                style={custom_style}
                                value={dataCenter.valuePaid || ''}
                                onChange={(e) => setDataCenter({ ...dataCenter, ['valuePaid']: Number(e.target.value) })}
                            />
                        </div>)
                    }
                    {
                        ((location.state && updateListById !== null && docForm.category !== '' && docForm.category == selectionList[1]) || docForm.category == selectionList[2]) && (<div className={styles.checkbox_fee}>
                            <div className={styles.checkbox_container}>
                                <Checkbox_v2
                                    type='checkbox'
                                    label='Pago?'
                                    name='isPaid'
                                    checked={dataCenter.isPaid}
                                    value={`${dataCenter.isPaid}` || ''}
                                    onChange={handleCheckbox}
                                />
                            </div>
                        </div>)
                    }

                    {
                        docForm.category !== '' && (<div className={`${styles.checkbox_container} ${styles.margin_check}`}>
                            <Checkbox_v2
                                type='checkbox'
                                name='isActive'
                                checked={docForm.isActive}
                                value={`${docForm.isActive}` || ''}
                                onChange={handleCheckbox}
                            />
                        </div>)
                    }

                    {
                        docForm.category === selectionList[1] && (<div className={styles.insert_in_list}>
                            <span onClick={handleInsertInList}>Inserir</span>
                        </div>)
                    }

                    <div className={styles.submit}>
                        <div>
                            <BtnSubmit title={location.state !== null ? 'Atualizar' : 'Confirmar'} isSandData={isSave} />
                        </div>
                        <div>
                            <button type='button' onClick={() => navigate('/cost')} className={styles.submit_cancel}>voltar</button>
                        </div>
                    </div>

                </form>
                {
                    docForm.category === selectionList[1] && (<div className={styles.list_description}>
                        <ul className={styles.descrip_list}>
                            <li className={styles.header_list} data-id="0">
                                <span>Data</span>
                                <span>Preço</span>
                                <span>Ativo</span>
                            </li>
                            {
                                _docs.map((item, index) => (
                                    <li
                                        className={`${item.isPaid ? styles.updated : ''}`}
                                        key={index} onClick={() => handleFieldsToUpdate(index)}

                                    >
                                        <span>{splitDate_1(item.date, true).date.stampDate}</span>
                                        <span>{formatedNumber(item.valuePaid === 0 ? item.price : item.valuePaid)}</span>
                                        <span>{!item.isPaid ? <AiTwotoneCloseCircle /> : <AiTwotoneCheckCircle />}</span>
                                    </li>
                                ))
                            }
                        </ul>
                        <div className={styles.cancel_and_displaysum}>
                            <span> Total: {formatedNumber(getValuesFromList()!)}</span>
                        </div>
                    </div>)
                }
            </div>
        </div>
    )
}

export default CostDetail