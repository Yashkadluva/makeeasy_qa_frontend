import React, { useEffect, useState } from "react";
import CustomerInformation from "../../components/ServiceMasterComponents/CustomerInformation/CustomerInformation";
import "./Service.scss";
import WebService from "../../utility/WebService";
import { Dispatch } from "redux";

import { useDispatch, useSelector } from "react-redux";
import {
  setDataInRedux,
  PAGE_TITLE,
  SET_SD_MASTER_DATA,
  SET_SD_ADDRESS_DATA,
  SET_SALE_DATA,
  SET_BILLING_DATA,
  UPDATE_OVERVIEW
} from "../../action/CommonAction";
import { RootState } from "../../config/Store";
import {
  SDMaster,
  CustomerModalState,
  SearchState,
} from "../../reducer/CommonReducer";
import { Outlet, useNavigate } from "react-router-dom";

const Service = () => {
  const [isLoading, setLoading] = useState(false);
  const [arLoading, setArLoading] = useState(false);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const [arData, setArData] = useState<any>();

  const data: any = useSelector<RootState, CustomerModalState>(
    (state) => state.customerModal
  );
  const address: any = useSelector<RootState, SDMaster>(
    (state) => state.sdMaster
  );
  const search: any = useSelector<RootState, SearchState>(
    (state) => state.search
  );
  let history = useNavigate();

  const dispatch: Dispatch<any> = useDispatch();
  useEffect(() => {
    dispatch(setDataInRedux({ type: PAGE_TITLE, value: "Service Master" }));
    if (!search.searchData.Id) {
      history("/SM");
    }
  }, []);

  useEffect(() => {
    if (search.searchData.Id) {
      getCustomerInformation(search.searchData.Id);
      getArCustomerInformation(search.searchData.Id);
    }
  }, [search]);

  const getCustomerInformation = (id: any) => {
    setLoading(true);
    WebService.getAPI({
      action: `SDserviceMaster/V2/GetSDserviceMaster/${id}_${user_info["AccountId"]}_${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        dispatch(
          setDataInRedux({
            type: SET_SD_MASTER_DATA,
            value: res,
          })
        );
        dispatch(
          setDataInRedux({
            type: SET_SD_ADDRESS_DATA,
            value: res.LocationMasterIds,
          })
        );

        dispatch(setDataInRedux({ type: UPDATE_OVERVIEW, value: new Date().getTime() }));
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  const getArCustomerInformation = (id: any) => {
    setArLoading(true);
    WebService.getAPI({
      action: `SDserviceMaster/V2/GetARCustomer/${id}_${user_info["AccountId"]}_${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        setArData(res);
        dispatch(
          setDataInRedux({
            type: SET_BILLING_DATA,
            value: res,
          })
        );
        setArLoading(false);
        getSales(res.QBId);
      })
      .catch((e) => {
        setArLoading(false);
      });
  };

  const getSales = (id: string) => {
    WebService.getAPI({
      action: `ARCustomerMaster/GetARAgingValues/${user_info["AccountId"]}/${user_info["CompanyId"]}/${id}`,
      body: null,
    })
      .then((res: any) => {
        dispatch(
          setDataInRedux({
            type: SET_SALE_DATA,
            value: res,
          })
        );
      })
      .catch((e) => {
        console.log("e", e);
      });
  };

  return (
    <>
      <div className="service service-master">
        <div className="home-main d-flex flex-row">
          <div
            className="ci-view"
            style={{ width: data?.isShow === true ? "32px" : "auto" }}
          >
            {arData && (
              <CustomerInformation
                loading={isLoading}
                arMasterData={arData}
                arLoader={arLoading}
              />
            )}
          </div>
          <div
            className={
              "mm-view right-card  with-CustInfo " +
              (data?.isShow == true ? "no-CustInfo" : "")
            }
          >
            {data?.isShow === true && address?.sd_master?.ARCustomerMaster ? (
              <div className="jobLocationText">
                Job Location
                <span className="top-address">
                  {address.sd_master.ARCustomerMaster.Address1}{" "}
                  {address.sd_master.ARCustomerMaster.Address2}{" "}
                  {address.sd_master.ARCustomerMaster.City}{" "}
                  {address.sd_master.ARCustomerMaster.State} ,{" "}
                  {address.sd_master.ARCustomerMaster.ZipCode}
                </span>
              </div>
            ) : null}
            <div className="">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Service;
