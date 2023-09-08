import axios from "axios";
import { toast } from "react-toastify";

//Development
const LOGIN_BASE_URL = "https://sawin-basic-webapi-po.azurewebsites.net/";

// const LOGIN_BASE_URL = "http://172.190.244.4:8080/";

//QA
// const LOGIN_BASE_URL = "https://sawinprov4-qa-webapi-silicus-qa.azurewebsites.net/";

//Production
// const LOGIN_BASE_URL = "https://sawinprov4-prospect-webapi-prospect.azurewebsites.net/"

const BASE_URL = LOGIN_BASE_URL + "api/";

export const GOOGLE_MAP_API_KEY = "AIzaSyAbGxCGRyI51IgjLi3sebel2fhLiMJ5Ygc";

interface PropData {
  action: string;
  body?: any;
  isFormData?: boolean;
  isShowError?: boolean;
  id?: string;
}

const WebService = {
  postAPI: function (props: PropData) {
    // this.addLoader(props.id);
    return new Promise((resolve, reject) => {
      var bodyFormData = new URLSearchParams();
      for (let key in props.body) {
        bodyFormData.append(key, props.body[key]);
      }
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      axios
        .post(
          `${BASE_URL}${props.action}`,
          props.isFormData ? bodyFormData : props.body,
          {
            headers: headers,
          }
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error && error.response && error.response.status == 401) {
            localStorage.clear();
            window.location.href = "/login";
          }

          props.isShowError ? reject(this.errorHandler(error)) : reject(error);
        });
    });
  },
  putAPI: function (props: PropData) {
    // eslint-disable-line
    return new Promise((resolve, reject) => {
      var bodyFormData = new URLSearchParams();
      for (let key in props.body) {
        bodyFormData.append(key, props.body[key]);
      }
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      axios
        .put(`${BASE_URL}${props.action}`, props.body, {
          headers: headers,
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          props.isShowError ? reject(this.errorHandler(error)) : reject(error);
        });
    });
  },

  getAccesstoken: function (props: PropData) {
    // eslint-disable-line
    // this.addLoader(props.id);
    return new Promise((resolve, reject) => {
      var bodyFormData = new URLSearchParams();
      for (let key in props.body) {
        bodyFormData.append(key, props.body[key]);
      }
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
      };
      axios
        .post(`${LOGIN_BASE_URL}${props.action}`, bodyFormData, {
          headers: headers,
        })
        .then((response) => {
          localStorage.setItem("token", response.data.access_token);
          resolve(response.data);
        })
        .catch((error) => {
          props.isShowError ? reject(this.errorHandler(error)) : reject(error);
        });
    });
  },

  getAPI: function (props: PropData) {
    return new Promise((resolve, reject) => {
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      axios
        .get(`${BASE_URL}${props.action}`, {
          headers: headers,
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          props.isShowError ? reject(this.errorHandler(error)) : reject(error);
        });
    });
  },

  deleteAPI: function (props: PropData) {
    return new Promise((resolve, reject) => {
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      axios
        .delete(`${BASE_URL}${props.action}`, {
          headers: headers,
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          props.isShowError ? reject(this.errorHandler(error)) : reject(error);
        });
    });
  },

  errorHandler: function (error: any) {
    if (error?.response) {
      error = error.response;
    }

    var errorMessage;
    if (!error || !error.status) {
      errorMessage = "Server Not Responding";
    } else if (error.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    } else if (error.status === 500) {
      errorMessage =
        (error &&
          error.data &&
          error.data.ErrorDetails &&
          error.data.ErrorDetails.message) ||
        "An unkown exception has occur. Please Contact administrator";
    } else {
      errorMessage = error.data.error_description;
    }
    toast.error(errorMessage);
    return errorMessage;
  },

  addLoader(id: any) {
    if (id) {
      var button = document.getElementById(id) as HTMLButtonElement | null;
      if (button != null) {
        button.disabled = true;
        var loader = document.createElement("i");
        loader.className = "bi bi-arrow-repeat mr-2";
        button.prepend(loader);
      }
    }
  },

  removeLoader(id: any) {
    if (id) {
      var button = document.getElementById(id) as HTMLButtonElement | null;
      if (button != null) {
        button.disabled = false;
        button.removeChild(button.childNodes[0]);
      }
    }
  },
  getReportUrl() {
    return LOGIN_BASE_URL;
  }


};

export default WebService;
