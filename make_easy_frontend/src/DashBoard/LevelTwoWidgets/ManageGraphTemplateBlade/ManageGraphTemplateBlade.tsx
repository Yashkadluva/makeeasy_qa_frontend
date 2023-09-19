import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';
import { Row, Col, Card, Form, Dropdown, Tabs, Tab } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import './ManageGraphTemplateBlade.scss';
import WebService from '../../../../utility/WebService';
import Loader from '../../../../components/Loader/Loader';

interface PropData {
    isShow: boolean;
    isClose: any;
    data?: any;
    index: any;
}

var data = [
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

const ManageGraphTemplateBlade = (props: PropData) => {
    const [templateList, setTemplateList] = useState<any[]>(data)
    const [isLoading, setLoading] = useState(false)
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
    const [allData, setAllData] = useState<any[]>([]);

    useEffect(() => {
        props.isShow && getWizardsSequence()
    }, [props.isShow]);

    const getWizardsSequence = () => {
        setLoading(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/DashboardTabsReact`,
            body: null
        })
            .then((res: any) => {
                var data = JSON.parse(res.value)
                setAllData(data)
                setTemplateList(data[props.index].LevelTwo)
                setLoading(false)
            })
            .catch((e) => {
                setLoading(false)
            })
    }

    const onCloseModal = () => {
        props.isClose(!props.isShow);
    };

    const onSave = () => {
        setLoading(true)
        for (var i in allData) {
            if (i == props.index) {
                allData[i].LevelTwo = templateList
            }
        }
        setAllData([...allData])
        WebService.postAPI({
            action: `SAIUserPreference/`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                UserId: user_info["userID"],
                UserName: user_info["userName"],
                key: 'DashboardTabsReact',
                value: JSON.stringify(allData)
            }
        })
            .then((res) => {
                onCloseModal()
                setLoading(false)
            })
            .catch((e) => {
                setLoading(false)
            })
    }

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

    return (
        <>
            <Loader show={isLoading} />
            <Offcanvas show={props.isShow} onHide={onCloseModal} placement={'end'} className="offcanvas-large" >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Manage Graph Template</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="border-bottom px-0">
                    <div className="p-2">
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
                                                                                require("../../../../assets/images/up-down-arrow.svg").default
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

export default ManageGraphTemplateBlade;