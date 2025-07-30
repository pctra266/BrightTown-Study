import { METHODS, requestApi, URL } from "..";
import {responseHandler} from "../util/responseHandler";
import {type Book} from "../../components/CreateEditViewBook";

export const editExistingBook = async (bookISBN: string, body: Book) => {
    return responseHandler(await requestApi(METHODS.PATCH, URL.EDIT_EXISTING_BOOK(bookISBN), body));
}