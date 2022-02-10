import axios from "axios"

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

  async getInfo() {
    const response = await this.instance.get("/minhas-informacoes/meus-dados/")
    return response.data
  }
}
