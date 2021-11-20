import axios from "axios"

export class ApiWrapper {
  public token = ""
  public instance = axios.create({
    baseURL: "https://suap.ifrn.edu.br/api/v2",
    headers: {
      "Content-Type": "application/json",
      Authorization: this.token ? `JWT ${this.token}` : ""
    }
  })

  async login(matriculation: string, password: string) {
    const response = await this.instance.post(
      "autenticacao/token/?format=json",
      {
        username: matriculation,
        password
      }
    )
    this.token = response.data.token
  }
}
