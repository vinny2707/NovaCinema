// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/common/ToastProvider";
import MainLayout from "./components/layout/MainLayout";
import ManagementLayout from "./components/layout/ManagementLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import HomePage from "./pages/HomePage";
import MovieDetailPage from "./pages/MovieDetailPage";
import AuthPage from "./pages/AuthPage";
import NowShowingPage from "./pages/NowShowingPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import AboutUsPage from "./pages/AboutUsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import DashboardPage from "./pages/management/DashboardPage";
import MoviesManagementPage from "./pages/management/MoviesManagementPage";
import TheatersManagementPage from "./pages/management/TheatersManagementPage";
import RoomsManagementPage from "./pages/management/RoomsManagementPage";
import UsersManagementPage from "./pages/management/UsersManagementPage";
import ShowtimesManagementPage from "./pages/management/ShowtimesManagementPage";
import TicketPricingManagementPage from "./pages/management/TicketPricingManagementPage";
import BookingManagementPage from "./pages/management/BookingManagementPage";

import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import PaymentGatewayPage from "./pages/PaymentGatewayPage";
import NotFoundPage from "./pages/NotFoundPage";

import "./App.css";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Route cha "/" sẽ dùng MainLayout */}
          <Route path="/" element={<MainLayout />}>
            {/* Khi truy cập "/", route con `index` sẽ được render */}
            {/* Đây chính là HomePage, nó sẽ chui vào <Outlet /> của MainLayout */}
            <Route index element={<HomePage />} />

            {/* Thêm các trang khác ở đây sau này, ví dụ: */}
            <Route path="login" element={<AuthPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            {/* <Route path="movie/:id" element={<div>Movie Detail Page</div>} /> */}
            {/* Movie detail */}
            <Route path="movie/:id" element={<MovieDetailPage />} />
            <Route path="now-showing" element={<NowShowingPage />} />
            <Route path="coming-soon" element={<ComingSoonPage />} />
            <Route path="about-us" element={<AboutUsPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="payment-gateway" element={
              <ProtectedRoute>
                <PaymentGatewayPage />
              </ProtectedRoute>
            } />
            <Route path="payments/callback" element={<PaymentStatusPage />} />
            {/* Catch-all route for 404 within main layout */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Management Routes - Protected for Admin only */}
          <Route
            path="/management"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ManagementLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="movies" element={<MoviesManagementPage />} />
            <Route path="theaters" element={<TheatersManagementPage />} />
            <Route path="rooms" element={<RoomsManagementPage />} />
            <Route path="users" element={<UsersManagementPage />} />
            <Route path="showtimes" element={<ShowtimesManagementPage />} />
            <Route path="pricing" element={<TicketPricingManagementPage />} />
            <Route path="bookings" element={<BookingManagementPage />} />
            {/* Catch-all route for 404 within management layout */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
