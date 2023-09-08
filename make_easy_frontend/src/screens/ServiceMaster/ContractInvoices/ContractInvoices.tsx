import { useEffect, useState } from "react";
import WebService from "../../../utility/WebService";
import { useSelector } from "react-redux";
import { RootState } from "../../../config/Store";
import { SDMaster, CustomerModalState } from "../../../reducer/CommonReducer";
import HelperService from "../../../utility/HelperService";
import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
  FilterOption,
  Filter,
} from "../../../components/Grid/Grid";
import "./ContractInvoices.scss";
import { useNavigate } from "react-router-dom";
import ToggleButton from "../../../components/ToggleButton/ToggleButton";
import BackComponent from "../../../components/BackComponent/BackComponent";
import DescriptionModal from "../../../components/DescriptionModal/DescriptionModal";
import { getPreference,  getLabels, } from "../../../utility/CommonApiCall";

const componentKey = "EntityContractInvoicesV2";

const filters: Filter[] = [
  {
    title: "Service Type",
    key: "ContractServiceType",
    child: [
      {
        title: "CRPM",
        value: "CRPM",
      },
      {
        title: "CPM",
        value: "CPM",
      },
      {
        title: "Dispatch",
        value: "D",
      },
      {
        title: "RRPM",
        value: "RRPM",
      },
      {
        title: "RPM",
        value: "RPM",
      },
      {
        title: "CPU-Check",
        value: "CPU-Check",
      },
      {
        title: "CRPM",
        value: "CRPM",
      },

    ],
  }
];

const dateFilter: FilterOption[] = [
  {
    title: "Invoice Date",
    value: "InvoiceDate",
  },
];

const ContactInvoices = () => {
  const navigate = useNavigate()
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const customerModal: any = useSelector<RootState, CustomerModalState>(
    (state) => state.customerModal
  );
  const [rows, setRows] = useState<GridRow[]>([]);
  const [ShowLoader, setShowLoader] = useState(false);
  const [isShowDescription, setIsShowDescription] = useState(false)
  const [descriptionData, setDescriptionData] = useState("")
  const [descriptionTitle, setDescriptionTitle] = useState("")
  const [gridHeader, setHeader] = useState<GridHeader[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [label, setLabel] = useState<any[]>([]);

  useEffect(() => {
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
            title: "Invoice#",
            sortingKey: 'Id',
          },
          {
            title: "Amount",
            class: "text-end",
            sortingKey: 'InvoiceTotal',
          },
          {
            title: "Invoice Date",
            class: "text-center",
            sortingKey: 'InvoiceDate',
          },
          {
            title:  res.length > 0 ? res[0].Break1Label : "",
            isShow: false,
            sortingKey: 'BreakName1',
          },
          {
            title:res.length > 0 ? res[0].Break2Label : "",
            isShow: false,
            sortingKey: 'BreakName2',
          },
          {
            title: "Service Type",
            sortingKey: 'ContractServiceType',
          },
          {
            title: "Work Description",
            class: "text-start description-text",
            sortingKey: 'WorkDescription',
          },
          {
            title: "Bill Seq#",
            isShow: false,
            sortingKey: 'ContractBillingSeqNum',
          },
          {
            title: "Approved",
            isShow: false,
            sortingKey: 'IsApproved',
          },
          {
            title: "Posted",
            isShow: false,
            sortingKey: 'IsPosted',
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
            setHeader(temp);
          }
        }
      })
      .catch((e: any) => { });
  };

  const getContactInvoices = (page: number, order?: string, sort?: string, service?: any, dateFilter?: any, startDate?: any, endDate?: any) => {
    let requestBody = {
      "Offset": page - 1,
      "Limit": 10,
      "SortBy": sort ? sort : "",
      "OrderBY": order ? order : "",
      "FromDate": startDate ? HelperService.getFormatedDateForSorting(startDate)  : "",
      "ToDate": endDate ? HelperService.getFormatedDateForSorting(endDate): "",
      "ApplyOnDate": dateFilter ? dateFilter : [],
      "ServiceType": service ? service : []
    }
    setShowLoader(true);
    WebService.postAPI({
      action: `SDInvoice/v2/GetContractInvoices/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data?.sd_master?.Id}/`,
      body: requestBody,
    })
      .then((res: any) => {
        setShowLoader(false);
        let rows: GridRow[] = [];
        for (var i in res.list) {
          let columns: GridColumn[] = [];
          columns.push({ value: res.list[i].ContractNum });
          columns.push({ value: <a className="grid-hypper-link" onClick={() => getRedirect()}>{res.list[i].Id}</a> });
          columns.push({ value: HelperService.getCurrencyFormatter(res.list[i].InvoiceTotal) });
          columns.push({
            value: HelperService.getFormatedDate(res.list[i].InvoiceDate),
            type: "Date",
            originalValue: res.list[i].InvoiceDate,
          });
          columns.push({ value: res.list[i].BreakName1 });
          columns.push({ value: res.list[i].BreakName2 });
          columns.push({ value: res.list[i].ContractServiceType });
          columns.push({ value: showDescription(res.list[i].WorkDescription, "Work Description") });
          columns.push({ value: res.list[i].ContractBillingSeqNum });
          columns.push({ value: switchButton(res.list[i].IsApproved) });
          columns.push({ value: switchButton(res.list[i].IsPosted) });
          rows.push({ data: columns });
        }
        setRows(rows);
        setTotalCount(res.totalCount);
      })
      .catch((e) => {
        console.log("e", e);
      });
  };

  const getRedirect = () => {
    navigate("/")
  }

  const showDescription = (e: any, title: string) => {
    if (e) {
      return (<a className="grid-hypper-link" onClick={() => viewFullDescription(e, title)}>{e}</a>)
    }
  }

  const viewFullDescription = (data: any, title: string) => {
    setDescriptionTitle(title)
    setDescriptionData(data);
    setIsShowDescription(true);
  }

  const closeDescription = (value: any) => {
    setIsShowDescription(value)
  }

  const switchButton = (value: any) => {
    return (
      <div>
        <ToggleButton isChecked={value} title="" label_id="" onChange={(data: any) => alert(data)} />
      </div>
    );
  };

  const onSorting = ( currentPage :number,isAsc: boolean, key: any, startDate: any, endDate: any, data: any, dateFilter: any) => {
    var ServiceTypeArray = [];
    for (var i in data) {
      for (var j in data[i].child) {
              if (data[i].key === 'ContractServiceType') {
          if (data[i].child[j].isChecked === true) {
            ServiceTypeArray.push(data[i].child[j].value)
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
    getContactInvoices(currentPage, isAsc === true ? 'Asc' : 'Desc', key,ServiceTypeArray, array, startDate, endDate)
  }

  return (
    <>
      <DescriptionModal
        isShow={isShowDescription}
        title={descriptionTitle}
        isClose={closeDescription}
        data={descriptionData}
      />
      <div
        className=""
        style={{ width: customerModal?.isShow === true ? "" : "" }}
      >
        <div className="d-flex justify-content-between align-items-center px-3">
          <div className="d-flex flex-row equipment-heading-view align-items-center card-title">
            <BackComponent title={'Contract Invoices'} count={totalCount} />
          </div>
        </div>
        <div className="other-component-view card-shadow equipment">
          <Grid headers={gridHeader}
            rows={rows}
            filters={filters}
            dateFilter={dateFilter}
            ShowLoader={ShowLoader}
            isColumn={true}
            hoverRow={true}
            storeKey={componentKey}
            errorMessage={'No Contract Invoices Found'} 
            count={totalCount}
            onPageChange={onSorting}
            onSort={onSorting}
            />
        </div>
      </div>
    </>
  );
};

export default ContactInvoices;
