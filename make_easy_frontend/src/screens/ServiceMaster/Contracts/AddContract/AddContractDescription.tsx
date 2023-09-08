

import { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import { toast } from "react-toastify";
import WebService from "../../../../utility/WebService";
import Loader from "../../../../components/Loader/Loader";
import StandardDescriptionModal from "../../../../components/StandardDescriptionModal/StandardDescriptionModal";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";


interface PropData {
    isShow: boolean;
    isClose: any;
    data: any;
}

const AddContractDescription = (props: PropData) => {
    const [isLoading, setLoading] = useState(false);
    const [previousData, setPreviousData] = useState<any>()
    const [bladeTitle, setBladeTitle] = useState("Contract Description")
    const [showStatndardDescriptionModel, setShowStatndardDescriptionModel] = useState(false);
    const [showAlertModel, setAlertModel] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [contractDescriptionData, setContractDescriptionData] = useState<any>({});


    useEffect(() => {
        if (props?.data && props.isShow == true) {
            setPreviousData(props?.data?.Contract?.ContractDescription)
        }
    }, [props.data, props.isShow])

    useEffect(() => {
        if (props.isShow == true && props.data) {
            var temp: any = props.data?.Contract;
            if (props.data?.EquipmentGridData.length > 0) {
                temp.AssociatedEquipmentIds = props.data?.EquipmentGridData.map((item: any) => {
                    return item.Id
                })
            }
            setContractDescriptionData(temp)
        }
    }, [props.isShow])

    const onCloseModal = (e?: any) => {
        setPreviousData("")
        props.isClose(!props.isShow, e);
    };

    const onSave = () => {
        if (previousData == "") {
            toast.error("Please Enter Description")
        } else {
            var data = contractDescriptionData;
            data.ContractDescription = previousData
            setLoading(true)
            WebService.putAPI({
                action: `SaiSDContract/UpdateContract`,
                body: data,
            })
                .then((res: any) => {
                    setLoading(false)
                    toast.success("Contract Updated Successfully.")
                    onCloseModal("Add")
                })
                .catch((e) => {
                    setLoading(false)
                    if (e.response.data.ErrorDetails.message) {
                        setAlertModel(!showAlertModel)
                        setErrorMessage(e?.response?.data?.ErrorDetails?.message)
                    }
                });
        }
    };

    const closeModal = (value: any, type: any, data: any) => {
        if (type === "ON_SAVE") {
            if (previousData) {
                setPreviousData(`${previousData} ${data}`);
            } else {
                setPreviousData(data);
            }
        }
        setShowStatndardDescriptionModel(value);
    };







    return (
        <>
            <Loader show={isLoading} />
            <StandardDescriptionModal
                isShow={showStatndardDescriptionModel}
                isClose={closeModal}
                title="Standard Descriptions"
                Contract={true}
            />
            <DraggableModal
                isOpen={showAlertModel}
                onClose={() => setAlertModel(false)}
                title="Alert"
                type="ALERT_MODEL"
                width={600}
                previousData={errorMessage}
            />
            <Offcanvas
                show={props.isShow}
                onHide={onCloseModal}
                placement={"end"}
                className="offcanvas-large"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{bladeTitle}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="border-bottom px-0 information-main-view py-0">

                    <div className="form-style">
                        <Loader show={isLoading} />
                        <div className="notes-edit-view mx-0 modal-body px-3 mt-2">
                            <div className="col-12 form-group">
                                <textarea
                                    className="form-control form-control-textarea h-auto mt-4 text-dark"
                                    placeholder="Contract Description"
                                    rows={30}
                                    value={previousData}
                                    onChange={(e) => setPreviousData(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="offcanvas-footer mt-4 position-absolute">
                            <Button
                                variant="primary"
                                className="btn-brand-solid me-3"
                                type="button"
                                onClick={() =>
                                    setShowStatndardDescriptionModel(true)
                                }
                            >
                                Standard Description
                            </Button>
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
                                onClick={onCloseModal}
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

export default AddContractDescription;
