import { legacy_createStore, combineReducers, applyMiddleware } from "redux";
import thunk from 'redux-thunk'
import { composeWithDevTools } from "redux-devtools-extension";
import { userLoginReducer } from "../reducer/AuthReducer";
import { addSideBarReducer, sideBarReducer } from "../reducer/SideBarReducer";
import { getSdMaster, getSalesData, getAddressData, SearchResultReducer, getPageTitle, getActivePage, getAdditionalInfo, getCustomerInfoModal, getAddress, getAttachEquipmment, activeTab, getDictionary, getWorkOrderId, getInvoiceData, getOverviewCount, getInvoiceSDMaster, getInvoiceOverview, getDefaults, getCallTimeEntryId, getIsRefresh, getDispatchBoardDate, getSdBilling, getContractData, getUpdateOverview } from "../reducer/CommonReducer";

const reducers = combineReducers({
    userLogin: userLoginReducer,
    sideBarData: addSideBarReducer,
    sideBar: sideBarReducer,
    sdMaster: getSdMaster,
    sdBilling: getSdBilling,
    sales: getSalesData,
    search: SearchResultReducer,
    pageTitle: getPageTitle,
    pageActive: getActivePage,
    additionalInformation: getAdditionalInfo,
    customerModal: getCustomerInfoModal,
    address: getAddress,
    addressData: getAddressData,
    attachEquipment: getAttachEquipmment,
    activeTabView: activeTab,
    getDictionaryData: getDictionary,
    workOrderId: getWorkOrderId,
    invoice: getInvoiceData,
    overviewCount: getOverviewCount,
    invoceSDMaster: getInvoiceSDMaster,
    invoiceOverview: getInvoiceOverview,
    getDefaults: getDefaults,
    CallTimeEntryId: getCallTimeEntryId,
    isRefresh: getIsRefresh,
    DispatchBoardDate: getDispatchBoardDate,
    contractData: getContractData,
    updateOverview: getUpdateOverview,
})

const initialState = {}

const middleware = [thunk]

const store = legacy_createStore(
    reducers,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))
)

export default store;

export type RootState = ReturnType<typeof store.getState>