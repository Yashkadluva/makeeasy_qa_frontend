import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';
import './WizardDeatilsBlade.scss';
import CallPurchaseOrderDetail from '../WizardDeatilsComponents/CallPurchaseOrderDetail/CallPurchaseOrderDetail';
import CancelledCallsDetail from '../WizardDeatilsComponents/CancelledCallsDetail/CancelledCallsDetail';
import CustomerInvoicesDeatil from '../WizardDeatilsComponents/CustomerInvoicesDeatil/CustomerInvoicesDeatil';
import NewServiceMasterDetail from '../WizardDeatilsComponents/NewServiceMasterDetail/NewServiceMasterDetail';
import ReturnCallsDetail from '../WizardDeatilsComponents/ReturnCallsDetail/ReturnCallsDetail';
import OldEquipmentDetail from '../WizardDeatilsComponents/OldEquipmentDetail/OldEquipmentDetail';
import InactiveCustomerDetail from '../WizardDeatilsComponents/InactiveCustomerDetail/InactiveCustomerDetail';
import PendingQuoteDetail from '../WizardDeatilsComponents/PendingQuoteDetail/PendingQuoteDetail';
import PartReorderStatus from '../WizardDeatilsComponents/PartReorderStatusDetail/PartReorderStatus';
import TopFiveCustomerDetail from '../WizardDeatilsComponents/TopFiveCustomerDetail/TopFiveCustomerDetail';
import CustomerWithContractDetail from '../WizardDeatilsComponents/CustomerWithContractDetail/CustomerWithContractDetail';
import PendingMaintanenceScheduleDetail from '../WizardDeatilsComponents/PendingMaintanenceScheduleDetail/PendingMaintanenceScheduleDetail';
import RecommendationByStatusDetail from '../WizardDeatilsComponents/RecommendationByStatusDetail/RecommendationByStatusDetail';
import CallsByServiceType from '../../LevelTwoWidgets/CallsByServiceType/CallsByServiceType';
import CallByServiceTypeDetail from '../WizardDeatilsComponents/CallByServiceType/CallByServiceTypeDetail';

interface PropData {
    isShow: boolean;
    isClose: any;
    data: any;
    title: any;
};

const WizardDeatilsBlade = (props: PropData) => {
    const onCloseModal = (e?: any) => {
        props.isClose(!props.isShow, e, props.data?.key);
    };

    console.log(props.data?.key);


    return (
        <>
            <Offcanvas show={props.isShow} onHide={onCloseModal} placement={'end'} className="offcanvas-dex-large" >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{props.title} Detail</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="border-bottom px-0">
                    {props.title == "Call - Purchase Order" && <CallPurchaseOrderDetail data={props.data} />}
                    {props.title == "Cancelled Calls" && <CancelledCallsDetail data={props.data} />}
                    {props.title == "Customer Invoices" && <CustomerInvoicesDeatil data={props.data} />}
                    {props.title == "New Service Master" && <NewServiceMasterDetail data={props.data} />}
                    {props.title == "Return Calls" && <ReturnCallsDetail data={props.data} />}
                    {props.data && props.data?.key == "EquipmentFilter" && <OldEquipmentDetail data={props.data} />}
                    {props.title == "Inactive Customer" && <InactiveCustomerDetail data={props.data} />}
                    {props.title == "Pending Quotes & Recomd." && <PendingQuoteDetail data={props.data} />}
                    {props.title == "Part Reorder Status" && <PartReorderStatus data={props.data} />}
                    {props.title == "Top 5 Customers" && <TopFiveCustomerDetail data={props.data} />}
                    {props.title == "Customer With Contract" && <CustomerWithContractDetail data={props.data} />}
                    {props.title == "Pending Maintenance Schedule" && <PendingMaintanenceScheduleDetail data={props.data} />}
                    {props.title == "Recommendation By Status" && <RecommendationByStatusDetail data={props.data} />}
                    {props.title == "Calls By Service Type" && <CallByServiceTypeDetail data={props.data} />}
                    <div className="offcanvas-footer mt-4 position-absolute">
                        <Button variant="primary" className="btn-brand-outline" type="button" onClick={onCloseModal}>Close</Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default WizardDeatilsBlade;