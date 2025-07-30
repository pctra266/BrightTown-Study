import { getBaseurl } from "./baseURL.config";
import Axios from "axios";
import * as Urls from "./urls.config";

export enum METHODS {
  GET,
  POST,
  PUT,
  DELETE,
  PATCH,
}

export async function requestApiWithoutSecurity(
  method: METHODS,
  url: string,
  body?: any,
  header: any = {
    "Content-Type": "application/json",
  }
) {
  const full_url = getBaseurl(url);
  switch (method) {
    case METHODS.GET:
      return _get(full_url, header, body);
    case METHODS.POST:
      body = body || {};
      return _post(full_url, body, header);
    case METHODS.PUT:
      return _put(full_url, body, header);
    case METHODS.DELETE:
      return _delete(full_url, body, header);
    case METHODS.PATCH:
      return _patch(full_url, body, header);
    default:
      break;
  }
}

export async function requestApi(
  method: METHODS,
  url: string,
  body?: any,
  header: any = {
    "Content-Type": "application/json"
  }
) {

  // TODO: Add auth token as header
  // const tokenWithoutJWt = (await Auth.currentSession()).getAccessToken().payload;
  // const token = (await Auth.currentSession()).getAccessToken().getJwtToken();
  // header.Authorization = `Bearer ${token}`;
  const full_url = getBaseurl(url);
  switch (method) {
    case METHODS.GET:
      return _get(full_url, header, body);
    case METHODS.POST:
      body = body || {};
      return _post(full_url, body, header);
    case METHODS.PUT:
      return _put(full_url, body, header);
    case METHODS.DELETE:
      return _delete(full_url, body, header);
    case METHODS.PATCH:
      return _patch(full_url, body, header);
    default:
      break;
  }
}

export async function requestAnyAPI(
  method: METHODS,
  url: string,
  body?: any,
  header: any = {
    "Content-Type": "application/json",
  }
) {
  switch (method) {
    case METHODS.GET:
      return _get(url, header, body);
    case METHODS.POST:
      body = body || {};
      return _post(url, body, header);
    case METHODS.PUT:
      return _put(url, body, header);
    case METHODS.DELETE:
      return _delete(url, body, header);
    case METHODS.PATCH:
      return _patch(url, body, header);
    default:
      break;
  }
}

export const URL = Urls;

/**
 * GET Rest API Call
 *
 * @param {any} url
 * @param {any} header
 * @returns
 * @memberof RestClient
 */
const _get = async (url: string, header: any, params: any) => {
  return Axios.get(url, { headers: header, params: params })
    .then((response) => response)
    .catch(_catch);
};

/**
 * POST Rest API Call
 *
 * @param {any} url
 * @param {any} body
 * @param {any} header
 * @returns
 * @memberof RestClient
 */
const _post = async (url: string, body: any, header: any) => {
  return Axios.post(url, body, { headers: header }).then(_then).catch(_catch);
};

/**
 * PUT Rest API Call
 *
 * @param {any} url
 * @param {any} body
 * @param {any} header
 * @returns
 * @memberof RestClient
 */
const _put = async (url: string, body: any, header: any) => {
  return Axios.put(url, body, { headers: header })
    .then((response) => response)
    .catch(_catch);
};

/**
 * DELETE Rest API Call
 *
 * @param {any} url
 * @param {any} header
 * @returns
 * @memberof RestClient
 */
const _delete = async (url: string, body: any, header: any) => {
  return Axios.delete(url, { headers: header })
    .then((response) => response)
    .catch(_catch);
};

/**
 * PATCH Rest API Call
 *
 * @param {any} url
 * @param {any} header
 * @returns
 * @memberof RestClient
 */
const _patch = async (url: string, body: any, header: any) => {
  return Axios.patch(url, body, { headers: header })
    .then((response) => response)
    .catch(_catch);
};

const _catch = (error: any) => {
  console.error("api error", error?.response);
  return error?.response || error;
};

const _then = (response: any) => {
  return response;
};
