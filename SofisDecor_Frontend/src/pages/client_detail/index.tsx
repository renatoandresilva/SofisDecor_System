import {
  FormEvent,
  useEffect,
  useState,
} from "react"
import {
  useLocation,
  useNavigate
} from "react-router-dom"
import {
  formatCellPhone,
  formatCEP,
  updateDocFunc,
  getDocFnc,
  isEmpty,
  validarCPF,
  formatCPF,
  validarCNPJ,
  _addDocFnc,
} from "../../interfaces/IUtilis/IUtilitis"
import { db } from "../../service/dataConnection"
import BtnSubmit from "../../components/btnSubmit/BtnSubmit"
import Input from "../../components/Input/Input"
import {
  ClientData,
  Address,
  API_Struc
} from "./ClientSetting"

import styles from './Client_detail.module.css'
import '../../App.css'

const address: Address = {
  zipcode: '',
  street: '',
  neighborhood: '',
  city: '',
}

const formInput: ClientData = {
  name: '',
  cpf: '',
  whatsapp: '',
  residence: '',
  address: address,
}

const ClientDetail = () => {

  const [loading, setLoading] = useState(false)
  const [sandData, setSandData] = useState(false)

  const [formData, setFormData] = useState<ClientData>(formInput)
  const [addressInfo, setAddressInfo] = useState<Address>(address)
  const [resultAddressAPI, setResultAddressAPI] = useState<null | API_Struc>(null)

  const navigate = useNavigate()
  const location = useLocation()

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    console.log(formData);

    if (formData.name.trim() === '') {
      return alert('Campo Nome precisa ser preenchido.')
    }

    if (formData.cpf.trim() === '') {
      return alert('Campo CPF precisa ser preenchido.')
    }

    if (!validarCPF(formData.cpf)) {
      return alert('Este cpf não é valido.')
    }

    if (formData.whatsapp.trim() === '') {
      return alert('Campo Whatsapp precisa ser preenchido.')
    }

    if (formData.residence.trim() === '') {
      return alert('Campo Residêcia precisa ser preenchido.')
    }

    if (addressInfo.street.trim() === '') {
      return alert('Campo Rua precisa ser preenchido.')
    }

    if (addressInfo.neighborhood.trim() === '') {
      return alert('Campo Bairro precisa ser preenchido.')
    }

    if (addressInfo.city.trim() === '') {
      return alert('Campo Bairro precisa ser preenchido.')
    }

    setLoading(true)

    try {

      const attr = {
        prop2: null, // ou os dados a comparar
        objKey: "id",
        left: ['address'], // propriedades que não devem ser verificadas
        noVerify: true
      };

      fetch('/sofisdecor/save', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          collectionName: "client",
          structure: formData,
          attr
        })
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            alert(data.msg);
          } else {
            alert("Erro: " + data.msg);
          }
        })
        .catch((err) => {
          alert("Erro de rede: " + err.message);
        });


      if (location.state === null) {

        const compare: KeyTest<ClientData, Address> = {
          prop1: 'infoSaleValue' as keyof ClientData,
          prop2: formInput.address as Address,
          objKey: 'id',
          left: ['address'],
          noVerify: true,
        }

        _addDocFnc<ClientData>(formData, db, 'client', compare)
          .then(resp => {

            if (resp.isSaved) {
              return alert(resp.msg)
            }

            alert(resp.msg)
          })

        setFormData(formInput)
        setAddressInfo(address)
        setLoading(false)
        return
      }

      updateDocFunc(db, 'client', location.state, formData)
      setFormData(formInput)
      setAddressInfo(address)
      setLoading(false)

    } catch (error) {

      setLoading(false)
      throw new Error('Não possível realizar essa operação: ' + error);

    }

  }

  const handleFormData = (e: FormEvent) => {

    const target = e.target as HTMLInputElement

    const keys = Object.keys(address)

    if (keys.indexOf(target.name) !== -1) {
      setAddressInfo({ ...addressInfo, [target.name]: target.value })
      return
    }

    setFormData({ ...formData, [target.name]: target.value })
  }

  const handleFormatPhoneZipcodeCPF = (e: FormEvent) => {
    const target = e.target as HTMLInputElement

    if (target.name === 'cpf') {

      if (target.value.length === 11) {

        if (!validarCPF(target.value)) return alert('Este CPF não é valido.')

        const formated = formatCPF(formData.cpf)!

        setFormData({ ...formData, [target.name]: formated })

        return
      }

      if (target.value.length === 14) {

        if (!validarCNPJ(target.value)) return alert('Este CNPJ não é valido.')

        const formated = formatCPF(formData.cpf)!

        setFormData({ ...formData, [target.name]: formated })
        return
      }

    }

    if (target.name === 'whatsapp') {

      const formated = formatCellPhone(formData.whatsapp)

      setFormData({ ...formData, [target.name]: formated })
      return
    }

    if (target.name === 'zipcode') {
      const formated = formatCEP(addressInfo.zipcode)

      getAddressByZipcode(target.value)
      setAddressInfo({ ...addressInfo, [target.name]: formated })
    }

  }

  async function getAddressByZipcode(zipcode: string) {

    const url = `https://viacep.com.br/ws/${zipcode.trim()}/json/`

    if (addressInfo.zipcode === '') {
      return
    }

    try {

      await fetch(url)
        .then(response => {

          response.json().then(resp => {

            type Response = API_Struc & { erro: boolean }

            const response: Response = resp as Response;

            if (!response.erro) {
              setResultAddressAPI(resp as API_Struc)
              return
            }

            console.info('Endereço não encontrado.');

          })

        })
        .catch(err => {

          throw new Error(`Erro ao buscar endereço: ${err}`);

        })

    } catch (error) {

      throw new Error(`Não foi possível essa operação: ${error}`);

    }
  }

  // Effects
  useEffect(() => {

    if (location.state) {

      getDocFnc(db, 'client', location.state).then(resp => {

        const data = resp as ClientData
        setFormData(data)
        setAddressInfo(data.address)

      })
    }
  }, [])

  useEffect(() => {

    if (loading) {
      setSandData(true)
    }

    if (resultAddressAPI !== null) {
      const address: Address = {
        zipcode: resultAddressAPI!.cep,
        street: resultAddressAPI!.logradouro,
        neighborhood: resultAddressAPI!.bairro,
        city: resultAddressAPI!.localidade,
      }
      setAddressInfo(address)
      setResultAddressAPI(null)
    }

    if (!isEmpty(addressInfo)) {
      setFormData({ ...formData, ['address']: addressInfo })
    }

  }, [loading, addressInfo, resultAddressAPI])

  return (
    <div>
      <h1 className={styles.title}>{location.state ? 'Atualizar Cadastro' : 'Cadastrar Cliente'} </h1>
      <div className={styles.form_wrapper}>
        <form onSubmit={handleFormSubmit} className={`${styles.form_content}`}>
          <div className={`${styles.input} ${styles.input_first}`}>
            <Input
              type="text"
              label="Cliente"
              name="name"
              placeholder="Ex: Renato, Debora, Vitória..."
              value={formData.name}
              onChange={handleFormData}
              className={styles.input}
              autoComplete="off"
            />
          </div>
          <div className={`${styles.resize_input}`}>
            <Input
              type="text"
              label="CPF/CNPJ"
              name="cpf"
              placeholder="000.000.000/00"
              value={formData.cpf}
              onChange={handleFormData}
              onBlur={handleFormatPhoneZipcodeCPF}
              className={styles.input}
              autoComplete="off"
            />
          </div>
          <div className={`${styles.resize_input}`}>
            <Input
              type="text"
              label="Whatsapp"
              name="whatsapp"
              placeholder="(99) 99999-9999"
              value={formData.whatsapp}
              onChange={handleFormData}
              onBlur={handleFormatPhoneZipcodeCPF}
              className={styles.input}
              autoComplete="off"
            />
          </div>
          <div className={styles.input}>
            <Input
              type="text"
              label="Residência"
              name="residence"
              placeholder="Ex: número, lote e quadra, apt, bloco..."
              value={formData.residence}
              onChange={handleFormData}
              className={styles.input}
              autoComplete="off"
            />
          </div>
          <div className={`${styles.resize_input}`}>
            <Input
              type="text"
              label="Cep"
              name="zipcode"
              placeholder="Ex: 24715-891"
              value={addressInfo.zipcode}
              onChange={handleFormData}
              onBlur={handleFormatPhoneZipcodeCPF}
              className={styles.input}
              autoComplete="off"
            />
          </div>
          <div className={styles.input}>
            <Input
              type="text"
              label="Rua"
              name="street"
              placeholder="Ex: Jurimetri Françoá da Silva..."
              value={addressInfo.street}
              onChange={handleFormData}
              autoComplete="off"
            />
          </div>
          <div className={styles.input}>
            <Input
              type="text"
              label="Bairro"
              name="neighborhood"
              placeholder="Ex: Peroba, Jardim Catarina..."
              value={addressInfo.neighborhood}
              onChange={handleFormData}
              autoComplete="off"
            />
          </div>
          <div className={`${styles.resize_input_1}`}>
            <Input
              type="text"
              label="Cidade"
              name="city"
              placeholder="Ex: São Gonçalo, Itaboraí..."
              value={addressInfo.city}
              onChange={handleFormData}
              autoComplete="off"
            />
          </div>
          <div className={`${styles.input} ${styles.actions}`}>
            <button type="button" onClick={() => navigate('/client')} className='btn_cancel '>Cancelar</button>
            <BtnSubmit title={location.state ? "Atualizar" : "Confirmar"} isSandData={sandData} />
          </div>
        </form>
      </div>

    </div>
  )
}

export default ClientDetail