import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import './components/common/CustomSpinner';
import { AuthContextProvider } from './context/AuthContext';
import { TranslationProvider } from './context/TranslationContext';
import trevioThemeConfig from './utils/trevioThemeConfig';
import frFR from 'antd/locale/fr_FR';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoute';
import { ConfigProvider } from 'antd';
import Layout from './components/Layout';
import NotFoundPage from './pages/notfoundpage';
import AdminPanel from './pages/admin/adminpanel';
import Users from './pages/admin/users';
import Properties from './pages/admin/properties';
import NearbyPlaces from './pages/admin/nearbyplaces';
import User from './pages/admin/user';
import NearbyPlace from './pages/admin/nearbyplace';
import Login from './pages/forms/sign/login';
import Signup from './pages/forms/sign/signup';
import Account from './pages/forms/account';
import Guestform from './pages/forms/guestform';
import MapPicker from './pages/forms/propertypost/MapPicker';
import PropertyDetails from './pages/components/PropertyDetails';
import CreateNearbyPlace from './pages/forms/createnearbyplace';
import EditProperty from './pages/forms/propertyedit/EditProperty';
import EditBasicInfo from './pages/forms/propertyedit/EditBasicInfo';
import EditPhotos from './pages/forms/propertyedit/EditPhotos';
import EditHouseRules from './pages/forms/propertyedit/EditHouseRules';
import EditCheckIn from './pages/forms/propertyedit/EditCheckIn';
import AddEquipement from './pages/forms/equipement/AddEquipement';
import EditEquipement from './pages/forms/equipement/EditEquipement';
import DigitalGuidebook from './pages/components/DigitalGuidebook';
import ResetPasswordRequest from './pages/forms/sign/ResetPasswordRequest';
import VerifyResetCode from './pages/forms/sign/VerifyResetCode';
import NewPassword from './pages/forms/sign/NewPassword';
import EditCheckOut from './pages/forms/propertyedit/EditCheckOut';
import Pendingproperties from './pages/admin/pendingproperties';
import PendingNearbyPlaces from './pages/admin/pendingnearbyplaces';
import Profile from './pages/components/Profile';
import ContractsList from './pages/components/ContractsList';
import RevTasksDashboard from './pages/RevTasksDashboard';
import PropertyRevenueDashboard from './pages/admin/PropertyRevenueDashboard';
import PropertyTaskDashboard from './pages/dashboard/ClientMode/PropertyTaskDashboard';
import AddConciergeForm from './pages/forms/concierge/AddConciergeForm';
import ConciergeProperties from './pages/dashboard/ClientMode/ConciergeProperties';
import AssignConciergeForm from './pages/forms/concierge/AssignConciergeForm';
import ManagerVerification from './pages/forms/concierge/ManagerVerification';
import GuestContractView from './pages/guest/GuestContractView';
import EmailVerificationMessage from './pages/forms/sign/EmailVerificationMessage';
import CreateReservationForm from './pages/forms/reservation/CreateReservationForm';
import ReservationsDashboard from './pages/dashboard/ClientMode/ReservationsDashboard';
import GenerateContract from './pages/forms/reservation/GenerateContract';
import GuestReservationView from './pages/guest/GuestReservationView';
import ManageServiceWorkers from './pages/components/ManageServiceWorkers';
import RevenueDashboard from './pages/dashboard/ClientMode/RevenueDashboard';
import PropertiesDashboard from './pages/dashboard/ClientMode/PropertiesDashboard';
import ConciergesDashboard from './pages/dashboard/ClientMode/ConciergesDashboard';
import PropertyManagement from './pages/forms/propertyedit/PropertyManagement';
import Home from './pages/home';
import PropertyActions from './pages/dashboard/ClientMode/PropertyActions';
import ProtectedAddProperty from './pages/forms/propertypost/ProtectedAddProperty';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import FAQPage from './pages/FAQPage';
import ConciergeArea from './pages/dashboard/ConciergeMode/ConciergeArea';
import ConciergeAreaProperties from './pages/dashboard/ConciergeMode/ConciergeAreaProperties';
import ConciergeAreaReservations from './pages/dashboard/ConciergeMode/ConciergeAreaReservations';
import ConciergeAreaTasks from './pages/dashboard/ConciergeMode/ConciergeAreaTasks';
import ConciergeAreaRevenue from './pages/dashboard/ConciergeMode/ConciergeAreaRevenue';

const router = createBrowserRouter([
 {
  path: '/',
  element: (
   <Layout>
    <ProtectedRoute>
     <ReservationsDashboard />
    </ProtectedRoute>
   </Layout>
  ),
  errorElement: <NotFoundPage />,
 },
 {
  path: '/home',
  element: <Home />,
 },
 {
  path: '/dashboard',
  element: (
   <Layout>
    <ProtectedRoute>
     <ReservationsDashboard />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/revtaskdashboard',
  element: (
   <Layout>
    <ProtectedRoute>
     <RevTasksDashboard />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/propertyrevenuedashboard',
  element: (
   <Layout>
    <ProtectedRoute>
     <PropertyRevenueDashboard />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/propertytaskdashboard',
  element: (
   <Layout>
    <ProtectedRoute>
     <PropertyTaskDashboard />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/revenues',
  element: (
   <Layout>
    <ProtectedRoute>
     <RevenueDashboard />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/propertiesdashboard',
  element: (
   <Layout>
    <ProtectedRoute>
     <PropertiesDashboard />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/propertyactions',
  element: (
   <Layout>
    <ProtectedRoute>
     <PropertyActions />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/property-management',
  element: (
   <Layout>
    <ProtectedRoute>
     <PropertyManagement />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/concierges',
  element: (
   <Layout>
    <ProtectedRoute>
     <ConciergesDashboard />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/add-concierge',
  element: (
   <Layout>
    <ProtectedRoute>
     <AddConciergeForm />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/assign-concierge',
  element: (
   <Layout>
    <ProtectedRoute>
     <AssignConciergeForm />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/concierges/:managerId/properties',
  element: (
   <Layout>
    <ProtectedRoute>
     <ConciergeProperties />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/manager/verify/:token',
  element: <ManagerVerification />,
 },

 {
  path: '/adminpanel',
  element: (
   <Layout>
    <ProtectedRoute requiredRole="admin">
     <AdminPanel />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/clients',
  element: (
   <Layout>
    <ProtectedRoute requiredRole="admin">
     <Users />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/client',
  element: (
   <Layout>
    <ProtectedRoute requiredRole="admin">
     <User />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/properties',
  element: (
   <Layout>
    <ProtectedRoute requiredRole="admin">
     <Properties />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/nearbyplaces',
  element: (
   <Layout>
    <ProtectedRoute requiredRole="admin">
     <NearbyPlaces />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/nearbyplace',
  element: (
   <Layout>
    <ProtectedRoute requiredRole="admin">
     <NearbyPlace />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/pendingproperties',
  element: (
   <Layout>
    <ProtectedRoute>
     <Pendingproperties />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/pendingnearbyplaces',
  element: (
   <Layout>
    <ProtectedRoute>
     <PendingNearbyPlaces />
    </ProtectedRoute>
   </Layout>
  ),
 },
 { path: '/login', element: <Login /> },
 { path: '/signup', element: <Signup /> },
 {
  path: '/verify-email',
  element: <EmailVerificationMessage />,
 },
 {
  path: '/account',
  element: (
   <Layout>
    <ProtectedRoute>
     <Account />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/profile',
  element: (
   <Layout>
    <ProtectedRoute>
     <Profile />
    </ProtectedRoute>
   </Layout>
  ),
 },
 { path: '/reset-password-request', element: <ResetPasswordRequest /> },
 { path: '/verify-reset-code', element: <VerifyResetCode /> },
 { path: '/new-password', element: <NewPassword /> },
 {
  path: '/guestform',
  element: <Guestform />,
 },
 {
  path: '/addproperty',
  element: (
   <Layout>
    <ProtectedRoute>
     <ProtectedAddProperty />
    </ProtectedRoute>
   </Layout>
  ),
 },
 { path: '/mappicker', element: <MapPicker /> },
 { path: '/propertydetails', element: <PropertyDetails /> },
 {
  path: '/createnearbyplace',
  element: (
   <Layout>
    <ProtectedRoute>
     <CreateNearbyPlace />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/editproperty',
  element: (
   <Layout>
    <ProtectedRoute>
     <EditProperty />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/editbasicinfo',
  element: (
   <Layout>
    <ProtectedRoute>
     <EditBasicInfo />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/editequipements',
  element: (
   <Layout>
    <ProtectedRoute>
     <EditEquipement />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/editphotos',
  element: (
   <Layout>
    <ProtectedRoute>
     <EditPhotos />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/edithouserules',
  element: (
   <Layout>
    <ProtectedRoute>
     <EditHouseRules />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/editcheckin',
  element: (
   <Layout>
    <ProtectedRoute>
     <EditCheckIn />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/editcheckout',
  element: (
   <Layout>
    <ProtectedRoute>
     <EditCheckOut />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/addequipement',
  element: (
   <Layout>
    <ProtectedRoute>
     <AddEquipement />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/editequipement',
  element: (
   <Layout>
    <ProtectedRoute>
     <EditEquipement />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/digitalguidebook',
  element: (
   <Layout>
    <DigitalGuidebook />
   </Layout>
  ),
 },
 {
  path: '/contractslist',
  element: (
   <Layout>
    <ContractsList />
   </Layout>
  ),
 },
 {
  path: '/guest/contract/:hashId',
  element: (
   <Layout>
    <GuestContractView />{' '}
   </Layout>
  ),
 },
 {
  path: '/reservations',
  element: (
   <Layout>
    <ProtectedRoute>
     <ReservationsDashboard />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/create-reservation',
  element: (
   <Layout>
    <ProtectedRoute>
     <CreateReservationForm />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/generate-contract/:id',
  element: (
   <Layout>
    <ProtectedRoute>
     <GenerateContract />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/guest/reservation/:hashId',
  element: (
   <Layout>
    <GuestReservationView />
   </Layout>
  ),
 },
 {
  path: '/service-workers',
  element: (
   <Layout>
    <ProtectedRoute>
     <ManageServiceWorkers />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/privacy-policy',
  element: (
   <Layout>
    <PrivacyPolicyPage />
   </Layout>
  ),
 },
 {
  path: '/faqs',
  element: (
   <Layout>
    <FAQPage />
   </Layout>
  ),
 },
 {
  path: '/concierge/dashboard',
  element: (
   <Layout>
    <ProtectedRoute>
     <ConciergeArea />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/concierge/properties',
  element: (
   <Layout>
    <ProtectedRoute>
     <ConciergeAreaProperties />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/concierge/reservations',
  element: (
   <Layout>
    <ProtectedRoute>
     <ConciergeAreaReservations />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/concierge/tasks',
  element: (
   <Layout>
    <ProtectedRoute>
     <ConciergeAreaTasks />
    </ProtectedRoute>
   </Layout>
  ),
 },
 {
  path: '/concierge/revenue',
  element: (
   <Layout>
    <ProtectedRoute>
     <ConciergeAreaRevenue />
    </ProtectedRoute>
   </Layout>
  ),
 },
]);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 <ConfigProvider locale={frFR} theme={trevioThemeConfig}>
  <AuthContextProvider>
   <TranslationProvider>
    <RouterProvider router={router} />
   </TranslationProvider>
  </AuthContextProvider>
 </ConfigProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
