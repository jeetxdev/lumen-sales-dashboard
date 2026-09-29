import { Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { AccountDetail } from './pages/AccountDetail';
import { Accounts } from './pages/Accounts';
import { Inventory } from './pages/Inventory';
import { Invoices } from './pages/Invoices';
import { More } from './pages/More';
import { NotFound } from './pages/NotFound';
import { OrderDetail } from './pages/OrderDetail';
import { Orders } from './pages/Orders';
import { Overview } from './pages/Overview';
import { ProductDetail } from './pages/ProductDetail';
import { Products } from './pages/Products';
import { Promotions } from './pages/Promotions';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Overview />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="accounts/:id" element={<AccountDetail />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:sku" element={<ProductDetail />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="more" element={<More />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
