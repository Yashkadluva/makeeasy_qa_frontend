import { useState, useEffect } from "react";
import { Row, Col, Offcanvas, Form, Button, Tabs, Tab } from 'react-bootstrap';
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import { useNavigate } from "react-router-dom";
import WebService from "../../../../utility/WebService";
import { toast } from 'react-toastify';
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import { Label } from "../../../../components/Label/Label";
import HelperService from "../../../../utility/HelperService";
import Loader from "../../../../components/Loader/Loader";
import CreateSchedule from "../ContractDetails/CreateSchedule";
import MaintenanceScheduleListing from "../ContractDetails/MaintenanceScheduleListing";

interface PropData {
    isShow: boolean;
    isClose: any;
    data?: any;
    partDetaiil?: any;
}

const CreateMaintenanceSchedule = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
    const [showAlertModel, setAlertModel] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [scheduleListing, setScheduleListing] = useState<any[]>(props.data?.MaintainanceScheduleGridData);
    const [currentTab, setCurrentTab] = useState("TabCreate");
    const [onSubmit, setOnSubmit] = useState<any>("");

    useEffect(() => {
        setScheduleListing(props.data?.MaintainanceScheduleGridData)
    }, [props.data?.MaintainanceScheduleGridData])


    const CloseModal = (e: any) => {
        setOnSubmit("")
        setCurrentTab("TabCreate")
        props.isClose(!props.isShow, e);
    };

    const getCurrentKey = (value: any) => {
        setCurrentTab(value);
    };

    const updateList = (data: any) => {
        // setScheduleListing(data)
    }

    const onClickSubmit = () => {
        if (currentTab == "Tablisting") {
            setOnSubmit(new Date().getTime())
        }
    }





    return (
        <>

            <DraggableModal
                isOpen={showAlertModel}
                onClose={() => setAlertModel(false)}
                title="Alert"
                type="ALERT_MODEL"
                width={600}
                previousData={errorMessage}
            />

            <Loader show={isLoading} />


            <Offcanvas show={props.isShow} onHide={() => CloseModal({})} placement={'end'} className="offcanvas-dex-large" >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Create Maintenance Schedule</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <div className="modal-inner-min-h">
                        <div className="tab-style-2 px-3 pt-3">
                            <Tabs activeKey={currentTab} onSelect={getCurrentKey}>
                                <Tab
                                    eventKey="TabCreate"
                                    title={
                                        <div className="d-flex flex-column justify-content-center align-items-center">
                                            <img
                                                src={
                                                    require("../../../../assets/images/icon-maintenance-schedule.svg").default
                                                }
                                                className="theme-icon-color"
                                                height={21}
                                                width={21}
                                            />
                                            <label className="nav-text">Create</label>
                                        </div>
                                    }

                                >
                                    <CreateSchedule data={props.data} activeTab={currentTab} changeTab={getCurrentKey} updateListing={(e: any) => updateList(e)} partDetaiil={props.partDetaiil} />
                                </Tab>
                                <Tab
                                    eventKey="Tablisting"
                                    title={
                                        <div className="d-flex flex-column justify-content-center align-items-center">
                                            <img
                                                src={
                                                    require("../../../../assets/images/schedule-listing.svg").default
                                                }
                                                className="theme-icon-color"
                                                height={21}
                                                width={21}
                                            />
                                            <label className="nav-text">Schedule Listing</label>
                                        </div>
                                    }
                                >
                                    <MaintenanceScheduleListing data={props.data} activeTab={currentTab} changeTab={getCurrentKey} listData={scheduleListing} onSubmit={onSubmit} colseBlade={() => CloseModal("Add")} partDetaiil={props.partDetaiil} />
                                </Tab>
                            </Tabs>
                        </div>
                    </div>
                    <div className="offcanvas-footer mt-4">
                        <Button
                            variant="primary"
                            className="btn-brand-outline"
                            type="button"
                            onClick={() => CloseModal("no")}
                        >
                            Cancel
                        </Button>

                        {
                            currentTab == "TabCreate" ?
                                <Button
                                    variant="primary"
                                    className="btn-brand-solid ms-3"
                                    type="button"
                                    onClick={() => document.getElementById("saveSchedule")?.click()}
                                >
                                    Save
                                </Button>
                                :
                                <Button
                                    variant="primary"
                                    className="btn-brand-solid ms-3"
                                    type="button"
                                    onClick={() => onClickSubmit()}
                                >
                                    Submit
                                </Button>
                        }
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>);
};

export default CreateMaintenanceSchedule;


