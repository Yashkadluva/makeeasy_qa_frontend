import React, { useEffect, useState } from "react";
import "./Header.scss";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import Loader from "../Loader/Loader";
import Dropdown from "react-bootstrap/Dropdown";
import Search from "../../components/Search/Search";
import { USER_LOGOUT, GET_DICTIONARY, setDataInRedux } from "../../action/CommonAction";
import WebService from "../../utility/WebService";
import logo from "../../assets/images/logo-short.png";
import profile from "../../assets/images/dummy-profile.svg";
import phone from "../../assets/images/call-icon.svg";
import icondLightMode from "../../assets/images/moon.svg";
import icondDarkMode from "../../assets/images/dark.svg";
import avtar from "../../assets/images/avtar.svg";
import useDarkMode from "use-dark-mode";

const Header = () => {
  const [isLoading, setLoading] = useState(false);
  const dispatch: Dispatch<any> = useDispatch();
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const darkMode = useDarkMode();


  var dictionary: any = {
    db_ServiceMaster: "Service Master",
    db_CustomerMaster: "Customer Master",
    db_ServiceCall: "Service Call",
    db_JobCosting: "Job Costing",
    db_SalesMan: "SalesMan",
    db_Discount: "Discount",
    db_Quote: "Quote",
    db_ServiceMaster_Label1: "Label1",
    db_ServiceMaster_Label2: "Label2",
    db_ServiceMaster_Label3: "Label3",
    db_ServiceMaster_Label4: "Label4",
    db_ServiceCall_Label1: "Label1",
    db_ServiceCall_Label2: "Label2",
    db_ServiceCall_Label3: "Label3",
    db_ServiceCall_Label4: "Label4",
  };


  useEffect(() => {
    if (darkMode.value) {
      console.log("darkMode.value", darkMode.value);
      darkMode.toggle();
    }
    dispatch(setDataInRedux({ type: GET_DICTIONARY, value: dictionary }));
    getCompanyDictionary();
  }, []);

  const getCompanyDictionary = () => {
    setLoading(true)
    const requestData = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      Culture: user_info["cultureCode"],
    };
    WebService.postAPI({
      action: `Resource/GetResourceEntries`,
      body: requestData,
    })
      .then((res: any) => {

        for (var i in res) {
          dictionary[res[i].Name] = res[i].Value;
        }
        getCustomFields(dictionary)
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  const getCustomFields = (data: any) => {
    console.log("data",data)
    setLoading(true)
    WebService.getAPI({
      action:
        "SaiSetupCustomFields/" +
        user_info["AccountId"] +
        "/" +
        user_info["CompanyId"],
      body: null,
    })
      .then((res: any) => {
        if (res.Data.length > 0) {
          for (var i in res.Data) {
            if (res.Data[i].Type === 1) {
              data.db_ServiceMaster_Label1 = res.Data[i].Field1
              data.db_ServiceMaster_Label2 = res.Data[i].Field2
              data.db_ServiceMaster_Label3 = res.Data[i].Field3
              data.db_ServiceMaster_Label4 = res.Data[i].Field4
            }
            if (res.Data[i].Type === 2) {
              data.db_ServiceCall_Label1 = res.Data[i].Field1
              data.db_ServiceCall_Label2 = res.Data[i].Field2
              data.db_ServiceCall_Label3 = res.Data[i].Field3
              data.db_ServiceCall_Label4 = res.Data[i].Field4
            }
          }
          dispatch(setDataInRedux({ type: GET_DICTIONARY, value: data }));
          setLoading(false);
        }
      })
      .catch((e) => {
        setLoading(false);
      })
  }

  const logoutHandler = async () => {
    localStorage.clear();
    dispatch(setDataInRedux({ type: USER_LOGOUT, value: '' }));
    window.location.href = "/login";
  };

  return (
    <>
      <Loader show={isLoading} />
      <header>
        <div className="header">
          <div className="row main-row">
            <div className="col-lg-5 col-md-3 col-6 align-self-center d-flex align-items-center pr-0">
              <a id="btn-collapse" href="#">
                <i className="ri-menu-line ri-xl"></i>
              </a>
              <a
                id="btn-toggle"
                href="#"
                className="sidebar-toggler break-point-lg"
              >
                <i className="ri-menu-line ri-xl"></i>
              </a>
              <img
                src={logo}

                alt="Logo"
                className="header-logo"
                width={70}
                height={50}
              />
            </div>
            <div className="col-lg-7 col-md-9 col-6 d-flex justify-content-end align-items-center form-style">
              <Search />
              <a onClick={darkMode.toggle} className="header-icons me-3">
                <img
                  src={darkMode.value ? icondDarkMode : icondLightMode}
                  className="icon theme-icon-color"
                  alt="Dark mode"
                />
              </a>
              <a className="header-icons me-3">
                <img
                  src={phone}
                  className="icon theme-icon-color"
                  width={20}
                  alt="phone"
                />
              </a>
              <Dropdown>
                <Dropdown.Toggle
                  className="d-flex bg-transparent text-dark p-0 border-0 h-auto profile-dd my-2"
                  id="dropdown-basic"
                >
                  <div className="dropdown">
                    <img
                      src={user_info["profilePictureUrl"] ? user_info["profilePictureUrl"] : avtar}
                      id="img_header"
                      width={35}
                      height={35}
                      className="mr-2"
                      alt="profile"
                    />
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu className="profile-dd-item">
                  <Dropdown.Item onClick={() => logoutHandler()}>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
