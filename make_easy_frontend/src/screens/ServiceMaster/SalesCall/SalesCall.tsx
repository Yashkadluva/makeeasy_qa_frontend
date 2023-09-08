import { useEffect, useState } from "react";
import Grid, {
  GridColumn, GridHeader, GridRow, Filter,
  FilterOption,
} from "../../../components/Grid/Grid";
import WebService from "../../../utility/WebService";
import "./SalesCall.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../config/Store";
import { SDMaster, CustomerModalState } from "../../../reducer/CommonReducer";
import HelperService from '../../../utility/HelperService';
import { useNavigate } from "react-router-dom";
import BackComponent from "../../../components/BackComponent/BackComponent";
import DescriptionModal from "../../../components/DescriptionModal/DescriptionModal";
import { getPreference } from "../../../utility/CommonApiCall";
import ReactPlayerCircleControls from "../../../components/Player/Player";

const componentKey = "EntitySalesCallV2";
const headers: GridHeader[] = [
  {
    title: "Date Received",
    class: "text-center",
    sortingKey: 'DateReceived',
  },
  {
    title: "Activity QTY",
    class: "text-center",
    sortingKey: 'SalesCallActivites',
  },
  {
    title: "WO#",
    class: "text-end",
    sortingKey: 'CallNum',
  },
  {
    title: "Call Type",
    sortingKey: 'TypeofCall',
  },
  {
    title: "Call Notes",
    class: "text-start description-text",
    sortingKey: 'CallNotes',
  },
  {
    title: "Outcome Code",
    sortingKey: 'OutcomeCode',
  },
  {
    title: "Salesman",
    sortingKey: 'SalesmanName',
  },
  {
    title: "Price Quoted",
    isShow: false,
    sortingKey: 'PriceQuoted',
  },
  {
    title: "Quote#",
    isShow: false,
    sortingKey: 'QuoteNum',
  },
  {
    title: "Recording",
    isShow: false,
    sortingKey: 'RecordingUrl',
  },
];




const filters: Filter[] = [
  {
    title: "Call Type",
    key: "TypeofCall",
    child: [
      {
        title: "Sales",
        value: "Sales",
      },
      {
        title: "Maintenance",
        value: "Maintenance",
      },
    ],
  }
];

const dateFilter: FilterOption[] = [
  {
    title: "Date Received",
    value: "DateReceived",
  },
];


const SalesCall = () => {
  const navigate = useNavigate()
  const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const customerModal: any = useSelector<RootState, CustomerModalState>(state => state.customerModal)
  const [rows, setRows] = useState<GridRow[]>([]);
  const [ShowLoader, setShowLoader] = useState(false);
  const [isShowDescription, setIsShowDescription] = useState(false)
  const [descriptionData, setDescriptionData] = useState("")
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    getSalesCall(1);
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

  const getSalesCall = (page: number, order?: string, sort?: string, service?: any, dateFilter?: any, startDate?: any, endDate?: any) => {
    let requestBody = {
      "Offset": page - 1,
      "Limit": 10,
      "SortBy": sort ? sort : "",
      "OrderBY": order ? order : "",
      "FromDate": startDate ? HelperService.getFormatedDateForSorting(startDate)  : "",
      "ToDate": endDate ? HelperService.getFormatedDateForSorting(endDate): "",
      "ApplyOnDate": dateFilter ? dateFilter : [],
      "CallType": service ? service : []
    }
    setShowLoader(true)
    WebService.postAPI({
      action: `SDSalesCallMaster/v2/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data?.sd_master?.Id}`,
      body: requestBody,
    })
      .then((res: any) => {
        setShowLoader(false)
        let rows: GridRow[] = []
        for (var i in res.list) {
          let columns: GridColumn[] = [];
          columns.push({
            value: HelperService.getFormatedDate(res.list[i].DateReceived), type: "Date",
            originalValue: res.list[i].DateReceived,
          })
          columns.push({ value: res.list[i].SalesCallActivites })
          columns.push({ value: <a className="grid-hypper-link" onClick={() => getRedirect()}>{res.list[i].CallNum}</a> })
          columns.push({ value: res.list[i].TypeofCall })
          columns.push({
            value: showDescription((res.list[i].CallNotes)),
            originalValue: res.list[i].CallNotes
          })
          columns.push({ value: res.list[i].OutcomeCode })
          columns.push({ value: res.list[i].SalesmanName })
          columns.push({ value: res.list[i].PriceQuoted })
          columns.push({ value: res.list[i].QuoteNum })
          columns.push({ value: recordingPlayer(res.list[i].RecordingUrl) })
          rows.push({ data: columns });
        }
        setRows(rows);
        setTotalCount(res.totalCount);
      })
      .catch((e) => {
        setShowLoader(false)
      });
  };

  const onSorting = ( currentPage :number,isAsc: boolean, key: any, startDate: any, endDate: any, data: any, dateFilter: any) => {
    var CallTypeArray = [];
    for (var i in data) {
      for (var j in data[i].child) {
              if (data[i].key === 'TypeofCall') {
          if (data[i].child[j].isChecked === true) {
            CallTypeArray.push(data[i].child[j].value)
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
    getSalesCall(currentPage, isAsc === true ? 'Asc' : 'Desc', key,CallTypeArray, array, startDate, endDate)
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

  const recordingPlayer = (RecordingUrl:string) => {
    return(
      <div className="d-flex justify-content-center">
    <ReactPlayerCircleControls url= {RecordingUrl} />
    </div>
    )
  }

  const goBack = () => {
    window.history.back();
  };

  const getRedirect = () => {
    navigate("/")
  }

  const closeEquipment = (value: any) => {
    setIsShowDescription(value)
  }

  return (
    <>
 
      <DescriptionModal
        isShow={isShowDescription}
        title="Call Notes"
        isClose={closeEquipment}
        data={descriptionData}
      />

      <div
        className="  sales-call"
        style={{ width: customerModal?.isShow === true ? "" : " " }}
      >

        <div className="d-flex justify-content-between align-items-center px-3">
          <div className="d-flex flex-row equipment-heading-view align-items-center card-title">
            <BackComponent title={'Sales Call'}  count={totalCount} />
          </div>

        </div>
        <div className="other-component-view card-shadow equipment">
          <Grid headers={gridHeader}
            filters={filters}
            rows={rows}
            dateFilter={dateFilter}
            ShowLoader={ShowLoader}
            hoverRow={true}
            storeKey={componentKey}
            isColumn={true} errorMessage={'No Sales Call Found'} 
            count={totalCount}
            onPageChange={onSorting}
            onSort={onSorting}/>
        </div>
      </div>

    </>
  );
};

export default SalesCall;
