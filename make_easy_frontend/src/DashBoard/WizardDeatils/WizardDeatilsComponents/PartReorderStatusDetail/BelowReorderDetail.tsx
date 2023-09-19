import './PartReorderStatus.scss';
import { useEffect, useState } from 'react';
import HelperService from '../../../../../utility/HelperService';
import Grid, { GridColumn, GridHeader, GridRow } from '../../../../../components/Grid/Grid';
import DescriptionModal from '../../../../../components/DescriptionModal/DescriptionModal';

interface PropData {
    data: any;
    showLoader: any;
};

const headers: GridHeader[] = [
    {
        title: "PartNum",
    },
    {
        title: "PurchaseDescription",
    },
    {
        title: "QtyOnHand",
        class: "text-end"
    },
    {
        title: "MaxQty",
        class: "text-end"
    },

];

const BelowReorderDetail = (props: PropData) => {
    const [rows, setRows] = useState<GridRow[]>([]);
    const [isShowDescription, setIsShowDescription] = useState(false);
    const [descriptionData, setDescriptionData] = useState("");

    useEffect(() => {
        if (props.data && props.data.length > 0) {
            let rows: GridRow[] = [];
            for (var i in props.data) {
                let columns: GridColumn[] = [];
                columns.push({ value: props.data[i].PartNum });
                columns.push({ value: props.data[i].PurchaseDescription && showDescription(props.data[i].PurchaseDescription) });
                columns.push({ value: props.data[i].QtyOnHand && HelperService.getCurrencyFormatter(props.data[i].QtyOnHand) });
                columns.push({ value: props.data[i].MaxQty !== 0 ? HelperService.getCurrencyFormatter(props.data[i].MaxQty) : props.data[i].MaxQty == 0 && "0.00" });
                rows.push({ data: columns });
            }

            setRows(rows);
        } else {
            setRows([])
        }
    }, [props.data]);

    const showDescription = (e: any) => {
        if (e) {
            return (
                <a className="grid-hypper-link"
                    onClick={() => viewFullDescription(e)}>
                    {HelperService.removeHtml(e)}
                </a>
            );
        }
    };

    const viewFullDescription = (data: any) => {
        setDescriptionData(data);
        setIsShowDescription(true);
    };

    return (
        <>
            <DescriptionModal
                isShow={isShowDescription}
                title="Description"
                isClose={() => setIsShowDescription(false)}
                data={descriptionData}
            />
            <>
                <div className="mt-2 detail-grid-div">
                    <Grid
                        headers={headers}
                        rows={rows}
                        ShowLoader={props.showLoader}
                        errorMessage={"No Part Found"}
                    />
                </div>
            </>
        </>
    )
}

export default BelowReorderDetail;


