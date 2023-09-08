import React from 'react';
import logo from '../../assets/images/logo.png'

import './AuthHeader.scss'

const AuthHeader = () => {
    return (
        <div className='header-main'>
            <img src={logo} className='headerLogo' alt={'Header Logo'} />
            <span className="border-bottom border-dark"></span>
        </div>
    )
}

export default AuthHeader;