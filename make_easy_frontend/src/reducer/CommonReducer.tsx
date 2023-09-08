import { any } from "prop-types";
import {
  RESET_SEARCH_RESULT,
  SEARCH_RESULT,
  SET_SD_MASTER_DATA,
  PAGE_TITLE,
  SET_ADDRESS,
  PAGE_ACTIVE,
  SET_ADDITIONAL_INFORMATION,
  SET_EQUIPMENT_INFORMATION,
  SET_CUSTOMER_INFO_MODAL,
  SET_SD_ADDRESS_DATA,
  SET_ACTIVE_TAB,
  GET_DICTIONARY,
  RESET_EQUIPMENT_INFORMATION,
  SET_WORK_ORDER_ID,
  SET_PURCHASE_ORDER_ID,
  SET_INVOICE_DATA,
  SET_OVERVIEW_COUNT_DATA,
  SET_INVOICE_SD_MASTER,
  SET_INVOICE_OVERVIEW,
  SET_SALE_DATA,
  SET_DEFAULTS,
  SET_CALL_TIME_ENTRY_DATA,
  SET_IS_REFRESH,
  SET_DISPATCH_BOARD_DATE,
  SET_BILLING_DATA,
  SET_CONTRACT_DATA,
  UPDATE_OVERVIEW,
} from "../action/CommonAction";

export interface contractDataState {
  contractData: object;
}

export interface DispatchBoardDateState {
  DispatchBoardDate: any;
}

export interface CallTimeEntryState {
  CallTimeEntryId: object;
}

export interface isRefreshState {
  isRefresh: any;
}

export interface SDMaster {
  sd_master: object;
}

export interface SDBilling {
  billing: object;
}

export interface Sales { }

export interface Address { }

export interface PageTitle {
  title: string;
}

export interface PageActiveState {
  title: string;
}

export interface AdditionalInfoState {
  AdditionalInfo: object;
}

export interface ActiveTabState {
  ActiveTab: "BookService";
}

export interface AttachEquipmentState {
  AttachEquipment: object;
}

export interface InviceSDMasterState {
  invoceSDMaster: object;
}

export interface SearchState {
  searchData: any;
}

export interface UpdateOverviewState {
  isUpdate: any;
}

export interface CustomerModalState {
  isShow: boolean;
}

export interface AddressState {
  addressData: object;
}

interface Action {
  type: string;
  payload?: any;
}

export interface getDictionaryState {
  getDictionary: object;
}

export interface getDefaultsState {
  Defaults: object;
}

export interface WorkOrderIdState {
  workOrderId: object;
}

export interface overviewCountState {
  overviewCount: object;
}

export interface InvoiceState {
  invoiceData: object;
}

export interface InvoiceOverviewState {
  data: any;
}

export interface PurchaseOrderIdState {
  purchaseOrderId: object;
}

export const getIsRefresh = (
  state: isRefreshState = { isRefresh: new Date().getTime() },
  action: Action
) => {
  switch (action.type) {
    case SET_IS_REFRESH:
      return { isRefresh: action.payload };
    default:
      return state;
  }
};

export const getContractData = (
  state: contractDataState = { contractData: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_CONTRACT_DATA:
      return { contractData: action.payload };
    default:
      return state;
  }
};

export const getCallTimeEntryId = (
  state: CallTimeEntryState = { CallTimeEntryId: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_CALL_TIME_ENTRY_DATA:
      return { CallTimeEntryId: action.payload };
    default:
      return state;
  }
};

export const getDispatchBoardDate = (
  state: DispatchBoardDateState = { DispatchBoardDate: "" },
  action: Action
) => {
  switch (action.type) {
    case SET_DISPATCH_BOARD_DATE:
      return { DispatchBoardDate: action.payload };
    default:
      return state;
  }
};

export const getDefaults = (
  state: getDefaultsState = { Defaults: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_DEFAULTS:
      return { Defaults: action.payload };
    default:
      return state;
  }
};

export const getInvoiceSDMaster = (
  state: InviceSDMasterState = { invoceSDMaster: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_INVOICE_SD_MASTER:
      return { invoceSDMaster: action.payload };
    default:
      return state;
  }
};

export const getOverviewCount = (
  state: overviewCountState = { overviewCount: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_OVERVIEW_COUNT_DATA:
      return { overviewCount: action.payload };
    default:
      return state;
  }
};

export const getUpdateOverview = (
  state: UpdateOverviewState = { isUpdate: '' },
  action: Action
) => {
  switch (action.type) {
    case UPDATE_OVERVIEW:
      return { isUpdate: action.payload };
    default:
      return state;
  }
};

export const getWorkOrderId = (
  state: WorkOrderIdState = { workOrderId: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_WORK_ORDER_ID:
      return { workOrderId: action.payload };
    default:
      return state;
  }
};

export const getPurchaseOrder = (
  state: PurchaseOrderIdState = { purchaseOrderId: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_PURCHASE_ORDER_ID:
      return { purchaseOrderId: action.payload };
    default:
      return state;
  }
};

export const getDictionary = (
  state: getDictionaryState = { getDictionary: [] },
  action: Action
) => {
  switch (action.type) {
    case GET_DICTIONARY:
      return { getDictionary: action.payload };
    default:
      return state;
  }
};

export const getSdMaster = (
  state: SDMaster = { sd_master: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_SD_MASTER_DATA:
      return { sd_master: action.payload };
    default:
      return state;
  }
};

export const getSdBilling = (
  state: SDBilling = { billing: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_BILLING_DATA:
      return { billing: action.payload };
    default:
      return state;
  }
};

export const getSalesData = (state: Sales = {}, action: Action) => {
  switch (action.type) {
    case SET_SALE_DATA:
      return action.payload;
    default:
      return state;
  }
};

export const getAddress = (state: Address = {}, action: Action) => {
  switch (action.type) {
    case SET_SD_ADDRESS_DATA:
      return action.payload;
    default:
      return state;
  }
};

export const SearchResultReducer = (
  state: SearchState = { searchData: {} },
  action: Action
) => {
  switch (action.type) {
    case SEARCH_RESULT:
      return { searchData: action.payload };
    case RESET_SEARCH_RESULT:
      return { searchData: {} };
    default:
      return state;
  }
};

export const getPageTitle = (
  state: PageTitle = { title: "" },
  action: Action
) => {
  switch (action.type) {
    case PAGE_TITLE:
      return { title: action.payload };
    default:
      return state;
  }
};

export const getActivePage = (
  state: PageActiveState = { title: "" },
  action: Action
) => {
  switch (action.type) {
    case PAGE_ACTIVE:
      return { title: action.payload };
    default:
      return state;
  }
};

export const getAdditionalInfo = (
  state: AdditionalInfoState = { AdditionalInfo: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_ADDITIONAL_INFORMATION:
      return { AdditionalInfo: action.payload };
    default:
      return state;
  }
};

export const activeTab = (
  state: ActiveTabState = { ActiveTab: "BookService" },
  action: Action
) => {
  switch (action.type) {
    case SET_ACTIVE_TAB:
      return { ActiveTab: action.payload };
    default:
      return state;
  }
};

export const getAttachEquipmment = (
  state: AttachEquipmentState = { AttachEquipment: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_EQUIPMENT_INFORMATION:
      return { AttachEquipment: action.payload };
    case RESET_EQUIPMENT_INFORMATION:
      return { AttachEquipment: {} };
    default:
      return state;
  }
};

export const getCustomerInfoModal = (
  state: CustomerModalState = { isShow: false },
  action: Action
) => {
  switch (action.type) {
    case SET_CUSTOMER_INFO_MODAL:
      return { isShow: action.payload };
    default:
      return state;
  }
};

export const getAddressData = (
  state: AddressState = { addressData: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_ADDRESS:
      return { addressData: action.payload };
    default:
      return state;
  }
};

export const getInvoiceData = (
  state: InvoiceState = { invoiceData: {} },
  action: Action
) => {
  switch (action.type) {
    case SET_INVOICE_DATA:
      return { invoiceData: action.payload };
    default:
      return state;
  }
};

export const getInvoiceOverview = (
  state: InvoiceOverviewState = { data: "" },
  action: Action
) => {
  switch (action.type) {
    case SET_INVOICE_OVERVIEW:
      return { data: action.payload };
    default:
      return state;
  }
};
