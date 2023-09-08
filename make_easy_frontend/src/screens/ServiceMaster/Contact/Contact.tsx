import { useEffect, useState, useRef } from "react";
import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
  Filter,
} from "../../../components/Grid/Grid";
import WebService from "../../../utility/WebService";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../config/Store";
import { SDMaster, CustomerModalState } from "../../../reducer/CommonReducer";
import AddContactModal from "../Contact/AddContactModal";
import "./Contact.scss";
import deleteicon from "../../../assets/images/delete-icon.svg";
import editicon from "../../../assets/images/edit.svg";
import BsButton from "react-bootstrap/Button";
import { toast } from "react-toastify";
import HelperService from "../../../utility/HelperService";
import DraggableModal from "../../../components/DraggableModal/DraggableModal";
import BackComponent from "../../../components/BackComponent/BackComponent";
import DescriptionModal from "../../../components/DescriptionModal/DescriptionModal";
import { getPreference } from "../../../utility/CommonApiCall";
import AlertModal from "../../../components/AlertModal/AlertModal";


const componentKey = "EntityContactV2";

const headers: GridHeader[] = [
  {
    title: "Contact Name",
    sortingKey:"ContactName"
  },
  {
    title: "Email",
    sortingKey:"Email"
  },
  {
    title: "Primary#",
    class: "text-end",
    sortingKey:"WorkPhone"
  },
  {
    title: "Secondary#",
    class: "text-end",
    sortingKey:"HomePhone"
  },
  {
    title: "Comment",
    class: "text-start description-text",
    sortingKey:"Comment"
  },
  {
    title: "Is Default",
    class: "text-center",
    sortingKey:"IsDefaultForEntityId"
  },
  {
    title: "Action",
    class: "text-center freeze-column",
    isFreeze: true,
    isSorting: false,
    isFilter: false,
  },
];

const filters: Filter[] = [
  {
    title: "Is Default",
    key: "IsDefaultForEntityId",
    child: [
      {
        title: "Yes",
        value: "Yes",
      },
      {
        title: "No",
        value: "No",
      },
    ],
  },
];

const Contact = () => {
  let navigate = useNavigate();
  const userdata: any = useSelector<RootState, SDMaster>(
    (state) => state.sdMaster
  );

  const [ShowLoader, setShowLoader] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletedData, setDeletedData] = useState<any>({});
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const [commentTitle, setCommentTitle] = useState("");
  const [commentData, setCommentData] = useState("");
  const [isShowComment, setIsShowComment] = useState(false);
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState<GridRow[]>([]);
  const editEquipmentData = useRef({});
  const pageCount = useRef<number>(0)

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

  const getContactsdata = (page: number, order?: string, sort?: string, isDefaultData?: any, dateFilter?: any, startDate?: any, endDate?: any) => {
    pageCount.current = page;
    let requestBody = {
      "Offset":page - 1,
      "Limit":10,
      "SortBy": sort ? sort : '',    
      "OrderBY": order ? order : '',
      "IsDefault":isDefaultData && isDefaultData.length == 1 ? isDefaultData[0] : ""
    }
    setShowLoader(true);
    WebService.postAPI({
      action: `EntityContact/GetAll/V2/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data?.sd_master?.Id}/1`,
      body: requestBody,
    })
      .then((res: any) => {

        setShowLoader(false);
        let rows: GridRow[] = [];
        for (var i in res.list) {
          let columns: GridColumn[] = [];
          columns.push({ value: res.list[i].ContactName });
          columns.push({ value: res.list[i].Email });
          columns.push({
            value: (
              <a className="grid-hypper-link" onClick={() => getRedirect()}>
                {HelperService.getFormattedContact(res.list[i].WorkPhone)}
              </a>
            ),
          });
          columns.push({
            value: (
              <a className="grid-hypper-link" onClick={() => getRedirect()}>
                {HelperService.getFormattedContact(res.list[i].HomePhone)}
              </a>
            ),
          });
          columns.push({ value: showDescription(res.list[i].Comment, "Comment") });
          columns.push({ value: isActive(res.list[i].IsDefaultForEntityId) });
          columns.push({ value: actionList(i, res.list[i]), type: "COMPONENT" });
          rows.push({ data: columns });
        }
        setRows(rows);
        setTotalCount(res.totalCount);
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };

  const showDescription = (e: any, title: string) => {
    if (e) {
      return (
        <a
          className="grid-hypper-link"
          onClick={() => viewFullDescription(e, title)}
        >
          {e}
        </a>
      );
    }
  };

  const viewFullDescription = (data: any, title: string) => {
    setCommentTitle(title);
    setCommentData(data);
    setIsShowComment(true);
  };

  const closeComment = (value: any) => {
    setIsShowComment(value);
  };

  const openEditContact = (e: any, data: any) => {
    editEquipmentData.current = data;
    setShowAddContactModal(e);
  };

  const actionList = (value: any, data: any) => {
    return (
      <div className="text-center action-btns text-nowrap">
        <a
          onClick={() => openEditContact(true, data)}
          className="text-dark ms-2 font-18 cursor-pointer"
        >
          <img src={editicon} height={25} className="theme-icon-color" />
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

  const closeModal = (value: any) => {
    setShowAddContactModal(value);
    editEquipmentData.current = {};
    setShowAddContactModal(value);
    getContactsdata(pageCount.current);
  };

  const getRedirect = () => {
    navigate("/");
  };

  const isActive = (e: any) => {
    if (e == true) {
      return <span>Yes</span>;
    } else if (e == false) {
      return <span>No</span>;
    }
  };

  const onDelete = (data: any) => {
    setShowDeleteModal(true);
    var obj = {
      Id: data.Id,
      EntityType: data.EntityType,
    };
    setDeletedData(obj);
  };

  const onDeleteContact = () => {
    setShowDeleteModal(false);
    WebService.deleteAPI({
      action: `EntityContact/${user_info["AccountId"]}/${user_info["CompanyId"]}/${userdata.sd_master.Id}/${deletedData.EntityType}/${deletedData.Id}`,
      body: null,
      isShowError: false,
    })
      .then((res) => {
        toast.success("Contact deleted successfully.");
        getContactsdata(pageCount.current);
      })
      .catch((e) => {
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel);
          setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        }
      });
  };
  const onSorting = ( currentPage :number,isAsc: boolean, key: any, startDate: any, endDate: any, data: any, dateFilter: any) => {
    var defaultArray = [];
    for (var i in data) {
      for (var j in data[i].child) {
        if (data[i].key === 'IsDefaultForEntityId') {
          if (data[i].child[j].isChecked === true) {
            defaultArray.push(data[i].child[j].value)
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
    getContactsdata(currentPage, isAsc === true ? 'Asc' : 'Desc', key, defaultArray,  array, startDate, endDate)
  }

  const onRemove = () => {
    getContactsdata(1)
  }

  return (
    <>
      <DescriptionModal
        isShow={isShowComment}
        title={commentTitle}
        isClose={closeComment}
        data={commentData}
      />
      <DraggableModal
        isOpen={isShoWDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Alert"
        type="DELETE_MODAL"
        width={600}
        delete={onDeleteContact}
        data={deletedData}
      />
      <AddContactModal
        isShow={showAddContactModal}
        isClose={closeModal}
        data={editEquipmentData.current}
        title="Contact Modal"
      />
      <div
        className="  contact"
        style={{ width: data?.isShow === false ? "" : "" }}
      >
        <div className="d-flex justify-content-between align-items-center px-3">
          <div className="d-flex flex-row equipment-heading-view align-items-center card-title">
            <BackComponent title={"Contacts"}  count={totalCount} />
          </div>
          <div>
            <BsButton
              variant="light"
              className="btn-brand-light  mb-2"
              type="button"
              onClick={() => setShowAddContactModal(!showAddContactModal)}
            >
              + Add Contacts
            </BsButton>
          </div>
        </div>
        <div className="other-component-view card-shadow equipment">
          <Grid
            filters={filters}
            headers={gridHeader}
            rows={rows}
            ShowLoader={ShowLoader}
            isColumn={true}
            storeKey={componentKey}
            gridId="contactUs"
            errorMessage={"No Contacts Found"}
            count={totalCount}
            onPageChange={onSorting}
            onSort={onSorting}
            
          />
        </div>
      </div>
    </>
  );
};
export default Contact;
