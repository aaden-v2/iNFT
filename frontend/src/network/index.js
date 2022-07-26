import axios from "axios";

export const HOST =
  process.env.NODE_ENV === "production" ? "https://nftads.info" : "http://localhost:5003";

const myAxios = axios.create({
  baseURL: HOST,
  withCredentials: true
});

export const get = myAxios.get;
export const post = myAxios.post;
export const put = myAxios.put;

export default myAxios;
