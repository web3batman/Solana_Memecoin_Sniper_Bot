import axios, { AxiosError } from "axios";
import { Navigate } from "react-router-dom";
import { toastError, toastSuccess } from "./toast";

// Create an instance of axios
const api = axios.create({
    baseURL: `${import.meta.env.VITE_SERVER_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});
/*
  NOTE: intercept any error responses from the api
 and check if the token is no longer valid.
 ie. Token has expired or user is no longer
 authenticated.
 logout the user if the token has expired
*/

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response.status === 401) {
            Navigate({ to: "/" });
        }
        return Promise.reject(err);
    }
);

const postRequest = async (url: string, data: any, status: string) => {
    try {
        const res = await api.post(url, data);
        if (res.status === 200) {
            toastSuccess(`${status} success`)
            return res.data;
        }
    } catch (e) {
        console.log('postRequest', url, e)
        toastError(`${status} failed`)
        if (e instanceof AxiosError)
            return ({ error: e.response?.data.error });
        throw (e)
    }
}

export default postRequest;
