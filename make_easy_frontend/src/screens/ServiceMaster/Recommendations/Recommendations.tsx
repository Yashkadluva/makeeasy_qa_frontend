import { useEffect, useRef, useState } from "react";
import BsButton from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import deleteicon from "../../../assets/images/delete-icon.svg";
import editicon from "../../../assets/images/edit.svg";
import BackComponent from "../../../components/BackComponent/BackComponent";
import DescriptionModal from "../../../components/DescriptionModal/DescriptionModal";
import DraggableModal from "../../../components/DraggableModal/DraggableModal";
import Grid, {
  Filter,
  FilterOption,
  GridColumn,
  GridHeader,
  GridRow,
} from "../../../components/Grid/Grid";
import { RootState } from "../../../config/Store";
import { CustomerModalState, SDMaster } from "../../../reducer/CommonReducer";
import { getPreference } from "../../../utility/CommonApiCall";
import HelperService from "../../../utility/HelperService";
import WebService from "../../../utility/WebService";
import AddRecommendationModal from "../Recommendations/AddRecommendationModal";
import "./Recommendations.scss";
const componentKey = "EntityRecommendationV2";
const headers: GridHeader[] = [
  {
    title: "Recommended Date",
    class: "text-center",
    sortingKey: 'RecommendedDate',
  },
  {
    title: "Comments",
    class: "description-text",
    sortingKey: 'RecommendationText',
  },
  {
    title: "Recommended By",
    sortingKey: 'TechNameInternal',
  },
  {
    title: "Status",
    sortingKey: 'Status',
    class: "text-center",

  },
  {
    title: "Accepted On",
    class: "text-center",
    isShow: false,
    sortingKey: 'AcceptedOn',
  },
  {
    title: "Reason to Deny",
    isShow: false,
    sortingKey: 'ReasonToDeny',
  },
  {
    title: "Actions",
    class: "freeze-column text-center",
    isFreeze: true,
    isSorting: false,
    isFilter: false,
  },
];
const dateFilter: FilterOption[] = [
  {
    title: "Recommended Date",
    value: "RecommendedDate",
  },
  {
    title: "Accepted On",
    value: "AcceptedOn",
  },
];

const filters: Filter[] = [
  {
    title: "Status",
    key: "Status",
    child: [
      {
        title: "Accepted",
        value: "Accepted",
      },
      {
        title: "Pending",
        value: "Pending",
      },
      {
        title: "Decline",
        value: "Decline",
      },
    ],
  },
];

const Recommendations = () => {
  const [showAddRecommendationModal, setShowAddRecommendationModal] =
    useState(false);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const customerModal: any = useSelector<RootState, CustomerModalState>(
    (state) => state.customerModal
  );
  const [rows, setRows] = useState<GridRow[]>([]);
  const [ShowLoader, setShowLoader] = useState(false);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletedData, setDeletedData] = useState<any>({});
  const [isShowDescription, setIsShowDescription] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");
  const editEquipmentData = useRef({});
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [totalCount, setTotalCount] = useState(0);
  const pageCount = useRef<number>(0);
  const gridRef = useRef<any>();

  const recommendationPropData = {
    Id: data?.sd_master?.Id,
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
      .catch((e: any) => {});
  };

  // console.log(gridRef.current.getValues().filter);

  const getRecommendations = (
    page: number,
    order?: string,
    sort?: string,
    service?: any,
    dateFilter?: any,
    startDate?: any,
    endDate?: any
  ) => {

    pageCount.current = page;
    let requestBody = {
      Offset: page - 1,
      Limit: 10,
      SortBy: sort ? sort : "",
      OrderBY: order ? order : "",
      FromDate: startDate
        ? HelperService.getFormatedDateForSorting(startDate)
        : "",
      ToDate: endDate ? HelperService.getFormatedDateForSorting(endDate) : "",
      ApplyOnDate: dateFilter ? dateFilter : [],
      Status: service ? service : [],
    };
    setShowLoader(true);
    WebService.postAPI({
      action: `SDServiceMasterRecommendation/GetPendingRecommendationsForSM/v2/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data?.sd_master?.Id}`,
      body: requestBody,
    })
      .then((res: any) => {
        setShowLoader(false);
        let rows: GridRow[] = [];
        for (var i in res.list) {
          let columns: GridColumn[] = [];
          columns.push({
            value: HelperService.getFormatedDate(res.list[i].RecommendedDate),
            type: "Date",
            originalValue: res.list[i].RecommendedDate,
          });
          columns.push({
            value: showDescription(res.list[i].RecommendationText),
          });
          columns.push({ value: res.list[i].TechNameInternal });
          columns.push({
            value:
              (res.list[i].Status == 1 && "Pending") ||
              (res.list[i].Status == 2 && "Accepted") ||
              (res.list[i].Status == 3 && "Decline"),
          });

          columns.push({
            value: HelperService.getFormatedDate(res.list[i].AcceptedOn),
            type: "Date",
            originalValue: res.list[i].AcceptedOn,
          });
          columns.push({ value: res.list[i].ReasonToDeny });
          columns.push({
            value: actionList(i, res.list[i]),
            type: "COMPONENT",
          });
          rows.push({ data: columns });
        }

        setRows(rows);
        setTotalCount(res.totalCount);
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };

  const onSorting = (
    currentPage :number,
    isAsc: boolean,
    key: any,
    startDate: any,
    endDate: any,
    data: any,
    dateFilter: any
  ) => {
    var ServiceTypeArray = [];
    for (var i in data) {
      for (var j in data[i].child) {
        if (data[i].key === "Status") {
          if (data[i].child[j].isChecked === true) {
            ServiceTypeArray.push(data[i].child[j].value);
          }
        }
      }
    }
    var array = [];
    if (dateFilter.length > 0) {
      for (var i in dateFilter) {
        if (dateFilter[i].isChecked === true) {
          array.push(dateFilter[i].value);
        }
      }
    }
    getRecommendations(
      currentPage,
      isAsc === true ? "Asc" : "Desc",
      key,
      ServiceTypeArray,
      array,
      startDate,
      endDate
    );
  };

  const openEditRecommendation = (e: any, data: any) => {
    editEquipmentData.current = data;
    setShowAddRecommendationModal(e);
  };

  const showDescription = (e: any) => {
    if (e) {
      return (
        <a className="grid-hypper-link" onClick={() => viewFullDescription(e)}>
          {HelperService.removeHtml(e)}
        </a>
      );
    }
  };

  const viewFullDescription = (data: any) => {
    setDescriptionData(data);
    setIsShowDescription(true);
  };
  const closeDescription = (value: any) => {
    setIsShowDescription(value);
  };

  const actionList = (value: any, data: any) => {
    return (
      <div className="action-btns text-nowrap">
        <a
          onClick={() => openEditRecommendation(true, data)}
          className="text-dark ms-2 font-18 cursor-pointer"
        >
          <img src={editicon} height={25} />
        </a>
        <a
          onClick={() => onDelete(data)}
          className="text-dark ms-2 font-18 cursor-pointer"
        >
          <img src={deleteicon} height={25} />
        </a>
      </div>
    );
  };

  const goBack = () => {
    window.history.back();
  };

  const closeModal = (value: any, type: any) => {
    editEquipmentData.current = {};
    setShowAddRecommendationModal(value);
    setShowAddContactModal(value);
    type == "add" && getRecommendations(pageCount.current);
  };

  const onDelete = (data: any) => {
    setShowDeleteModal(true);
    var obj = {
      id: data.Id,
    };
    setDeletedData(obj);
  };

  const onDeleteRecommendation = () => {
    setShowDeleteModal(false);
    WebService.deleteAPI({
      action: `SDServiceMasterRecommendation/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data.sd_master.Id}`,
      body: null,
      isShowError: false,
    })
      .then((res) => {
        toast.success("Recommendation deleted successfully.");
        getRecommendations(pageCount.current);
      })
      .catch((e) => {
        console.log("e", e);
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel);
          setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        }
      });
  };

  return (
    <>
      <DescriptionModal
        isShow={isShowDescription}
        title="Comments"
        isClose={closeDescription}
        data={descriptionData}
      />

      <AddRecommendationModal
        isShow={showAddRecommendationModal}
        isClose={closeModal}
        title="Recommendation Modal"
        popupData={editEquipmentData.current}
        Ids={recommendationPropData}
      />

      <DraggableModal
        isOpen={isShoWDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Alert"
        type="DELETE_MODAL"
        width={600}
        delete={onDeleteRecommendation}
        data={deletedData}
      />

      <DraggableModal
        isOpen={showAlertModel}
        onClose={() => setAlertModel(false)}
        title="Alert"
        type="ALERT_MODEL"
        width={600}
        previousData={errorMessage}
      />

      <div
        className=" recommendations"
        style={{ width: customerModal?.isShow === true ? "" : "" }}
      >
        <div className="d-flex justify-content-between align-items-center px-3">
          <div className="d-flex flex-row equipment-heading-view align-items-center card-title">
            <BackComponent title={"Recommendations"} count={totalCount} />
          </div>
          <div>
            <BsButton
              variant="light"
              className="btn-brand-light  mb-2"
              type="button"
              onClick={() =>
                setShowAddRecommendationModal(!showAddRecommendationModal)
              }
            >
              + Add Recommendation
            </BsButton>
          </div>
        </div>
        <div className="other-component-view card-shadow equipment">
          <Grid
            ref={gridRef}
            filters={filters}
            storeKey={componentKey}
            dateFilter={dateFilter}
            headers={gridHeader}
            rows={rows}
            ShowLoader={ShowLoader}
            hoverRow={true}
            isColumn={true}
            errorMessage={"No Recommendations Found"}
            count={totalCount}
            onPageChange={onSorting}
            onSort={onSorting}
          />
        </div>
      </div>
    </>
  );
};

export default Recommendations;
