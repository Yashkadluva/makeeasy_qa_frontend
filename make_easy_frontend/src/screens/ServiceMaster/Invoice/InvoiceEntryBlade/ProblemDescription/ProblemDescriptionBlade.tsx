import { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../../config/Store";
import { InviceSDMasterState } from "../../../../../reducer/CommonReducer";
import WebService from "../../../../../utility/WebService";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Dispatch } from "redux";
import Loader from "../../../../../components/Loader/Loader";
import { Label } from "../../../../../components/Label/Label";
import { toast } from "react-toastify";
import { setDataInRedux, SET_INVOICE_SD_MASTER } from "../../../../../action/CommonAction";


interface PropData {
    isShow: boolean;
    isClose: any;
    data: any;
}

const ProblemDescriptionBlade = (props: PropData) => {
    const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
        (state) => state.invoceSDMaster);
    const dispatch: Dispatch<any> = useDispatch();
    const [isLoading, setLoading] = useState(false);
    const [previousData, setPreviousData] = useState<any>()
    let requestedData: any = useRef()
    let InvoiceReduxData: any = useRef()
    const [bladeTitle, setBladeTitle] = useState("Edit Problem Description")

    useEffect(() => {
        if (props?.data?.CompanyId && props.isShow == true) {
            setPreviousData(props?.data?.Description)
            requestedData.current = props?.data
            InvoiceReduxData.current = invoceSDMaster.invoceSDMaster;
        }
    }, [props.data, props.isShow])

    const onCloseModal = () => {
        setPreviousData("")
        props.isClose(!props.isShow,previousData);
    };

    const onSave = () => {
        if (previousData == "") {
            toast.error("Please Enter Problem Description")
        } else {
            requestedData.current.Description = previousData;
            setLoading(true);
            WebService.putAPI({
                action: `SDCallMaster/MobileUpdateDescription`,
                body: requestedData.current
            })
                .then((res: any) => {
                    setLoading(false);
                    toast.success("Problem Description Updated Succesfully");
                    InvoiceReduxData.current.ProblemDescription = previousData;
                    dispatch(setDataInRedux({ type: SET_INVOICE_SD_MASTER, value: InvoiceReduxData.current }));
                    onCloseModal();
                })
                .catch((e) => {
                    setLoading(false);
                });
        }
    };



    return (
        <>
            <Loader show={isLoading} />
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
                                    className="form-control form-control-textarea h-auto mt-4"
                                    placeholder="Problem Description"
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

export default ProblemDescriptionBlade;
