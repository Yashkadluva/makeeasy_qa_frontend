import axios from "axios";
import { useEffect, useState } from "react";
import "./GoogleAddressModal.scss";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../config/Store";
import { SearchState } from "../../reducer/CommonReducer";
import Loader from "../Loader/Loader";
import { Dispatch } from "redux";
import Form from "react-bootstrap/Form";
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import HelperService from "../../utility/HelperService";

interface PropData {
  isOpen: any;
  close: any;
  data: any;
  updateData?: any;
}

const GoogleAddressModal = (props: PropData) => {
  const [isLoading, setLoading] = useState(false);
  const [googleResult, setGoogleResult] = useState(Object);
  const search: any = useSelector<RootState, SearchState>(
    (state) => state.search
  );
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [enteredAddress, setEnteredAddress] = useState(true);
  const [recommendedAddress, setRecommendedAddress] = useState(false);
  const addressData = props.data;
  const dispatch: Dispatch<any> = useDispatch();

  useEffect(() => {
    getGoogleAddress();
  }, [addressData]);

  const getGoogleAddress = () => {
    axios
      .get(
        `https://maps.google.com/maps/api/geocode/json?key=AIzaSyC7dXZ5VVpf5ILgqLTacCyQwPzXLIghKfg&address=${props?.data?.Address1} ${props?.data?.Address2} ${props?.data?.City} ${props?.data?.State} ${props?.data?.ZipCode}`
      )
      .then((res) => {
        if (res.data) {
          res.data.results[0].custom_address = getData(
            "street_number",
            res.data.results[0].address_components,
            false
          );
          res.data.results[0].custom_address +=
            (res.data.results[0].custom_address ? " " : "") +
            getData("route", res.data.results[0].address_components, false);
          res.data.results[0].custom_address +=
            (res.data.results[0].custom_address ? " " : "") +
            getData("locality", res.data.results[0].address_components, false);
          if (res.data.results[0].custom_address) {
            var address = getData(
              "sublocality_level_1",
              res.data.results[0].address_components,
              true
            );

            if (address) {
              res.data.results[0].custom_address +=
                (res.data.results[0].custom_address ? ",  " : "") + address;
            }

            res.data.results[0].custom_address +=
              (res.data.results[0].custom_address ? ", " : "") +
              getData(
                "administrative_area_level_1",
                res.data.results[0].address_components,
                true
              );
            // res.data.results[0].custom_address += (res.data.results[0].custom_address ? ", " : '') + getData('country', res.data.results[0].address_components, true);
            res.data.results[0].custom_address +=
              (res.data.results[0].custom_address ? ",  " : "") +
              getData(
                "postal_code",
                res.data.results[0].address_components,
                true
              );
            setGoogleResult(res.data && res.data.results[0]);
          }
        }
      })
      .catch((e) => {});
  };

  const onSave = () => {
    var value = localStorage.getItem("MODAL_TYPE");
    var requestedBody = addressData;
    requestedBody.googleVerified = false;
    requestedBody.latitude = googleResult?.geometry?.location?.lat;
    requestedBody.longitude = googleResult?.geometry?.location?.lng;
    if (recommendedAddress) {
      requestedBody.Address1 = getData(
        "street_number",
        googleResult.address_components,
        false
      );
      if (requestedBody.Address1) {
        requestedBody.Address1 += " ";
      }
      requestedBody.Address1 += getData(
        "route",
        googleResult.address_components,
        false
      );
      requestedBody.Address2 = getData(
        "locality",
        googleResult.address_components,
        false
      );
      requestedBody.ZipCode = getData(
        "postal_code",
        googleResult.address_components,
        true
      );
    
      requestedBody.googleVerified = true;
    } else {
      var requestedBody = addressData;
    }
    if (value === "SERVICE_LOCATION") {
      props.close("SERVICE_LOCATION", requestedBody);
    } else if (value === "BILL_INFO") {
      props.close("BILL_INFO", requestedBody);
    } else {
      props.close("ON_SAVE", requestedBody);
    }
    localStorage.removeItem("MODAL_TYPE");
  };

  const getData = (type: string, response: any[], isShort: boolean) => {
    var data = "";
    for (var j = 0; j < response.length; j++) {
      var types = response[j].types;
      for (var k = 0; k < types.length; k++) {
        if (types[k] == type) {
          if (isShort) {
            data = response[j].short_name;
          } else {
            data = response[j].long_name;
          }
        }
      }
    }
    return data;
  };

  const onCheck = (value: string) => {
    if (value === "ENTERED") {
      setEnteredAddress(true);
      setRecommendedAddress(false);
    } else {
      setEnteredAddress(false);
      setRecommendedAddress(true);
    }
  };

  const onCancel = () => {
    localStorage.removeItem("MODAL_TYPE");
    props.close();
  };

  return (
    <>
      <Loader show={isLoading} />
      <Offcanvas
        show={props.isOpen}
        onHide={onCancel}
        placement={"end"}
        className="offcanvas-large"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Google Address</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="border-bottom px-0 information-main-view py-0">
          <div className="call-buget-modal form-style mx-0 p-1">
            <div className="modal-body px-3 mt-4">
              <div className="row google-address">
                <div className="col-5 address-box d-flex row">
                  <div className="col-1 mt-2">
                    <Form.Group className="" controlId="formBasicCheckbox">
                      <Form.Check
                        type="radio"
                        label=""
                        defaultChecked={enteredAddress}
                        checked={enteredAddress}
                        onChange={() => onCheck("ENTERED")}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-10">
                    <div className="entered-title">You entered</div>
                    <div className="address-text">
                      {props?.data?.Address1} {props?.data?.Address2}
                    </div>
                    <div className="address-text">
                      {props?.data?.City}, {props?.data?.State},{" "}
                      {props?.data?.ZipCode}
                    </div>
                  </div>
                </div>
                <div className="col-5 address-box d-flex row">
                  <div className="col-1 mt-2">
                    <Form.Group className="" controlId="formBasicCheckbox">
                      <Form.Check
                        type="radio"
                        label=""
                        defaultChecked={recommendedAddress}
                        checked={recommendedAddress}
                        onChange={() => onCheck("RECOMMENDED")}
                        disabled={
                          HelperService.isEmptyObject(googleResult)
                            ? true
                            : false
                        }
                      />
                    </Form.Group>
                  </div>
                  <div className="col-10">
                    <div className="entered-title">Recommended</div>
                    <div className="address-text">
                      {HelperService.isEmptyObject(googleResult)
                        ? "No Recommended Address"
                        : googleResult["custom_address"]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="offcanvas-footer mt-4 position-absolute">
              <Button
                variant="primary"
                className="btn-brand-solid me-3"
                type="submit"
                onClick={() => onSave()}
              >
                Submit
              </Button>
              <Button
                variant="primary"
                className="btn-brand-outline"
                type="button"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default GoogleAddressModal;
