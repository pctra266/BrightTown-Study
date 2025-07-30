import { METHODS, requestApi, URL } from "..";
import {responseHandler} from "../util/responseHandler";
import {type Book} from "../../components/CreateEditViewBook";

export const createNewBook = async (body: Book) => {
    return responseHandler(await requestApi(METHODS.POST, URL.CREATE_NEW_BOOK(), body));
}