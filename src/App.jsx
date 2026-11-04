import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import Properties from './pages/Properties.jsx'
import PropertyDetail from './pages/PropertyDetail.jsx'
import Sell from './pages/Sell.jsx'
import Agents from './pages/Agents.jsx'
import AgentDetail from './pages/AgentDetail.jsx'
import About from './pages/About.jsx'
import Projects from './pages/Projects.jsx'
import Contact from './pages/Contact.jsx'
import { Privacy, Terms } from './pages/Legal.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import NotFound from './pages/NotFound.jsx'

import DashboardLayout from './pages/dashboard/DashboardLayout.jsx'
import Overview from './pages/dashboard/Overview.jsx'
import Favorites from './pages/dashboard/Favorites.jsx'
import MyListings from './pages/dashboard/MyListings.jsx'
import MyInquiries from './pages/dashboard/MyInquiries.jsx'
import RecentlyViewed from './pages/dashboard/RecentlyViewed.jsx'
import AccountSettings from './pages/dashboard/AccountSettings.jsx'

import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminOverview from './pages/admin/AdminOverview.jsx'
import AdminProperties from './pages/admin/AdminProperties.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminAgents from './pages/admin/AdminAgents.jsx'
import AdminInquiries from './pages/admin/AdminInquiries.jsx'
import { AdminCategories, AdminLocations } from './pages/admin/AdminTaxonomy.jsx'
import { AdminHomepage, AdminSettings } from './pages/admin/AdminContent.jsx'
import AdminReviews from './pages/admin/AdminReviews.jsx'
import AdminReports from './pages/admin/AdminReports.jsx'

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="agents" element={<AdminAgents />} />
        <Route path="inquiries" element={<AdminInquiries />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="locations" element={<AdminLocations />} />
        <Route path="homepage" element={<AdminHomepage />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:slug" element={<PropertyDetail />} />
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <Sell />
            </ProtectedRoute>
          }
        />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/:slug" element={<AgentDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="listings" element={<MyListings />} />
          <Route path="inquiries" element={<MyInquiries />} />
          <Route path="recent" element={<RecentlyViewed />} />
          <Route path="settings" element={<AccountSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  )
}
