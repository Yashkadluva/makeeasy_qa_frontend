import { useState, useEffect } from "react";
import { Row, Col, Offcanvas, Tabs, Tab, Form, Button } from 'react-bootstrap';
import { Envelope } from 'react-bootstrap-icons';
import { useForm, Controller } from "react-hook-form";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import { useNavigate } from "react-router-dom";
import "./ContractDetail.scss"
import WebService from "../../../../utility/WebService";
import { toast } from 'react-toastify';
import HelperService from "../../../../utility/HelperService";
import AddContractBlade from "../AddContract/AddContractBlade";
import { Dispatch } from "redux";
import { setDataInRedux,SET_IS_REFRESH } from "../../../../action/CommonAction";
import { useSelector,useDispatch } from "react-redux";

interface PropData {
  genralData: any;
  classOptions: any;
  locationOptions: any;
  contractTypeOptions: any;
}

const ContractGenralInfo = (props: PropData) => {
  const [generalData, setGeneralData] = useState<any>({});
  const [isShowAddContract, setIsShowAddContract] = useState(false);
  const dispatch: Dispatch<any> = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
  } = useForm();

  useEffect(() => {
    setGeneralData(props.genralData?.Contract)
  }, [props.genralData])

  const dropdonwOptions: Options[] = [
    { id: 1, value: "Option 1" },
    { id: 2, value: "Option 2" },
    { id: 3, value: "Option 3" },
    { id: 4, value: "Option 4" },
  ];


  const onCloseAddContract = (value:any,type:any) => {
    setIsShowAddContract(false)
    type == "Add" &&    dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
  }

  


  return <>

    <AddContractBlade
      isShow={isShowAddContract}
      isClose={onCloseAddContract}
      data={props.genralData ? props.genralData : {}}
      isEdit={true}
      classOptions={props.classOptions}
      locationOptions={props.locationOptions}
      contractTypeOptions={props.contractTypeOptions}
    />


    <Row className="text-dark mt-3 font-14">
      <Col md={12} className="text-end mb-3"> <Button variant="light" className="btn-brand-light btn-small" onClick={()=>setIsShowAddContract(true)}>Edit</Button> </Col>
      <Col md={3} className="mb-3">
        <Form.Label className="font-w-medium">Contract #</Form.Label>
        <p className="mb-0">{generalData?.ContractNum ? generalData?.ContractNum : "-"}</p>
      </Col>
      <Col md={3} className="mb-3">
        <Form.Label className="font-w-medium">Start Date</Form.Label>
        <p className="mb-0">{generalData?.StartDate ? HelperService.getFormatedDate(generalData?.StartDate) : "-"}</p>
      </Col>
      <Col md={3} className="mb-3">
        <Form.Label className="font-w-medium">End Date</Form.Label>
        <p className="mb-0">{generalData?.ExpiryDate ? HelperService.getFormatedDate(generalData?.ExpiryDate) : "-"}</p>
      </Col>
      <Col md={3} className="mb-3">
        <Form.Label className="font-w-medium">Amount</Form.Label>
        <p className="mb-0">{generalData?.Amount ? HelperService.getCurrencyFormatter(generalData?.Amount) : "0.00"}</p>
      </Col>
      <Col md={3} className="mb-3">
        <Form.Label className="font-w-medium">Contract Type</Form.Label>
        <p className="mb-0">{generalData?.ContractType ? generalData?.ContractType : "-"}</p>
      </Col>
      <Col md={3} className="mb-3">
        <Form.Label className="font-w-medium">Location</Form.Label>
        <p className="mb-0">{props.genralData?.Break1Name ? props.genralData?.Break1Name : "-"}</p>
      </Col>
      <Col md={3} className="mb-3">
        <Form.Label className="font-w-medium">Class</Form.Label>
        <p className="mb-0">{props.genralData?.Break2Name ? props.genralData?.Break2Name : "-"}</p>
      </Col>
      <Col md={3} className="mb-3">
        <Form.Label className="font-w-medium"># Of Systems</Form.Label>
        <p className="mb-0">{generalData?.NumberOfSystem ? generalData?.NumberOfSystem : "-"}</p>
      </Col>
      <Col md={3} className="mb-3">
        <Form.Label className="font-w-medium">Salesman</Form.Label>
        <p className="mb-0">{generalData?.SalesmanNum ? generalData?.SalesmanNum : "-"} </p>
      </Col>
      <Col md={3} className="mb-3">
        <Form.Label className="font-w-medium">Customer PO #</Form.Label>
        <p className="mb-0">{generalData?.CustomerPONum ? generalData?.CustomerPONum : "-"} </p>
      </Col>
      <Col md={3} className="mb-3">
        <Form.Label className="font-w-medium">Contract Billing</Form.Label>
        <Form.Group className="mb-3" controlId="ContractBilling">
          <Form.Check type="checkbox" label="" checked={generalData?.RegularAccounting} />
        </Form.Group>
      </Col>
      <Col md={3} className="mb-3">
        <Form.Label className="font-w-medium">Reserve Accounting</Form.Label>
        <Form.Group className="mb-3" controlId="ReserveAccounting">
          <Form.Check type="checkbox" label="" checked={generalData?.ReserveAccounting} />
        </Form.Group>
      </Col>
    </Row>
  </>;
};

export default ContractGenralInfo;


