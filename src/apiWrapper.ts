import axios, { AxiosInstance } from "axios"
import {
  Boletim,
  InformaçõesTurmaVirtual,
  PeríodoLetivo,
  TurmaVirtual
} from "./types"

export class ApiWrapper {
  public token = ""
  public refreshToken = ""
  public instance: AxiosInstance
  public urlBase = ""

  constructor(urlBase: string) {
    this.urlBase = urlBase

    this.instance = axios.create({
      baseURL: `${this.urlBase}/api/v2`,
      headers: {
        "Content-Type": "application/json"
      }
    })

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response.status === 401) {
          await this.renovarToken()
          return this.instance.request(error.config)
        }
        return Promise.reject(error)
      }
    )
  }

  loginWithToken(token: string) {
    this.token = token
    this.instance.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  async login(matriculation: string, password: string) {
    const response = await this.instance.post(
      "/autenticacao/token/?format=json",
      {
        username: matriculation,
        password
      }
    )
    this.token = response.data.access
    this.refreshToken = response.data.refresh
    this.instance.defaults.headers.common.Authorization = `Bearer ${this.token}`
  }

  async renovarToken() {
    const response = await this.instance.post("/autenticacao/token/refresh/", {
      refresh: this.refreshToken
    })
    this.token = response.data.access
    this.instance.defaults.headers.common.Authorization = `Bearer ${this.token}`
    return this.token
  }

  async obterInformações() {
    const response = await this.instance.get("/minhas-informacoes/meus-dados/")
    return response.data
  }

  async obterPeríodosLetivos(): Promise<PeríodoLetivo[]> {
    const response = await this.instance.get(
      "/minhas-informacoes/meus-periodos-letivos/"
    )
    return response.data
  }

  async obterNotas(
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<Boletim[]> {
    const response = await this.instance.get(
      `/minhas-informacoes/boletim/${anoLetivo}/${períodoLetivo}/`
    )

    return response.data
  }

  async obterTurmasVirtuais(
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<TurmaVirtual[]> {
    const response = await this.instance.get(
      `/minhas-informacoes/turmas-virtuais/${anoLetivo}/${períodoLetivo}/`
    )

    return response.data
  }

  async obterInformaçõesTurmaVirtual(
    códigoDiário: string
  ): Promise<InformaçõesTurmaVirtual> {
    const response = await this.instance.get(
      `/minhas-informacoes/turma-virtual/${códigoDiário}/`
    )

    return response.data
  }
}
