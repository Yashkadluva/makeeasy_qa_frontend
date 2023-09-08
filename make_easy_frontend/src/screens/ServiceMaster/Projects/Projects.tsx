import { useEffect, useState, useRef } from "react";
import Grid, { GridColumn, GridHeader, GridRow, FilterOption, Filter } from "../../../components/Grid/Grid";
import WebService from "../../../utility/WebService";
import { useSelector } from "react-redux";
import { RootState } from "../../../config/Store";
import { SDMaster, CustomerModalState } from "../../../reducer/CommonReducer";
import HelperService from '../../../utility/HelperService';
import "./Projects.scss";
import deleteicon from "../../../assets/images/delete-icon.svg";
import { useNavigate } from "react-router-dom";
import BsButton from 'react-bootstrap/Button';
import { toast } from "react-toastify";
import BackComponent from "../../../components/BackComponent/BackComponent";
import NewProjectModal from "./NewProjectModal";
import DraggableModal from "../../../components/DraggableModal/DraggableModal";
import DescriptionModal from "../../../components/DescriptionModal/DescriptionModal";
import { getPreference } from "../../../utility/CommonApiCall";

const componentKey = "EntityProjectV2";




const headers: GridHeader[] = [
  {
    title: "Project #",
    sortingKey: 'ProjectNum',
  },
  {
    title: "Project Name",
    sortingKey: 'ProjectName',
  },
  {
    title: "Description",
    class: "text-start description-text",
    isShow: false,
    sortingKey: 'Description',
  },
  {
    title: "Project Type",
    sortingKey: 'ProjectType',
  },
  {
    title: "Status",
    class: "text-center",
    sortingKey: 'ProjectStatus',
  },
  {
    title: "Start Date",
    isShow: false,
    sortingKey: 'StartDate',
  },
  {
    title: "End Date",
    isShow: false,
    sortingKey: 'EndDate',
  },
  {
    title: "Project Manager",
    class: "text-center",
    sortingKey: 'ProjectManagerName',
  },
  {
    title: "SalesPerson",
    sortingKey: 'SalesmanName1',
  },
  {
    title: "Project Total",
    class: "text-end",
    sortingKey: 'ProjectAmount',
  },
  {
    title: "Current Profit Margin",
    class: "text-end",
    sortingKey: 'EstimatedProfitMargin',
  },
  {
    title: "Action",
    class: "text-center freeze-column",
    isSorting: false,
    isFilter: false,
    isFreeze: true,
  }

];



const dateFilter: FilterOption[] = [
  {
    title: "Start Date",
    value: "StartDate",
  },
];

const filters: Filter[] = [
  {
    title: "Status",
    key: "ProjectStatus",
    child: [
      {
        title: "Open",
        value: "1",
      },
      {
        title: "Close",
        value: "3",
      },
    ],
  },
  {
    title: "Type",
    key: "EntityType",
    child: [
      {
        title: "Call",
        value: "Call",
      },
      {
        title: "Invoice",
        value: "Invoice",
      },
    ],
  },
];

const Projects = () => {
  const navigate = useNavigate()
  const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const customerModal: any = useSelector<RootState, CustomerModalState>(state => state.customerModal)
  const [rows, setRows] = useState<GridRow[]>([]);
  const [showAddBillingCode, setshowAddBillingCode] = useState(false)
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [ShowLoader, setShowLoader] = useState(false);
  const [deletedData, setDeletedData] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [showAlertModel, setAlertModel] = useState(false);
  const [isShowDescription, setIsShowDescription] = useState(false)
  const [descriptionData, setDescriptionData] = useState("")
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [totalCount, setTotalCount] = useState(0);
  const pageCount = useRef<number>(0)

  const closeModal = (value: any) => {
    setshowAddBillingCode(value);
  };

  useEffect(() => {

    getUserPreference();
  }, []);

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

  const getProjects = (page: number, order?: string, sort?: string, service?: any, Type?: any, dateFilter?: any, startDate?: any, endDate?: any) => {
    pageCount.current = page;
    let requestBody = {
      "Offset": page - 1,
      "Limit": 10,
      "SortBy": sort ? sort : "",
      "OrderBY": order ? order : "",
      "FromDate": startDate ? HelperService.getFormatedDateForSorting(startDate) : "",
      "ToDate": endDate ? HelperService.getFormatedDateForSorting(endDate) : "",
      "ApplyOnDate": dateFilter ? dateFilter : [],
      "Status": service ? service : "",
      "Type": service ? service : []
    }
    setShowLoader(true)
    WebService.postAPI({
      action: `SDSMProjects/GetAllProjectsForSM/v2/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data?.sd_master?.Id}`,
      body: requestBody,
    })
      .then((res: any) => {
        setShowLoader(false)
        let rows: GridRow[] = []
        for (var i in res.list) {
          let columns: GridColumn[] = []
          columns.push({ value: <a className="grid-hypper-link" onClick={() => getRedirect()}>{res.list[i].ProjectNum}</a> })
          columns.push({ value: res.list[i].ProjectName })
          columns.push({
            value: showDescription((res.list[i].Description)),
            originalValue: res.list[i].Description
          })
          columns.push({ value: res.list[i].ProjectType })
          columns.push({ value: res.list[i].ProjectStatus == 1 ? 'Open' : 'Close' })
          columns.push({ value: HelperService.getFormatedDateAndTime(res.list[i].StartDate) })
          columns.push({ value: HelperService.getFormatedDateAndTime(res.list[i].EndDate) == "Invalid date" ? "" : HelperService.getFormatedDateAndTime(res.list[i].EndDate) })
          columns.push({ value: res.list[i].ProjectManagerName })
          columns.push({ value: res.list[i].SalesmanName1 })
          columns.push({ value: HelperService.getCurrencyFormatter(res.list[i].ProjectAmount) })
          columns.push({ value: HelperService.getCurrencyFormatter(res.list[i].EstimatedProfitMargin) })
          columns.push({ value: actionList(i), type: 'COMPONENT' })
          rows.push({ data: columns });
        }
        setRows(rows);
        setTotalCount(res.totalCount);
      })
      .catch((e) => {
        setShowLoader(false)
      });
  };
  // ProjectStatus

  const onSorting = (currentPage: number, isAsc: boolean, key: any, startDate: any, endDate: any, data: any, dateFilter: any) => {
    var ProjectStatusArray = [];
    var EntityTypeArray = [];
    for (var i in data) {
      for (var j in data[i].child) {
        if (data[i].key === 'EntityType') {
          if (data[i].child[j].isChecked === true) {
            EntityTypeArray.push(data[i].child[j].value)
          }
        }
        if (data[i].key === 'ProjectStatus') {
          if (data[i].child[j].isChecked === true) {
            ProjectStatusArray.push(data[i].child[j].value)
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
    getProjects(currentPage, isAsc === true ? 'Asc' : 'Desc', key, ProjectStatusArray, EntityTypeArray, array, startDate, endDate)
  }




  const showDescription = (e: any) => {
    if (e) {
      return (<a className="grid-hypper-link" onClick={() => viewFullDescription(e)}>{e}</a>)
    }
  }

  const viewFullDescription = (data: any) => {
    setDescriptionData(data);
    setIsShowDescription(true);
  }

  const actionList = (value: any) => {
    return <div className="text-center action-btns">
      <a onClick={() => alert("API is not available")} className="text-dark ms-2 font-18 cursor-pointer">
        <img
          src={deleteicon}
          height={25}
        /></a>
    </div >;
  };

  const goBack = () => {
    window.history.back();
  };

  const getRedirect = () => {
    navigate("/")
  }




  const onDelete = (data: any) => {
    setShowDeleteModal(!isShoWDeleteModal)
    var obj = {
      id: data.DocumentId
    }
    setDeletedData(obj)
  }

  const onDeleteProjects = () => {
    setShowDeleteModal(false)
    const requestData = {
      "AccountId": user_info["AccountId"],
      "CompanyId": user_info["CompanyId"],
      "Document": Document
    }

    WebService.deleteAPI({
      action: `EntityDocument/${user_info['AccountId']}/${user_info['CompanyId']}/${data.sd_master.Id}/1/` + deletedData.id,
      body: null,
      isShowError: false
    })
      .then((res) => {
        toast.success('Contract deleted successfully.')
        getProjects(pageCount.current)
      })
      .catch((e) => {
        console.log("e", e)
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel)
          setErrorMessage(e?.response?.data?.ErrorDetails?.message)
        }
      })
  }

  const closeEquipment = (value: any) => {
    setIsShowDescription(value)
  }

  return (
    <>
      <DescriptionModal
        isShow={isShowDescription}
        title="Description"
        isClose={closeEquipment}
        data={descriptionData}
      />
      <DraggableModal
        isOpen={isShoWDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Alert"
        type="DELETE_MODAL"
        width={600}
        delete={onDeleteProjects}
        data={deletedData}
      />
      <div
        className="  projects"
        style={{ width: customerModal?.isShow === true ? "" : "" }}
      >
        <NewProjectModal
          isShow={showAddBillingCode}
          title={'Add Billing Code'}
          isClose={closeModal} />
        <div className="d-flex justify-content-between align-items-center px-3">
          <div className="d-flex flex-row equipment-heading-view align-items-center card-title">
            <BackComponent title={'Projects'} count={totalCount} />
          </div>
          <div>
            <BsButton variant="light" className="btn-brand-light  mb-2" type="button" onClick={() =>
              setshowAddBillingCode(
                !showAddBillingCode
              )
            }  >
              + Add Project
            </BsButton>
          </div>
        </div>
        <div className="other-component-view card-shadow equipment">
          <Grid filters={filters} storeKey={componentKey}
            dateFilter={dateFilter} headers={gridHeader} rows={rows} ShowLoader={ShowLoader} hoverRow={true} isColumn={true} errorMessage={'No Projects Found'} count={totalCount}
            onPageChange={onSorting} onSort={onSorting} />
        </div>
      </div>

    </>
  );
};

export default Projects;
