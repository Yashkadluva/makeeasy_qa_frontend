import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import Grid, {
  GridHeader,
  GridRow,
  GridColumn,
  FilterOption,
  Filter,
} from "../../../components/Grid/Grid";
import { RootState } from "../../../config/Store";
import { CustomerModalState, SDMaster } from "../../../reducer/CommonReducer";
import WebService from "../../../utility/WebService";
import "./ProspectNote.scss";
import HelperService from "../../../utility/HelperService";
import deleteicon from "../../../assets/images/delete-icon.svg";
import { toast } from "react-toastify";
import DraggableModal from "../../../components/DraggableModal/DraggableModal";
import BackComponent from "../../../components/BackComponent/BackComponent";
import { getPreference } from "../../../utility/CommonApiCall";
import ReactPlayerCircleControls from "../../../components/Player/Player";

const componentKey = "EntityRecordingV2";

const headers: GridHeader[] = [
  {
    title: "Recording",
    sortingKey:"RecordingUrl",
    
  },
  {
    title: "Recorded On",
    class: "text-center",
    sortingKey:"CreatedOn",

  },
  {
    title: "Attended By",
    sortingKey:"AttendedBy"
  },
  {
    title: "Work Order",
    class: "text-center",
    sortingKey:"RecordingStatus"
  },
  {
    title: "Outbound Call",
    class: "text-center",
    sortingKey:"IsOutboundCall"
  },
  {
    title: "Actions",
    isSorting: false,
    isFreeze:true,
    isFilter: false,
    class: "text-center freeze-column",
  },
];

const dateFilter: FilterOption[] = [
  {
    title: "Recorded On",
    value: "CreatedOn",
  },
];

const filters: Filter[] = [
  {
    title: "Outbound Call",
    key: "OutboundCall",
    child: [
      {
        title: "Yes",
        value: "true",
      },
      {
        title: "No",
        value: "false",
      },
    ],
  },
];

const ProspectNote = () => {
  const [prospectNotesData, setProspectNotesData] = useState([]);
  const customerModal: any = useSelector<RootState, CustomerModalState>(
    (state) => state.customerModal
  );
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const [ShowLoader, setShowLoader] = useState(false);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const [rows, setRows] = useState<GridRow[]>([]);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletedData, setDeletedData] = useState<any>({});
  const [recordingId, setRecordinId] = useState("");
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [totalCount, setTotalCount] = useState(0);
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

  const getProspectNotes = (page: number, order?: string, sort?: string, OutboundCall?: any, dateFilter?: any, startDate?: any, endDate?: any) => {
    pageCount.current = page;
    let requestBody = {
      "Offset":page - 1,
      "Limit":10,
      "SortBy":sort ? sort : '',    
      "OrderBY":order ? order : '',
      "FromDate": startDate ? HelperService.getFormatedDateForSorting(startDate)  : "",
      "ToDate":endDate ? HelperService.getFormatedDateForSorting(endDate): "",
      "ApplyOnDate": dateFilter ? dateFilter : [],
      "OutboundCall": OutboundCall && OutboundCall.length == 1 ? OutboundCall[0] : ""
    }
    setShowLoader(true);
    WebService.postAPI({
      action: `SAIVoiceCallRecording/GetVoiceCallRecordings/V2/${user_info['AccountId']}/${user_info['CompanyId']}/${data.sd_master.Id}/0/true`,
      body: requestBody,
    })
      .then((res: any) => {
        console.log(res)
        setShowLoader(false);
        let rows: GridRow[] = [];
        for (var i in res.list) {
          let columns: GridColumn[] = [];
          columns.push({ value: recordingPlayer(res.list[i].RecordingUrl)});
          columns.push({
            value: HelperService.getFormatedDateAndTime(res.list[i].CreatedOn),
            type: "Date",
            originalValue: res.list[i].CreatedOn,
          });
          columns.push({ value: res.list[i].AttendedBy });
          columns.push({ value: res.list[i].RecordingStatus});
      
          columns.push({ value: res.list[i].IsOutboundCall ? "Yes" : "No" });
          columns.push({ value: actionList(i, res.list[i].CallSID) });
          rows.push({ data: columns });
        }
        setRows(rows);
        setTotalCount(res.totalCount);
        setProspectNotesData(res);
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };
  const recordingPlayer = (RecordingUrl:string) => {
    return(
      <div className="d-flex justify-content-center">
    <ReactPlayerCircleControls url= {RecordingUrl} />
    </div>
    )
  }

  const actionList = (value: any, data: any) => {
    return (
      <div className="text-center action-btns">
        <a
          onClick={() => onDelete(value, data)}
          className="text-dark ms-2 font-18 cursor-pointer"
        >
          <img src={deleteicon} height={25} />
        </a>
      </div>
    );
  };

  const onDelete = (Value: any, data: any) => {
    setRecordinId(data);
    setShowDeleteModal(true);
    var obj = {
      id: Value.DocumentId,
    };
    setDeletedData(obj);
  };

  const onDeleteProspectNote = () => {
    setShowDeleteModal(false);
    WebService.deleteAPI({
      action: `SAWINVoice/${user_info["AccountId"]}/${user_info["CompanyId"]}/` + recordingId,
      body: null,
      isShowError: false,
    })
      .then((res) => {
        toast.success("Recording deleted successfully.");
        getProspectNotes(pageCount.current);
      })
      .catch((e) => {
        console.log("e", e);
        if(e.response.data.ErrorDetails.message){
        setAlertModel(!showAlertModel);
        setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        }
      });
  };

  const onSorting = ( currentPage :number,isAsc: boolean, key: any, startDate: any, endDate: any, data: any, dateFilter: any) => {
    var outbooundCallArray = [];
    for (var i in data) {
      for (var j in data[i].child) {
        if (data[i].key === 'OutboundCall') {
          if (data[i].child[j].isChecked === true) {
            outbooundCallArray.push(data[i].child[j].value)
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
    getProspectNotes(currentPage, isAsc === true ? 'Asc' : 'Desc', key, outbooundCallArray,  array, startDate, endDate)
  }

  const onRemove = () => {
    getProspectNotes(1)
  }


  return (
    <>

      <DraggableModal
        isOpen={isShoWDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Alert"
        type="DELETE_MODAL"
        width={600}
        delete={onDeleteProspectNote}
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
        className=" prospect-note"
        style={{ width: customerModal?.isShow === true ? " " : " " }}
      >
        
        <div className="d-flex justify-content-between align-items-center px-3">
          <div className="d-flex flex-row equipment-heading-view align-items-center card-title">
            <BackComponent title={'Recordings'} count={totalCount}/>
          </div>
          
        </div>
        <div className="other-component-view card-shadow equipment"> 
        <Grid
          filters={filters}
          dateFilter={dateFilter}
          headers={gridHeader}
          rows={rows}
          ShowLoader={ShowLoader}
          isColumn={true}
          errorMessage={"No Recordings Found"}
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

export default ProspectNote;
