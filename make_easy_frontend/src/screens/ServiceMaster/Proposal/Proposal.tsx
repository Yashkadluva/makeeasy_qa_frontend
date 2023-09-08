import { useEffect, useState } from "react";
import WebService from "../../../utility/WebService";
import { useSelector } from "react-redux";
import { RootState } from "../../../config/Store";
import { SDMaster, CustomerModalState, getDictionaryState } from "../../../reducer/CommonReducer";
import HelperService from '../../../utility/HelperService';
import Grid, { GridColumn, GridHeader, GridRow, Filter, FilterOption } from "../../../components/Grid/Grid";
import "./Proposal.scss";
import { useNavigate } from "react-router-dom";
import BsButton from 'react-bootstrap/Button';
import BackComponent from "../../../components/BackComponent/BackComponent";
import DescriptionModal from "../../../components/DescriptionModal/DescriptionModal";
import { getPreference, getBusiness, getLocation, getLabels,} from "../../../utility/CommonApiCall";

const componentKey = "EntityProposalV2";



const dateFilter: FilterOption[] = [
  {
    title: "Quote Date",
    value: "QuoteDate",
  },
  {
    title: "Expiration Date",
    value: "ExpirationDate",
  },
];

const filters: Filter[] = [
  {
    title: "Status",
    key: "QuoteDisposition",
    child: [
      {
        title: "Quoted",
        value: "Q",
      },
      {
        title: "Sold",
        value: "S",
      },
      {
        title: "Expired",
        value: "E",
      },
    ],
  },
  {
    title: "Quote type",
    key: "QuoteType",
    child: [
      {
        title: "Replace",
        value: "R",
      },
      {
        title: "Repair",
        value: "R",
      },
    ],
  },
  {
    title: "Location",
    key: "BreakName1",
    child: [],
  },
  {
    title: "Service Type",
    key: "ServiceType1",
    child: [],
  },
  {
    title: "Class",
    key: "BreakName2",
    child: []
  },
];

const Proposal = () => {
  const dictionary: any = useSelector<RootState, getDictionaryState>(
    (state) => state.getDictionaryData?.getDictionary);
  const navigate = useNavigate()
  const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const customerModal: any = useSelector<RootState, CustomerModalState>(state => state.customerModal)
  const [rows, setRows] = useState<GridRow[]>([]);
  const [ShowLoader, setShowLoader] = useState(false);
  const [isShowDescription, setIsShowDescription] = useState(false)
  const [descriptionData, setDescriptionData] = useState("")
  const [descriptionTitle, setDescriptionTitle] = useState("")
  const [gridHeader, setHeader] = useState<GridHeader[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [gridFilter, setGridFilter] = useState<Filter[]>(filters)
  const [label, setLabel] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>([]);


  useEffect(() => {
    getBusinessValues();
    getlocationValues();
    getServiceTypeOption();
    getLableName()
    // getUserPreference();
  }, []);

  const getLableName = () => {
    getLabels({ user_info })
      .then((res: any) => {
        setLabel(res);
        const headers = [
          {
            title: dictionary.db_Quote,
            class: "text-end",
            sortingKey: 'Id',
          },
          {
            title: "Quote Date",
            class: "text-center",
            sortingKey: 'QuoteDate',
          },
          {
            title: "Expiration Date",
            class: "text-center",
            isShow: false,
            sortingKey: 'ExpirationDate',
          },
          {
            title: "Name",
            sortingKey: 'QuoteName',
          },
          {
            title: "Description",
            class: "text-start description-text",
            isShow: false,
            sortingKey: 'QuoteDescription',
          },
          {
            title: "Quote Amount",
            class: "text-end",
            sortingKey: 'Total',
          },
          {
            title: res.length > 0 ? res[0].Break1Label : "",
            isShow: false,
            sortingKey: 'BreakCode1',
          },
          {
            title:  res.length > 0 ? res[0].Break2Label : "",
            isShow: false,
            sortingKey: 'BreakCode2',
          },
          {
            title: "Service Type",
            isShow: false,
            sortingKey: 'ServiceType',
          },
          {
            title: "Quote Type",
            isShow: false,
            sortingKey: 'QuoteType',
          },
          {
            title: "Status",
            sortingKey: 'QuoteDisposition',
            class: "text-center"
          },
          {
            title: "Sold Date",
            sortingKey: 'DispositionDate',
            isShow: false
          },
          {
            title: "Salesperson",
            sortingKey: 'SalesmanNum1',
          },
          {
            title: "Technician",
            sortingKey: 'TechnicianName',
            isShow: false
          },
          {
            title: "WO#",
            sortingKey: 'CallNum',
            class: "text-end",
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

  const getProposal = (page: number, order?: string, sort?: string, status?: any, location?: any, service?: any,Class?:any,Quote?:any, dateFilter?: any, startDate?: any, endDate?: any) => {
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
      "Class": Class ? Class : [],
      "QuoteType": Quote ? Quote :[]
    }
    setShowLoader(true)
    WebService.postAPI({
      action: `SaiSDQuoteMaster/V2/GetSMQuotes/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data?.sd_master?.Id}/`,
      body: requestBody,
    })
      .then((res: any) => {
        setShowLoader(false)
        let rows: GridRow[] = []
        for (var i in res.list) {
          let columns: GridColumn[] = []
          columns.push({ value: <a className="grid-hypper-link" onClick={() => getRedirect()}>{res.list[i].Id}</a> })
          columns.push({ value: HelperService.getFormatedDate(res.list[i].QuoteDate) })
          columns.push({ value: HelperService.getFormatedDate(res.list[i].ExpirationDate) })
          columns.push({ value: res.list[i].QuoteName })
          columns.push({ value: showDescription(HelperService.removeHtml(res.list[i].QuoteDescription), "Description") })
          columns.push({ value: HelperService.getCurrencyFormatter(res.list[i].Total) })
          columns.push({ value: res.list[i].BreakName1 })
          columns.push({ value: res.list[i].BreakName2 })
          columns.push({ value: res.list[i].ServiceType })
          columns.push({ value: res.list[i].QuoteType })
          columns.push({ value: getQuoteDisposition(res.list[i].QuoteDisposition) })
          columns.push({ value: HelperService.getFormatedDate(res.list[i].DispositionDate) })
          columns.push({ value: res.list[i].SalesmanNum1 })
          columns.push({ value: res.list[i].TechnicianName })
          columns.push({ value: <a className="grid-hypper-link" onClick={() => getRedirect()}>{res.list[i].CallNum}</a> })

          rows.push({ data: columns });
        }

        setRows(rows);
        setTotalCount(res.totalRecords);
      })
      .catch((e) => {
        setShowLoader(false)
      });
  };

  const getBusinessValues = () => {
    getBusiness({ data, user_info })
      .then((res: any) => {
        var array: any = [];
        for (var i in res) {
          array.push({ title: res[i].BreakName, value: res[i].BreakCode, key:"BreakName1" });
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

        console.log(gridFilter)

      })
      .catch((e) => { });
  };

  const getlocationValues = () => {
    getLocation({ data, user_info })
      .then((res: any) => {
        var array: any = [];
        for (var i in res) {
          array.push({ title: res[i].BreakName, value: res[i].BreakCode, key: "BreakName"});
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

  const onSorting = (currentPage: number, isAsc: boolean, key: any, startDate: any, endDate: any, data: any, dateFilter: any) => {
    var statusArray = [];
    var locationArray = [];
    var ServiceTypeArray = [];
    var ClassArray = [];
    var QuoteTypeArray = [];
    for (var i in data) {
      for (var j in data[i].child) {
        if (data[i].key === 'QuoteDisposition') {
          if (data[i].child[j].isChecked === true) {
            statusArray.push(data[i].child[j].value)
          }
        }
        if (data[i].key === 'BreakName1') {
          if (data[i].child[j].isChecked === true) {
            locationArray.push(data[i].child[j].value)
          }
        }
        if (data[i].key === 'ServiceType1') {
          if (data[i].child[j].isChecked === true) {
            ServiceTypeArray.push(data[i].child[j].value)
          }
        }
        if (data[i].key === 'BreakName2') {
          if (data[i].child[j].isChecked === true) {
            ClassArray.push(data[i].child[j].value)
          }
        }
        if (data[i].key === 'QuoteType') {
          if (data[i].child[j].isChecked === true) {
            QuoteTypeArray.push(data[i].child[j].value)
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
    getProposal(currentPage, isAsc === true ? 'Asc' : 'Desc', key, statusArray, locationArray, ServiceTypeArray ,ClassArray, QuoteTypeArray , array, startDate, endDate)
  }

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
              gridFilter.map((item:any)=>{
                if(item.title == "Service Type"){
                  item.child = array;
                  return {...item}
                }else{
                  return item
                }
              })
              )
        })
        .catch((e) => { });
};
  const goBack = () => {
    window.history.back();
  };

  const getQuoteDisposition = (e: any) => {
    if (e) {
      if (e == "S") {
        return <span>Sold</span>
      }
      else if (e == "Q") {
        return <span>Quoted</span>
      }
      else if (e == "E") {
        return <span>Expired</span>
      }
    }
  }

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

  return (
    <>
      <DescriptionModal
        isShow={isShowDescription}
        title={descriptionTitle}
        isClose={closeDescription}
        data={descriptionData}
      />
      <div
        className=" "
        style={{ width: customerModal?.isShow === true ? "" : "" }}
      >
        <div className=" ">
          <div className="d-flex justify-content-between align-items-center px-3">
            <div className="d-flex flex-row equipment-heading-view align-items-center card-title">
              <BackComponent title={dictionary.db_Quote} count={totalCount} />
            </div>
            <div>
              <BsButton variant="light" className="btn-brand-light  mb-2" type="button">
                + Add Proposal
              </BsButton>
            </div>
          </div>
          <div className="other-component-view card-shadow equipment">
            <Grid
              filters={gridFilter}
              dateFilter={dateFilter}
              headers={gridHeader}
              storeKey={componentKey}
              rows={rows}
              ShowLoader={ShowLoader}
              isColumn={true}
              hoverRow={true}
              errorMessage={'No Proposals Found'}
              count={totalCount}
              onPageChange={onSorting}
              onSort={onSorting}
            />
          </div>
        </div>
      </div>

    </>
  );
};

export default Proposal;
