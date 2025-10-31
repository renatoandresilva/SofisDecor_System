import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import Dropdown from '../../components/dropdown/Dropdown'

import styles from './CatalogHome.module.css'
import { TategoryHome_struc, Doc, ImgsDoc } from './catalogHomeSetting'
import { db } from '../../service/dataConnection'
import {
    formatedNumber,
    checkPermission,
    getDocsFunc,
    DataRef,
    createCharacters,
    getfile,
    isArrayEqual,
    get_DocsFunc
} from '../../interfaces/IUtilis/IUtilitis'

type Data = TategoryHome_struc & { docId: string }

const CatalogHome = () => {

    const [render, setRender] = useState<number | null>(null)

    const [names, setNames] = useState<string[]>([])
    const [fileNames, setFileNames] = useState<string[]>([])
    const [binaries, setBinaries] = useState<string[][]>([])
    const [binaries_, setBinaries_] = useState<ImgsDoc[]>([])
    const [listRender, setListRender] = useState<TategoryHome_struc[]>([])
    const [filteredList, setFilteredList] = useState<TategoryHome_struc[]>([])
    const [listRenderUpdated, setBinariesUpdated] = useState<TategoryHome_struc[]>([])

    const [title, setTitle] = useState('')
    const [filter, setFilter] = useState('')

    const [open, setOpen] = useState(false)
    const [isPermite, setIsPermite] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()

    const handleGoToCatalogDetail = () => {

        if (filteredList.length > 0) {

            setFileNames(getFileNames(filteredList))
        }

        !open ? setOpen(true) : setOpen(false)
    }

    const handleGetDetails = (name: string) => {

        if (filteredList.length < 1) {

            const el = listRender.filter(el => el.fileName === name)
            const hasUrlImg = el[0].urlImage[0] ? true : false

            navigate(`/catalog_detail/${createCharacters(10)}`, { state: { docId: el[0].docId, hasImg: hasUrlImg } })

        }

        const el = filteredList.filter(el => el.fileName === name)
        const hasUrlImg = el[0].urlImage[0] ? true : false

        navigate(`/catalog_detail/${createCharacters(10)}`, { state: { docId: el[0].docId, hasImg: hasUrlImg } })

    }

    const handleGoDetailToUpdate = (e: FormEvent) => {

        if (!isPermite) return

        const target = e.target as HTMLImageElement

        if (filteredList.length < 1) {

            const el = listRender.filter(el => el.fileName === target.dataset.id)
            const hasUrlImg = el[0].urlImage[0] ? true : false

            navigate(`/catalog_detail/${createCharacters(10)}`, { state: { docId: el[0].docId, hasImg: hasUrlImg } })

        }

        const el = filteredList.filter(el => el.fileName === target.dataset.id)
        const hasUrlImg = el[0].urlImage[0] ? true : false

        navigate(`/catalog_detail/${createCharacters(10)}`, { state: { docId: el[0].docId, hasImg: hasUrlImg } })

    }

    // Functions
    async function init() {

        const upCase = location.state as string
        const letter = upCase.charAt(0)
        const change = upCase.charAt(0).toLocaleUpperCase()
        const change1 = upCase.replace(letter, change)

        try {

            const snapData1: TategoryHome_struc[] = []
            await getDocsFunc(db, 'product', true, 'category', change1).then(docEl => {

                const originalArray = docEl as DataRef[]
                const snapData: TategoryHome_struc[] = []

                originalArray.forEach(item => {
                    const currDoc = item.docData as Doc

                    const obj: TategoryHome_struc = {
                        id: currDoc.id,
                        docId: item.docId,
                        fileName: currDoc.fileName,
                        category: currDoc.category,
                        class: currDoc.class,
                        infoSaleValue: currDoc.infoSaleValue,
                        installment_value: item.docData.infoSaleValue[0].installment_value,
                        ProductDescription: currDoc.ProductDescription,
                        urlImage: currDoc.urlImage,
                    }

                    snapData.push(obj)
                    snapData1.push(obj)
                })

            })

            getFileNames(snapData1)
            setListRender(snapData1)
            setIsPermite(checkPermission())

        } catch (error) {

            console.error("Erro ao carregar imgaem" + error);

        }

    }

    function getFileNames(list: TategoryHome_struc[]): string[] {

        const file_Names: string[] = []

        list.forEach(item => {

            file_Names.push(item.fileName.trim())
        })

        // Set Unique Items list
        const names = fileNames.reduce(function (previous: string[], current: string) {

            const index = previous.findIndex(name => name === current)

            if (index === -1) {
                previous.push(current)
            }

            return previous
        }, [])

        setFileNames(names)
        return file_Names
    }

    /* UseEffects */
    useEffect(() => {

        try {

            const dataBase = async () => {

                await get_DocsFunc<Data>(db, 'product', false).then(doc => {

                    const docBase = doc as Data[]

                    const listContent = docBase.reduce((acc: string[], curr: Data) => {

                        if (acc.every(el => el !== curr.class)) {
                            acc.push(curr.class)
                        }

                        return acc
                    }, [])

                    setNames(listContent)
                })

            }

            init()
            dataBase()

        } catch (error) {
            throw new Error("Não possível carregar os dados: " + error);
        }

    }, [])

    useEffect(() => {

    }, [])

    useEffect(() => {

        if (Array.isArray(listRender) && listRender.length) {

            // Get title form category
            setFileNames(getFileNames(listRender))
            setTitle(listRender[0].category)

            if (binaries.length === 0) {

                const list: string[][] = []

                listRender.forEach(item => {
                    list.push(item.urlImage)
                })

                const unique = list.reduce((acc: string[][], curr) => {
                    const index = acc.find(el => {
                        if (isArrayEqual(el, curr)) {
                            return true
                        }

                        return false
                    })

                    if (!index) {
                        acc.push(curr)
                    }

                    return acc
                }, [])

                setBinaries(unique)
            }

        }

        if (listRender.length !== 0) {
        }

    }, [listRender])

    useEffect(() => {

        if (Array.isArray(binaries) && binaries.length !== 0) {

            const unique = listRender.reduce((acc: TategoryHome_struc[], curr) => {

                const index = acc.find(el => el.docId === curr.docId)

                if (!index) {
                    acc.push(curr)
                }

                return acc
            }, [])

            unique.forEach((item, index) => {

                const arr = binaries[index]

                if (arr && arr.length) {
                    arr.forEach(el => {

                        getfile(el).then(url => {

                            if (url) {

                                const arr: ImgsDoc = {
                                    class: item.class,
                                    index,
                                    objList: url,
                                    hasUrl: true
                                }
                                setBinaries_(item => [...item, arr])
                            } else {

                                const arr: ImgsDoc = {
                                    class: item.class,
                                    index,
                                    objList: url!,
                                    hasUrl: false
                                }

                                setBinaries_(item => [...item, arr])
                                throw new Error("Imagem não adcionada ao bucker de imagens: " + el);

                            }

                        })
                    })
                }

            })

        }

    }, [binaries])

    useEffect(() => {

        if (Array.isArray(binaries_) && binaries_.length !== 0) {

            const unique = listRender.reduce((acc: TategoryHome_struc[], curr) => {

                const index = acc.find(el => el.docId === curr.docId)

                if (!index) {
                    acc.push(curr)
                }

                return acc
            }, [])

            const list_1: TategoryHome_struc[] = []

            unique.forEach((item, index) => {
                const obj = item

                const list: string[] = []

                binaries_.forEach(el => {
                    if (el.index === index) {
                        list.push(el.objList)
                    }
                })
                obj.urlImage = list

                list_1.push(obj)
            })

            const unique_1 = list_1.reduce((acc: TategoryHome_struc[], curr) => {

                const index = acc.find(el => el.docId === curr.docId)

                if (!index) {
                    acc.push(curr)
                }

                return acc
            }, [])

            setBinariesUpdated(unique_1)
        }

    }, [binaries_])

    useEffect(() => {

        if (filter) {

            const filteredList = listRenderUpdated.filter(item => item.class === filter)

            setFilteredList(filteredList)
            console.log(filteredList);

        } else {
            setRender(null)
            setFilteredList([])
            init()
        }
    }, [filter])

    return (
        <main className={styles.catelogHome_container}>

            <div><p>Wpp:<b> (22) 98118-7869</b></p></div>

            {
                isPermite ? (<div className={styles.linkList_container}>
                    <ul className={styles.linkList}>
                        {
                            open && fileNames.length > 0 && fileNames.map(el => (<li key={el} onClick={() => handleGetDetails(el)}>
                                <span>{el}</span>
                            </li>))
                        }
                    </ul>
                    <span onClick={handleGoToCatalogDetail} className={styles.manager_catalog}>Gerenciar Catálogo</span>
                </div>) : (<div className={styles.linkList_container}>
                    <span onClick={() => navigate('/catalog')} className={styles.getback}>Voltar</span>
                </div>)
            }

            <h1>Móveis para {title ?? 'seu lar'}</h1>

            <section className={styles.catelogHome_filter}>
                <div>
                    <Dropdown
                        placeholder='Buscar por cama, sofá, fogão, ... '
                        contents={names}
                        value={filter}
                        change={setFilter}
                        prop_content=''
                        out_style={styles.dropdown}
                        xmark_clean={styles.xmark_clean}
                    />
                </div>
            </section>

            <section className={styles.catelogHome_imgs}>
                <ul onClick={handleGoDetailToUpdate}>
                    {
                        filteredList.length !== 0 ? filteredList.map((item) => (<li key={item.id}>
                            < div className={styles.img_container}>
                                <img src={item.urlImage[0]} className={isPermite ? `${styles.img}` : ''} alt='Imagem do produto' key={render} data-id={item.fileName} />

                            </div>
                            <div className={styles.img_info}>
                                <div className={styles.img_info_description}>
                                    <span>{item.ProductDescription}</span>
                                </div>
                                <ul className={styles.img_info_price}>
                                    {item.infoSaleValue.length > 0 && item.infoSaleValue.map((el, index) => (
                                        <li className={styles.stamp_info} key={index}>
                                            <span>
                                                {el.addInfo}
                                                <span className={styles.stamp_arraow}>{'->'}</span>
                                                <span>{el.installments}x de</span>
                                                <span>{formatedNumber(el.installment_value)}</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>))
                            : listRenderUpdated.length !== 0 && listRenderUpdated.map((item) => (
                                <li key={item.id}>
                                    <div className={styles.img_container}>
                                        <img src={item.urlImage[0]} className={styles.img} alt='Imagem  do produto' data-id={item.fileName} />
                                    </div>
                                    <div className={styles.img_info}>
                                        <div className={styles.img_info_description}>
                                            <span>{item.ProductDescription}</span>
                                        </div>
                                        <ul className={styles.img_info_price}>
                                            {item.infoSaleValue.length > 0 && item.infoSaleValue.map((el, index) => (
                                                <li className={styles.stamp_info} key={index}>
                                                    <span>
                                                        {el.addInfo}
                                                        <span className={styles.stamp_arraow}>{'->'}</span>
                                                        <span>{el.installments}x de</span>
                                                        <span>{formatedNumber(el.installment_value)}</span>
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                            ))
                    }
                </ul>
            </section>
        </main >
    )
}

export default CatalogHome

