import React, { useEffect, useState } from 'react'
import SignaturePad from 'react-signature-canvas';

interface SignatureData {
    signature?: any;
    previousSignature?: any;

}




const SignatureCanvas = (props: SignatureData) => {
    let sigPad: any = {}

    useEffect(() => {
        if (props.previousSignature && sigPad) {
            sigPad.fromDataURL(props.previousSignature);
        }
    }, [props.previousSignature]);


    const onClear = () => {
        sigPad.clear();
        props.signature(sigPad.getTrimmedCanvas().toDataURL('image/png'))
    }


    return (
        <div className=''>
            <SignaturePad canvasProps={{
                width: "300%",
                height: 130,
                style: { border: '2px solid #000' },
            }}
                ref={(ref) => { sigPad = ref }}
                onEnd={(event: MouseEvent) => {
                    props.signature(sigPad.getTrimmedCanvas()
                        .toDataURL('image/png'))
                }}
            />
            <div className="text-end">
                <a href="#" onClick={() => onClear()}>clear</a>
            </div>
        </div>
    )
}

export default SignatureCanvas;