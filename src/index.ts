import { ApiWrapper } from "./apiWrapper"
import { ScrapperWrapper } from "./scrapperWrapper"

export class Client {
  private readonly apiWrapper = new ApiWrapper()
  private readonly scrapperWrapper = new ScrapperWrapper()

  async login(matriculation: string, password: string) {
    try {
      await this.apiWrapper.login(matriculation, password)
      await this.scrapperWrapper.login(matriculation, password)
    } catch (error) {
      throw new Error("Matricula ou senha inválidos")
    }
  }

  get credentials() {
    return {
      api: this.apiWrapper.token,
      scrapper: this.scrapperWrapper.credentials
    }
  }

  async getInfo() {
    return await this.apiWrapper.getInfo()
  }
}
