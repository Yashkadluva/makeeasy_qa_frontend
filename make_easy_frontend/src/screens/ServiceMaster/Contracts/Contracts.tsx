import { useEffect, useState } from "react";
import Grid, { GridColumn, GridHeader, GridRow, FilterOption, Filter } from "../../../components/Grid/Grid";
import WebService from "../../../utility/WebService";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../config/Store";
import deleteicon from "../../../assets/images/delete-icon.svg";
import cancelIcon from "../../../assets/images/cross-black.svg";
import renewIcon from "../../../assets/images/reload.svg";
import { SDMaster } from "../../../reducer/CommonReducer";
import HelperService from '../../../utility/HelperService';
import { isRefreshState } from "../../../reducer/CommonReducer";
import "./Contracts.scss";
import BsButton from 'react-bootstrap/Button';
import { Tabs, Tab, Dropdown } from 'react-bootstrap';
import DescriptionModal from "../../../components/DescriptionModal/DescriptionModal";
import DraggableModal from "../../../components/DraggableModal/DraggableModal";
import { toast } from "react-toastify";
import BackComponent from "../../../components/BackComponent/BackComponent";
import {
  getPreference, getBusiness,
  getLocation, getLabels,
} from "../../../utility/CommonApiCall";
import ContractGenralInfo from './ContractDetails/ContractGenralInfo';
import ContractMaintenanceSchedule from './ContractDetails/ContractMaintenanceSchedule';
import ContractBilling from './ContractDetails/ContractBilling';
import AddContractBlade from "./AddContract/AddContractBlade";
import ContractEquipments from "./ContractDetails/ContractEquipments";
import Loader from "../../../components/Loader/Loader";
import ContractDescription from "./AddContract/ContractDescription";
import ContractProfitability from "./ContractDetails/ContractProfitability";
import ReserveAccounting from "./ContractDetails/ReserveAccounting";
import RenewContractModal from "./RenewContractModal";

const componentKey = "EntityContractsV2";

const dateFilter: FilterOption[] = [
  {
    title: "Start Date",
    value: "StartDate",
  },
  {
    title: "Expiry Date",
    value: "ExpiryDate",
  },
];

const filters: Filter[] = [

  {
    title: "Status",
    key: "Status",
    child: [
      {
        title: "Active",
        value: "Active",
      },
      {
        title: "Cancelled",
        value: "Cancelled",
      },
      {
        title: "Expired",
        value: "Expired",
      },
      {
        title: "Renewed",
        value: "Renewed",
      },
      {
        title: "New",
        value: "New",
      },
    ],
  },
  {
    title: "Class",
    key: "BreakName2",
    child: []
  },
  {
    title: "Location",
    key: "BreakName1",
    child: [],
  },
  {
    title: "Contracts Type",
    key: "ServiceType",
    child: []
  },
];

const Contracts = () => {
  const navigate = useNavigate()
  const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const customerModal: any = useSelector<RootState>
  const [rows, setRows] = useState<GridRow[]>([]);
  const [ShowLoader, setShowLoader] = useState(false);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [isShowDescription, setIsShowDescription] = useState(false)
  const [isShowRenewContract, setIsRenewContract] = useState(false)
  const [isShowAddContract, setIsShowAddContract] = useState(false)
  const [descriptionData, setDescriptionData] = useState("")
  const [deletedData, setDeletedData] = useState<any>({});
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [gridHeader, setHeader] = useState<GridHeader[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [gridFilter, setGridFilter] = useState<Filter[]>(filters)
  const [label, setLabel] = useState<any[]>([]);
  const [classOptions, setClassOptions] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [contractTypeOptions, setContractTypeOptions] = useState<any[]>([]);
  const [contractDetail, setContractDetail] = useState<any[]>([]);
  const [contractData, setContractData] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("TabProfitability");
  const [currentIndex, setCurrentIndex] = useState();
  const isRefresh: any = useSelector<RootState, isRefreshState>(
    (state) => state.isRefresh);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const [confirmApprovdModel, setConfirmApprovdModel] = useState(false);
  const [cancelContractData, setCancelContractData] = useState<any>({})

  useEffect(() => {
    getContractsData(currentIndex)
  }, [isRefresh]);

  useEffect(() => {
    getBusinessValues();
    getlocationValues();
    getContractsType();
    // getUserPreference();
    getLableName()
  }, []);

  const getLableName = () => {
    getLabels({ user_info })
      .then((res: any) => {
        setLabel(res);
        const headers = [
          {
            title: "Contract#",
            sortingKey: 'ContractNum',
          },
          {
            title: res.length > 0 ? res[0].Break1Label : "",
            isShow: false,
            sortingKey: 'BreakName1',
          },
          {
            title: res.length > 0 ? res[0].Break2Label : "",
            isShow: false,
            sortingKey: 'BreakName2',
          },
          {
            title: "Contract Type",
            sortingKey: 'ContractType',
          },
          {
            title: "Description",
            class: "text-start description-text",
            sortingKey: 'ContractDescription',
            isNotAllowClick: true
          },
          {
            title: "Start Date",
            class: "text-center",
            sortingKey: 'StartDate',
          },
          {
            title: "Expiry Date",
            class: "text-center",
            sortingKey: 'ExpiryDate',
          },
          {
            title: "Contract Amt",
            class: "text-end",
            sortingKey: 'Amount',
          },
          {
            title: "Status",
            class: "text-center",
            sortingKey: 'Status',
          },
          {
            title: "Salesman",
            isShow: false,
            sortingKey: 'SalesmanNum',
          },
          {
            title: "Actions",
            isFilter: false,
            isSorting: false,
            class: "freeze-column text-center",
            isFreeze: true,
            isNotAllowClick: true
          }
        ];
        setHeader(headers)
      })
      .catch((e) => { });
  };

  const getUserPreference = () => {
    getPreference({ key: componentKey, user_info })
      .then((res: any) => {
        if (res.value && res.value.length > 10) {
          let temp: GridHeader[] = JSON.parse(res.value);
          if (temp.length > 1) {
            setHeader(temp);
          }
        }
      })
      .catch((e: any) => { });
  };

  const getContracts = (page: number, order?: string, sort?: string, service?: any, status?: any, location?: any, Class?: any, dateFilter?: any, startDate?: any, endDate?: any) => {
    let requestBody = {
      "Offset": page - 1,
      "Limit": 5,
      "SortBy": sort ? sort : "Desc",
      "OrderBY": order ? order : "",
      "FromDate": startDate ? HelperService.getFormatedDateForSorting(startDate) : "",
      "ToDate": endDate ? HelperService.getFormatedDateForSorting(endDate) : "",
      "ApplyOnDate": dateFilter ? dateFilter : [],
      "Status": status ? status : [],
      "ContractType": service ? service : [],
      "Location": location ? location : [],
      "Class": Class ? Class : [],
    }
    setContractDetail([])
    setShowLoader(true)
    WebService.postAPI({
      action: `SaiSDContract/V2/GetContracts/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data?.sd_master?.Id}/true`,
      body: requestBody,
    })
      .then((res: any) => {
        setShowLoader(false)
        let rows: GridRow[] = []
        for (var i in res.list) {
          let columns: GridColumn[] = []
          columns.push({ value: res.list[i].ContractNum })
          columns.push({ value: res.list[i].BreakName1 })
          columns.push({ value: res.list[i].BreakName2 })
          columns.push({ value: res.list[i].ContractType })
          columns.push({ value: showDescription(res.list[i]) })
          columns.push({ value: HelperService.getFormatedDate(res.list[i].StartDate) })
          columns.push({ value: HelperService.getFormatedDate(res.list[i].ExpiryDate) })
          columns.push({ value: HelperService.getCurrencyFormatter(res.list[i].Amount) })
          columns.push({ value: res.list[i].Status })
          columns.push({ value: res.list[i].SalesmanNum })
          columns.push({ value: actionList(res.list[i]), type: 'COMPONENT' })
          rows.push({ data: columns });
        }
        setRows(rows);
        setContractData(res.list)
        setTotalCount(res.totalRecords);
      })
      .catch((e) => {
        setShowLoader(false)
      });
  };

  const onSorting = (currentPage: number, isAsc: boolean, key: any, startDate: any, endDate: any, data: any, dateFilter: any) => {
    var ContractServiceType = [];
    var Status = [];
    var locationArray = [];
    var ClassArray = [];
    for (var i in data) {
      for (var j in data[i].child) {
        if (data[i].key === 'ServiceType') {
          if (data[i].child[j].isChecked === true) {
            ContractServiceType.push(data[i].child[j].value)
          }
        }
        if (data[i].key === 'Status') {
          if (data[i].child[j].isChecked === true) {
            Status.push(data[i].child[j].value)
          }
        }
        if (data[i].key === 'BreakName1') {
          if (data[i].child[j].isChecked === true) {
            locationArray.push(data[i].child[j].value)
          }
        }
        if (data[i].key === 'BreakName2') {
          if (data[i].child[j].isChecked === true) {
            ClassArray.push(data[i].child[j].value)
          }
        }
      }
    }
    var array = [];
    if (dateFilter.length > 0) {
      for (var i in dateFilter) {
        if (dateFilter[i].isChecked === true) {
          array.push(dateFilter[i].value)
        }
      }
    }
    getContracts(currentPage, isAsc === true ? 'Asc' : 'Desc', key, ContractServiceType, Status, locationArray, ClassArray, array, startDate, endDate)
  };

  const getBusinessValues = () => {
    getBusiness({ data, user_info })
      .then((res: any) => {
        var array: any = [];
        var optionArray: any = [];
        for (var i in res) {
          array.push({ title: res[i].BreakName, value: res[i].BreakCode, key: "BreakName1" });
          optionArray.push({ value: res[i].BreakName, id: res[i].BreakCode });
        }
        setGridFilter(
          gridFilter.map((item: any) => {
            if (item.title == "Class") {
              item.child = array;
              return { ...item }
            } else {
              return item
            }
          })
        )

        setClassOptions(optionArray)

      })
      .catch((e) => { });
  };

  const getlocationValues = () => {
    getLocation({ data, user_info })
      .then((res: any) => {
        var array: any = [];
        var optionArray: any = [];
        for (var i in res) {
          array.push({ title: res[i].BreakName, value: res[i].BreakCode, key: "BreakName" });
          optionArray.push({ value: res[i].BreakName, id: res[i].BreakCode });
        }
        setGridFilter(
          gridFilter.map((item: any) => {
            if (item.title == "Location") {
              item.child = array;
              return { ...item }
            } else {
              return item
            }
          })
        )
        setLocationOptions(optionArray)
      })
      .catch((e: any) => { });
  };

  const getContractsType = () => {
    setShowLoader(true)
    WebService.getAPI({
      action: `SetupSDServiceType/GetAllUsedFor/${user_info["AccountId"]}/${user_info["CompanyId"]}/M`,
      body: null,
    })
      .then((res: any) => {
        var array: any = [];
        var optionArray: any = [];
        for (var i in res) {
          array.push({ title: res[i].ServiceType, value: res[i].ServiceType, key: "ContractType" });
          optionArray.push({ value: res[i].ServiceTypeDescription, id: res[i].ServiceType, code: res[i].ServiceType, object: res[i] });
        }
        setGridFilter(
          gridFilter.map((item: any) => {
            if (item.key == "ServiceType") {
              item.child = array;
              return { ...item }
            } else {
              return item
            }
          })
        )
        setContractTypeOptions(optionArray)

      })
      .catch((e) => { });
  };

  const actionList = (value: any) => {
    return <div className="text-center action-btns">

      <a className="text-dark ms-2 font-18 cursor-pointer theme-icon-color" title="Renew" onClick={() => onRenwContract(value)}>
        <img
          src={renewIcon}
          height={25}
        /></a>
      {

        <a className={value.Status == "Cancelled" ? "disable-option" : "text-dark ms-2 font-18 cursor-pointer"} onClick={() => onCancelContract(value)}>
          <img
            src={cancelIcon}
            height={25} className="theme-icon-color"
          /></a>
      }

      <a onClick={() => onDelete(value)} className="text-dark ms-2 font-18 cursor-pointer">
        <img
          src={deleteicon}
          height={25}
        /></a>

    </div >;
  };

  const getRedirect = () => {
    navigate("/")
  };

  const viewFullDescription = (data: any) => {
    setDescriptionData(data.ContractDescription);
    setIsShowDescription(true);
  };

  const closeEquipment = (value: any) => {
    setIsShowDescription(value)
  };

  const showDescription = (e: any) => {
    if (e) {
      return (<a className="grid-hypper-link" onClick={() => viewFullDescription(e)}>{e.ContractDescription}</a>)
    }
  };

  const onDelete = (data: any) => {
    setShowDeleteModal(true)
    var obj = {
      ContractNum: data.ContractNum,
      ServiceMasterNum: data.ServiceMasterNum
    }
    setDeletedData(obj)
  };

  const onDeleteContract = () => {
    setShowDeleteModal(false)
    WebService.deleteAPI({
      action: `SaiSDContract/Delete/${user_info['AccountId']}/${user_info['CompanyId']}/${deletedData.ContractNum}/${deletedData.ServiceMasterNum}`,
      body: null,
      isShowError: false
    })
      .then((res) => {
        toast.success('Contract deleted successfully.')
        getContracts(1)
      })
      .catch((e) => {
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel)
          setErrorMessage(e?.response?.data?.ErrorDetails?.message)
        }
      })
  };

  const selectedRow = (index: any) => {
    getContractsData(index, "setTab")
  };

  const getContractsData = (index: any, type?: any) => {
    type && type == "setTab" && setCurrentTab("TabProfitability")
    if (index || index == 0) {
      setCurrentIndex(index)
      var requestBody = {
        AccountId: user_info["AccountId"],
        CompanyId: user_info["CompanyId"],
        ContractNum: contractData[index]?.ContractNum,
      }
      setLoading(true)
      WebService.postAPI({
        action: `SaiSDContract/GetContractDetailsViewOnly/`,
        body: requestBody,
      })
        .then((res: any) => {
          setLoading(false);
          setContractDetail([res]);
        })
        .catch((e) => {
          setLoading(false)
        });
    }
  };

  const getCurrentKey = (value: any) => {
    setCurrentTab(value);
  };

  const onCloseAddContract = (value: any, type: any) => {
    setIsShowAddContract(false)
    type == "Add" && getContracts(1)
  };

  const onCancelContract = (data?: any) => {
    
    setErrorMessage("Are you sure, you want to cancel this contract ? ")
    setConfirmAlertModel(true);
    setCancelContractData(data)
  };

  const onConfirmCancelContract = () => {
    setConfirmAlertModel(false);
    setLoading(true)
    WebService.getAPI({
      action: `SaiSDContract/CancelContract/${user_info['AccountId']}/${user_info['CompanyId']}/${cancelContractData?.ContractNum}/${cancelContractData?.ServiceMasterNum}`,
      body: null,
    })
      .then((res: any) => {
        setLoading(false);
        toast.success("Contract Cancelled Successfully")
        getContracts(1)
      })
      .catch((e) => {
        setLoading(false)
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel)
          setErrorMessage(e?.response?.data?.ErrorDetails?.message)
        }
      });
  };

  const onApproveContract = () => {
    setErrorMessage("Do you want to approve this contract?");
    setConfirmApprovdModel(true);
  };

  const onConfirmApprovedContract = () => {
    setConfirmApprovdModel(false);
    setLoading(true)
    WebService.postAPI({
      action: `SaiSDContract/ApproveContract/${user_info['AccountId']}/${user_info['CompanyId']}/${contractDetail[0].Contract?.ContractNum}`,
      body: null,
    })
      .then((res: any) => {
        setLoading(false);
        toast.success("Contract Approvd Successfully")
        getContractsData(currentIndex)
      })
      .catch((e) => {
        setLoading(false);
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel)
          setErrorMessage(e?.response?.data?.ErrorDetails?.message)
        }
      });
  };

  const onCloseRenew = (value: any, type: any) => {
    setIsRenewContract(false);
    type == "Add" && getContracts(1)
  };

  const onRenwContract = (data: any) => {
    setIsRenewContract(true)
    setCancelContractData(data)
  };

  

  return (
    <>
      <AddContractBlade
        isShow={isShowAddContract}
        isClose={onCloseAddContract}
        data={[]}
        isEdit={false}
        classOptions={classOptions}
        locationOptions={locationOptions}
        contractTypeOptions={contractTypeOptions}
        ServiceMasterNum={data.sd_master?.Id}
      />

      <DescriptionModal
        isShow={isShowDescription}
        title="Description"
        isClose={closeEquipment}
        data={descriptionData}
      />

      <RenewContractModal
        isShow={isShowRenewContract}
        title="Renew Contract"
        isClose={onCloseRenew}
        data={cancelContractData}
        companyData={data && data?.sd_master}
      />

      <DraggableModal
        isOpen={isShoWDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Alert"
        type="DELETE_MODAL"
        width={600}
        delete={onDeleteContract}
        data={null}
      />

      <DraggableModal
        isOpen={showAlertModel}
        onClose={() => setAlertModel(false)}
        title="Alert"
        type="ALERT_MODEL"
        width={600}
        previousData={errorMessage}
      />

      <DraggableModal
        isOpen={confirmAlertModel}
        onClose={() => setConfirmAlertModel(false)}
        title="Alert"
        type="CONFIRM_MODAL"
        width={600}
        previousData={errorMessage}
        onConfirm={onConfirmCancelContract}
      />

      <DraggableModal
        isOpen={confirmApprovdModel}
        onClose={() => setConfirmApprovdModel(false)}
        title="Alert"
        type="CONFIRM_MODAL"
        width={600}
        previousData={errorMessage}
        onConfirm={onConfirmApprovedContract}
      />

      <Loader show={isLoading} />

      <div className=" " style={{ width: customerModal?.isShow === true ? "" : "" }}>
        <div className="d-flex justify-content-between align-items-center px-3">
          <div className="d-flex flex-row equipment-heading-view align-items-center card-title">
            <BackComponent title={'Contracts'}
              count={totalCount} />
          </div>
          <div>
            <BsButton variant="light" className="btn-brand-light  mb-2" type="button" onClick={() => { setIsShowAddContract(true) }}>
              + Add Contract
            </BsButton>
          </div>
        </div>
        <div className="other-component-view card-shadow contract-card mb-3">
          <Grid
            filters={gridFilter}
            dateFilter={dateFilter}
            headers={gridHeader}
            rows={rows}
            ShowLoader={ShowLoader}
            errorMessage={'No Contracts Found'}
            hoverRow={true}
            storeKey={componentKey}
            isColumn={true}
            onClickRow={true}
            isSelectedRow={selectedRow}
            count={totalCount}
            onPageChange={onSorting}
            onSort={onSorting}
            perPageItem={5}
          />
        </div>
        {
          contractDetail.length > 0 &&
          <div className="other-component-view card-shadow contract-detail-card position-relative">
            <div className="text-end position-absolute" style={{ right: "30px", top: "22px" }}>
              <Dropdown className="action-dd">
                <Dropdown.Toggle id="dropdown-basic">
                  <img
                    src={require("../../../assets/images/blue-hamburg-icon.svg").default}
                    className="hamburg-icon show theme-icon-color"
                    alt="hamburg"
                  />
                  <img src={require("../../../assets/images/cross-icon-new.svg").default}
                    className="hamburg-icon close theme-icon-color"
                    alt="hamburg"
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu className="invoice-entry-dropmenu">

                  <Dropdown.Item className={contractDetail[0]?.IsApproved ? "disable-option" : ""} onClick={() => onApproveContract()}>Approve</Dropdown.Item>

                  <Dropdown.Item className={contractDetail[0]?.Status == "Renewed" ? "disable-option" : ""} onClick={() => onRenwContract(contractDetail[0]?.Contract)} >Renew</Dropdown.Item>

                  <Dropdown.Item className={contractDetail[0]?.Status == "Cancelled" ? "disable-option" : ""} onClick={() => onCancelContract({ContractNum:contractDetail[0]?.Contract?.ContractNum,ServiceMasterNum:contractDetail[0]?.Contract?.ServiceMasterNum})}>Cancel</Dropdown.Item>


                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="contract-details tab-style-2">
              <Tabs activeKey={currentTab} onSelect={getCurrentKey} >
                <Tab
                  eventKey="TabProfitability"
                  title={
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <img
                        src={
                          require("../../../assets/images/icon-profitability.svg").default
                        }
                        className="theme-icon-color"
                        height={21}
                        width={21}
                      />
                      <label className="nav-text">Profitability</label>
                    </div>
                  }

                >
                  <ContractProfitability data={contractDetail[0]} activeTab={currentTab} />
                </Tab>
                <Tab
                  eventKey="TabGeneralInfo"
                  title={
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <img
                        src={
                          require("../../../assets/images/detail-icon.svg").default
                        }
                        className="theme-icon-color"
                        height={21}
                        width={21}
                      />
                      {" "}
                      <label className="nav-text">General Info</label>
                    </div>
                  }
                >
                  <ContractGenralInfo genralData={contractDetail[0]} classOptions={classOptions}
                    locationOptions={locationOptions}
                    contractTypeOptions={contractTypeOptions} />
                </Tab>
                <Tab
                  eventKey="TabEquipment"
                  title={
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <img
                        src={
                          require("../../../assets/images/equipment-tab-icon.svg").default
                        }
                        className="theme-icon-color"
                        height={21}
                        width={21}
                      />
                      {" "}
                      <label className="nav-text">Equipment</label>
                    </div>
                  }
                >
                  <ContractEquipments data={contractDetail[0]} activeTab={currentTab} />
                </Tab>
                <Tab
                  eventKey="TabRegularBillingt"
                  title={
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <img
                        src={
                          require("../../../assets/images/icon-billing-detail-black.svg").default
                        }
                        className="theme-icon-color"
                        height={21}
                        width={21}
                      />
                      {" "}
                      <label className="nav-text">Regular Billing</label>
                    </div>
                  }
                >
                  <ContractBilling data={contractDetail[0]} activeTab={currentTab} />
                </Tab>
                <Tab
                  eventKey="TabMaintenanceSchedule"
                  title={
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <img
                        src={
                          require("../../../assets/images/icon-maintenance-schedule.svg").default
                        }
                        className="theme-icon-color"
                        height={21}
                        width={21}
                      />
                      {" "}

                      <label className="nav-text"> Maintenance Schedule</label>
                    </div>
                  }
                >
                  <ContractMaintenanceSchedule data={contractDetail[0]} activeTab={currentTab} />
                </Tab>
                <Tab
                  eventKey="TabReserveAccounting"
                  title={
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <img
                        src={
                          require("../../../assets/images/icon-accounting.svg").default
                        }
                        className="theme-icon-color"
                        height={21}
                        width={21}
                      />
                      {" "}
                      <label className="nav-text">Reserve Accounting</label>
                    </div>
                  }
                >
                  <ReserveAccounting data={contractDetail[0]} activeTab={currentTab} />
                </Tab>
                <Tab
                  eventKey="TabDescription"
                  title={
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <img
                        src={
                          require("../../../assets/images/icon-description.svg").default
                        }
                        className="theme-icon-color"
                        height={21}
                        width={21}
                      />
                      {" "}
                      <label className="nav-text">Description</label>
                    </div>
                  }
                >
                  <ContractDescription genralData={contractDetail[0]} />
                </Tab>
              </Tabs>
            </div>
          </div>
        }

      </div>

    </>
  );
};

export default Contracts;
