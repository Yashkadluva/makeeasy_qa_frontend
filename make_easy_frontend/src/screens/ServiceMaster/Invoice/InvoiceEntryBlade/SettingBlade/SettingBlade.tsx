import { useEffect, useState } from 'react';
import { Card, Offcanvas, Row, Col, Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import iconUpDown from "../../../../../assets/images/up-down-arrow.svg";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import './SettingBlade.scss';
import { getPreference, updatePreference } from '../../../../../utility/CommonApiCall';
import Loader from '../../../../../components/Loader/Loader';
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import { setDataInRedux, SET_INVOICE_OVERVIEW } from '../../../../../action/CommonAction';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../config/Store';
import { InvoiceOverviewState } from '../../../../../reducer/CommonReducer';


import iconGenralInfo from "../../../../../assets/images/icon-genral-info.svg";
import iconBilling from "../../../../../assets/images/icon-billing-detail.svg";
import iconEquip from "../../../../../assets/images/equipment-icon.svg";
import iconNotes from "../../../../../assets/images/documents-icon.svg";
import iconCallPic from "../../../../../assets/images/icon-call-pic.svg";
import iconTaskList from "../../../../../assets/images/icon-task-list.svg";
import iconProfitLos from "../../../../../assets/images/icon-profit-lost.svg";
import iconPreview from "../../../../../assets/images/icon-prview.svg";
import iconCallRecpt from "../../../../../assets/images/service-call-icon.svg";
import iconRecom from "../../../../../assets/images/icon-recomendation.svg";
import iconServey from "../../../../../assets/images/icon-servey.svg";
import iconActivity from "../../../../../assets/images/icon-activity-log.svg";

interface PropData {
    isShow: boolean;
    isClose: any;
}

var data = [
    {
        id: 'GENERAL_INFO',
        name: 'General Info',
        isCheck: true,
        path: '/general-info',
        image: iconGenralInfo,
        count: '0'
    },
    {
        id: 'BILLING_DETAILS',
        name: 'Billing Details',
        isCheck: true,
        path: '/billing-detail',
        image: iconBilling,
        count: '0'
    },
    {
        id: 'EQUIPMENT',
        name: 'Equipment',
        isCheck: true,
        path: '/invoice-entry-equipment',
        image: iconEquip,
        count: '0'
    },
    {
        id: 'DESCRIPTION_AND_NOTES',
        name: 'Description & Notes',
        isCheck: true,
        path: '/description-note',
        image: iconNotes,
        count: '0'
    },
    {
        id: 'CALL_PICTURES',
        name: 'Call Pictures',
        isCheck: true,
        path: '/call-pictures',
        image: iconCallPic,
        count: '0'
    },
    {
        id: 'TASK_LIST',
        name: 'Task List',
        isCheck: true,
        path: '/task-list',
        image: iconTaskList,
        count: '0'
    },
    {
        id: 'PROFIT_LOSS',
        name: 'Profit/Loss',
        isCheck: true,
        path: '',
        image: iconProfitLos,
        count: '0'
    },
    {
        id: 'PREVIEW',
        name: 'Preview',
        isCheck: true,
        path: '/invoice-preview',
        image: iconPreview,
        count: '0'
    },
    {
        id: 'CALL_RECEIPT',
        name: 'Call Receipt',
        isCheck: true,
        path: '/call-receipt',
        image: iconCallRecpt,
        count: '0'
    },
    {
        id: 'RECOMMENDATIONS',
        name: 'Recommendations',
        isCheck: true,
        path: '/invoice-recommendations',
        image: iconRecom,
        count: '0'
    },
    {
        id: 'SURVEY',
        name: 'Survey',
        isCheck: true,
        path: '',
        image: iconServey,
        count: '0'
    },
    {
        id: 'ACTIVITY_LOG',
        name: 'Activity Log',
        isCheck: true,
        path: '/activity-log',
        image: iconActivity,
        count: '0'
    },
]

const SettingBlade = (props: PropData) => {
    const [isLoading, setLoading] = useState(false)
    const [manageCardItem, setManageCardItem] = useState(data);
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
    const dispatch: Dispatch<any> = useDispatch();
    const invoiceOverview: any = useSelector<RootState, InvoiceOverviewState>(
        (state) => state.invoiceOverview);

    useEffect(() => {
        getOrder()
    }, [props.isShow, invoiceOverview])

    const getOrder = () => {
        setLoading(true)
        getPreference({ user_info, key: 'INVOICE_OVERVIEW' })
            .then((res: any) => {
                if (res.value) {
                    var data = JSON.parse(res.value)
                    if (data && data.length > 0) {
                        setManageCardItem(data)
                    }
                }
                setLoading(false)
            })
            .catch((e) => {
                setLoading(false)
            })
    }

    const onCloseModal = () => {
        props.isClose(!props.isShow);
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(manageCardItem);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setManageCardItem(items);
    }

    const click = (index: any) => {
        for (var i in manageCardItem) {
            if (i == index) {
                manageCardItem[i].isCheck = !manageCardItem[i].isCheck;
            }
        }
    }

    const onSubmit = () => {
        var data = manageCardItem
        updatePreference({ data, user_info, key: 'INVOICE_OVERVIEW' })
            .then((res: any) => {
                dispatch(setDataInRedux({ type: SET_INVOICE_OVERVIEW, value: new Date() }));
                onCloseModal()
            })
            .catch((e: any) => { });
    }

    return (
        <>
            <Loader show={isLoading} />
            <Offcanvas show={props.isShow} onHide={onCloseModal} placement={'end'} className="offcanvas-large setting-blade">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Manage Cards</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="px-0 pb-0">
                    <Form className="form-style">
                        <div className="modal-body px-3 modal-inner-min-h">
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="cards">
                                    {(provided) => (
                                        <ul className="cards" {...provided.droppableProps} ref={provided.innerRef}>
                                            {manageCardItem.map(({ id, name, isCheck }, index) => {
                                                return (
                                                    <Draggable key={id} draggableId={id} index={index}>
                                                        {(provided) => (
                                                            <Card className="bg-transparent py-2 px-3 moving-card mb-2 me-4" ref={provided.innerRef}  {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                <Row>
                                                                    <Col md="10">
                                                                        <Form.Group className="font-w-medium" controlId="GeneralInfo">
                                                                            <Form.Check
                                                                                type="checkbox"
                                                                                key={index}
                                                                                label={name}
                                                                                id={`index_${index}`}
                                                                                defaultChecked={isCheck}
                                                                                onClick={() => click(index)}
                                                                            />
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col md="2" className="text-end moving-area">
                                                                        <a href="javascript:void(0)"> <img src={iconUpDown} alt="move" width={12} /> </a>
                                                                    </Col>
                                                                </Row>
                                                            </Card>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </ul>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                        <div className="offcanvas-footer">
                            <Button variant="primary" className="btn-brand-solid me-3" onClick={() => onSubmit()}>Submit</Button>
                            <Button variant="primary" className="btn-brand-outline" type="button" onClick={onCloseModal}>Cancel</Button>
                        </div>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default SettingBlade;