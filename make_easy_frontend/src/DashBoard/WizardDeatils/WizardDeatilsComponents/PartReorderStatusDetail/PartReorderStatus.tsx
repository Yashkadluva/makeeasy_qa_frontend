import './PartReorderStatus.scss';
import { useEffect, useState } from 'react';
import WebService from '../../../../../utility/WebService';
import { Tab, Tabs } from 'react-bootstrap';
import BelowReorderDetail from './BelowReorderDetail';
import AboveReorderDetail from './AboveReorderDetail';

interface PropData {
    data: any;
};

const PartReorderStatus = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [partData, sePartData] = useState<any>({});

    useEffect(() => {
        if (props.data) {
            getCancelledCallsDetail();
        }
    }, [props.data]);


    const getCancelledCallsDetail = () => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SaiPIPartMaster/GetPartReOrderDetails/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
        })
            .then((res: any) => {
                console.log(res.Data?.BelowReorderQtyPartList)
                setShowLoader(false);
                sePartData(res.Data)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    };




    return (
        <>
            <>
                <div className="tab-style contract-details mb-0 p-2">
                    <Tabs defaultActiveKey="Quotes" className=" mt-1">

                        <Tab
                            eventKey="Quotes"
                            title={
                                <div className="d-flex flex-column justify-content-center align-items-center">
                                    <label className="nav-text">Below ReOrder Qty</label>
                                </div>
                            }

                        >
                              <AboveReorderDetail data={partData && partData?.AboveMaxQtyPartList && partData?.AboveMaxQtyPartList} showLoader={showLoader}/>
                        </Tab>
                        <Tab eventKey="Recommendation"
                            title={
                                <div className="d-flex flex-column justify-content-center align-items-center">
                                    <label className="nav-text">Above Max Qty</label>
                                </div>
                            }

                        >
                            <BelowReorderDetail data={partData && partData?.BelowReorderQtyPartList && partData?.BelowReorderQtyPartList} showLoader={showLoader}/>
                          
                        </Tab>

                    </Tabs>
                </div>

            </>



        </>
    )
}

export default PartReorderStatus;


