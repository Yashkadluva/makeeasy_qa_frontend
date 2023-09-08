import { useEffect, useState } from "react";
import { RootState } from "../../../config/Store";
import { useSelector } from "react-redux";
import {
  SDMaster,
  getDictionaryState,
  SearchState,
} from "../../../reducer/CommonReducer";
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import {
  SET_WORK_ORDER_ID, setDataInRedux
} from "../../../action/CommonAction";
import HelperService from "../../../utility/HelperService";
import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
  Filter,
  FilterOption,
} from "../../../components/Grid/Grid";
import WebService from "../../../utility/WebService";
import "./ServiceJob.scss";
import { useNavigate } from "react-router-dom";
import DescriptionModal from "../../../components/DescriptionModal/DescriptionModal";
import BackComponent from "../../../components/BackComponent/BackComponent";
import { getPreference } from "../../../utility/CommonApiCall";
import ReactPlayerCircleControls from "../../../components/Player/Player";

import {
  getBusiness,
  getLocation,
  getLabels,
} from "../../../utility/CommonApiCall";

const componentKey = "EntityServiceCall";




const dateFilter: FilterOption[] = [
  {
    title: "Start Date",
    value: "StartDate",
  },
  {
    title: "Received",
    value: "DateReceived",
  },
];

const ServiceJob = () => {
  const [label, setLabel] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>([]);

  const filters: Filter[] = [
    {
      title: "Status",
      key: "CallStatus",
      child: [
        {
          title: "Arrive",
          value: "A",
        },
        {
          title: "Complete",
          value: "C",
        },
        {
          title: "Dispatch",
          value: "D",
        },
        {
          title: "Assigned",
          value: "A",
        },
        {
          title: "Unassigned",
          value: "U",
        },
      ],
    },
    {
      title: "Location",
      key: "BreakName",
      child: [],
    },
    {
      title: "Service Type",
      key: "ServiceType1",
      child: [],
    },
    {
      title: "Class",
      key: "BreakName1",
      child: []
    },
    {
      title: "Outcome",
      key: "OutcomeCode",
      child: []
    },
  ];
  const dispatch: Dispatch<any> = useDispatch();
  const dictionary: any = useSelector<RootState, getDictionaryState>(
    (state) => state.getDictionaryData?.getDictionary
  );
  const navigate = useNavigate();
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const [rows, setRows] = useState<GridRow[]>([]);
  const [ShowLoader, setShowLoader] = useState(false);
  const [isShowDescription, setIsShowDescription] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");
  const [descriptionTitle, setDescriptionTitle] = useState("");
  const [gridHeader, setHeader] = useState<GridHeader[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [gridFilter, setGridFilter] = useState<Filter[]>(filters);
  // const search: any = useSelector<RootState, SearchState>(
  //   (state) => state.search
  // );
  // const value = search.searchData.Id != data?.sd_master?.Id
console.log(data)

  useEffect(() => {
    getBusinessValues();
    getOutcome();
    getlocationValues();
    getServiceTypeOption();
    getUserPreference();
    getLableName()
  }, []);


  // useEffect(() => {
  //   if (search.searchData.Id != data?.sd_master?.Id) {
  //     goBack()
  //   }
  // }, [value])


  const getLableName = () => {
    getLabels({ user_info })
      .then((res: any) => {
        setLabel(res);
        const headers = [
          {
            title: "Received",
            class: "text-center",
            sortingKey: 'DateReceived',
          },
          {
            title: "Start",
            class: "text-center",
            sortingKey: 'StartDate',
          },
          {
            title: "End",
            class: "text-center",
            sortingKey: 'EndDate',
          },
          {
            title: "Wo#",
            class: "text-end",
            sortingKey: 'SDCallMasterId',
          },
          {
            title: res.length > 0 ? res[0].Break1Label : "",
            isShow: false,
            sortingKey: 'BreakCode1',
          },
          {
            title: res.length > 0 ? res[0].Break2Label : "",
            isShow: false,
            sortingKey: 'BreakCode2',
          },
          {
            title: "Service Type",
            class: "text-center",
            sortingKey: 'ServiceType1',
          },
          {
            title: "Problem Desc.",
            class: "text-start description-text",
            sortingKey: 'problemDescription',
          },
          {
            title: "S",
            class: "text-center",
            sortingKey: 'CallStatus',
          },

          {
            title: "Outcome",
            class: "text-center",
            sortingKey:"SetupSDOutcomeCodeId",
          },
          {
            title: "Invoice#",
            class: "text-end",
            sortingKey: 'InvoiceNum',
          },
          {
            title: "Work Desc.",
            class: "text-start description-text",
            isSorting: false,
          },

          {
            title: "Approved",
            class: "text-center",
            isShow: false,
            sortingKey: 'InvoiceApproved',
          },
          {
            title: "Posted",
            class: "text-center",
            isShow: false,
            sortingKey: 'InvoicePosted',
          },
          {
            title: "Recording",
            class: "text-center",
            isShow: false,
            isSorting: false,
          },
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
            //   setHeader(temp);
          }
        }
      })
      .catch((e: any) => { });
  };

  const getServiceCall = (page: number, order?: string, sort?: string, status?: any, location?: any, service?: any, Outcome?: any, Class?: any, dateFilter?: any, startDate?: any, endDate?: any) => {
    let requestBody = {
      "Offset": page - 1,
      "Limit": 10,
      "SortBy": sort ? sort : "",
      "OrderBY": order ? order : "",
      "FromDate": startDate ? HelperService.getFormatedDateForSorting(startDate) : "",
      "ToDate": endDate ? HelperService.getFormatedDateForSorting(endDate) : "",
      "ApplyOnDate": dateFilter ? dateFilter : [],
      "Status": status ? status : [],
      "Location": location ? location : [],
      "ServiceType": service ? service : [],
      "OutcomeCode": Outcome ? Outcome : [],
      "Class": Class ? Class : [],
    }
    setShowLoader(true);
    WebService.postAPI({
      action: `SDCallMaster/v2/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data?.sd_master?.Id}`,
      body: requestBody,
    })
      .then((res: any) => {
        setShowLoader(false);
        let rows: GridRow[] = [];
        for (var i in res.list) {
          let columns: GridColumn[] = [];
          columns.push({
            value: HelperService.getFormatedDate(res.list[i].DateReceived),
            type: "Date",
            originalValue: res.list[i].DateReceived,
          });
          columns.push({
            value: HelperService.getFormatedDate(res.list[i].StartDate),
            type: "Date",
            originalValue: res.list[i].StartDate,
          });
          columns.push({
            value: HelperService.getFormatedDate(res.list[i].EndDate),
            type: "Date",
            originalValue: res.list[i].EndDate,
          });
          columns.push({
            value: onWorkOrder(res.list[i]),
            originalValue: res.list[i].SDCallMasterId,
          });
          columns.push({ value: res.list[i].BreakCode1 });
          columns.push({ value: res.list[i].BreakCode2 });
          columns.push({ value: res.list[i].ServiceType1 });
          columns.push({
            value: showDescription(
              res.list[i].ProblemDescription,
              "Problem Description"
            ),
            originalValue: res.list[i].ProblemDescription,
          });
          columns.push({ value: res.list[i].CallStatus });
          columns.push({ value: res.list[i].SetupSDOutcomeCodeId });
          columns.push({
            value: onInvoice(res.list[i]),
            originalValue: res.list[i].InvoiceNum,
          });
          columns.push({
            value: showDescription(HelperService.removeHtml(res.list[i].WorkDescriptions),
              "Work Description"),
            originalValue: res.list[i].WorkDescriptions,
          });
          columns.push({ value: res.list[i].InvoiceApproved ? "Yes" : "No" });
          columns.push({ value: res.list[i].InvoicePosted ? "Yes" : "No" });
          columns.push({ value: recordingPlayer(res.list[i].recordingUrl) });
          rows.push({ data: columns });
        }
        setRows(rows);
        setTotalCount(res.totalRecords);
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };

  const goBack = () => {
    navigate(-1);
  };

  const recordingPlayer = (RecordingUrl: string) => {
    return (
      <div className="d-flex justify-content-center">
        <ReactPlayerCircleControls url={RecordingUrl} />
      </div>
    )
  }

  const onInvoice = (value: any) => {
    return <a className="grid-hypper-link" onClick={() => onNavaigteInvoice(value)}>
      {value.InvoiceNum}
    </a>
  }

  const onWorkOrder = (value: any) => {
    return <a className="grid-hypper-link" onClick={() => onNavaigteCallInfo(value)}>
      {value.Id}
    </a>
  }

  const onNavaigteCallInfo = (e: any) => {
    dispatch(
      setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: e.Id, page: window.location.pathname, SMId: data.sd_master?.Id }, })
    );
    navigate(`/call-information`)
  }

  const onNavaigteInvoice = (e: any) => {
    dispatch(
      setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: e.InvoiceNum, page: window.location.pathname, SMId: data.sd_master?.Id } })
    );
    navigate(`/invoice-entry`)
  }

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

  const getBusinessValues = () => {
    getBusiness({ data, user_info })
      .then((res: any) => {
        var array: any = [];
        for (var i in res) {
          array.push({ title: res[i].BreakName, value: res[i].BreakName, key: "BreakName1" });
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
      })
      .catch((e) => { });
  };

  const getlocationValues = () => {
    getLocation({ data, user_info })
      .then((res: any) => {
        var array: any = [];
        for (var i in res) {
          array.push({ title: res[i].BreakName, value: res[i].BreakName, key: "BreakName" });
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
      })
      .catch((e: any) => { });
  };

  const getServiceTypeOption = () => {
    WebService.getAPI({
      action: `SetupSDServiceType/GetAll/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        let array: any = [];
        for (let i in res) {
          array.push({
            title: res[i].ServiceType,
            value: res[i].ServiceType,
          });
        }
        setGridFilter(
          gridFilter.map((item: any) => {
            if (item.title == "Service Type") {
              item.child = array;
              return { ...item }
            } else {
              return item
            }
          })
        )
      })
      .catch((e) => { });
  };

  const getOutcome = () => {
    WebService.getAPI({
      action: `SetupSDOutcomeCode/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null
    })
      .then((res: any) => {
        var array: any = [];
        for (var i in res) {
          array.push({ title: res[i].OutcomeCode, value: res[i].OutcomeCode, Key: "OutcomeCode" });
        }
        setGridFilter(
          gridFilter.map((item: any) => {
            if (item.title == "Outcome") {
              item.child = array;
              return { ...item }
            } else {
              return item
            }
          })
        )

      })
      .catch((e) => {

      })
  }

  const viewFullDescription = (data: any, title: string) => {
    setDescriptionTitle(title);
    setDescriptionData(data);
    setIsShowDescription(true);
  };
  const closeEquipment = (value: any) => {
    setIsShowDescription(value);
  };

  const onSorting = (currentPage: number, isAsc: boolean, key: any, startDate: any, endDate: any, data: any, dateFilter: any) => {
    var statusArray = [];
    var locationArray = [];
    var ServiceTypeArray = [];
    var ClassArray = [];
    var OutcomeArray = [];

    for (var i in data) {
      for (var j in data[i].child) {
        if (data[i].key === 'CallStatus') {
          if (data[i].child[j].isChecked === true) {
            statusArray.push(data[i].child[j].value)
          }
        }
        if (data[i].key === 'BreakName') {
          if (data[i].child[j].isChecked === true) {
            locationArray.push(data[i].child[j].value)
          }
        }
        if (data[i].key === 'ServiceType1') {
          if (data[i].child[j].isChecked === true) {
            ServiceTypeArray.push(data[i].child[j].value)
          }
        }
        if (data[i].key === 'BreakName1') {
          if (data[i].child[j].isChecked === true) {
            ClassArray.push(data[i].child[j].value)
          }
        }
        if (data[i].key === 'OutcomeCode') {
          if (data[i].child[j].isChecked === true) {
            OutcomeArray.push(data[i].child[j].value)
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
    getServiceCall(currentPage, isAsc === true ? 'Asc' : 'Desc', key, statusArray, locationArray, ServiceTypeArray, OutcomeArray, ClassArray, array, startDate, endDate)
  }

  return (
    <>

      <DescriptionModal
        isShow={isShowDescription}
        title={descriptionTitle}
        isClose={closeEquipment}
        data={descriptionData}
      />
      <div className=" ">
        <div className="d-flex justify-content-between align-items-center px-3">
          <div className="d-flex flex-row equipment-heading-view align-items-center card-title">
            <BackComponent
              title={dictionary.db_ServiceCall}
              count={totalCount}
            />
          </div>
          <div></div>
        </div>
        <div className="other-component-view card-shadow equipment">
          <Grid
            headers={gridHeader}
            filters={gridFilter}
            rows={rows}
            dateFilter={dateFilter}
            ShowLoader={ShowLoader}
            storeKey={componentKey}
            isColumn={true}
            errorMessage={`No ${dictionary.db_ServiceCall} Found`}
            hoverRow={true}
            count={totalCount}
            onPageChange={onSorting}
            onSort={onSorting}

          />
        </div>
      </div>
    </>
  );
};

export default ServiceJob;
