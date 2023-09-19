import { useEffect, useState } from "react";
import { Dropdown, Tabs, Tab } from "react-bootstrap";
import WebService from "../../utility/WebService";
import cancelIcon from "../../assets/images/cancel.svg";
import './DashBoard.scss';
import moment from "moment";
import HelperService from "../../utility/HelperService";
import ManageCardTemplateBlade from "./ManageCardTemplateBlade/ManageCardTemplateBlade";
import ReturnCalls from "./LevelOneWidgets/ReturnCalls/ReturnCalls";
import DurationBlade from "./DurationBlade/DurationBlade";
import CancelledCalls from "./LevelOneWidgets/CancelledCalls/CancelledCalls";
import CustomerInvoices from "./LevelOneWidgets/CustomerInvoices/CustomerInvoices";
import InactiveInvoices from "./LevelOneWidgets/InactiveCustomers/InactiveCustomers";
import PendingQuotes from "./LevelOneWidgets/PendingQuotes/PendingQuotes";
import CallPurchaseOrder from "./LevelOneWidgets/CallPurchaseOrder/CallPurchaseOrder";
import PartReorderStatus from "./LevelOneWidgets/PartReorderStatus/PartReorderStatus";
import OldEquipments from "./LevelOneWidgets/OldEquipments/OldEquipments";
import NewServiceMaster from "./LevelOneWidgets/NewServiceMaster/NewServiceMaster";
import { toast } from "react-toastify";
import AddNewTabBlade from "./AddNewTabBlade/AddNewTabBlade";
import WizardDeatilsBlade from "./WizardDeatils/WizardDeatilsBlade/WizardDeatilsBlade";
import TopFiveCustomers from "./LevelTwoWidgets/TopFiveCustomers/TopFiveCustomers";
import CallsByServiceType from "./LevelTwoWidgets/CallsByServiceType/CallsByServiceType";
import CustomerWithContract from "./LevelTwoWidgets/CustomerWithContract/CustomerWithContract";
import TimeSpentAnalysis from "./LevelTwoWidgets/TimeSpentAnalysis/TimeSpentAnalysis";
import PendingMaintenanceSchedule from "./LevelTwoWidgets/PendingMaintenanceSchedule/PendingMaintenanceSchedule";
import TopFiveARBalance from "./LevelTwoWidgets/TopFiveARBalance/TopFiveARBalance";
import ManageGraphTemplateBlade from "./LevelTwoWidgets/ManageGraphTemplateBlade/ManageGraphTemplateBlade";
import CallCountByUser from "./LevelTwoWidgets/CallCountByUser/CallCountByUser";
import IncompleteCallByUser from "./LevelTwoWidgets/IncompleteCallByUser/IncompleteCallByUser";
import DispatchVolume from "./LevelTwoWidgets/DispatchVolume/DispatchVolume";
import PortalSetupVsLogged from "./LevelTwoWidgets/PortalSetupVsLogged/PortalSetupVsLogged";
import RecommendedByStatus from "./LevelTwoWidgets/RecommendedByStatus/RecommendedByStatus";
import EstimateByStatus from "./LevelTwoWidgets/EstimateByStatus/EstimateByStatus";
import Power from "./PowerBI/PowerBI";

const Dashboard = () => {
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [showManageCardBlade, setShowManageCardBlade] = useState(false);
  const [showManageGraphBlade, setShowManageGraphBlade] = useState(false);
  const [dashboardTabs, setDashoardTabs] = useState<any[]>([]);
  const [showDurationBlade, setDurationBlade] = useState(false);
  const [durationData, setDurationData] = useState<any>({});
  const [detailData, setDetailData] = useState<any>({});
  const [isLoading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [tabs, setTabs] = useState<any[]>([]);
  const [durationTitle, setDurationTitle] = useState<any>("");
  const [detailTitle, setDetailTitle] = useState<any>("");
  const [showAddTabBlade, setShowAddTabBlade] = useState(false)
  const [showWizardDeatils, setShowWizardDeatils] = useState(false);
  const [dashBoardGraphData, setDashBoardGraphData] = useState<any[]>([])

  // update wizard states
  const [updateCustomerInvoces, setUpdateCustomerInvoces] = useState(new Date().getTime());
  const [updateQuotesAndRecommendation, setUpdateQuotesAndRecommendation] = useState(new Date().getTime());
  const [updateCallPurchaseOrder, setUpdateCallPurchaseOrder] = useState(new Date().getTime());
  const [updateInactiveCustomers, setUpdateInactiveCustomers] = useState(new Date().getTime());
  const [updateCancelledCalls, setUpdateCancelledCalls] = useState(new Date().getTime());
  const [updateReturnCalls, setUpdateReturnCalls] = useState(new Date().getTime());
  const [updateEquipment, setUpdateEquipment] = useState(new Date().getTime());
  const [updatePartReorderStatus, setUpdatePartReorderStatus] = useState(new Date().getTime());
  const [updateNewServiceMaster, setUpdateNewServiceMaster] = useState(new Date().getTime());

  useEffect(() => {
    getDashboardTabs(0)
  }, []);

  const getDashboardTabs = (index: any) => {
    WebService.getAPI({
      action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/DashboardTabsReact`,
      body: null
    })
      .then((res: any) => {
        var data = JSON.parse(res.value)
        setTabs(data)
        setDashoardTabs(data[index ? index : currentTab].LevelOne);
        setDashBoardGraphData(data[index ? index : currentTab].LevelTwo)
        console.log(data[index ? index : currentTab].LevelOne);
      })
      .catch((e) => {

      })
  };

  const onCloseCardBlade = () => {
    setShowManageCardBlade(false)
    getDashboardTabs(0)
  };

  const onCloseGraphBlade = () => {
    setShowManageGraphBlade(false)
    getDashboardTabs(0)
  };

  const onSelectMenuOption = (data: any, type: any, title: any, heading?: any) => {
    if (type == "Remove") {
      onRemoveWizard(data);
    } else if (type == "Details") {
      setDetailData(data)
      if (title == "Old Equipment") {
        setDetailTitle(heading)
      } else {
        setDetailTitle(title)
      }
      setShowWizardDeatils(true);
    } else if (type == "Duration") {
      setDurationTitle(title)
      setDurationData(data);
      setDurationBlade(true)
    } else if (type == "ScheduleEmail") {

    }

  };

  const onCloseDuration = (value: any, type: any, key: any) => {
    setDurationBlade(false);
    if (type && type == "on_save") {
      if (key == "CustomerInvoicesFilter") {
        setUpdateCustomerInvoces(new Date().getTime())
      } else if (key == "QuotesAndRecommendationFilter") {
        setUpdateQuotesAndRecommendation(new Date().getTime())
      } else if (key == "CallPurchaseOrderFilter") {
        setUpdateCallPurchaseOrder(new Date().getTime())
      } else if (key == "InactiveCustomersFilter") {
        setUpdateInactiveCustomers(new Date().getTime())
      } else if (key == "CancelledCallsFilter") {
        setUpdateCancelledCalls(new Date().getTime())
      } else if (key == "ReturnCallsFilter") {
        setUpdateReturnCalls(new Date().getTime())
      } else if (key == "EquipmentFilter") {
        setUpdateEquipment(new Date().getTime())
      }
    }
  };

  const onCloseDetails = (value: any, type: any, key: any) => {
    setShowWizardDeatils(false);
    if (type && type == "on_save") {
      if (key == "CustomerInvoicesFilter") {
        setUpdateCustomerInvoces(new Date().getTime())
      } else if (key == "QuotesAndRecommendationFilter") {
        setUpdateQuotesAndRecommendation(new Date().getTime())
      } else if (key == "CallPurchaseOrderFilter") {
        setUpdateCallPurchaseOrder(new Date().getTime())
      } else if (key == "InactiveCustomersFilter") {
        setUpdateInactiveCustomers(new Date().getTime())
      } else if (key == "CancelledCallsFilter") {
        setUpdateCancelledCalls(new Date().getTime())
      } else if (key == "ReturnCallsFilter") {
        setUpdateReturnCalls(new Date().getTime())
      } else if (key == "EquipmentFilter") {
        setUpdateEquipment(new Date().getTime())
      }
    }
  };

  const onCloseAddNewTabBlade = () => {
    getDashboardTabs(0)
    setShowAddTabBlade(false);
  };

  const onRemoveWizard = (data: any) => {
    let temp: any = dashboardTabs.map((item: any) => {
      if (item.WidgetCode == data) {
        item.IsSelected = false
        return { ...item }
      } else {
        return item
      }
    })
    setLoading(true)
    WebService.postAPI({
      action: `SAIUserPreference/`,
      body: {
        AccountId: user_info["AccountId"],
        CompanyId: user_info["CompanyId"],
        userID: user_info["userID"],
        UserName: user_info["userName"],
        key: 'DashboardTabsReact',
        value: JSON.stringify([
          {
            Name: 'My Tab',
            LevelOne: temp,
            LevelTwo: dashBoardGraphData,
          }
        ])
      }
    })
      .then((res) => {
        setLoading(false)
      })
      .catch((e) => {
        setLoading(false)
      })
  };

  // dashBoardGraphData

  const onRemoveTab = (index: any) => {
    if (tabs.length == 1) {
      toast.error('You cannot delete last tab.')
    } else {
      setLoading(true)
      var data = tabs.splice(index, 1)
      setTabs([...tabs])
      WebService.postAPI({
        action: `SAIUserPreference/`,
        body: {
          AccountId: user_info["AccountId"],
          CompanyId: user_info["CompanyId"],
          UserId: user_info["userID"],
          UserName: user_info["userName"],
          key: 'DashboardTabsReact',
          value: JSON.stringify(tabs)
        }
      })
        .then((res) => {
          setLoading(false)
        })
        .catch((e) => {
          setLoading(false)
        })
    }
  };

  const getCurrentTab = (e: any) => {
    setCurrentTab(e);
    let temp: any = tabs[e].LevelOne
    let graphTemp: any = tabs[e].LevelTwo
    setDashoardTabs([...temp]);
    setDashBoardGraphData([...graphTemp]);
  };

  return (
    <>
      <ManageCardTemplateBlade
        isShow={showManageCardBlade}
        isClose={onCloseCardBlade}
        data={dashboardTabs}
        index={currentTab}
      />
      <ManageGraphTemplateBlade
        isShow={showManageGraphBlade}
        isClose={onCloseGraphBlade}
        data={dashBoardGraphData}
        index={currentTab}
      />
      <DurationBlade
        isShow={showDurationBlade}
        isClose={onCloseDuration}
        data={durationData}
        title={durationTitle}
      />
      <AddNewTabBlade
        isShow={showAddTabBlade}
        isClose={onCloseAddNewTabBlade}
      />
      <WizardDeatilsBlade
        isShow={showWizardDeatils}
        isClose={onCloseDetails}
        data={detailData}
        title={detailTitle}
      />
      <div className="page-content-wraper dashboard-page">
        <div className="other-component-view card-shadow contract-detail-card position-relative">
          <div className="text-end position-absolute" style={{ right: "30px", top: "11px" }}>
            <Dropdown className="action-dd">
              <Dropdown.Toggle id="dropdown-basic">
                <img
                  src={require("../../assets/images/blue-hamburg-icon.svg").default}
                  className="hamburg-icon show theme-icon-color"
                  alt="hamburg"
                />
                <img src={require("../../assets/images/cross-icon-new.svg").default}
                  className="hamburg-icon close theme-icon-color"
                  alt="hamburg"
                />
              </Dropdown.Toggle>
              <Dropdown.Menu className="invoice-entry-dropmenu">
                <Dropdown.Item onClick={() => setShowAddTabBlade(true)}>
                  {" "}
                  Add New Tab
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setShowManageCardBlade(true)}>
                  {" "}
                  Manage Card Templates
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setShowManageGraphBlade(true)}>
                  {" "}
                  Manage Graph Templates
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="contract-details tab-style">
            <Tabs activeKey={currentTab} onSelect={getCurrentTab}>
              {
                tabs && tabs.length > 0 && tabs.map((res, index: any) => {
                  return (
                    <Tab
                      key={index}
                      eventKey={index}
                      title={
                        <div className=" justify-content-center align-items-center">
                          <label className="nav-text">{res.Name}</label>
                          <a onClick={() => onRemoveTab(index)}>
                            {
                              tabs.length == 1 ? '' : <img src={cancelIcon} className="theme-icon-color ms-3" />
                            }
                          </a>
                        </div>
                      }
                    >
                    </Tab>
                  )
                })
              }
            </Tabs>
          </div>
        </div>
        <div className='row main-view col-12 mt-4' key={currentTab}>
          {
            dashboardTabs && dashboardTabs.map((item: any) => {
              if (item.WidgetCode == "CancelledCalls" && item.IsSelected) {
                return <CancelledCalls selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateCancelledCalls} WidgetCode={item.WidgetCode} />
              } else if (item.WidgetCode == "CustomerInvoices" && item.IsSelected) {
                return <CustomerInvoices selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateCustomerInvoces} WidgetCode={item.WidgetCode} />
              } else if (item.WidgetCode == "CallPurchaseOrder" && item.IsSelected) {
                return <CallPurchaseOrder selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateCallPurchaseOrder} WidgetCode={item.WidgetCode} />
              } else if (item.WidgetCode == "PendingQuotes" && item.IsSelected) {
                return <PendingQuotes selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateQuotesAndRecommendation} WidgetCode={item.WidgetCode} />
              } else if (item.WidgetCode == "InactiveCustomer" && item.IsSelected) {
                return <InactiveInvoices selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateInactiveCustomers} WidgetCode={item.WidgetCode} />
              } else if (item.WidgetCode == "PartReorderStatus" && item.IsSelected) {
                return <PartReorderStatus selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updatePartReorderStatus} WidgetCode={item.WidgetCode} />
              } else if (item.WidgetCode == "OldEquipment" && item.IsSelected) {
                return <OldEquipments selectOption={(value: any, data: any, heading: any) => onSelectMenuOption(value, data, item.Title, heading)} isReload={updateEquipment} WidgetCode={item.WidgetCode} />
              } else if (item.WidgetCode == "NewServiceMaster" && item.IsSelected) {
                return <NewServiceMaster selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateNewServiceMaster} WidgetCode={item.WidgetCode} />
              } else if (item.WidgetCode == "ReturnCalls" && item.IsSelected) {
                return <ReturnCalls selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateReturnCalls} WidgetCode={item.WidgetCode} />;
              }
            })
          }
        </div>
        <div className='row main-view col-12 mt-4'>
          {
            dashBoardGraphData && dashBoardGraphData.map((item: any) => {
              if (item.WidgetCode == "TopFiveustomer" && item.IsSelected) {
                return <TopFiveCustomers selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateCancelledCalls} WidgetCode={item.WidgetCode} />
              }
              else if (item.WidgetCode == "CallsByServiceType" && item.IsSelected) {
                return <CallsByServiceType selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateCancelledCalls} WidgetCode={item.WidgetCode}/>
                // return <CustomerInvoices selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateCustomerInvoces} WidgetCode={item.WidgetCode} />
              } else if (item.WidgetCode == "CustomerWithContract" && item.IsSelected) {
                return <CustomerWithContract selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateCancelledCalls} WidgetCode={item.WidgetCode} />
                // return <CustomerInvoices selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateCustomerInvoces} WidgetCode={item.WidgetCode} />
              } else if (item.WidgetCode == "TimeSpentAnalysis" && item.IsSelected) {
                return <TimeSpentAnalysis />
              } else if (item.WidgetCode == "PendingMaintenanceSchedule" && item.IsSelected) {
                return <PendingMaintenanceSchedule selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateCancelledCalls} WidgetCode={item.WidgetCode} />
              } else if (item.WidgetCode == "TopFiveARBalance" && item.IsSelected) {
                return <TopFiveARBalance />
              } else if (item.WidgetCode == "CallCountByUser" && item.IsSelected) {
                return <CallCountByUser />
              } else if (item.WidgetCode == "IncompleteCalls" && item.IsSelected) {
                return <IncompleteCallByUser />
              } else if (item.WidgetCode == "DispatchVolume" && item.IsSelected) {
                return <DispatchVolume />
              } else if (item.WidgetCode == "PortalSetupLogged" && item.IsSelected) {
                return <PortalSetupVsLogged />
              } else if (item.WidgetCode == "RecommendationByStatus" && item.IsSelected) {
                return <RecommendedByStatus selectOption={(value: any, data: any) => onSelectMenuOption(value, data, item.Title)} isReload={updateCancelledCalls} WidgetCode={item.WidgetCode} />
              } else if (item.WidgetCode == "EstimateByStatus" && item.IsSelected) {
                return <EstimateByStatus />
              }
            })
          }
        </div>
        {/* <Power /> */}
      </div>
    </>
  )
}

export default Dashboard;