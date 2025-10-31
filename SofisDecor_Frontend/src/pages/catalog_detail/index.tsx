import { FormEvent, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { IoImageOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { FaTrashCanArrowUp } from "react-icons/fa6";
import { BsArrowBarDown } from "react-icons/bs";
import { FaLongArrowAltRight } from "react-icons/fa";

import { db } from "../../service/dataConnection"
import {
    _addDocFnc,
    updateDocFunc,
    get_DocsFunc,
    getDocFnc,
    saveFile,
    getfile,
    deleteFunc,
    formatedNumber,
    createCharacters,
    KeyTest,
} from "../../interfaces/IUtilis/IUtilitis"
import BtnSubmit from "../../components/btnSubmit/BtnSubmit"
import Dropdown from "../../components/dropdown/Dropdown"

import Input from "../../components/Input/Input"
import { Product, Repost_Value, DetailStructure } from "./catalogSetting"

import styles from './Catalog_Details.module.css'

const dataProductInput: Product = {
    fileName: '',
    category: '',
    class: '',
    infoSaleValue: [],
    ProductDescription: '',
    urlImage: [],
}

const dataInfoSaleInput: Repost_Value = {
    addInfo: '',
    fee: 0,
    purchcasePrice: 0,
    salePrice: 0,
    addition: 0,
    installments: 0,
    installment_value: 0,
}

type fileImg = {
    file?: File,
    fileName?: string,
    fileBinary?: string | ArrayBuffer | null | undefined
    id?: string,
    urlImage?: string,
}

type ListOptions = {
    classes: string[],
    categories: string[],
}

type Docs = Product & { docId: string }

const CatalogDetail = () => {

    const [index, setIndex] = useState<null | number>(null)
    const [formInput, setFormInput] = useState(dataProductInput)
    const [infoSaleInput, setInfoSaleInput] = useState(dataInfoSaleInput)

    const [update, setUpdate] = useState(false)
    const [loading, setLoading] = useState(false)
    const [negative, setNegative] = useState(false)
    const [background, setBackground] = useState(false)
    const [isModelOpen, setIsModelOpen] = useState(false)

    const [images, setImages] = useState<fileImg[]>([])
    const [oldImages, setOldImages] = useState<string[]>([])
    const [optionList, setOptionList] = useState<ListOptions | null>(null)
    const [listInfoSaleVelue, setListInfoSaleVelue] = useState<Repost_Value[]>([])

    const location = useLocation()
    const navigate = useNavigate()

    /* Events Handles */
    const handleSubmitForm = async (e: FormEvent) => {
        e.preventDefault()

        formInput.class = formInput.class.trim()
        formInput.category = formInput.category.trim()
        formInput.fileName = formInput.fileName.trim()
        formInput.ProductDescription = formInput.ProductDescription?.trim()

        if (!validateForm().isValid) return alert(validateForm().msg)
        if (formInput.infoSaleValue.length == 0) return alert('Valores não inseridos na lista')
        if (formInput.urlImage!.length == 0) return alert('Imagem do produto não adcionada.')

        setLoading(true)

        try {

            const files: File[] = []

            images.forEach(el => {
                if (el.file! !== undefined) {

                    files.push(el.file!)
                }
            })

            if (location.state) {

                const obj = location.state as DetailStructure

                if (files.length !== 0) {

                    if (obj.hasImg) {

                        await saveFile(files, formInput.category, false, oldImages)
                    } else {

                        if (formInput.urlImage?.length !== 0) {

                            await saveFile(files, formInput.category, true)
                        }
                    }
                }

                await updateDocFunc(db, 'product', obj.docId, formInput)
                navigate('/catalog')

                return
            }

            const compare: KeyTest<Product, Repost_Value[]> = {
                prop1: 'infoSaleValue' as keyof Product,
                prop2: formInput.infoSaleValue as Repost_Value[],
                objKey: 'id',
                left: null,
                noVerify: true,
            }

            await _addDocFnc<Product>(formInput, db, 'product', compare)
                .then(resp => {

                    if (resp.isSaved) {

                        const file = async () => {

                            try {

                                await saveFile(files, formInput.category, false)

                            } catch (error) {

                                throw new Error("Não foi possível salvar o arquivo no banco de dados: " + error);

                            }
                        }

                        file()
                    }
                })

            navigate('/catalog')

        } catch (error) {

            throw new Error("Não possível executar essa ação: " + error);

        }
    }

    const handleAddItemInList = () => {

        if (location.state !== null) {

            const list = listInfoSaleVelue
            list.splice(index!, 1, infoSaleInput)

            setListInfoSaleVelue([])
            setListInfoSaleVelue(list)
            setUpdate(true)
            setBackground(false)
            return
        }

        setListInfoSaleVelue(item => [...item, infoSaleInput])
        setIsModelOpen(true)
    }

    const handleSalePrice = (value: number) => {

        const salePrice_1 = Number(infoSaleInput.purchcasePrice) * Number(infoSaleInput.fee) + Number(infoSaleInput.addition)
        const salePrice_2 = value * Number(infoSaleInput.installments)

        if (salePrice_1.toFixed(2) !== salePrice_2.toFixed(2)) {

            setNegative(true)
            setInfoSaleInput({ ...infoSaleInput, ['installment_value']: 0 })
            return alert('Valores inconsitentes')
        }

        setNegative(false)
        setInfoSaleInput({ ...infoSaleInput, ['salePrice']: salePrice_2 })

    }

    const handleReaderUserFile = (e: FormEvent) => {
        const target = e.target as HTMLInputElement

        if (!validateForm().isValid) return alert(validateForm().msg)

        const _file = target.files![0]

        const reader = new FileReader()

        reader.onload = (evt: ProgressEvent<FileReader>) => {

            const file: fileImg = {
                file: _file,
                fileName: _file.name,
                fileBinary: evt.target?.result,
                id: createCharacters(5)
            }

            /* Limit of imgages */
            if (images.length > 1) return alert('Máxima quantidade de imagem: 2')

            setImages(imgUrls => [...imgUrls, file])
        }

        reader.readAsDataURL(_file)
        return
    }

    const handlePopulateField = (index: number) => {

        const currElement = listInfoSaleVelue[index]

        setIndex(index)
        setBackground(true)
        setInfoSaleInput(currElement)
    }

    const handleClearList = (index: number) => {
        const list = listInfoSaleVelue
        list.splice(index!, 1)

        setListInfoSaleVelue([])
        setListInfoSaleVelue(list)
        setUpdate(true)
    }

    const handleDeleteImage = (e: FormEvent) => {
        const target = e.target as HTMLLIElement

        const newList = images.filter(image => image.id !== target.dataset.id)

        const unique = newList.reduce((acc: fileImg[], curr) => {

            const index = acc.find(el => el.fileBinary === curr.fileBinary)

            if ((!index)) {
                acc.push(curr)
            }
            return acc
        }, [])

        setImages(unique)
    }

    const handleDeleteProduct = async () => {
        try {
            if (confirm('Esta ação não poderá ser desfeita. Continue?')) {

                const obj = location.state as DetailStructure

                await deleteFunc(db, 'product', obj.docId)
                navigate('/catalog')
            }
        } catch (error) {
            throw new Error("Não possível executar essa ação: " + error);
        }
    }

    const setDropdownItemFromList = (value: string, content: string) => {
        setFormInput({ ...formInput, [content]: value })
    }

    /* Functions */
    const validateForm = () => {

        if (formInput.fileName === '') {
            return {
                isValid: false,
                msg: 'Campo Nome do Produto precisa ser preenchido.'
            }
        }

        if (infoSaleInput.purchcasePrice === 0) {
            return {
                isValid: false,
                msg: 'Campo Preço Fornecedor precisa ser preenchido.'
            }
        }

        if (infoSaleInput.fee === 0) {
            return {
                isValid: false,
                msg: 'Campo Taxa precisa ser preenchido.'
            }
        }

        if (infoSaleInput.salePrice === 0) {
            return {
                isValid: false,
                msg: 'Campo Preço Final precisa ser preenchido.'
            }
        }

        if (infoSaleInput.installments === 0) {
            return {
                isValid: false,
                msg: 'Campo Qtd Parcela precisa ser preenchido.'
            }
        }

        if (infoSaleInput.installments === 0) {
            return {
                isValid: false,
                msg: 'Campo Valor Parcela precisa ser preenchido.'
            }
        }

        if (formInput.class === '') {
            return {
                isValid: false,
                msg: 'Campo Classe do Produto precisa ser preenchido.'
            }
        }

        if (formInput.category === '') {
            return {
                isValid: false,
                msg: 'Campo Categoria do Produto precisa ser preenchido.'
            }
        }

        return {

            isValid: true,
            msg: 'Campo Categoria do Produto precisa ser preenchido.'
        }
    }

    /* Effects */
    useEffect(() => {

        get_DocsFunc<Docs>(db, 'product', false).then(docBase => {

            const data = docBase as Docs[]

            const classes = data.reduce((acc: string[], curr: Docs) => {
                if (acc.every(el => el !== curr.class)) {
                    acc.push(curr.class)
                }

                return acc
            }, [])

            const categories = data.reduce((acc: string[], curr: Docs) => {
                if (acc.every(el => el !== curr.category)) {
                    acc.push(curr.category)
                }

                return acc
            }, [])

            setOptionList({
                ...optionList!, ['classes']: classes,
                ['categories']: categories,
            })

        })

        if (location.state !== null) {

            const obj = location.state as DetailStructure

            getDocFnc(db, 'product', obj.docId).then(doc => {
                const data = doc as Product

                // get Images 
                if (obj.hasImg) {
                    data.urlImage?.forEach(urlImage => {
                        getfile(urlImage).then(el => {

                            // 1- ANALIZAR ESSE TRRCHO MELHOR....

                            const imgList: fileImg[] = []

                            const obj: fileImg = {
                                fileBinary: el,
                                id: createCharacters(10)
                            }

                            imgList.push(obj)

                            // remove repeated urls
                            const unique = imgList.reduce((acc: fileImg[], curr) => {

                                const index = acc.find(el => el.fileBinary === curr.fileBinary)

                                if (!index) {
                                    acc.push(curr)
                                }
                                return acc
                            }, [])

                            setImages(unique)
                        })
                    })
                }

                setOldImages(data.urlImage!)
                setFormInput(doc as Product)
                setListInfoSaleVelue(data.infoSaleValue)
                setIsModelOpen(true)
            })
        }

    }, [])

    useEffect(() => {

        if (images.length === 0) return

        const urlImage: string[] = []

        images.forEach(el => {

            if (el.fileName) {
                urlImage.push(`catalog/${formInput.category}/${el.fileName}`)
            }
        })

        if (urlImage.length !== 0) {

            const unique = urlImage.reduce((acc: string[], curr: string) => {

                const index = acc.find(el => el === curr)

                if (!index) {
                    acc.push(curr)
                }

                return acc

            }, [])

            setFormInput({ ...formInput, ['urlImage']: unique })
        }

    }, [images])

    useEffect(() => {

        if (update) {
            setUpdate(false)
        }
    }, [update])

    useEffect(() => {

        if (listInfoSaleVelue.length !== 0) {
            setFormInput({ ...formInput, ['infoSaleValue']: listInfoSaleVelue })
        }

    }, [listInfoSaleVelue])

    return (
        <div className={styles.container}>
            <div className={styles.title_container}>
                <h1 className={styles.title}>{location.state ? 'Atualizar Produto' : 'Cadastrar Produto'}</h1>
                <div className={styles.action}>
                    <span onClick={handleDeleteProduct}>Excluir Produto</span>
                </div>
            </div>
            <form className={styles.form} onSubmit={handleSubmitForm}>
                <fieldset className={styles.form_col_1}>
                    <div>
                        <Input
                            type="text"
                            label="Nome do Produto"
                            placeholder="Ex: Erick, Romeu, Nilo..."
                            value={formInput.fileName.trim() || ''}
                            onChange={(e) => setFormInput({ ...formInput, ['fileName']: e.target.value })}
                        />
                    </div>
                    <div>
                        <Input
                            type="text"
                            label="Informação Adicional"
                            placeholder="Digite uma pequena informação..."
                            value={infoSaleInput.addInfo?.trim() || ''}
                            onChange={(e) => setInfoSaleInput({ ...infoSaleInput, ['addInfo']: e.target.value })}
                            className={background ? styles.background : ''}
                        />
                    </div>
                    <div>
                        <Input
                            type="number"
                            label="Preço Fornecedor"
                            value={infoSaleInput.purchcasePrice || ''}
                            onChange={(e) => setInfoSaleInput({ ...infoSaleInput, ['purchcasePrice']: Number(e.target.value) })}
                            className={background ? styles.background : ''}
                        />
                    </div>
                    <div>
                        <Input
                            type="number"
                            label="Taxa"
                            value={infoSaleInput.fee || ''}
                            onChange={(e) => setInfoSaleInput({ ...infoSaleInput, ['fee']: Number(e.target.value) })}
                            className={background ? styles.background : ''}
                        />
                    </div>
                    <div>
                        <Input
                            type="number"
                            label="Acréssimo"
                            value={infoSaleInput.addition || ''}
                            onChange={(e) => setInfoSaleInput({ ...infoSaleInput, ['addition']: Number(e.target.value) })}
                            className={background ? styles.background : ''}
                        />
                    </div>
                    <div>
                        <Input
                            type="number"
                            label="Preço Final"
                            disabled
                            value={infoSaleInput.salePrice || ''}
                            onChange={(e) => setInfoSaleInput({ ...infoSaleInput, ['salePrice']: Number(e.target.value) })}
                            className={`${background ? styles.background : ''} ${negative ? styles.negative : ''}`}
                        />
                    </div>
                    <div>
                        <Input
                            type="number"
                            label="Qtd Parcela"
                            value={infoSaleInput.installments || ''}
                            onChange={(e) => setInfoSaleInput({ ...infoSaleInput, ['installments']: Number(e.target.value) })}
                            className={background ? styles.background : ''}
                        />
                    </div>
                    <div>
                        <Input
                            type="number"
                            label="Valor Parcela"
                            value={infoSaleInput.installment_value || ''}
                            onChange={(e) => setInfoSaleInput({ ...infoSaleInput, ['installment_value']: Number(e.target.value) })}
                            className={background ? styles.background : ''}
                            onBlur={(e) => handleSalePrice(Number(e.target.value))}
                        />
                    </div>
                </fieldset>
                <fieldset className={styles.form_col_2}>
                    <div>
                        <Dropdown
                            contents={optionList?.classes!}
                            className={styles.dropdown}
                            label="Classe"
                            placeholder="Não encontrou na lista? digite..."
                            value={formInput.class.trim() || ''}
                            prop_content="class"
                            onChange={(e) => setFormInput({ ...formInput, ['class']: e.target.value })}
                            change={setDropdownItemFromList}
                        />
                    </div>
                    <div>
                        <Dropdown
                            contents={optionList?.categories!}
                            className={styles.dropdown}
                            label="Categoria"
                            placeholder="Não encontrou na lista? digite..."
                            value={formInput.category.trim() || ''}
                            prop_content="category"
                            onChange={(e) => setFormInput({ ...formInput, ['category']: e.target.value })}
                            change={setDropdownItemFromList}
                        />
                    </div>
                    <div>
                        <label className={styles.description}>
                            <span>Descrição do Produto</span>
                            <textarea
                                placeholder="Ex: cor do produto, altura, largura, 9 gavetas, ..."
                                rows={8} cols={33}
                                value={formInput.ProductDescription}
                                onChange={(e) => setFormInput({ ...formInput, ['ProductDescription']: e.target.value })}
                            >
                            </textarea>
                        </label>
                    </div>
                    <div className={styles.form_col_2_actions}>
                        <span onClick={handleAddItemInList}>Inserir na lista</span>
                        <span onClick={() => setInfoSaleInput(dataInfoSaleInput)}>Limpar lista</span>
                    </div>
                </fieldset>
                <div className={styles.form_submit}>
                    <div className={styles.file_container}>
                        <label className={styles.file}>
                            <span><IoImageOutline /> Imagem</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple style={{ display: 'none' }}
                                onChange={handleReaderUserFile}
                            />
                        </label>
                    </div>
                    <div className={styles.submit}>
                        <span onClick={() => navigate('/catalog')}>Cancelar</span>
                        <BtnSubmit title='Confirmar' isSandData={loading} />
                    </div>
                </div>
            </form>
            {
                images.length > 0 && (<ul className={styles.images} onDoubleClick={handleDeleteImage}>
                    {
                        images.map((item) => (
                            <li key={item.id} className={styles.image}>
                                <img src={item.fileBinary as string} className={styles.image_content} data-id={item.id} />
                            </li>
                        ))
                    }
                </ul>)
            }
            {
                isModelOpen && (<div className={styles.modal}>
                    <div className={styles.modal_header}>
                        <div className={styles.header_col1}>
                            <span>Descrição</span>
                            <span className={styles.header_child1}>Preço</span>
                        </div>
                        <div className={styles.header_col2}>
                            <span><BsArrowBarDown /></span>
                            <span onClick={() => setIsModelOpen(false)} className={styles.icon}><BsArrowBarDown /></span>
                        </div>
                    </div>
                    <ul className={styles.modal_list}>
                        {
                            listInfoSaleVelue.length !== 0 && listInfoSaleVelue.map((item, index) => (
                                <li key={index} className={styles.modal_content}>
                                    <div className={styles.content_col1}>
                                        <span>{item?.addInfo ? item?.addInfo : <FaLongArrowAltRight />}</span>
                                        <span>{formatedNumber(Number(item?.salePrice))}</span>
                                    </div>
                                    <div className={styles.content_col2}>
                                        <span onClick={() => handlePopulateField(index)}>{location.state !== null ? <FaRegEdit /> : '----'}  </span>
                                        <span onClick={() => handleClearList(index)}>{location.state === null ? <FaTrashCanArrowUp /> : '----'}</span>
                                    </div>
                                </li>
                            ))
                        }
                    </ul>
                </div>)
            }
        </div>
    )

}

export default CatalogDetail

