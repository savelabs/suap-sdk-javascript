import axios from "axios"
import { wrapper } from "axios-cookiejar-support"
import { CookieJar } from "tough-cookie"

export class ScrapperWrapper {
  private jar = new CookieJar()
  public scrapperInstance = wrapper(
    axios.create({ baseURL: "https://suap.ifrn.edu.br", jar: this.jar })
  )

  async login(matriculation: string, password: string) {
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
}
