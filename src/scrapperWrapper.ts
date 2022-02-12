import axios from "axios"
import { wrapper } from "axios-cookiejar-support"
import { CookieJar } from "tough-cookie"
import cheerio from "cheerio"
import { chunk, zipObject } from "./utils"
import { DetalhesNota, Documento } from "./types"

export class ScrapperWrapper {
  private jar = new CookieJar()
  public scrapperInstance = wrapper(
    axios.create({ baseURL: "https://suap.ifrn.edu.br", jar: this.jar })
  )

  public matriculation: string

  async login(matriculation: string, password: string) {
    this.matriculation = matriculation

    await this.scrapperInstance.get("/")
    const cookieString = await this.jar.getCookieString(
      "https://suap.ifrn.edu.br"
    )

    await this.scrapperInstance.post(
      "/accounts/login/",
      new URLSearchParams({
        username: matriculation,
        password,
        this_is_the_login_form: "1",
        csrfmiddlewaretoken: cookieString.split("csrftoken=")[1].split(";")[0]
      }).toString(),
      {
        headers: {
          Host: "suap.ifrn.edu.br",
          Origin: "https://suap.ifrn.edu.br",
          Referer: "https://suap.ifrn.edu.br/accounts/login/?next=",
          "User-Agent": "Aplicativo Save"
        }
      }
    )

    await this.scrapperInstance.get("/")
  }

  get credentials() {
    return this.jar.getCookieStringSync("https://suap.ifrn.edu.br")
  }

  async detalharNota(códigoDiário: string): Promise<DetalhesNota> {
    let response = await this.scrapperInstance.get(
      `/edu/aluno/${this.matriculation}/`
    )
    let $ = cheerio.load(response.data)

    const href = $(`tr:has(> td:contains("${códigoDiário}")) > td > a`).attr(
      "href"
    )

    response = await this.scrapperInstance.get(href)

    $ = cheerio.load(response.data)

    const teachers = $("#content > div:nth-child(3) > div").text()

    const titles = $("#content > div:nth-child(4) > div > h4")
      .toArray()
      .map((el) => $(el).text().replace(/\s+/g, " "))

    const data = $("#content > div:nth-child(4) > div > table")
      .toArray()
      .map((el) => {
        const $el = $(el)
        const data = $el
          .find("td")
          .toArray()
          .map((el) => $(el).text())
        const result = []
        chunk(data, 5).forEach((chunk: string[]) => {
          result.push({
            Sigla: chunk[0],
            Tipo: chunk[1],
            Descrição: chunk[2],
            Peso: chunk[3],
            "Nota Obtida": chunk[4]
          })
        })
        return result
      })

    return {
      Professores: teachers.trim(),
      "Detalhamento das Notas": zipObject(titles, data)
    }
  }

  async obterDocumentos(): Promise<Documento[]> {
    const response = await this.scrapperInstance.get(
      `/edu/aluno/${this.matriculation}/`
    )

    const $ = cheerio.load(response.data)

    const documents = $(
      "#content > div.title-container > div.action-bar-container > ul > li:nth-child(2) > ul > li > a"
    )
      .toArray()
      .map((el) => {
        const $el = $(el)
        return {
          nome: $el.text(),
          link: $el.attr("href")
        }
      })

    return documents
  }
}
