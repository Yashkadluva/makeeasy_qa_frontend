import  { useEffect, useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import './Signup.scss';
import { Label } from '../../../components/Label/Label';
import Loader from '../../../components/Loader/Loader';
import WebService from '../../../utility/WebService';
import tick from '../../../assets/images/tick.png';
import AuthHeader from '../../../components/AuthHeader/AuthHeader';
import SawinSelect from '../../../components/Select/SawinSelect';
import { Row, Col } from 'react-bootstrap';
import DraggableModal from '../../../components/DraggableModal/DraggableModal';
import { toast } from 'react-toastify';
import HelperService from '../../../utility/HelperService';
import useDarkMode from "use-dark-mode";

const SignUp = () => {
    const darkMode = useDarkMode();
    const { register, handleSubmit, watch, reset, formState: { errors }, control, setValue } = useForm();
    const watchAllFields = watch();
    let history = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [countryData, setCountryData] = useState([]);
    const [stateData, setStateData] = useState([]);
    const [show, setShow] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("US");
    const [showAlertModel, setAlertModel] = useState(false);
    const [isValidEmail, setValidEmail] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        getCountryList() // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        if (darkMode.value) {
            darkMode.toggle();
        }
    });


    const getCountryList = () => {
        setLoading(true)
        WebService.getAPI({
            action: 'SaiSetupCountry/GetAll/en-US',
            body: null
        })
            .then((res: any) => {
                setValue("Country", "US")
                var array: any = [];
                for (var i in res) {
                    array.push({ id: res[i].Code, value: res[i].Name });
                }
                setCountryData(array);
                getStateList()
                setLoading(false)
            })
            .catch((e) => {
                setLoading(false)
            })
    }

    const getStateList = () => {
        setLoading(true)
        WebService.getAPI({
            action: 'SaiSetupState/GetAll/en-US',
            body: null
        })
            .then((res: any) => {
                var array: any = [];
                for (var i in res) {
                    array.push({ id: res[i].Code, value: res[i].Name });
                }
                setStateData(array);
                setLoading(false)
            })
            .catch((e) => {
                setLoading(false)
            })
    }

    const onSubmit = (data: any) => {
        if (isValidEmail == false) {
            setLoading(true)
            WebService.postAPI({
                action: 'Prospects',
                body: data
            })
                .then((res: any) => {
                    reset()
                    setLoading(false)
                    setShow(!show)
                })
                .catch((e) => {
                    setLoading(false)
                })
        } else {
            toast.error("Please Enter Valid Email")
        }
    };

    const BusinessTypes: any = [
        { id: "Residential", value: "Residential" },
        { id: "Commercial", value: "Commercial" },
        { id: "Both", value: "Both" }
    ];

    const validateEmail = (email: any) => {
        setValidEmail(false)
        if (email) {
            setLoading(true)
            WebService.getAPI({
                action: `Prospects/ValidateEmail/${email}`,
                body: null
            })
                .then((res: any) => {
                    setValidEmail(false)
                    setLoading(false)
                })
                .catch((e) => {
                    setValidEmail(true)
                    setErrorMessage("The email address you have entered is already registered with another account.");
                    setAlertModel(true);
                    setLoading(false)
                })
        }
    }

    return (
        <>

            <Loader show={isLoading} />
            <AuthHeader />
            <div className='d-flex justify-content-center signup'>
                <div className='signup-main'>
                    <span className='signup-heading'>Create Account</span>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className='signupContainer form-style'>
                            <Row>
                                <Col md={6}>
                                    <Label title='First Name' showStar={true} />
                                    <input className='form-control input' type="text" {...register("FirstName", { required: true })} placeholder='Enter first name' />
                                    {errors.FirstName && <Label title={'Please enter first name.'} modeError={true} />}
                                </Col>
                                <Col md={6}>
                                    <Label title='Last Name' showStar={true} />
                                    <input className='form-control input' type="text" {...register("LastName", { required: true })} placeholder='Enter last name' />
                                    {errors.LastName && <Label title={'Please enter last name.'} modeError={true} />}
                                </Col>
                                <Col md={6}>
                                    <Label title='Job Title' showStar={true} />
                                    <input className='form-control input' type="text" {...register("JobTitle", { required: true })} placeholder='Enter job title' />
                                    {errors.JobTitle && <Label title={'Please enter job title.'} modeError={true} />}
                                </Col>
                                <Col md={6}>
                                    <Label title='Company Name' showStar={true} />
                                    <input className='form-control input' type="text" {...register("CompanyName", { required: true })} placeholder='Enter company name' />
                                    {errors.CompanyName && <Label title={'Please enter company name.'} modeError={true} />}
                                </Col>
                                <Col md={12}>
                                    <Label title='Email' showStar={true} />
                                    <input className='form-control input' type="text" {...register("Email", { required: true, pattern: /^\S+@\S+$/i })} placeholder='Enter email' onBlur={(e) => validateEmail(e.target.value)} />
                                    <span className='emailMsg'>You will not be able to change your email as this will be your username</span>
                                    {errors.Email && <Label title={'Please enter valid email.'} modeError={true} />}
                                </Col>
                                <Col md={6}>
                                    <Label title='Country' showStar={true} />
                                    <Controller
                                        control={control}
                                        name="Country"
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <SawinSelect
                                                options={countryData}
                                                disValue="Country"
                                                selected={selectedCountry}
                                                onChange={(data: any) => { field.onChange(data.id); setSelectedCountry(data.id) }}
                                            />
                                        )}
                                    />
                                    {errors.Country && <Label title={'Please select country.'} modeError={true} />}
                                </Col>
                                <Col md={6}>
                                    <Label title='State' showStar={true} />
                                    <Controller
                                        control={control}
                                        name="State"
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <SawinSelect
                                                options={selectedCountry == "US" ? stateData : []}
                                                onChange={(data: any) => field.onChange(data.id)}
                                            />
                                        )}
                                    />
                                    {errors.State && <Label title={'Please select state.'} modeError={true} />}
                                </Col>
                                <Col md={6}>
                                    <Label title='Phone' showStar={true} />
                                    <input className='form-control input' type="text"   {...register("PhoneNumber", {
                                        required: true,
                                        minLength: 12,
                                    })}
                                        onKeyPress={(e) =>
                                            HelperService.allowOnlyNumericValue(e)
                                        }
                                        onKeyUp={(e) => HelperService.contactFormatter(e)}
                                        placeholder="Phone Number" />
                                    {errors.PhoneNumber && <Label title={'Please enter phone.'} modeError={true} />}
                                </Col>
                                <Col md={6}>
                                    <Label title='Establishment Type' showStar={true} />
                                    <Controller
                                        control={control}
                                        name="BusinessType"
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <SawinSelect
                                                options={BusinessTypes}
                                                disValue="Country"
                                                // selected={[]}
                                                onChange={(data: any) => field.onChange(data.id)}
                                            />
                                        )}
                                    />
                                    {errors.BusinessType && <Label title={'Please select establishment type.'} modeError={true} />}
                                </Col>
                                <Col md={6}>
                                    <Label title='# of Office Users' showStar={true} />
                                    <input className='form-control input' type="text" {...register("OfficeUsersCount", { required: true })} placeholder='Enter no. of office users' onKeyPress={(e) =>
                                        HelperService.allowOnlyNumericValue(e)
                                    } />
                                    {errors.OfficeUsersCount && <Label title={'Please enter office users.'} modeError={true} />}
                                </Col>
                                <Col md={6}>
                                    <Label title='# of Remote Users' showStar={true} />
                                    <input className='form-control input' type="text" {...register("RemoteUsersCount", { required: true })} placeholder='Enter no. of remote users' onKeyPress={(e) =>
                                        HelperService.allowOnlyNumericValue(e)
                                    } />
                                    {errors.RemoteUsersCount && <Label title={'Please enter remote users.'} modeError={true} />}
                                </Col>
                                <Col md={12}>
                                    <Label title='Comments' />
                                    <textarea className='form-control input h-100 w-100'  {...register("Comments")} placeholder='Enter comment' />
                                </Col>
                                <Col md={12} className='bottom-buttons mb-4  text-center'>
                                    <div className='d-flex align-item-center justify-content-center'>
                                        <div className='w-25'>
                                            <Button size={'large'} label='Create Account' b_type='SIGNUP' />
                                        </div>
                                        <div className='d-flex justify-content-center'>
                                            <button className='b1-signup' onClick={() => history(`/login`)}><span className='login-button'>{'Log In'}</span></button>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </form>
                </div>
            </div >


            <Modal show={show} onHide={() => setShow(false)}
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header closeButton className='border-0'>
                </Modal.Header>
                <Modal.Body className='align-self-center'>
                    <img src={tick} className='tick-image' alt='tick' />
                    <p className='thankyou'>Thank you!</p>
                </Modal.Body>
            </Modal>

            <DraggableModal
                isOpen={showAlertModel}
                onClose={() => setAlertModel(false)}
                title="Alert"
                type="ALERT_MODEL"
                width={600}
                previousData={errorMessage}
            />
        </>
    )
}

export default SignUp;