import React, { useEffect, useState } from "react";
import WebService from "../../utility/WebService";
import { Collapse } from "react-bootstrap";
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import {
  setDataInRedux,
  IS_SHOW_HUMBERG_MENU,
  USER_LOGOUT,
} from "../../action/CommonAction";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import { HumbrugState } from "../../reducer/SideBarReducer";
import { Link } from "react-router-dom";
import Menu from "./Menu";
import MenuItem from "./MenuItem";
import SubMenu from "./SubMenu";
import ProSidebar from "./ProSidebar";
import SidebarFooter from "./SidebarFooter";
import SidebarContent from "./SidebarContent";
import "./SideBar.scss";
import DashboardIcon from "../../assets/images/dashboard.svg";
import AdminIcon from "../../assets/images/admin-icon.svg";
import DispatchBoardIcon from "../../assets/images/dispatch-board-icon.svg";
import ServiceIcon from "../../assets/images/service-icon.svg";
import ReceivableIcon from "../../assets/images/receivable-icon.svg";
import MiscIcon from "../../assets/images/misc-icon.svg";
import SalesIcon from "../../assets/images/sales-icon.svg";
import ReportsIcon from "../../assets/images/reports-icon.svg";
import hamburg from "../../assets/images/swap-icon.svg";
import { sideBarApi } from "../../utility/CommonApiCall";
import { getDictionaryState } from "../../reducer/CommonReducer";

const SideBar = () => {
  const ToogleClass = () => {
    var element = document.getElementById("main-app");
    element?.classList.toggle("toggled-main");
    dispatch(setDataInRedux({ type: IS_SHOW_HUMBERG_MENU, value: "" }));
  };

  const [headerData, setHeaderData] = useState<any[]>([]);
  const dispatch: Dispatch<any> = useDispatch();
  const value = useSelector<RootState, HumbrugState>((state) => state.sideBar);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const dictionary: any = useSelector<RootState, getDictionaryState>(
    (state) => state.getDictionaryData?.getDictionary
  );

  useEffect(() => {
    getHeader();
    if (value?.isShow) {
      var element = document.getElementById("main-app");
      element?.classList.toggle("toggled-main");
    }
  }, []);

  const getHeader = () => {
    sideBarApi({ user_info })
      .then((res: any) => {
        let temp: any = [];
        for (var i in res) {
          if (res[i].IsHidden === false && res[i].Title != "Search") {
            if (res[i].SubSet) {
              var child1: any = [];
              for (var j in res[i].SubSet) {
                if (res[i].SubSet[j].IsHidden === false) {
                  if (res[i].SubSet[j].SubSet) {
                    var child2: any = [];
                    for (var k in res[i].SubSet[j].SubSet) {
                      if (res[i].SubSet[j].SubSet[k].IsHidden === false) {
                        if (res[i].SubSet[j].SubSet[k].SubSet) {
                          var child3: any = [];
                          for (var l in res[i].SubSet[j].SubSet[k].SubSet) {
                            if (
                              res[i].SubSet[j].SubSet[k].SubSet[l].IsHidden ===
                              false
                            ) {
                              child3.push(res[i].SubSet[j].SubSet[k].SubSet[l]);
                            }
                          }
                          res[i].SubSet[j].SubSet[k].SubSet = child3;
                        }
                        child2.push(res[i].SubSet[j].SubSet[k]);
                      }
                    }

                    res[i].SubSet[j].SubSet = child2;
                  }
                  child1.push(res[i].SubSet[j]);
                }
              }

              res[i].SubSet = child1;
            }

            temp.push(res[i]);
          }
        }

        setHeaderData(temp);
      })
      .catch((e: any) => {
      });
  };

  const getImage = (title: string) => {
    if (title === "Dashboard") {
      return DashboardIcon;
    } else if (title === "Admin") {
      return AdminIcon;
    } else if (title === "Dispatch Board") {
      return DispatchBoardIcon;
    } else if (title === "Service") {
      return ServiceIcon;
    } else if (title === "Receivable") {
      return ReceivableIcon;
    } else if (title === "MISC") {
      return MiscIcon;
    } else if (title === "Sales/Mkt") {
      return SalesIcon;
    } else if (title === "Reports ") {
      return ReportsIcon;
    } else {
      return ReportsIcon;
    }
  };

  const getUrl = (title: string) => {
    if (title === "Dashboard") {
      return "/dashboard";
    } else if (title == dictionary.db_ServiceMaster) {
      return "/service-master";
    } else if (title === "Company Setup") {
      return "/company-information";
    } else if (title === "Dispatch Board") {
      return "/basic-view";
    } else if (title === "Manage Email Template") {
      return "/manage-email-template";
    } else if (title === "Manage Text Template") {
      return "/manage-text-template";
    } else if (title === 'Manage Users') {
      return "/manage-users";
    } else if (title === 'Manage Dictionary') {
      return "/manage-dictionary";
    } else if (title === 'Manage Groups') {
      return "/manage-groups";
    } else if (title === "Reports") {
      return "/reports";
    } else if (title === 'Generate Contract Billings') {
      return "/generate-contract-billing";
    } else if (title === 'Contract Renewal') {
      return "/contract-renewal";
    } else if (title === 'Maintenance Contract Notification') {
      return "/maintenance-contract-notification";
    } else {
      return "/dashboard";
    }
  };

  const logoutHandler = async () => {
    dispatch(setDataInRedux({ type: USER_LOGOUT, value: "" }));
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="main-sidebar">
      <ProSidebar collapsed={!value.isShow} breakPoint="xs">
        <SidebarContent>
          {headerData.map((res: any, i: number) => {
            return (
              <Menu
                hasSubmenu={res.SubSet && res.SubSet.length}
                iconShape="circle"
                key={"mainmenu_" + i}
              >
                {res.SubSet && res.SubSet.length > 0 ? (
                  <SubMenu
                    key={"menu_" + i}
                    title={res["Title"]}
                    icon={getImage(res["Title"])}
                  >
                    {res.SubSet.map((val: any, index: number) => {
                      return val.SubSet && val.SubSet.length > 0 ? (
                        <SubMenu key={"submenu_" + index} title={val["Title"]}>
                          {val.SubSet.map((val1: any, j: number) => {
                            return val1.SubSet && val1.SubSet.length > 0 ? (
                              <SubMenu key={"child_" + j} title={val1["Title"]}>
                                {val1.SubSet.map((val2: any, k: number) => {
                                  return (
                                    <MenuItem
                                      key={"child1_" + k}
                                      url={getUrl(val2["Title"])}
                                    >
                                      {val2["Title"]}
                                    </MenuItem>
                                  );
                                })}
                              </SubMenu>
                            ) : (
                              <MenuItem
                                key={"child_" + j}
                                url={getUrl(val1["Title"])}
                              >
                                {val1["Title"]}
                              </MenuItem>
                            );
                          })}
                        </SubMenu>
                      ) : (
                        <MenuItem
                          key={"submenu_" + index}
                          url={getUrl(val["Title"])}
                        >
                          {val["Title"]}
                        </MenuItem>
                      );
                    })}
                  </SubMenu>
                ) : (
                  <MenuItem
                    key={"menu_" + i}
                    icon={getImage(res["Title"])}
                    url={getUrl(res["Title"])}
                  >
                    {res["Title"]}
                  </MenuItem>
                )}
              </Menu>
            );
          })}
        </SidebarContent>

        <SidebarFooter style={{ textAlign: "center" }}>
          {/* <div
            className="sidebar-btn-wrapper cursor-pointer sa-side-footer"
            onClick={logoutHandler}
          >
            <img src={LogoutIcon} style={{ marginTop: -2 }} />
            {value.isShow ? (
              <span className="sa-side-footertext">Logout</span>
            ) : (
              <span className="sa-side-footercol">Logout</span>
            )}
          </div> */}
          <a className="toggle-menu-btn " onClick={ToogleClass}>
            <img
              src={hamburg}
              width="24"
              className="hamburger-menu mt-3"
              alt="hamburg"
            />
          </a>
        </SidebarFooter>
      </ProSidebar>
    </div>
  );
};

export default SideBar;
