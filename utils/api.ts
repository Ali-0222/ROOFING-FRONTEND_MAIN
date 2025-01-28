import axios, { AxiosResponse } from "axios";

const baseUrl: string = process.env.NEXT_PUBLIC_API_SERVER_URL || "";
interface RequestOptions {
  headers?: {
    Authorization?: string;
  };
}

const callApi = (
  method: string,
  needAuth: boolean,
  path: string,
  data: any,
  doneCallback?: (data: any) => void,
  failCallback?: (errorMessage: string) => void,
  token?: string
): void => {
  let options: RequestOptions = {};
  if (needAuth && token) {
    options.headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  let axiosCall: Promise<AxiosResponse>;
  switch (method) {
    case "POST":
      axiosCall = axios.post(`${baseUrl}${path}`, data, options);
      break;
    case "GET":
      axiosCall = axios.get(`${baseUrl}${path}`, options);
      break;
    case "PUT":
      axiosCall = axios.put(`${baseUrl}${path}`, data, options);
      break;
    case "DELETE":
      axiosCall = axios.delete(`${baseUrl}${path}`, options);
      break;
    default:
      throw new Error("Invalid HTTP method");
  }
  axiosCall.then(
    (res) => {
      if (doneCallback) doneCallback(res.data);
    },
    (err) => {
      let errorMessage = "Network error.";
      let status = 503;
      if (err.response) {
        errorMessage = err.response.data.message;
        status = err.response.status;
      }
      if (failCallback) failCallback(err);
    }
  );
};

export const callGetApi = (
  path: string,
  doneCallback?: (data: any) => void,
  failCallback?: (errorMessage: string) => void
): void => {
  callApi("GET", false, path, undefined, doneCallback, failCallback);
};

export const callPostApi = (
  path: string,
  data: any,
  doneCallback?: (data: any) => void,
  failCallback?: (errorMessage: string) => void
): void => {
  callApi("POST", false, path, data, doneCallback, failCallback);
};

export const callPutApi = (
  path: string,
  data: any,
  doneCallback?: (data: any) => void,
  failCallback?: (errorMessage: string) => void
): void => {
  callApi("PUT", false, path, data, doneCallback, failCallback);
};

export const callDeleteApi = (
  path: string,
  doneCallback?: (data: any) => void,
  failCallback?: (errorMessage: string) => void
): void => {
  callApi("DELETE", false, path, undefined, doneCallback, failCallback);
};

export const callGetApiWithAuth = (
  path: string,
  doneCallback?: (data: any) => void,
  failCallback?: (errorMessage: string) => void,
  token?: string
): void => {
  callApi("GET", true, path, undefined, doneCallback, failCallback, token);
};

export const callPostApiWithAuth = (
  path: string,
  data: any,
  doneCallback?: (data: any) => void,
  failCallback?: (errorMessage: string) => void,
  token?: string
): void => {
  callApi("POST", true, path, data, doneCallback, failCallback, token);
};

export const callPutApiWithAuth = (
  path: string,
  data: any,
  doneCallback?: (data: any) => void,
  failCallback?: (errorMessage: string) => void,
  token?: string
): void => {
  callApi("PUT", true, path, data, doneCallback, failCallback, token);
};

export const callDeleteApiWithAuth = (
  path: string,
  doneCallback?: (data: any) => void,
  failCallback?: (errorMessage: string) => void,
  token?: string
): void => {
  callApi("DELETE", true, path, undefined, doneCallback, failCallback, token);
};
