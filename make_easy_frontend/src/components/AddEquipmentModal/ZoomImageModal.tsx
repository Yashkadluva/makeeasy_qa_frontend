import { Button } from '../../components/Button/Button';

interface PropData {
    close: any,
    data?:any
}

const ZoomImageModal = (props: PropData) => {

    const onCancel = () => {
        props.close()
    }

    return (
        <>
            <div className='delete-modal'>
                <form>
                    <div className='form-style text-center'>
                        <div className="text-center mb-3">
                        <img height={400} width={550} src={props.data ? props.data : ""} alt="" className='object-fit-content w-100' />
                        </div>
                        <div className='d-flex justify-content-center mt-4 mb-4'>
                                    <span className='px-2'></span>
                                <Button size='large' label='Close' b_type='CANCEL' onClick={() => onCancel()} />
                           
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default ZoomImageModal;