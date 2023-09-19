interface PropData {
    data?: any;
    isShow: boolean;
    selectedOption?: any;
}


const DashBoardMenu = (props: PropData) => {
    return (
        <>
            <div>
                {props.isShow == true && (
                    <ul className="service-option">
                        <li
                            className="option"
                        >
                            Call Detail
                        </li>
                        <li
                            className="option"
                        >
                            Rechedule Call
                        </li>
                        <li
                            className="option"
                        >
                            Cancel Call
                        </li>
                        <li
                            className="option"
                        >
                            Create PO
                        </li>
                        <li
                            className="option"
                        >
                            View Invoice
                        </li>
                        <li
                            className="option"
                        >
                            Change Outcome Code
                        </li>

                        <li
                            className="option"
                        >
                            Call Info
                        </li>
                        <li
                            className="option"
                        >
                            Service Master
                        </li>
                        <li
                            className="option"
                        >
                            Send Text Message
                        </li>
                        <li
                            className="option"
                        >
                            Assign To Sub Contractor
                        </li>
                        <li
                            className="option"
                        >
                            View Service Receipt
                        </li>

                        <li className="option">
                            Start/View Chat
                        </li>
                        <li
                            className="option"
                        >
                            Print WO
                        </li>
                        <li
                            className="option"
                        >
                            Create Return
                        </li>
                    </ul>
                )}
            </div>
        </>
    )
}

export default DashBoardMenu;