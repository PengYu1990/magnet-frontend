import { LOGIN_USER } from "../authProvider";
import { User } from "../interfaces";

export default function getLoginUser() {

    // const token = localStorage.getItem(TOKEN_KEY);

    // Get current login user
    const userString = localStorage.getItem(LOGIN_USER);
    let user: User | null = null;
    if (userString != null)  {
        user = JSON.parse(userString);
        return user;
    }
    return null;
}