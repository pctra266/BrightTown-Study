// Members API end points.
export const CREATE_NEW_MEMBER = () => "/members";
export const EDIT_EXISTING_MEMBER = (memberUUID: string) => `/members/${memberUUID}`;
export const DELETE_EXISTING_MEMBER = (id: string) => `/members/${id}`;
export const GET_MEMBERS_BY_QUERY = (query: string) => `/members?q=${query}`;

// Books API end points.
export const CREATE_NEW_BOOK = () => "/books";
export const EDIT_EXISTING_BOOK = (bookISBN: string) => `/books/${bookISBN}`;
export const GET_BOOKS_BY_QUERY = (query: string) => `/books?q=${query}`;

// IssueNote API end point.
export const CREATE_NEW_ISSUE_NOTE = () => "/issue-notes";

// ReturnNote API end point.
export const CREATE_NEW_RETURN_NOTE = () => "/returns";