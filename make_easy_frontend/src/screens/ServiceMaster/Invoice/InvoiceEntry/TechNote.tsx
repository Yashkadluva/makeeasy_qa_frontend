import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Grid, {
    GridColumn,
    GridHeader,
    GridRow,
} from "../../../../components/Grid/Grid";
import { RootState } from "../../../../config/Store";
import { InvoiceState } from "../../../../reducer/CommonReducer";
import HelperService from "../../../../utility/HelperService";
import WebService from "../../../../utility/WebService";
import { Row, Col } from "react-bootstrap";
import deleteIcon from "../../../../assets/images/delete-icon.svg";
import editicon from "../../../../assets/images/edit.svg";
import Button from "react-bootstrap/Button";
import NotesBlade from "../../../../components/NotesBlade/NotesBlade";
import AddTechNotesBlade from "./TechNotesBlade/AddTechNotesBlade";
import { toast } from "react-toastify";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import moment from "moment";
import loader from "../../../../assets/images/loader.gif";

const headers: GridHeader[] = [
    {
        title: "Technician #",
    },
    {
        title: "Technician Name",
    },
    {
        title: "Service Date",
        class: "text-center",
    },
    {
        title: "Schedule Time",
        class: "text-center",
    },
    {
        title: "Status",
    },
    {
        title: "Dispatch",
        class: "text-center",
    },
    {
        title: "Arrive",
        class: "text-center",
    },
    {
        title: "Complete",
        class: "text-center",
    },
    {
        title: "R",
    },
    {
        title: "O ",
    },
    {
        title: "D",
    },
   
];

const TechNote = () => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [rows, setRows] = useState<GridRow[]>([]);
    const [ShowLoader, setShowLoader] = useState(false);
    const [resData, setResData] = useState<any>();
    const [isShowAddTechNotesBlade, setIsShowAddTechNotesBlade] = useState(false);
    const [showTechNotes, setShowTechNotes] = useState<any>([])
    const [pageLoader, setPageLoader] = useState(false);
    const [editTechNotes, setEditTechNotes] = useState<any>()
    const [showAlertModel, setAlertModel] = useState(false);
    const [deletedData, setDeletedData] = useState<any>({});
    const [errorMessage, setErrorMessage] = useState('');
    const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
    const [isShoWAddButton, setShoWAddButton] = useState(false);
    const invoiceData: any = useSelector<RootState, InvoiceState>(
        (state) => state.invoice);
    let indexNumber = useRef(0);


    useEffect(() => {
        getTech()
    }, [])


    useEffect(()=>{
        showTechNotes.length > 0 &&  setShoWAddButton(false)
    },[showTechNotes])


    const getTech = () => {
        WebService.getAPI({
            action: `SDTechAssignedOnCall/GetAllOrOneTechByInvoice/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}/null`,
            body: null
        })
            .then((res: any) => {
                setResData(res)
                if (res.length > 0) {
                    let rows: GridRow[] = [];
                    for (var i in res) {
                        let columns: GridColumn[] = [];
                        columns.push({
                            value: res[i].EntityCode,
                        });
                        columns.push({
                            value: res[i].SetupSaiSDTechMaster.TechNameInternal,
                        });
                        columns.push({
                            value: HelperService.getFormatedDate(res[i].ServiceDate),
                        });
                        columns.push({
                            value: HelperService.getFormatedTime(res[i].ScheduleDateTime),
                        });
                        columns.push({
                            value: res[i].Status,
                        });
                        columns.push({
                            value: HelperService.getFormatedTime(res[i].DispatchDateTime),
                        });
                        columns.push({
                            value: HelperService.getFormatedTime(res[i].ArriveDateTime),
                        });
                        columns.push({
                            value: HelperService.getFormatedTime(res[i].CompleteDateTime),
                        });
                        columns.push({
                            value: HelperService.getCurrencyFormatter(res[i].RegularHrs),
                        });
                        columns.push({
                            value: HelperService.getCurrencyFormatter(res[i].OvertimeHrs),
                        });
                        columns.push({
                            value: HelperService.getCurrencyFormatter(res[i].DoubletimeHrs),
                        });
                       
                        rows.push({ data: columns });
                    }
                    setRows(rows)
                }
            })
            .catch((e) => {

            })
    }

    const getTechNotes = (index: any) => {
    setShowLoader(true)
        WebService.getAPI({
            action: `SDTechNotes/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}/${resData[index]?.CallSequence}`,
            body: null,
        })
            .then((res: any) => {
                setEditTechNotes(resData[index])
                setShowTechNotes(res)
                indexNumber.current = index
                if(res.length == 0){
                    setShoWAddButton(true)
                }
                setShowLoader(false)
            })
            .catch((e) => {
            });
    }

    const onEdit = (e: any) => {
        setEditTechNotes(e)
        setIsShowAddTechNotesBlade(true)
    }

    const closeModal = (e: any) => {
        setIsShowAddTechNotesBlade(false);
        setEditTechNotes({});
        getTechNotes(indexNumber.current)
    };

    const onDelete = (data: any) => {
        setShowDeleteModal(true)
        let obj = {
            id: data.Id,
            value: data.ServiceDate,
            callSequence: data.CallSequence,
            data: data.SDCallMasterId
        }
        setDeletedData(obj)
    }

    const onDeleteTechNotes = () => {
        setShowDeleteModal(false)
        setPageLoader(true);
        var date = deletedData.value && moment(deletedData.value).format('YYYY-MM-DD')
        WebService.deleteAPI({
            action: `SDTechNotes/Delete/${user_info['AccountId']}/${user_info['CompanyId']}/${deletedData.id}/${deletedData.callSequence}/${date}T0-0-0/${deletedData.data}`,
            body: null,
            isShowError: false
        })
            .then((res) => {
                setPageLoader(false);
                getTechNotes(indexNumber.current)
                toast.success('Tech Notes deleted successfully.')
            })
            .catch((e) => {
                setPageLoader(false);
                if (e.response.data.ErrorDetails.message) {
                    setAlertModel(!showAlertModel)
                    setErrorMessage(e?.response?.data?.ErrorDetails?.message)
                }
            })
    }


    
    return (
        <>
            <DraggableModal
                isOpen={isShoWDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Alert"
                type="DELETE_MODAL"
                width={600}
                delete={onDeleteTechNotes}
                data={deletedData}
            />

            <DraggableModal
                isOpen={showAlertModel}
                onClose={() => setAlertModel(false)}
                title="Alert"
                type="ALERT_MODEL"
                width={600}
                previousData={errorMessage}
            />

            <AddTechNotesBlade
                isShow={isShowAddTechNotesBlade}
                isClose={closeModal}
                data={editTechNotes}
                isEdit={showTechNotes.length !== 0 ? true : false}
            />

            <div className="border-bottom border-light pt-3">
                <Grid
                    headers={headers}
                    rows={rows}
                    onClickRow={true}
                    hoverRow={true}
                    isSelectedRow={getTechNotes}
                    //  ShowLoader={ShowLoader}
                    errorMessage={"No items to display"}
                />
            </div>

            <div className=" py-3">
                <div className="d-flex mb-2 justify-content-between align-item-center">
                    <p className="font-w-medium mb-0">Tech Notes</p>
                    {isShoWAddButton == false  ? <></> :
                    <div className="text-end ">
                        <Button
                            variant="primary"
                            className="btn-brand-light"
                            type="submit"
                            onClick={() =>
                                setIsShowAddTechNotesBlade(
                                    !isShowAddTechNotesBlade
                                )
                            }
                        > + Add Tech-Notes</Button>
                    </div>
                }

                </div>

                
                {
                 ShowLoader == true ?
                 <div style={{ textAlign: "center" }}>
                   <img
                     style={{ position: "relative" }}
                     src={loader}
                     alt="No loader found"
                   />
                   <div style={{ position: "relative", color: "white" }}>
                     Loading...
                   </div>
                 </div>
                 :

                 <>

                {
                    showTechNotes.map((showTechNote: any, index: number) => {
                    return <div key={'number_' + index} className="border-bottom border-light pt-3">
                        <Row className="align-items-end mb-3">
                            <Col lg={6} className="d-flex text-dark">
                            <div className="tech-name-avtar">
                          {
                            showTechNote?.SetupSaiSDTechMaster?.TechProfilePictureUrl ?
                              <img
                                src={showTechNote?.SetupSaiSDTechMaster?.TechProfilePictureUrl}
                                alt="Photo"
                                width={45}
                                height={45}
                                className="user-photo"
                              />
                              :
                              HelperService.getCompanyIcon(showTechNote.SetupSaiSDTechMaster?.TechNameInternal)
                          }
                        </div>
                                <div className="pe-3 mx-1">
                                    <p className='mb-1 text-brand font-14 font-w-medium'>{showTechNote ? showTechNote.UpdatedBy : ""} <span className='mb-0 text-secondary font-12 ms-2'>{showTechNote.CreatedOn && HelperService.getFormatedDateAndTime(showTechNote.CreatedOn)}</span></p>
                                    <p className='mb-0 text-dark font-14' dangerouslySetInnerHTML={{ __html: showTechNote && showTechNote.TechNotes ? showTechNote.TechNotes : "" }}></p>
                                </div>

                            </Col>
                            <Col lg={6} className="text-end">
                                {/* <a onClick={() => onEdit(showTechNote)} href="javascript:void(0)" className="me-2"> <img src={editicon} width={16} alt="edit" className="theme-icon-color" /> </a> */}
                                <Button variant="light" className="btn-brand-light btn-small me-2" onClick={() => onEdit(showTechNote)}>Edit</Button>
                                <a onClick={() => onDelete(showTechNote)} href="javascript:void(0)"> <img src={deleteIcon} width={16} alt="Delete" className="theme-icon-color" /> </a>
                            </Col>
                        </Row>
                    </div>
                })
            }
</>
                }
            </div>
        </>
    )
}

export default TechNote;