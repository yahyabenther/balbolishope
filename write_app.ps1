$content = @'
import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import ProductListPage from "./pages/ProductListPage";
import CategoryPage from "./pages/CategoryPage";
import SearchResults from "./pages/SearchResults";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Account from "./pages/Account";
import { Zap, Percent, TrendingUp, Star } from "lucide-react";

import { ProductProvider } from "./context/ProductContext";
import { OrderProvider } from "./context/OrderContext";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminClients from "./pages/admin/AdminClients";
import AdminSettings from "./pages/admin/adminSettins";
import { SettingsProvider } from "./context/SettingsContext";
import { AdminUsersProvider } from "./context/AdminUsersContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Shop chrome (header/nav/footer/cart drawer) — only rendered around
// customer-facing pages. Admin gets its own layout (AdminLayout) instead,
// so /admin/* doesn't show the shop header, nav, footer, or cart drawer.
function ShopLayout() {
  return (
    <>
      <Header />
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <OrderProvider>
        <SettingsProvider>
          <AdminUsersProvider>
            <ScrollToTop />
            <Routes>
              <Route element={<ShopLayout />}>
                <Route path="/" element={<Home />} />
                <Route
                  path="/new-arrivals"
                  element={<ProductListPage title="Nouveautés" icon={<Zap size={22} />} tagKey="newArrival" />}
                />
                <Route
                  path="/promotions"
                  element={<ProductListPage title="Promotions" icon={<Percent size={22} />} tagKey="promotion" />}
                />
                <Route
                  path="/best-sellers"
                  element={<ProductListPage title="Meilleures Ventes" icon={<TrendingUp size={22} />} tagKey="bestSeller" />}
                />
                <Route
                  path="/featured"
                  element={<ProductListPage title="En Vedette" icon={<Star size={22} />} tagKey="featured" />}
                />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/account" element={<Account />} />
              </Route>

              <Route
                path="/admin"
                element={
                  <ErrorBoundary>
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  </ErrorBoundary>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="clients" element={<AdminClients />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </AdminUsersProvider>
        </SettingsProvider>
      </OrderProvider>
    </ProductProvider>
  );
}

'@
Set-Content -Path "src\\App.jsx" -Value $content -Encoding UTF8
Write-Host "Done. New file written."