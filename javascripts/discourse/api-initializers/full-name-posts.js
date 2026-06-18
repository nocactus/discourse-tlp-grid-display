import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.11.1", (api) => {
  // Toon de volledige naam in antwoorden in plaats van de gebruikersnaam.
  // Discourse toont standaard alleen de username; door nameFirst te overschrijven
  // wordt user.name (volledige naam) getoond wanneer die beschikbaar is.
  api.modifyClass("component:poster-name", {
    pluginId: "hakelstube-full-name",

    get nameFirst() {
      const name = this.args?.user?.name;
      const username = this.args?.user?.username;
      return !!(name && name !== username);
    },
  });
});
