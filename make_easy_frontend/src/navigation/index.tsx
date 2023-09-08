import { Routes, Route, Navigate, RouteProps, RoutesProps } from "react-router-dom";
import React, { Suspense } from "react"
import ProtectedRoute from "./ProtectedRoute";
import Login from "../screens/Auth/Login/Login";
import Main from "../screens/Main";

import { useSelector } from "react-redux";
import { RootState } from "../config/Store";
// Admin Module
import { UserState } from "../reducer/AuthReducer";
import { useState } from "react";
import Loader from "../components/Loader/Loader";
import Reports from "../screens/Reports/Reports";
import ReportsLeftMenu from "../screens/Reports/ReportsLeftMenu/ReportsLeftMenu";
import ReverseCostByInvoice from "../screens/Reports/ReverseCostByInvoice/ReverseCostByInvoice";
import ManageUsers from "../screens/Admin/ManageUsers/ManageUsers";
import ManageGroups from "../screens/Admin/ManageGroups/ManageGroups";
import ManageDictionary from "../screens/Admin/ManageDictionary/ManageDictionary";
import AddService from "../screens/AddService/AddService";
import GenerateContractBilling from "../screens/Contract/GenerateContractBilling/GenerateContractBilling";
import ContractRenewal from "../screens/Contract/ContractRenewal/ContractRenewal";
import MaintenanceContractNotification from "../screens/Contract/MaintenanceContractNotification/MaintenanceContractNotification";
import BatchStatus from "../screens/Reports/BatchStatus/BatchStatus";
import ReturnCall from "../screens/Reports/ReturnCall/ReturnCall";
import SMRecommendation from "../screens/Reports/SMRecommendation/SMRecommendation";
import ByManufacturer from "../screens/Reports/ByManufacturer/ByManufacturer";
import MaintenanceReview from "../screens/Reports/MaintenanceReview/MaintenanceReview";
import ContractReview from "../screens/Reports/ContractReview/ContractReview";
import ContractProfitability from "../screens/Reports/ContractProfitability/ContractProfitability";
import ServiceJobCost from "../screens/Reports/ServiceJobCost/ServiceJobCost";
import TechSolutionCode from "../screens/Reports/TechSolutionCode/TechSolutionCode";
import PutOnHandDetails from "../screens/Reports/PutOnHandDetails/PutOnHandDetails";
import PartUsage from "../screens/Reports/PartUsage/PartUsage";
import PurchaseOrderListing from "../screens/Reports/PurchaseOrderListing/PurchaseOrderListing";
import TimeCardAnalysis from "../screens/Reports/TimeCardAnalysis/TimeCardAnalysis";
import TimeCardReview from "../screens/Reports/TimeCardReview/TimeCardReview";
import ProposalReport from "../screens/Reports/ProposalReport/ProposalReport";
import CreditCardTransaction from "../screens/Reports/CreditCardTransaction/CreditCradTransaction";
import ProjectProfitabilityReport from "../screens/Reports/ProjectProfitabilityReport/ProjectProfitabilityReport";



const DashBoard = React.lazy(() => import("../screens/DashBoard/DashBoard"));
const CompanyEquipmentType = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyEquipmentType/CompanyEquipmentType"));
const InvoiceEntryEquipment = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/InvoiceEntryEquipment"));
const InvoiceEntryPreview = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/InvoiceEntryPreview"));

const SignUp = React.lazy(() => import("../screens/Auth/Signup/Signup"));
const Service = React.lazy(() => import("../screens/ServiceMaster/Service"));
const MainMasterComponent = React.lazy(() => import("../components/ServiceMasterComponents/MainMasterComponent/MainMasterComponent"));
const ServiceJob = React.lazy(() => import("../screens/ServiceMaster/ServiceJob/ServiceJob"));
const SalesCall = React.lazy(() => import("../screens/ServiceMaster/SalesCall/SalesCall"));
const ContactInvoices = React.lazy(() => import("../screens/ServiceMaster/ContractInvoices/ContractInvoices"));
const Contracts = React.lazy(() => import("../screens/ServiceMaster/Contracts/Contracts"));
const ContractDetail = React.lazy(() => import("../screens/ServiceMaster/Contracts/ContractDetails/ContractDetail"));

const ViewDetails = React.lazy(() => import("../screens/ServiceMaster/Contracts/AddContract/ViewDetails"));
const Contact = React.lazy(() => import("../screens/ServiceMaster/Contact/Contact"));
const Equipment = React.lazy(() => import("../screens/ServiceMaster/Equipment/Equipment"));
const Proposal = React.lazy(() => import("../screens/ServiceMaster/Proposal/Proposal"));
const Projects = React.lazy(() => import("../screens/ServiceMaster/Projects/Projects"));
const ProspectNote = React.lazy(() => import("../screens/ServiceMaster/ProspectNote/ProspectNote"));
const Document = React.lazy(() => import("../screens/ServiceMaster/Document/Document"));
const Recommendations = React.lazy(() => import("../screens/ServiceMaster/Recommendations/Recommendations"));
const Communication = React.lazy(() => import("../screens/ServiceMaster/Communication/Communication"));
const SelectServiceMaster = React.lazy(() => import("../screens/SelectServiceMaster/SelectServiceMaster"));
const CompanyInfo = React.lazy(() => import("../screens/Admin/CompanySetup/Company/Information/CompanyInfo"));
const CallInfo = React.lazy(() => import("../screens/CallInformation/CallInfo"));
const CreatePo = React.lazy(() => import("../screens/CreatePo/CreatePo"));
const CallTimeEntry = React.lazy(() => import("../screens/CallTimeEntry/CallTimeEntry"));

const AddNewServiceMaster = React.lazy(() => import("../screens/ServiceMaster/AddNewServiceMaster/AddNewServiceMaster"));
const AddDocument = React.lazy(() => import("../screens/ServiceMaster/Document/AddDocument"));

const InvoiceEntry = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/InvoiceEntry"));
const GeneralInfo = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/GeneralInfo"));
const InvoiceEntryV2 = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/InvoiceEntryV2"));
const BillingDetails = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/BillingDetails"));
const DescriptionNotes = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/DescriptionNotes"));
const CallPictures = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/CallPictures"));
const CallReceipt = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/CallReceipt"));
const InvoiceRecommendations = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/Recommendations"));
const ActivityLog = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/ActivityLog"));
const TaskList = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/TaskList"));

const TitleOfCourtesy = React.lazy(() => import("../screens/Admin/CompanySetup/Company/TitleOfCourtesy/TitleOfCourtesy"));
const Billingcode = React.lazy(() => import("../screens/Admin/CompanySetup/Company/Billingcode/Billingcode"));
const CoustomerSource = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CoustomerSource/CoustomerSource"));
const PriceCodes = React.lazy(() => import("../screens/Admin/CompanySetup/Company/PriceCodes/PriceCodes"));
const Pricing = React.lazy(() => import("../screens/Admin/CompanySetup/Company/Pricing/Pricing"));
const APPaymentTerms = React.lazy(() => import("../screens/Admin/CompanySetup/Company/APPaymentTerms/APPaymentTerms"));
const PaymentTerms = React.lazy(() => import("../screens/Admin/CompanySetup/Company/PaymentTerms/PaymentTerms"));
const RecordingTags = React.lazy(() => import("../screens/Admin/CompanySetup/Company/RecordingTags/RecordingTags"));
const FiscalPeriod = React.lazy(() => import("../screens/Admin/CompanySetup/Company/FiscalPeriod/FiscalPeriod"));
const GLBreaks = React.lazy(() => import("../screens/Admin/CompanySetup/Company/GLBreaks/GLBreaks"));
const CardTags = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CardTags/CardTags"));
const EmployeeMaster = React.lazy(() => import("../screens/Admin/CompanySetup/Company/EmployeeMaster/EmployeeMaster"));
const CustomerLevel = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CustomerLevel/CustomerLevel"));
const Trucks = React.lazy(() => import("../screens/Admin/CompanySetup/Company/Trucks/Trucks"));
const BusinessCategory = React.lazy(() => import("../screens/Admin/CompanySetup/Company/BusinessCategory/BusinessCategory"));
const CallType = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CallType/CallType"));
const MiscellaneousFields = React.lazy(() => import("../screens/Admin/CompanySetup/Company/MiscellaneousFields/MiscellaneousFields"));
const ProspectStatus = React.lazy(() => import("../screens/Admin/CompanySetup/Company/ProspectStatus/ProspectStatus"));
const Salesman = React.lazy(() => import("../screens/Admin/CompanySetup/Company/Salesman/Salesman"));
const OutComeCode = React.lazy(() => import("../screens/Admin/CompanySetup/Company/OutComeCode/OutComeCode"));
const Activity = React.lazy(() => import("../screens/Admin/CompanySetup/Company/Activity/Activity"));
const ReportingAuthority = React.lazy(() => import("../screens/Admin/CompanySetup/Company/ReportingAuthority/ReportingAuthority"));
const TaxingAuthority = React.lazy(() => import("../screens/Admin/CompanySetup/Company/TaxingAuthority/TaxingAuthority"));
const TaxCode = React.lazy(() => import("../screens/Admin/CompanySetup/Company/TaxCode/TaxCode"));
const CompanyOptions = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyOptions/CompanyOptions"));
const CancellationReason = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CancellationReason/CancellationReason"));
const RecomendationStatus = React.lazy(() => import("../screens/Admin/CompanySetup/Company/RecomendationStatus/RecomendationStatus"));
const TechnicianTrades = React.lazy(() => import("../screens/Admin/CompanySetup/Company/TechnicianTrades/TechnicianTrades"));
const TechLevel = React.lazy(() => import("../screens/Admin/CompanySetup/Company/TechLevel/TechLevel"));
const TechnicianMaster = React.lazy(() => import("../screens/Admin/CompanySetup/Company/TechnicianMaster/TechnicianMaster"));
const TimePromised = React.lazy(() => import("../screens/Admin/CompanySetup/Company/TimePromised/TimePromised"));
const CompanyOutcomeCodes = React.lazy(() => import("../screens/Admin/CompanySetup/Company/OutcomeCodes/OutcomeCodes"));
const CompanyTask = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyTask/CompanyTask"));
const TypeOfBusiness = React.lazy(() => import("../screens/Admin/CompanySetup/Company/TypeOfBusiness/TypeOfBusiness"));
const LocationClasification = React.lazy(() => import("../screens/Admin/CompanySetup/Company/LocationClasification/LocationClasification"));
const TechCrew = React.lazy(() => import("../screens/Admin/CompanySetup/Company/TechCrew/TechCrew"));
const CompanyPaymentMethod = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyPaymentMethod/CompanyPaymentMethod"));
const CompanyVendors = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyVendors/CompanyVendors"));
const SubContractorStatus = React.lazy(() => import("../screens/Admin/CompanySetup/Company/SubContractorStatus/SubContractorStatus"));
const CompanyProjectType = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyProjectType/CompanyProjectType"));
const CompanyZone = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyZone/CompanyZone"));
const CompanyZipCode = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyZipCode/CompanyZipCode"));
const CompanyServiceType = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyServiceType/CompanyServiceType"));
const CompanyEquipmentManufacturer = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyEquipmentManufacturer/CompanyEquipmentManufacturer"));
const CompanyEquipmentModal = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyEquipmentModal/CompanyEquipmentModal"));
const CompanyEquipmentIndustry = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyEquipmentIndustry/CompanyEquipmentIndustry"));
const CompanyIndustryField = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyIndustryField/CompanyIndustryField"));
const CompanyDeactivateSurvey = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyDeactivateSurvey/CompanyDeactivateSurvey"));
const CompanyCoupans = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyCoupans/CompanyCoupans"));
const CompanyOptionaltem = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyOptionaltem/CompanyOptionaltem"));
const CompanyPricingBucket = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyPricingBucket/CompanyPricingBucket"));
const CompanyPaymentTerms = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyPaymentTerms/CompanyPaymentTerms"));
const CompanyEmailSatup = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyEmailSatup/CompanyEmailSatup"));
const CompanyInclusionExclusion = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyInclusion&Exclusion/CompanyInclusion&Exclusion"));
const AccountStructure = React.lazy(() => import("../screens/Admin/CompanySetup/Company/AccountStructure/AccountStructure"));
const ARCompany = React.lazy(() => import("../screens/Admin/CompanySetup/Company/ARCompany/ARCompany"));
const CustomerPortalSetup = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CustomerPortalSetup/CustomerPortalSetup"));
const CompanyOption = React.lazy(() => import("../screens/Admin/CompanySetup/Company/CompanyOption/CompanyOption"));
const InvoiceEntryPagesLink = React.lazy(() => import("../screens/ServiceMaster/Invoice/InvoiceEntry/InvoiceEntryPagesLink"));
const DispatchBoard = React.lazy(() => import("../screens/DispatchBoard/DispatchBoard"));
const BasicView = React.lazy(() => import("../screens/DispatchBoard/BasicView/BasicView"));
const HorizontalView = React.lazy(() => import("../screens/DispatchBoard/HorizontalView/HorizontalView"));
const VerticalView = React.lazy(() => import("../screens/DispatchBoard/VerticalView/VerticalView"));
const CompanySetupLeftSideMenu = React.lazy(() => import("../screens/Admin/CompanySetup/CompanySetupLeftSideMenu/CompanySetupLeftSideMenu"));
const BusinessType = React.lazy(() => import("../screens/Admin/CompanySetup/Company/BusinessType/BusinessType"));
const SolutionCodes = React.lazy(() => import("../screens/Admin/CompanySetup/Company/SolutionCodes/SolutionCodes"));
const ControlsAndDefaults = React.lazy(() => import("../screens/Admin/CompanySetup/Company/ControlsAndDefaults/ControlsAndDefaults"));
const Training = React.lazy(() => import("../screens/Admin/CompanySetup/Company/Training/Training"))
const ManageEmailTemplate = React.lazy(() => import("../screens/Admin/ManageEmailTemplate/ManageEmailTemplate"))
const ManagTextTemplate = React.lazy(() => import("../screens/Admin/ManagTextTemplate/ManagTextTemplate"))
const InvoiceDetail = React.lazy(() => import("../screens/InvoiceDetail/InvoiceDetail"))
const CashCollections = React.lazy(() => import("../screens/Reports/cashCollections/cashCollections"));
const InvoiceBilling = React.lazy(() => import("../screens/Reports/invoiceBilling/InvoiceBilling"));
const RevenueCostByTechnician = React.lazy(() => import("../screens/Reports/RevenueCostByTechnician/RevenueCostByTechnician"));
const NotYetDispatched = React.lazy(() => import("../screens/Reports/notYetDispatched/NotYetDispatched"));
const OpenCalls = React.lazy(() => import("../screens/Reports/openCalls/OpenCalls"));
const CallDetails = React.lazy(() => import("../screens/Reports/callDetails/CallDetails"));
const ServiceMasterList = React.lazy(() => import("../screens/Reports/ServiceMasterList/ServiceMasterList"));

const Navigation = () => {


  const login: any = useSelector<RootState, UserState>((state) => state.userLogin);

  interface ProtectedRouteProps extends RoutesProps {
    isAuthenticated: boolean;
    authenticationPath: string;
  }

  const defaultProtectedRouteProps: Omit<ProtectedRouteProps, "outlet"> = {
    isAuthenticated: localStorage.getItem("token") != null,
    authenticationPath: "/login",
  };

  const [formcounter, setFormcounter] = useState(Math.floor(Math.random() * 100) + 1);
  const [serviceBook, setServiceBook] = useState(false);
  const requestingService = (data: any) => {
    setFormcounter(Math.floor(Math.random() * 100) + 1)
    setServiceBook(data)
  }

  return (
    <>

      <div id="main-wraper">
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route
            path="/login"
            element={
              defaultProtectedRouteProps.isAuthenticated || login.loginSuccess ? (
                <Navigate replace to="/dashboard" />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/signup"
            element={
              defaultProtectedRouteProps.isAuthenticated || login.loginSuccess ? (
                <Navigate replace to="/dashboard" />
              ) : (
                <Suspense fallback={<><Loader show={true} /></>}>
                  <SignUp />
                </Suspense>
              )
            }
          />
          <Route
            path="/invoice-detail"
            element={
              defaultProtectedRouteProps.isAuthenticated || login.loginSuccess ? (
                <Suspense fallback={<><Loader show={true} /></>}>
                  <InvoiceDetail />
                </Suspense>
              ) : (
                <Suspense fallback={<><Loader show={true} /></>}>
                  <InvoiceDetail />
                </Suspense>
              )
            }
          />


          <Route
            path="/"
            element={
              <ProtectedRoute
                {...defaultProtectedRouteProps}
                outlet={<Main />}
              />
            }
          >
            <Route path="/dashboard" element={<Suspense fallback={<><Loader show={true} /></>}>
              <DashBoard />
            </Suspense>} />
            <Route path="/contract-details" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <ContractDetail />
              </Suspense>
            } />
            <Route path="/" element={<Suspense fallback={<><Loader show={true} /></>}>
              <Service />
            </Suspense>} >
              <Route path="/service-master" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <MainMasterComponent isServiceRequested={requestingService} />
                </Suspense>} />
              <Route path="/service-call" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <ServiceJob />
                </Suspense>
              } />

              <Route path="/sales-call" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <SalesCall />
                </Suspense>} />
              <Route path="/contract-invoices" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <ContactInvoices />
                </Suspense>
              } />
              <Route path="/contracts" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Contracts />
                </Suspense>
              } />
              <Route path="/view-details" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <ViewDetails />
                </Suspense>
              } />
              <Route path="/contact" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Contact />
                </Suspense>
              } />
              <Route path="/equipment" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Equipment />
                </Suspense>
              } />
              <Route path="/proposal" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Proposal />
                </Suspense>
              } />
              <Route path="/projects" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Projects />
                </Suspense>
              } />
              <Route path="/recordings" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <ProspectNote />
                </Suspense>
              } />
              <Route path="/document" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Document />
                </Suspense>
              } />
              <Route path="/recommendations" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Recommendations />
                </Suspense>
              } />
              <Route path="/communication" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Communication />
                </Suspense>
              } />
            </Route>
            <Route path="/SM" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <SelectServiceMaster />
              </Suspense>
            } />
            <Route path="/call-information" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <CallInfo />
              </Suspense>
            }>
            </Route>
            <Route path="/create-po" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <CreatePo />
              </Suspense>
            }>
            </Route>
            <Route path="/return-po" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <CreatePo />
              </Suspense>
            }></Route>
            <Route path="/call-time-entry" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <CallTimeEntry />
              </Suspense>
            }>
            </Route>


            {/* /////////// Company Setup */}



            <Route path="/" element={<Suspense fallback={<><Loader show={true} /></>}>
              <CompanySetupLeftSideMenu />
            </Suspense>} >
              <Route path="/billing-code" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Billingcode />
                </Suspense>
              } />
              <Route path="/company-information" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyInfo />
                </Suspense>
              } />
              <Route path="/title-of-courtesy" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <TitleOfCourtesy />
                </Suspense>
              } />
              <Route path="/price-codes" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <PriceCodes />
                </Suspense>
              } />
              <Route path="/customer-source" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CoustomerSource />
                </Suspense>
              } />
              <Route path="/business-type" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  < BusinessType />
                </Suspense>
              } />
              <Route path="/solution-codes" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  < SolutionCodes />
                </Suspense>
              } />
              <Route path="/add-service" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <AddService />
                </Suspense>
              } />
              <Route path="/pricing" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  < Pricing />
                </Suspense>
              } />
              <Route path="/ap-payment-terms" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  < APPaymentTerms />
                </Suspense>
              } />
              <Route path="/payment-terms" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  < PaymentTerms />
                </Suspense>
              } />
              <Route path="/tags" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  < RecordingTags />
                </Suspense>
              } />
              <Route path="/fiscal-period" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  < FiscalPeriod />
                </Suspense>
              } />
              <Route path="/controls-and-defaults" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  < ControlsAndDefaults />
                </Suspense>
              } />
              <Route path="/gl-breaks" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <GLBreaks />
                </Suspense>
              } />
              <Route path="/card-tags" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CardTags />
                </Suspense>
              } />
              <Route path="/employee-master" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <EmployeeMaster />
                </Suspense>
              } />
              <Route path="/customer-level" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CustomerLevel />
                </Suspense>
              } />
              <Route path="/trucks" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Trucks />
                </Suspense>
              } />
              <Route path="/business-catogery" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <BusinessCategory />
                </Suspense>
              } />
              <Route path="/call-type" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CallType />
                </Suspense>
              } />
              <Route path="/miscellaneous-fields" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <MiscellaneousFields />
                </Suspense>
              } />
              <Route path="/prospect-status" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <ProspectStatus />
                </Suspense>
              } />
              <Route path="/salesman" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Salesman />
                </Suspense>
              } />
              <Route path="/outcome-code" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <OutComeCode />
                </Suspense>
              } />
              <Route path="/activity" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Activity />
                </Suspense>
              } />
              <Route path="/reporting-authority" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <ReportingAuthority />
                </Suspense>
              } />
              <Route path="/taxing-authority" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <TaxingAuthority />
                </Suspense>
              } />
              <Route path="/tax-code" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <TaxCode />
                </Suspense>
              } />
              <Route path="/company-options" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyOptions />
                </Suspense>
              } />
              <Route path="/cancellation-reason" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CancellationReason />
                </Suspense>
              } />
              <Route path="/recomendation-status" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <RecomendationStatus />
                </Suspense>
              } />
              <Route path="/technician-trades" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <TechnicianTrades />
                </Suspense>
              } />
              <Route path="/tech-level" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <TechLevel />
                </Suspense>
              } />
              <Route path="/technician-master" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <TechnicianMaster />
                </Suspense>
              } />
              <Route path="/time-promised" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <TimePromised />
                </Suspense>
              } />
              <Route path="/company-outcome-codes" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyOutcomeCodes />
                </Suspense>
              } />
              <Route path="/company-task" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyTask />
                </Suspense>
              } />
              <Route path="/type-of-business" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <TypeOfBusiness />
                </Suspense>
              } />
              <Route path="/location-classification" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <LocationClasification />
                </Suspense>
              } />
              <Route path="/tech-crew" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <TechCrew />
                </Suspense>
              } />
              <Route path="/company-payment-method" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyPaymentMethod />
                </Suspense>
              } />
              <Route path="/company-vendors" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyVendors />
                </Suspense>
              } />

              <Route path="/sub-contractor-status" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <SubContractorStatus />
                </Suspense>
              } />
              <Route path="/company-project-type" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyProjectType />
                </Suspense>
              } />
              <Route path="/company-zone" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyZone />
                </Suspense>
              } />
              <Route path="/company-zipcode" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyZipCode />
                </Suspense>
              } />
              <Route path="/company-service-type" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyServiceType />
                </Suspense>
              } />
              <Route path="/company-equipment-manufacturer" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyEquipmentManufacturer />
                </Suspense>
              } />
              <Route path="/company-equipment-modal" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyEquipmentModal />
                </Suspense>
              } />
              <Route path="/company-equipment-industry" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyEquipmentIndustry />
                </Suspense>
              } />
              <Route path="/company-industry-field" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyIndustryField />
                </Suspense>
              } />
              <Route path="/company-equipment-type" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyEquipmentType />
                </Suspense>
              } />
              <Route path="/company-deactivate-survey" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyDeactivateSurvey />
                </Suspense>
              } />
              <Route path="/company-coupons" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyCoupans />
                </Suspense>
              } />
              <Route path="/company-optional-item" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyOptionaltem />
                </Suspense>
              } />
              <Route path="/company-pricing-bucket" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyPricingBucket />
                </Suspense>
              } />
              <Route path="/company-payment-terms" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyPaymentTerms />
                </Suspense>
              } />
              <Route path="/company-email-setup" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyEmailSatup />
                </Suspense>
              } />
              <Route path="/inclusion-and-exclusion" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CompanyInclusionExclusion />
                </Suspense>
              } />
              <Route path="/account-structure" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <AccountStructure />
                </Suspense>
              } />
              <Route path="/ar-company" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <ARCompany />
                </Suspense>
              } />
              <Route path="/customer-portal-setup" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CustomerPortalSetup />
                </Suspense>
              } />
              <Route path="/training" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Training />
                </Suspense>
              } />

            </Route>
            <Route path="/manage-email-template" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <ManageEmailTemplate />
              </Suspense>
            } />
            <Route path="/manage-text-template" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <ManagTextTemplate />
              </Suspense>
            } />
            <Route path="/manage-users" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <ManageUsers />
              </Suspense>
            } />
            <Route path="/manage-dictionary" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <ManageDictionary />
              </Suspense>
            } />
            <Route path="/manage-groups" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <ManageGroups />
              </Suspense>
            } />




            {/* INVOICE ENTRY */}
            <Route path="/" element={<Suspense fallback={<><Loader show={true} /></>}>
              <InvoiceEntry />
            </Suspense>} >
              <Route path="/invoice-entry" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <InvoiceEntryPagesLink />
                </Suspense>} />

              <Route path="/general-info" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <GeneralInfo />
                </Suspense>
              } />

              <Route path="/invoice-entry-2" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <InvoiceEntryV2 />
                </Suspense>
              } />

              <Route path="/billing-detail" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <BillingDetails />
                </Suspense>
              } />
              <Route path="/description-note" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <DescriptionNotes />
                </Suspense>
              } />
              <Route path="/invoice-entry-equipment" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <InvoiceEntryEquipment />
                </Suspense>
              } />
              <Route path="/call-pictures" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CallPictures />
                </Suspense>
              } />
              <Route path="/call-receipt" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <CallReceipt />
                </Suspense>
              } />
              <Route path="/activity-log" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <ActivityLog />
                </Suspense>
              } />
              <Route path="/invoice-recommendations" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <InvoiceRecommendations />
                </Suspense>
              } />
              <Route path="/invoice-preview" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <InvoiceEntryPreview />
                </Suspense>
              } />
              <Route path="/task-list" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <TaskList />
                </Suspense>
              } />
            </Route>


            <Route path="/company-option" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <CompanyOption />
              </Suspense>
            } />

            {/* Technician Master //////////// */}


            <Route path="/comapny-information" element={<Suspense fallback={<><Loader show={true} /></>}>
              <CompanyInfo />
            </Suspense>} />
            <Route path="/add-service-master" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <AddNewServiceMaster />
              </Suspense>
            } />
            <Route path="/add-new-same-customer-master" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <AddNewServiceMaster />
              </Suspense>
            } />
            <Route path="/add-document" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <AddDocument />
              </Suspense>
            } />
            <Route path="/dispatch-board" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <DispatchBoard />
              </Suspense>
            } />
            <Route path="/basic-view" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <BasicView />
              </Suspense>
            } />
            <Route path="/horizontal-view" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <HorizontalView />
              </Suspense>
            } />
            <Route path="/vertical-view" element={
              <Suspense fallback={<><Loader show={true} /></>}>
                <VerticalView />
              </Suspense>
            } />



            {/* Reports */}
            <Route path="/" element={<Suspense fallback={<><Loader show={true} /></>}>
              <ReportsLeftMenu />
            </Suspense>} >
              <Route path="/reports" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <Reports />
                </Suspense>
              } />
              <Route path="/batch-status" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <BatchStatus />
                </Suspense>
              } />
              <Route path="/return-call" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <ReturnCall />
                </Suspense>

              } />
              <Route path="/reverse-cost-by-invoice" element={
                <Suspense fallback={<><Loader show={true} /></>}>
                  <ReverseCostByInvoice />
                </Suspense>
              } />
              <Route path="/cash-collections" element={<Suspense fallback={<><Loader show={true} /></>}>
                <CashCollections />
              </Suspense>
              } />
              <Route path="/invoice-billing" element={<Suspense fallback={<><Loader show={true} /></>}>
                <InvoiceBilling />
              </Suspense>
              } />
              <Route path="/revenue-cost-by-technician" element={<Suspense fallback={<><Loader show={true} /></>}>
                <RevenueCostByTechnician />
              </Suspense>
              } />
              <Route path="/not-yet-dispatched" element={<Suspense fallback={<><Loader show={true} /></>}>
                <NotYetDispatched />
              </Suspense>
              } />
              <Route path="/open-calls" element={<Suspense fallback={<><Loader show={true} /></>}>
                <OpenCalls />
              </Suspense>
              } />
              <Route path="/call-details" element={<Suspense fallback={<><Loader show={true} /></>}>
                <CallDetails />
              </Suspense>
              } />
              <Route path="/sm-recommendation" element={<Suspense fallback={<><Loader show={true} /></>}>
                <SMRecommendation />
              </Suspense>
              } />
              <Route path="/by-manufacturer" element={<Suspense fallback={<><Loader show={true} /></>}>
                <ByManufacturer />
              </Suspense>
              } />
              <Route path="/maintenance-review" element={<Suspense fallback={<><Loader show={true} /></>}>
                <MaintenanceReview />
              </Suspense>
              } />
              <Route path="/contract-review" element={<Suspense fallback={<><Loader show={true} /></>}>
                <ContractReview />
              </Suspense>
              } />
              <Route path="/contract-profitability" element={<Suspense fallback={<><Loader show={true} /></>}>
                <ContractProfitability />
              </Suspense>
              } />
              <Route path="/service-job-cost" element={<Suspense fallback={<><Loader show={true} /></>}>
                <ServiceJobCost />
              </Suspense>
              } />
              <Route path="/tech-solution-code" element={<Suspense fallback={<><Loader show={true} /></>}>
                <TechSolutionCode />
              </Suspense>
              } />
              <Route path="/part-on-hand-details" element={<Suspense fallback={<><Loader show={true} /></>}>
                <PutOnHandDetails />
              </Suspense>
              } />
              <Route path="/part-usage" element={<Suspense fallback={<><Loader show={true} /></>}>
                <PartUsage />
              </Suspense>
              } />
              <Route path="/purchase-order-listing" element={<Suspense fallback={<><Loader show={true} /></>}>
                <PurchaseOrderListing />
              </Suspense>
              } />
              <Route path="/time-card-analysis" element={<Suspense fallback={<><Loader show={true} /></>}>
                <TimeCardAnalysis />
              </Suspense>
              } />
              <Route path="/time-card-review" element={<Suspense fallback={<><Loader show={true} /></>}>
                <TimeCardReview />
              </Suspense>
              } />
              <Route path="/proposal-report" element={<Suspense fallback={<><Loader show={true} /></>}>
                <ProposalReport />
              </Suspense>
              } />
              <Route path="/credit-card-transaction" element={<Suspense fallback={<><Loader show={true} /></>}>
                <CreditCardTransaction />
              </Suspense>
              } />
              <Route path="/project-profitability-report" element={<Suspense fallback={<><Loader show={true} /></>}>
                <ProjectProfitabilityReport />
              </Suspense>
              } />
              <Route path="/service-master-list" element={<Suspense fallback={<><Loader show={true} /></>}>
                <ServiceMasterList />
              </Suspense>
              } />



            </Route>






            {/* Contract */}
            <Route path="/generate-contract-billing" element={<GenerateContractBilling />} />
            <Route path="/contract-renewal" element={<ContractRenewal />} />
            <Route path="/maintenance-contract-notification" element={<MaintenanceContractNotification />} />
          </Route>






          <Route path="*" element={<Navigate replace to="/login" />} />
        </Routes>
      </div >
    </>
  );
};

export default Navigation;
