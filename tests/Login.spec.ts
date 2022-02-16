import { ClienteSuap } from "../src"

test("login", async () => {
  const client = new ClienteSuap()

  await client.login(process.env.SUAP_MATRICULATION, process.env.SUAP_PASSWORD)
})

test("login with incorrect credentials", async () => {
  const client = new ClienteSuap()

  await expect(client.login("", "")).rejects.toThrow(Error)
})
