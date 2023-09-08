import{ useEffect, useState } from "react";
import Grid, {
  GridHeader,
  GridColumn,
  GridRow,
  FilterOption,
  Filter,
} from "../../../components/Grid/Grid";
import WebService from "../../../utility/WebService";
import {  useSelector } from "react-redux";
import { RootState } from "../../../config/Store";
import { SDMaster, CustomerModalState } from "../../../reducer/CommonReducer";
import "./Communication.scss";
import Mailbox from "../../../assets/images/Mailbox.svg";
import Sendbox from "../../../assets/images/Sendbox.svg";
import HelperService from "../../../utility/HelperService";
import BackComponent from "../../../components/BackComponent/BackComponent";
import { getPreference } from "../../../utility/CommonApiCall";
import { ChatFill } from "react-bootstrap-icons";


const componentKey = "EntityCommunicationV2";
const headers: GridHeader[] = [
  {
    title: "",
    isSorting: false,
    class: "text-center",
    sortingKey: 'StartDate',
  },
  {
    title: "Date & Time",
    sortingKey: 'DateTimeOfMessage',
    class: "text-center",
  },
  {
    title: "Type",
    sortingKey: 'EntityType',
  },
  {
    title: "To",
    sortingKey: 'To',
  },
  {
    title: "Subject/Message",
    sortingKey: 'Subject',
  },
  {
    title: "Actions",
    class: "text-center freeze-column",
    isFreeze: true,
    isSorting: false,
    isFilter: false,
  },
];

const dateFilter: FilterOption[] = [
  {
    title: "Date & Time",
    value: "DateTimeOfMessage",
  },
];

const filters: Filter[] = [
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

const Communication = () => {
  const [isShow, setShow] = useState(true);
  const [contactData, setContactData] = useState();
  const [ShowLoader, setShowLoader] = useState(false);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const userdata: any = useSelector<RootState, SDMaster>(
    (state) => state.sdMaster
  );
  const [rows, setRows] = useState<GridRow[]>([]);
  const [lengthCount, setlengthCount] = useState(0);
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const goBack = () => {
    window.history.back();
  };
  const [totalCount, setTotalCount] = useState(0);

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

  const getCommunicationdata = (page: number, order?: string, sort?: string, service?: any, dateFilter?: any, startDate?: any, endDate?: any) => {
    let requestBody = {
      "Offset": page - 1,
      "Limit": 10,
      "SortBy": sort ? sort : "",
      "OrderBY": order ? order : "",
      "FromDate": startDate ? HelperService.getFormatedDateForSorting(startDate)  : "",
      "ToDate": endDate ? HelperService.getFormatedDateForSorting(endDate): "",
      "ApplyOnDate": dateFilter ? dateFilter : [],
      "Type": service ? service : []
    }
    setShowLoader(true);
    WebService.postAPI({
      action: `SaiSentBox/GetSentBoxRecords/v2/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data?.sd_master?.Id}`,
      body: requestBody,
    })
      .then((res: any) => {
        setShowLoader(false);
        let rows: GridRow[] = [];
        setlengthCount(res.list.length);
        console.log(res.list)
        for (var i in res.list) {
          let columns: GridColumn[] = [];
          columns.push({ value: communicationList(res.list[i].EntityType)});
          columns.push({ value:HelperService.getFormatedDateAndTime(res.list[i].DateTimeOfMessage),originalValue: res.list[i].DateTimeOfMessage});
          columns.push({ value:res.list[i].EntityType==3? <span>Call</span>:<span>Invoice</span> });
          columns.push({ value: res.list[i].To });
          columns.push({ value: res.list[i].Subject });
          columns.push({ value: actionList(i)});
          rows.push({ data: columns });
        }
        console.log(rows)
        setRows(rows);
        setTotalCount(res.totalCount);
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };

  const onSorting = ( currentPage :number,isAsc: boolean, key: any, startDate: any, endDate: any, data: any, dateFilter: any) => {
    var EntityTypeArray = [];
    for (var i in data) {
      for (var j in data[i].child) {
              if (data[i].key === 'EntityType') {
          if (data[i].child[j].isChecked === true) {
            EntityTypeArray.push(data[i].child[j].value)
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
    getCommunicationdata(currentPage, isAsc === true ? 'Asc' : 'Desc', key,EntityTypeArray, array, startDate, endDate)
  }


  const actionList = (value: any) => {
    return (
      <div className="text-center">
        <a
          onClick={() => alert("Not working in old system")}
          className="text-dark ms-2 font-18 cursor-pointer"
        >
          <img src={Sendbox} height={16}  className="theme-icon-color"/>
        </a>
      </div>
    );
  };

  const communicationList = (value: any) => {
    return (
      <div className="text-center">
        {
          value == 3 ?  <a className="text-dark ms-2 font-18 cursor-pointer">
          <img src={Mailbox} height={15} className="theme-icon-color"/>
        </a> :  <a className="ms-2 font-18 cursor-pointer">
          <ChatFill />
        </a>
        }
       
      </div>
    );
  };

  return (
    <>
      <div className="communication"> 
        <div className="d-flex justify-content-between align-items-center px-3">
          <div className="d-flex flex-row equipment-heading-view align-items-center card-title">
            <BackComponent title={'Communication'}  count={totalCount}/>
          </div>
        </div>
        <div className="other-component-view card-shadow equipment">
        <Grid
          headers={gridHeader}
          rows={rows}
          ShowLoader={ShowLoader}
          errorMessage="No Communications Found"
          isColumn={true}
          dateFilter={dateFilter}
          filters={filters}
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
export default Communication;
