import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://localhost:9090",
    realm: "taasselunga",
    clientId: "taasselunga_frontend",
});

export default keycloak;