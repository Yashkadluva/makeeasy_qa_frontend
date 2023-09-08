

import { useState, useEffect } from "react";
import { Row, Col, Offcanvas, Tabs, Tab, Form, Button } from 'react-bootstrap';
import { Envelope } from 'react-bootstrap-icons';
import { useForm, Controller } from "react-hook-form";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import { useNavigate } from "react-router-dom";
import WebService from "../../../../utility/WebService";
import { toast } from 'react-toastify';
import HelperService from "../../../../utility/HelperService";
import { Dispatch } from "redux";
import { setDataInRedux, SET_IS_REFRESH } from "../../../../action/CommonAction";
import { useSelector, useDispatch } from "react-redux";
import AddContractDescription from "./AddContractDescription";

interface PropData {
    genralData: any;
}

const ContractDescription = (props: PropData) => {
    const [generalData, setGeneralData] = useState<any>({});
    const [isShowDescription, setIsShowDescription] = useState(false);
    const dispatch: Dispatch<any> = useDispatch();

    useEffect(() => {
        setGeneralData(props.genralData?.Contract)
    }, [props.genralData])

    const onCloseAddDescription = (value: any, type: any) => {
        setIsShowDescription(false)
        type == "Add" && dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
    }



    return <>
        <AddContractDescription
            isShow={isShowDescription}
            isClose={onCloseAddDescription}
            data={props.genralData}
        />

        <Row className="text-dark mt-3 font-14">
           
            <Col md={3} className="mb-3">
                <Form.Label className="font-w-medium">Contract Description</Form.Label>
            </Col>
            <Col md={9} className="text-end mb-3">
                <Button variant="light" className="btn-brand-light btn-small" onClick={() => setIsShowDescription(true)}>{generalData?.ContractDescription ? "Edit" : "Add"}</Button>
            </Col>
            <Col md={12} className="mb-3">
            <p className="mb-0">{generalData?.ContractDescription ? generalData?.ContractDescription : "-"}</p>
            </Col>
          
        </Row>
    </>;
};

export default ContractDescription;


