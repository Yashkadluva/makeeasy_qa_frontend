import { useState, useEffect } from "react";
import rightArrow from "../../../../assets/images/right-arrow-blue.svg";
import loader from '../../../../assets/images/loader.gif'
import { Card, Dropdown, Offcanvas, Form, Row, Col, Button } from 'react-bootstrap';
import { X, Gear } from 'react-bootstrap-icons';
import { useNavigate } from "react-router-dom";

import "./InvoiceEntry.scss"
import { getPreference, updatePreference } from "../../../../utility/CommonApiCall";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../config/Store";
import { InvoiceOverviewState, InvoiceState } from "../../../../reducer/CommonReducer";
import { Dispatch } from "redux";
import { setDataInRedux, SET_INVOICE_OVERVIEW } from "../../../../action/CommonAction";
import WebService from "../../../../utility/WebService";

import iconGenralInfo from "../../../../assets/images/icon-genral-info.svg";
import iconBilling from "../../../../assets/images/icon-billing-detail.svg";
import iconEquip from "../../../../assets/images/equipment-icon.svg";
import iconNotes from "../../../../assets/images/documents-icon.svg";
import iconCallPic from "../../../../assets/images/icon-call-pic.svg";
import iconTaskList from "../../../../assets/images/icon-task-list.svg";
import iconProfitLos from "../../../../assets/images/icon-profit-lost.svg";
import iconPreview from "../../../../assets/images/icon-prview.svg";
import iconCallRecpt from "../../../../assets/images/service-call-icon.svg";
import iconRecom from "../../../../assets/images/icon-recomendation.svg";
import iconServey from "../../../../assets/images/icon-servey.svg";
import iconActivity from "../../../../assets/images/icon-activity-log.svg";

var defaultData = [
  {
    id: 'GENERAL_INFO',
    name: 'General Info',
    isCheck: true,
    path: '/general-info',
    image: iconGenralInfo,
    count: '0'
  },
  {
    id: 'BILLING_DETAILS',
    name: 'Billing Details',
    isCheck: true,
    path: '/billing-detail',
    image: iconBilling,
    count: '0'
  },
  {
    id: 'EQUIPMENT',
    name: 'Equipment',
    isCheck: true,
    path: '/invoice-entry-equipment',
    image: iconEquip,
    count: '0'
  },
  {
    id: 'DESCRIPTION_AND_NOTES',
    name: 'Description & Notes',
    isCheck: true,
    path: '/description-note',
    image: iconNotes,
    count: '0'
  },
  {
    id: 'CALL_PICTURES',
    name: 'Call Pictures',
    isCheck: true,
    path: '/call-pictures',
    image: iconCallPic,
    count: '0'
  },
  {
    id: 'TASK_LIST',
    name: 'Task List',
    isCheck: true,
    path: '/task-list',
    image: iconTaskList,
    count: '0'
  },
  {
    id: 'PROFIT_LOSS',
    name: 'Profit/Loss',
    isCheck: true,
    path: '',
    image: iconProfitLos,
    count: '0'
  },
  {
    id: 'PREVIEW',
    name: 'Preview',
    isCheck: true,
    path: '/invoice-preview',
    image: iconPreview,
    count: '0'
  },
  {
    id: 'CALL_RECEIPT',
    name: 'Call Receipt',
    isCheck: true,
    path: '/call-receipt',
    image: iconCallRecpt,
    count: '0'
  },
  {
    id: 'RECOMMENDATIONS',
    name: 'Recommendations',
    isCheck: true,
    path: '/invoice-recommendations',
    image: iconRecom,
    count: '0'
  },
  {
    id: 'SURVEY',
    name: 'Survey',
    isCheck: true,
    path: '',
    image: iconServey,
    count: '0'
  },
  {
    id: 'ACTIVITY_LOG',
    name: 'Activity Log',
    isCheck: true,
    path: '/activity-log',
    image: iconActivity,
    count: '0'
  },
]


const InvoiceEntryPagesLink = () => {
  const navigate = useNavigate();
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const [cardData, setCardData] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const invoiceOverview: any = useSelector<RootState, InvoiceOverviewState>(
    (state) => state.invoiceOverview);
  const dispatch: Dispatch<any> = useDispatch();
  const invoiceData: any = useSelector<RootState, InvoiceState>(
    (state) => state.invoice);


  useEffect(() => {
    getOrder()

  }, [invoiceOverview, invoiceData])

  const getOrder = () => {
    setLoading(true)
    
    getPreference({ user_info, key: 'INVOICE_OVERVIEW' })
      .then((res: any) => {
        var value = JSON.parse(res.value)
        if (value) {
          getOverviewCount(value)
        } else {
          var data = defaultData
          updatePreference({ data, user_info, key: 'INVOICE_OVERVIEW' })
            .then((res: any) => {
              dispatch(setDataInRedux({ type: SET_INVOICE_OVERVIEW, value: new Date() }));
              getOverviewCount(data)
            })
            .catch((e: any) => { });

        }
      })
      .catch((e) => {

      })
  }

  const getOverviewCount = (value: any) => {
   if(invoiceData.invoiceData.InvoiceNum){ setLoading(true)
    var requestedBody = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      InvoiceNum: invoiceData.invoiceData.InvoiceNum,
      ServiceMasterId: invoiceData.invoiceData.SMNum
    }
    WebService.postAPI({
      action: `SDInvoice/GetOverview`,
      body: requestedBody
    })
      .then((res: any) => {
        if (value.length > 0) {
          for (var i in value) {
            if (value[i].id == 'GENERAL_INFO') {
              value[i].count = '0';
            } else if (value[i].id == 'BILLING_DETAILS') {
              value[i].count = res.Result.BillingDetailsCount;
            } else if (value[i].id === 'EQUIPMENT') {
              value[i].count = res.Result.EquipmentCount;
            } else if (value[i].id === 'DESCRIPTION_AND_NOTES') {
              value[i].count = '0';
            } else if (value[i].id === 'CALL_PICTURES') {
              value[i].count = res.Result.CallPictureCount;
            } else if (value[i].id === 'TASK_LIST') {
              value[i].count = res.Result.TaskListCount;
            } else if (value[i].id === 'PROFIT_LOSS') {
              value[i].count = '0';
            } else if (value[i].id === 'PREVIEW') {
              value[i].count = '0';
            } else if (value[i].id === 'CALL_RECEIPT') {
              value[i].count = '0';
            } else if (value[i].id === 'RECOMMENDATIONS') {
              value[i].count = res.Result.RecommandationCount;
            } else if (value[i].id === 'SURVEY') {
              value[i].count = '0';
            } else if (value[i].id === 'ACTIVITY_LOG') {
              value[i].count = '0';
            }
             else if (value[i].id === 'TASK_LIST') {
              value[i].count = '0';
            }
          }
          setCardData(value)
          setLoading(false)
        }
      })
      .catch((e) => {
        setLoading(false)
      })}else{
        setCardData(defaultData)
        setLoading(false)
      }
  }

  const onRemove = (index: any) => {
    setLoading(true)
    for (var i in cardData) {
      if (i == index) {
        cardData[i].isCheck = !cardData[i].isCheck;
      }
    }
    var data = cardData;
    updatePreference({ data, user_info, key: 'INVOICE_OVERVIEW' })
      .then((res: any) => {
        dispatch(setDataInRedux({ type: SET_INVOICE_OVERVIEW, value: new Date() }));
        getOrder()
      })
      .catch((e: any) => {
        setLoading(false)
      });
  }

  return <>
    <Card className="card-style">
      {
        isLoading === true ?

          <div className="">
            <div ></div>
            <div style={{ textAlign: 'center', marginTop: '10%' }}>
              <img style={{ position: 'relative' }} src={loader} alt="No loader found" />
              <div style={{ position: 'relative', color: 'white' }}>Loading...</div>
            </div>
          </div > :
          <div className="row main-overview mx-0 mt-4 mx-2">
            {
              cardData.map((res, index: any) => {
                return (
                  res.isCheck === true &&
                  <div className="box-main-view cursor-pointer col-lg-3 col-md-4 mx-0 mt-0 pb-1 mb-3">
                    <div className="box-view">
                      <a href="javascript:void(0)" className="close-icon" onClick={() => onRemove(index)}>< X size={24} /></a>
                      <div onClick={() => navigate(`${res.path}`)}>
                        <img src={`${res.image}`} className="data-icon theme-icon-color" />
                        {(res.id === 'GENERAL_INFO' ||
                          res.id === 'DESCRIPTION_AND_NOTES' ||
                          res.id === 'PREVIEW' ||
                          res.id === 'PROFIT_LOSS' ||
                          res.id === 'CALL_RECEIPT' ||
                          res.id === 'SURVEY') ? <div className="count-text">&nbsp;</div> : <div className="count-text">{res.count}</div>}
                        <div className="services-title-text">{res.name}</div>
                        <img src={rightArrow} className="blue-arrow-icon theme-icon-color" />
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
      }


    </Card>
  </>;
};

export default InvoiceEntryPagesLink;


