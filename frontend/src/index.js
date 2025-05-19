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
import PropertyTaskDashboard from './pages/dashboard/PropertyTaskDashboard';
import AddConciergeForm from './pages/forms/concierge/AddConciergeForm';
import ConciergeProperties from './pages/dashboard/ConciergeProperties';
import AssignConciergeForm from './pages/forms/concierge/AssignConciergeForm';
import ManagerVerification from './pages/forms/concierge/ManagerVerification';
import GuestContractView from './pages/guest/GuestContractView';
import EmailVerificationMessage from './pages/forms/sign/EmailVerificationMessage';
import CreateReservationForm from './pages/forms/reservation/CreateReservationForm';
import ReservationsList from './pages/dashboard/ReservationsList';
import GenerateContract from './pages/forms/reservation/GenerateContract';
import GuestReservationView from './pages/guest/GuestReservationView';
import ManageServiceWorkers from './pages/components/ManageServiceWorkers';
import RevenueDashboard from './pages/dashboard/RevenueDashboard';
import PropertiesDashboard from './pages/dashboard/PropertiesDashboard';
import ConciergesDashboard from './pages/dashboard/ConciergesDashboard';
import PropertyManagement from './pages/forms/propertyedit/PropertyManagement';
import Home from './pages/home';
import PropertyActions from './pages/dashboard/PropertyActions';
import ProtectedAddProperty from './pages/forms/propertypost/ProtectedAddProperty';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import FAQPage from './pages/FAQPage';
import ConciergeArea from './pages/dashboard/concierge/ConciergeArea';
import ConciergeAreaProperties from './pages/dashboard/concierge/ConciergeAreaProperties';
import ConciergeAreaReservations from './pages/dashboard/concierge/ConciergeAreaReservations';
import ConciergeAreaTasks from './pages/dashboard/concierge/ConciergeAreaTasks';
import ConciergeAreaRevenue from './pages/dashboard/concierge/ConciergeAreaRevenue';

const router = createBrowserRouter([
 {
  path: '/',
  element: (
   <ProtectedRoute>
    <ReservationsList />
   </ProtectedRoute>
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
   <ProtectedRoute>
    <ReservationsList />
   </ProtectedRoute>
  ),
 },
 {
  path: '/revtaskdashboard',
  element: <RevTasksDashboard />,
 },
 {
  path: '/propertyrevenuedashboard',
  element: <PropertyRevenueDashboard />,
 },
 {
  path: '/propertytaskdashboard',
  element: <PropertyTaskDashboard />,
 },
 {
  path: '/revenues',
  element: (
   <ProtectedRoute>
    <RevenueDashboard />
   </ProtectedRoute>
  ),
 },
 {
  path: '/propertiesdashboard',
  element: (
   <ProtectedRoute>
    <PropertiesDashboard />
   </ProtectedRoute>
  ),
 },
 {
  path: '/propertyactions',
  element: (
   <ProtectedRoute>
    <PropertyActions />
   </ProtectedRoute>
  ),
 },
 {
  path: '/property-management',
  element: (
   <ProtectedRoute>
    <PropertyManagement />
   </ProtectedRoute>
  ),
 },
 {
  path: '/concierges',
  element: (
   <ProtectedRoute>
    <ConciergesDashboard />
   </ProtectedRoute>
  ),
 },
 {
  path: '/add-concierge',
  element: (
   <ProtectedRoute>
    <AddConciergeForm />
   </ProtectedRoute>
  ),
 },
 {
  path: '/assign-concierge',
  element: (
   <ProtectedRoute>
    <AssignConciergeForm />
   </ProtectedRoute>
  ),
 },
 {
  path: '/concierges/:managerId/properties',
  element: (
   <ProtectedRoute>
    <ConciergeProperties />
   </ProtectedRoute>
  ),
 },
 {
  path: '/manager/verify/:token',
  element: <ManagerVerification />,
 },

 {
  path: '/adminpanel',
  element: (
   <ProtectedRoute requiredRole="admin">
    <AdminPanel />
   </ProtectedRoute>
  ),
 },
 {
  path: '/clients',
  element: (
   <ProtectedRoute requiredRole="admin">
    <Users />
   </ProtectedRoute>
  ),
 },
 {
  path: '/client',
  element: (
   <ProtectedRoute requiredRole="admin">
    <User />
   </ProtectedRoute>
  ),
 },
 {
  path: '/properties',
  element: (
   <ProtectedRoute requiredRole="admin">
    <Properties />
   </ProtectedRoute>
  ),
 },
 {
  path: '/nearbyplaces',
  element: (
   <ProtectedRoute requiredRole="admin">
    <NearbyPlaces />
   </ProtectedRoute>
  ),
 },
 {
  path: '/nearbyplace',
  element: (
   <ProtectedRoute requiredRole="admin">
    <NearbyPlace />
   </ProtectedRoute>
  ),
 },
 {
  path: '/pendingproperties',
  element: (
   <ProtectedRoute>
    <Pendingproperties />
   </ProtectedRoute>
  ),
 },
 {
  path: '/pendingnearbyplaces',
  element: (
   <ProtectedRoute>
    <PendingNearbyPlaces />
   </ProtectedRoute>
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
   <ProtectedRoute>
    <Account />
   </ProtectedRoute>
  ),
 },
 {
  path: '/profile',
  element: (
   <ProtectedRoute>
    <Profile />
   </ProtectedRoute>
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
   <ProtectedRoute>
    <ProtectedAddProperty />
   </ProtectedRoute>
  ),
 },
 { path: '/mappicker', element: <MapPicker /> },
 { path: '/propertydetails', element: <PropertyDetails /> },
 {
  path: '/createnearbyplace',
  element: (
   <ProtectedRoute>
    <CreateNearbyPlace />
   </ProtectedRoute>
  ),
 },
 {
  path: '/editproperty',
  element: (
   <ProtectedRoute>
    <EditProperty />
   </ProtectedRoute>
  ),
 },
 {
  path: '/editbasicinfo',
  element: (
   <ProtectedRoute>
    <EditBasicInfo />
   </ProtectedRoute>
  ),
 },
 {
  path: '/editequipements',
  element: (
   <ProtectedRoute>
    <EditEquipement />
   </ProtectedRoute>
  ),
 },
 {
  path: '/editphotos',
  element: (
   <ProtectedRoute>
    <EditPhotos />
   </ProtectedRoute>
  ),
 },
 {
  path: '/edithouserules',
  element: (
   <ProtectedRoute>
    <EditHouseRules />
   </ProtectedRoute>
  ),
 },
 {
  path: '/editcheckin',
  element: (
   <ProtectedRoute>
    <EditCheckIn />
   </ProtectedRoute>
  ),
 },
 {
  path: '/editcheckout',
  element: (
   <ProtectedRoute>
    <EditCheckOut />
   </ProtectedRoute>
  ),
 },
 {
  path: '/addequipement',
  element: (
   <ProtectedRoute>
    <AddEquipement />
   </ProtectedRoute>
  ),
 },
 {
  path: '/editequipement',
  element: (
   <ProtectedRoute>
    <EditEquipement />
   </ProtectedRoute>
  ),
 },
 { path: '/digitalguidebook', element: <DigitalGuidebook /> },
 {
  path: '/contractslist',
  element: <ContractsList />,
 },
 { path: '/guest/contract/:hashId', element: <GuestContractView /> },
 {
  path: '/reservations',
  element: (
   <ProtectedRoute>
    <ReservationsList />
   </ProtectedRoute>
  ),
 },
 {
  path: '/create-reservation',
  element: (
   <ProtectedRoute>
    <CreateReservationForm />
   </ProtectedRoute>
  ),
 },
 {
  path: '/generate-contract/:id',
  element: (
   <ProtectedRoute>
    <GenerateContract />
   </ProtectedRoute>
  ),
 },
 {
  path: '/guest/reservation/:hashId',
  element: <GuestReservationView />,
 },
 {
  path: '/service-workers',
  element: (
   <ProtectedRoute>
    <ManageServiceWorkers />
   </ProtectedRoute>
  ),
 },
 {
  path: '/privacy-policy',
  element: <PrivacyPolicyPage />,
 },
 {
  path: '/faqs',
  element: <FAQPage />,
 },
 {
  path: '/concierge/dashboard',
  element: (
   <ProtectedRoute>
    <ConciergeArea />
   </ProtectedRoute>
  ),
 },
 {
  path: '/concierge/properties',
  element: (
   <ProtectedRoute>
    <ConciergeAreaProperties />
   </ProtectedRoute>
  ),
 },
 {
  path: '/concierge/reservations',
  element: (
   <ProtectedRoute>
    <ConciergeAreaReservations />
   </ProtectedRoute>
  ),
 },
 {
  path: '/concierge/tasks',
  element: (
   <ProtectedRoute>
    <ConciergeAreaTasks />
   </ProtectedRoute>
  ),
 },
 {
  path: '/concierge/revenue',
  element: (
   <ProtectedRoute>
    <ConciergeAreaRevenue />
   </ProtectedRoute>
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
