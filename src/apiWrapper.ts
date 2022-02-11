import axios from "axios"
import { Boletim, PeríodoLetivo } from "./types"

export class ApiWrapper {
  public token = ""
  public instance = axios.create({
    baseURL: "https://suap.ifrn.edu.br/api/v2",
    headers: {
      "Content-Type": "application/json"
    }
  })

  async login(matriculation: string, password: string) {
    const response = await this.instance.post(
      "/autenticacao/token/?format=json",
      {
        username: matriculation,
        password
      }
    )
    this.token = response.data.token
    this.instance.defaults.headers.common.Authorization = `JWT ${this.token}`
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
}
