import { HashRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "./components/layout/AppShell";
import { HistoryPage } from "./pages/HistoryPage";
import { WizardPage } from "./pages/WizardPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<WizardPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}
