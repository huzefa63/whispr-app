import { jwtDecode } from "jwt-decode";

export function returnJwtAndUserId(){
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;
    const userId = jwtDecode(jwt).id;
    return {jwt,userId}
}