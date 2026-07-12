import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { DemoPage } from './pages/DemoPage';
import { Home } from './pages/Home';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/demo/:slug" element={<DemoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
