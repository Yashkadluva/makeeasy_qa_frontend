import Offcanvas from 'react-bootstrap/Offcanvas';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import WebService from '../../../utility/WebService';
import { toast } from 'react-toastify';
import Loader from '../../../components/Loader/Loader';
import HelperService from '../../../utility/HelperService';
import moment from 'moment';

interface PropData {
    isShow: boolean;
    isClose: any;
    data?: any;
}

var data = [
    {
        Title: 'Call - Purchase Order',
        IsSelected: false,
        WidgetCode: 'CallPurchaseOrder',
    },
    {
        Title: 'Customer Invoices',
        IsSelected: false,
        WidgetCode: 'CustomerInvoices'
    },
    {
        Title: 'Pending Quotes & Recomd.',
        IsSelected: false,
        WidgetCode: 'PendingQuotes'
    },
    {
        Title: 'Inactive Customer',
        IsSelected: false,
        WidgetCode: 'InactiveCustomer'
    },
    {
        Title: 'Cancelled Calls',
        IsSelected: false,
        WidgetCode: 'CancelledCalls'
    },
    {
        Title: 'Part Reorder Status',
        IsSelected: false,
        WidgetCode: 'PartReorderStatus'
    },
    {
        Title: 'Old Equipment',
        IsSelected: false,
        WidgetCode: 'OldEquipment'
    },
    {
        Title: 'New Service Master',
        IsSelected: false,
        WidgetCode: 'NewServiceMaster'
    },
    {
        Title: 'Return Calls',
        IsSelected: false,
        WidgetCode: 'ReturnCalls'
    },
]

const graphData = [
    {
        Title: 'Top 5 Customers',
        IsSelected: false,
        WidgetCode: 'TopFiveustomer'
    },
    {
        Title: 'Calls By Service Type',
        IsSelected: false,
        WidgetCode: 'CallsByServiceType'
    },
    {
        Title: 'Customer With Contract',
        IsSelected: false,
        WidgetCode: 'CustomerWithContract'
    },
    {
        Title: 'Pending Maintenance Schedule',
        IsSelected: false,
        WidgetCode: 'PendingMaintenanceSchedule'
    },
    {
        Title: 'Time Spent Analysis',
        IsSelected: false,
        WidgetCode: 'TimeSpentAnalysis'
    },
    {
        Title: 'Top 5 AR Balance',
        IsSelected: false,
        WidgetCode: 'TopFiveARBalance'
    },
    {
        Title: 'Portal Setup Vs Logged',
        IsSelected: false,
        WidgetCode: 'PortalSetupLogged'
    },
    {
        Title: 'Recommendation By Status',
        IsSelected: false,
        WidgetCode: 'RecommendationByStatus'
    },
    {
        Title: 'Estimate By Status',
        IsSelected: false,
        WidgetCode: 'EstimateByStatus'
    },
    {
        Title: 'Top Scorecard',
        IsSelected: false,
        WidgetCode: 'TopScorecard'
    },
    {
        Title: 'Revenue By Service Type',
        IsSelected: false,
        WidgetCode: 'RevenueByServiceType'
    },
    {
        Title: 'Call Count By User',
        IsSelected: false,
        WidgetCode: 'CallCountByUser'
    },
    {
        Title: 'Incomplete Calls',
        IsSelected: false,
        WidgetCode: 'IncompleteCalls'
    },
    {
        Title: 'Dispatch Volume',
        IsSelected: false,
        WidgetCode: 'DispatchVolume'
    },
]

const AddNewTabBlade = (props: PropData) => {
    const [templateList, setTemplateList] = useState<any[]>([])
    const [graphTemplateList, setGraphTemplateList] = useState<any[]>([])
    const [isLoading, setLoading] = useState(false)
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
    const [tabs, setTabs] = useState<any[]>([])
    const [tabName, setTabName] = useState('')

    useEffect(() => {
        getTemplateDetail()
    }, []);

    useEffect(() => {
        if (props.isShow) {
            setGraphTemplateList(graphData);
            setTemplateList(data)
        }
    }, [props.isShow])

    const getTemplateDetail = () => {
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/DashboardTabsReact`,
            body: null
        })
            .then((res: any) => {
                var data = JSON.parse(res.value)
                setTabs(data)
            })
            .catch((e) => {

            })
    }

    const onCloseModal = () => {
        props.isClose(!props.isShow);
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(templateList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setTemplateList(items);
    }

    const click = (index: any) => {
        for (var i in templateList) {
            if (i == index) {
                templateList[i].IsSelected = !templateList[i].IsSelected;
            }
        }
        setTemplateList([...templateList])
    }

    const onDragEndCardTemplate = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(graphTemplateList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setGraphTemplateList(items);
    }

    const clickGraphTemplate = (index: any) => {
        for (var i in graphTemplateList) {
            if (i == index) {
                graphTemplateList[i].IsSelected = !graphTemplateList[i].IsSelected;
            }
        }
        setGraphTemplateList([...graphTemplateList])
    }

    const onSave = () => {
        if (tabName == '') {
            toast.error('Please enter tab name')
        } else {
            var array: any = tabs ? tabs : [];
            array.push({ Name: tabName, LevelOne: templateList, LevelTwo: graphTemplateList })
            setLoading(true)
            WebService.postAPI({
                action: `SAIUserPreference/`,
                body: {
                    AccountId: user_info["AccountId"],
                    CompanyId: user_info["CompanyId"],
                    UserId: user_info["userID"],
                    UserName: user_info["userName"],
                    key: 'DashboardTabsReact',
                    value: JSON.stringify(array)
                }
            })
                .then((res) => {
                    onCloseModal()
                    setTabName('')
                    setTemplateList([])
                    setGraphTemplateList([])
                    setLoading(false)
                    onSaveFilters()
                })
                .catch((e) => {
                    setLoading(false)
                })
        }
    }

    const onSaveFilters = () => {
        const currentDate = new Date();
        var startDate = currentDate.setDate(currentDate.getDate() - 7);
        var array = [
            'CallPurchaseOrderFilter',
            'CancelledCallsFilter',
            'ReturnCallsFilter',
            'EquipmentFilter',
            'CustomerInvoicesFilter',
            'QuotesAndRecommendationFilter',
            'InactiveCustomersFilter',
        ]
        for (var i in array) {
            WebService.postAPI({
                action: `SAIUserPreference/`,
                body: {
                    UserId: user_info["userID"],
                    AccountId: user_info["AccountId"],
                    CompanyId: user_info["CompanyId"],
                    UserName: user_info["userName"],
                    key: array[i],
                    value: JSON.stringify({
                        EndDate: HelperService.getFormatedDatebyYYYY(new Date()),
                        StartDate:array[i]  == "EquipmentFilter" ?  HelperService.getFormatedDatebyYYYY(moment(new Date()).subtract(7,"y"))  : HelperService.getFormatedDatebyYYYY(startDate),
                        Duration: array[i]  == "EquipmentFilter" ?  '7 Years' : '7 Days'
                    })
                }
            })
                .then((res) => {

                })
                .catch((e) => {

                })
        }
    }

    return (
        <>
            <Loader show={isLoading} />
            <Offcanvas show={props.isShow} onHide={onCloseModal} placement={'end'} className="offcanvas-large" >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Add New Tab</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="border-bottom px-0 form-style">
                    <div className="modal-body px-3 modal-inner-min-h py-3">
                        <div className='d-flex'>
                            <div>
                                <Form.Label className="mt-2">Tab Name <span className="text-danger">*</span></Form.Label>
                            </div>
                            <div style={{ width: 275, marginLeft: 10, marginRight: 10 }}>
                                <input
                                    className="form-control input"
                                    type="text"
                                    value={tabName}
                                    onChange={(e) => setTabName(e.target.value)}
                                    placeholder="Tab Name"

                                />
                            </div>
                        </div>
                        <h5 className="font-18 mt-3">Card Templates</h5>
                        <Col md={12}>
                            {templateList?.length > 0 &&
                                <Card className="p-2 bg-transparent border-light popupInfoscroll manage-card-template">
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId="cards">
                                            {(provided) => (
                                                <ul {...provided.droppableProps} ref={provided.innerRef}>
                                                    {templateList?.map(({ WidgetCode, Title, IsSelected }: any, index: any) => {
                                                        return (
                                                            <Draggable key={WidgetCode} draggableId={WidgetCode} index={index}>
                                                                {(provided) => (
                                                                    <div className="call-group" ref={provided.innerRef}  {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                        <Form.Group className=" " controlId="AllServiceCalls">
                                                                            <Form.Check type="checkbox" label={Title} checked={IsSelected} onChange={() => click(index)} id={`index_${index}`} />
                                                                        </Form.Group>
                                                                        <a href="javascript:void(0)" className="move-btn"> <img
                                                                            src={
                                                                                require("../../../assets/images/up-down-arrow.svg").default
                                                                            }
                                                                            className="theme-icon-color"
                                                                            height={18}
                                                                            width={18}
                                                                        /></a>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    })}
                                                </ul>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </Card>
                            }
                        </Col>
                        <h5 className="font-18 mt-3">Graph Templates</h5>
                        <Col md={12}>
                            {graphTemplateList?.length > 0 &&
                                <Card className="p-2 bg-transparent border-light popupInfoscroll manage-card-template">
                                    <DragDropContext onDragEnd={onDragEndCardTemplate}>
                                        <Droppable droppableId="cards">
                                            {(provided) => (
                                                <ul {...provided.droppableProps} ref={provided.innerRef}>
                                                    {graphTemplateList?.map(({ WidgetCode, Title, IsSelected }: any, index: any) => {
                                                        return (
                                                            <Draggable key={WidgetCode} draggableId={WidgetCode} index={index}>
                                                                {(provided) => (
                                                                    <div className="call-group" ref={provided.innerRef}  {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                        <Form.Group className=" " controlId="AllServiceCalls">
                                                                            <Form.Check type="checkbox" label={Title} checked={IsSelected} onChange={() => clickGraphTemplate(index)} id={`index_${index}`} />
                                                                        </Form.Group>
                                                                        <a href="javascript:void(0)" className="move-btn"> <img
                                                                            src={
                                                                                require("../../../assets/images/up-down-arrow.svg").default
                                                                            }
                                                                            className="theme-icon-color"
                                                                            height={18}
                                                                            width={18}
                                                                        /></a>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    })}
                                                </ul>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </Card>
                            }
                        </Col>
                    </div>
                    <div className="offcanvas-footer mt-4 position-absolute">
                        <Button variant="primary" className="btn-brand-solid me-3" type="submit" onClick={() => onSave()}>Save</Button>
                        <Button variant="primary" className="btn-brand-outline" type="button" onClick={onCloseModal}>Cancel</Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default AddNewTabBlade;