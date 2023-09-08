import React from 'react';
import PropTypes from 'prop-types';

import './Image.css';

interface PropData {
    path: string;
    url: string,
    alt: string,
    width: number,
    height: number
}

export const Image = (props: PropData) => {
    return (
        <img src={props.path ? require(`${props.path}`) : `${props.url}`} alt={props.alt} width={props.width} height={props.height} />
    )
}

Image.propTypes = {
    path: PropTypes.string,
    url: PropTypes.string,
    alt: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number
}

Image.defaultProps = {
    path: '',
    url: 'https://picsum.photos/200/300',
    alt: 'Not Found',
    width: '100',
    height: '100'
}