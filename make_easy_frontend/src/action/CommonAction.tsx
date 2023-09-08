import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { RootState } from "../config/Store";
import { AnyAction } from "redux";

interface ReduxData {
  type: string;
  value: any;
}

export const setDataInRedux =
  (data: ReduxData): ThunkAction<void, RootState, unknown, AnyAction> =>
    async (
      dispatch: ThunkDispatch<RootState, unknown, AnyAction>
    ): Promise<void> => {
      dispatch({
        type: data.type,
        payload: data.value,
      });
    };

export const USER_LOGIN_REQUEST = "USER_LOGIN_REQUEST";
export const USER_LOGIN_SUCCESS = "USER_LOGIN_SUCCESS";
export const USER_LOGIN_FAIL = "USER_LOGIN_FAIL";
export const USER_LOGOUT = "USER_LOGOUT";

export const ADD_SIDEBAR_DATA = "ADD_SIDEBAR_DATA";
export const IS_SHOW_HUMBERG_MENU = "IS_SHOW_HUMBERG_MENU";

export const SET_SD_MASTER_DATA = "SET_SD_MASTER_DATA";
export const SET_SD_ADDRESS_DATA = "SET_SD_ADDRESS_DATA";
export const SET_SALE_DATA = "SET_SALE_DATA";
export const SET_BILLING_DATA = "SET_BILLING_DATA";
export const UPDATE_OVERVIEW = 'UPDATE_OVERVIEW';


export const SET_ACTIVE_TAB = "SET_ACTIVE_TAB";

export const SEARCH_RESULT = "SEARCH_RESULT";
export const RESET_SEARCH_RESULT = "RESET_SEARCH_RESULT";
export const PAGE_TITLE = "PAGE_TITLE";

export const PAGE_ACTIVE = "PAGE_ACTIVE";
export const GET_DICTIONARY = "GET_DICTIONARY";

export const SET_ADDITIONAL_INFORMATION = "SET_ADDITIONAL_INFORMATION";
export const SET_EQUIPMENT_INFORMATION = "SET_EQUIPMENT_INFORMATION";
export const RESET_EQUIPMENT_INFORMATION = "RESET_EQUIPMENT_INFORMATION";
export const SET_CUSTOMER_INFO_MODAL = "SET_CUSTOMER_INFO_MODAL";

export const SET_WORK_ORDER_ID = "SET_WORK_ORDER_ID";
export const SET_PURCHASE_ORDER_ID = " SET_PURCHASE_ORDER_ID";

export const SET_INVOICE_DATA = "SET_INVOICE_DATA";
export const SET_ADDRESS = "SET_ADDRESS";
export const SET_OVERVIEW_COUNT_DATA = "SET_OVERVIEW_COUNT_DATA"
export const SET_INVOICE_SD_MASTER = "SET_INVOICE_SD_MASTER"
export const SET_INVOICE_OVERVIEW = "SET_INVOICE_OVERVIEW"
export const SET_DEFAULTS = "SET_DEFAULTS"
export const SET_CALL_TIME_ENTRY_DATA = "SET_CALL_TIME_ENTRY_DATA"
export const SET_IS_REFRESH = "SET_IS_REFRESH"
export const SET_DISPATCH_BOARD_DATE = "SET_DISPATCH_BOARD_DATE"
export const SET_CONTRACT_DATA = "SET_CONTRACT_DATA"
