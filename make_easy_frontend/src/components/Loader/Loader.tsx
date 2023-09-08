import React from 'react';
import './Loader.css'
import loader from '../../assets/images/ajax-loader.gif'

interface PropData {
    show: boolean;
}

const Loader = (props: PropData) => {
    return (
        <>
            {
                props.show && <div className="resultLoading">
                    <div className='bg' style={{ backgroundColor: '#000000' }}></div>
                    <div style={{ textAlign: 'center', marginTop: '22%' }}>
                        <img style={{ position: 'relative' }} src={loader} alt="No loader found" />
                        <div style={{ position: 'relative', color: 'white' }}>Loading...</div>
                    </div>
                </div >
            }
        </>
    )
}

export default Loader;
