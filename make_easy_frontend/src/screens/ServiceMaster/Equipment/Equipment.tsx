import { useEffect, useRef, useState } from "react";
import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
  Filter,
} from "../../../components/Grid/Grid";
import { useSelector } from "react-redux";
import { RootState } from "../../../config/Store";
import deleteicon from "../../../assets/images/delete-icon.svg";
import editicon from "../../../assets/images/edit.svg";
import { SDMaster, CustomerModalState } from "../../../reducer/CommonReducer";
import HelperService from "../../../utility/HelperService";
import BsButton from "react-bootstrap/Button";
import "./Equipment.scss";
import DescriptionModal from "../../../components/DescriptionModal/DescriptionModal";
import AddEquipmentModal from "../../../components/AddEquipmentModal/AddEquipmentModal";
import { Value } from "sass";
import WebService from "../../../utility/WebService";
import { toast } from "react-toastify";
import DraggableModal from "../../../components/DraggableModal/DraggableModal";
import BackComponent from "../../../components/BackComponent/BackComponent";
import { getPreference } from "../../../utility/CommonApiCall";

const componentKey = "EntityEquipment";

const headers: GridHeader[] = [
  {
    title: "",
    class: "text-center",
    isSorting: false,
  },
  {
    title: "Manufacturer",
    sortingKey: 'EqpManufacturer',
  },
  {
    title: "Model",
    sortingKey: 'EqpModel',
  },
  {
    title: "Serial#",
    sortingKey: 'SerialNo',
  },
  {
    title: "Description",
    class: "text-start description-text",
    sortingKey: 'Description',
  },
  {
    title: "System",
    sortingKey: 'System',
  },
  {
    title: "Unit",
    sortingKey: 'Unit',
  },

  {
    title: "Location",
    isShow: false,
    sortingKey: 'Location',
  },
  {
    title: "Equipment Type",
    isShow: false,
    sortingKey: 'EquipmentType',

  },
  {
    title: "Invalid Equipment",
    class: "text-center",
    isShow: false,
    sortingKey: 'InvalidEquipment',
  },
  {
    title: "Installation Date",
    class: "text-center",
    isShow: false,
    sortingKey: 'InstallationDate',
  },
  {
    title: "Our Installation",
    class: "text-center",
    isShow: false,
    sortingKey: 'OurInstallation',
  },
  {
    title: "Warranty Date",
    class: "text-center",
    isShow: false,
    sortingKey: 'ReplacedDate',
  },
  {
    title: "Actions",
    class: "text-center freeze-column",
    isFreeze: true,
    isSorting: false,
    isFilter: false,
  },
];

const filters: Filter[] = [
  {
    title: "Invalid Equipment",
    key: "InvalidEquipment",
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
  {
    title: "Our Installation",
    key: "OurInstallation",
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
  {
    title: "Manufacturer",
    key: "EqpManufacturer",
    child: [],
  },
];

const Equipment = () => {
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const customerModal: any = useSelector<RootState, CustomerModalState>(
    (state) => state.customerModal
  );
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [rows, setRows] = useState<GridRow[]>([]);
  const [ShowLoader, setShowLoader] = useState(false);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [deletedData, setDeletedData] = useState<any>({});
  const editEquipmentData1 = useRef({});
  const [editEquipmentData, setEditEquipmentData] = useState({});
  const [SDEquipmentMastersId, setShowAddEquipmentModalId] = useState("");
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [isShowDescription, setIsShowDescription] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [totalCount, setTotalCount] = useState(0);
  const pageCount = useRef<number>(0)
  const [gridFilter,setGridFilter] = useState<Filter[]>(filters)

  useEffect(() => {
    getManufacturer(); 
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

  let equipId = {
    Id: data?.sd_master?.Id,
    ARCustomerMasterId: data.sd_master.ARCustomerMasterId
  }

  const getEquipment = (page: number, order?: string, sort?: string, InvalidEquipment?: any, OurInstallation?: any, Manufacturer?: any, dateFilter?: any, startDate?: any, endDate?: any) => {
    pageCount.current = page;
    let requestBody = {
      "Offset": page - 1,
      "Limit": 10,
      "SortBy": sort ? sort : "",
      "OrderBY": order ? order : "Desc",
      "InvalidEquipment": InvalidEquipment ? InvalidEquipment : "",
      "OurInstallation": OurInstallation ? OurInstallation : "",
      "FromDate": startDate ? HelperService.getFormatedDateForSorting(startDate) : "",
      "ToDate": endDate ? HelperService.getFormatedDateForSorting(endDate) : "",
      "ApplyOnDate":  dateFilter ? dateFilter : [],
      "Manufacturer" : Manufacturer ? Manufacturer : [],
    }
    setShowLoader(true);
    WebService.postAPI({
      action: `SDEquipmentMaster/v2/GetServiceMasterEquipments/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data?.sd_master?.Id}/true`,
      body: requestBody,
      isShowError: false,
    })
      .then((res: any) => {
        setShowLoader(false);
        let rows: GridRow[] = [];
        for (var i in res.list) {
          let columns: GridColumn[] = [];
          columns.push({ value: box(i, res.list[i].Covered) });
          columns.push({ value: res.list[i].EqpManufacturer });
          columns.push({ value: res.list[i].EqpModel });
          columns.push({ value: res.list[i].SerialNo });
          columns.push({ value: showDescription(res.list[i]) });
          columns.push({ value: res.list[i].System });
          columns.push({ value: res.list[i].Unit });
          columns.push({ value: res.list[i].Location });
          columns.push({ value: res.list[i].EquipmentType });
          columns.push({
            value: res.list[i].InvalidEquipment === false ? "No" : "Yes",
          });

          columns.push({
            value: HelperService.getFormatedDate(res.list[i].InstallationDate),
          });
          columns.push({
            value: res.list[i].OurInstallation === false ? "No" : "Yes",
          });
          columns.push({
            value: HelperService.getFormatedDate(res.list[i].ReplacedDate),
          });
          columns.push({ value: actionList(i, res.list[i]), type: "COMPONENT" });
          rows.push({ data: columns });
        }
        setRows(rows);
        setTotalCount(res.totalRecords);
      })
      .catch((e) => {
        setShowLoader(false);
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel);
          setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        }
      });
  };

  const getManufacturer = () => {
    WebService.getAPI({
      action: `SetupSDEquipmentManufacturer/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        var array:any = [];
        for (var i in res) {
          array.push({ title: res[i].EqpManufacturer, value: res[i].EqpManufacturer, key:"EqpManufacturer" });
        }
        setGridFilter(
        gridFilter.map((item:any)=>{
          if(item.title == "Manufacturer"){
            item.child = array;
            return {...item}
          }else{
            return item
          }
        })
        )
      })
      .catch((error) => {});
  };

  const box = (index: any, covered: any) => {
    return (
      <div className="cover-box">
        <div
          className={ 
            "box-size " +
            (covered === "Yes" ? "box-background-color" : "box-color")
          }
        >
          {" "}
        </div>
      </div>
    );
  };

  const showDescription = (e: any) => {
    if (e) {
      return (
        <a
          className="
      grid-hypper-link"
          onClick={() => viewFullDescription(e)}
        >
          {e.Description}
        </a>
      );
    }
  };

  const viewFullDescription = (data: any) => {
    setDescriptionData(data.Description);
    setIsShowDescription(true);
  };
  const closeDescription = (value: any) => {
    setIsShowDescription(value);
  };

  const closeAddEquipment = (value: any, type:any) => {
    setShowAddEquipmentModal(value);
    type == "yes" && getEquipment(1);
    editEquipmentData1.current = {};
    setEditEquipmentData({});
  };
  const goBack = () => {
    window.history.back();
  };

  const openEditEquipment = (e: any, data: any) => {
    setEditEquipmentData(data);
    editEquipmentData1.current = data;
    setShowAddEquipmentModal(e);
  };

  const actionList = (data: any, value: any) => {
    return (
      <div className="text-center action-btns">
        <a
          onClick={() => openEditEquipment(true, value)}
          className="text-dark ms-2 font-18 cursor-pointer"
        >
          <img src={editicon} height={25} />
        </a>
        <a
          onClick={() => onDelete(data, value)}
          className="text-dark ms-2 font-18 cursor-pointer"
        >
          <img src={deleteicon} height={25} />
        </a>
      </div>
    );
  };

  const onDelete = (data: any, value: any) => {
    setShowAddEquipmentModalId(value.Id);
    setShowDeleteModal(true);
    var obj = {
      id: data.DocumentId,
    };
    setDeletedData(obj);
  };

  const onDeleteEquipment = () => {
    setShowDeleteModal(false);
    WebService.deleteAPI({
      action: `SDEquipmentMaster/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data.sd_master.Id}/${SDEquipmentMastersId}`,
      body: null,
      isShowError: false,
    })
      .then((res) => {
        toast.success("Equipment deleted successfully.");
        getEquipment(1);
      })
      .catch((e) => {
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel);
          setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        }
      });
  };

  const onSorting = ( currentPage :number,isAsc: boolean, key: any, startDate: any, endDate: any, data: any, dateFilter: any) => {
    var invalidEquipmentArray = "";
    var OurInstallationArray = "";
    var ManufacturerArray:any[] = [];
    for (var i in data) {
      for (var j in data[i].child) {
        if (data[i].key === 'InvalidEquipment') {
          if (data[i].child[j].isChecked === true) {
            invalidEquipmentArray = data[i].child[j].value
          }
        }
        if (data[i].key === 'OurInstallation') {
          if (data[i].child[j].isChecked === true) {
            OurInstallationArray = data[i].child[j].value
          }
        }
        if (data[i].key === 'EqpManufacturer') {
          if (data[i].child[j].isChecked === true) {
            ManufacturerArray.push(data[i].child[j].value)
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
    
    getEquipment(currentPage, isAsc === true ? 'Asc' : 'Desc', key, invalidEquipmentArray, OurInstallationArray, ManufacturerArray, array, startDate, endDate)
  }

  return (
    <>
      <DraggableModal
        isOpen={isShoWDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Alert"
        type="DELETE_MODAL"
        width={600}
        delete={onDeleteEquipment}
        data={deletedData}
      />
      <AddEquipmentModal
        isShow={showAddEquipmentModal}
        title="Equipment"
        isClose={closeAddEquipment}
        popupData={editEquipmentData1.current}
        equipId={equipId}
      />
      <DescriptionModal
        isShow={isShowDescription}
        title="Description"
        isClose={closeDescription}
        data={descriptionData}
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
        className=""
        style={{ width: customerModal?.isShow === true ? "" : "" }}
      >
        <div className="d-flex justify-content-between align-items-center px-3">
          <div className="d-flex flex-row equipment-heading-view align-items-center card-title">
            <BackComponent title={"Equipment"} count={totalCount} />
          </div>
          <div>
            <BsButton
              variant="light"
              className="btn-brand-light  mb-2"
              type="button"
              onClick={() => {
                editEquipmentData1.current = {};
                setShowAddEquipmentModal(!showAddEquipmentModal);
              }}
            >
              + Add Equipment
            </BsButton>
          </div>
        </div>
        <div className="other-component-view card-shadow equipment">
          <Grid
            errorMessage={"No Equipment Found"}
            headers={gridHeader}
            rows={rows}
            ShowLoader={ShowLoader}
            filters={gridFilter}
            isColumn={true}
            hoverRow={true}
            storeKey={componentKey}
            count={totalCount}
            onPageChange={onSorting}
            onSort={onSorting}
          />
        </div>
      </div>
    </>
  );
};

export default Equipment;
