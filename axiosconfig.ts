import axios from "axios";

const instance = axios.create({
    baseURL: "https://api.9rx.com",

    withCredentials: true,
});


export default instance;

