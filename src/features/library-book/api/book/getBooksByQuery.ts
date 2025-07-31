import {responseHandler} from "../util/responseHandler";
import {METHODS, requestApi, URL} from "../index";

export const getBooksByQuery = async (query: string) => {
    return responseHandler(await requestApi(METHODS.GET, URL.GET_BOOKS_BY_QUERY(query)));
}