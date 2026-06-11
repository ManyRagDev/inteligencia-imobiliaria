import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CookiePolicy from "@/pages/CookiePolicy";
import DataProcessing from "@/pages/DataProcessing";
import DataRights from "@/pages/DataRights";
import LegalHub from "@/pages/LegalHub";
import Privacy from "@/pages/Privacy";
import TermsOfUse from "@/pages/TermsOfUse";
import TerceiraInteligencia from "@/pages/TerceiraInteligencia";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TerceiraInteligencia />} />
        <Route path="/3inteligencia" element={<Navigate to="/" replace />} />
        <Route path="/legal" element={<LegalHub />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/tratamento-de-dados" element={<DataProcessing />} />
        <Route path="/direitos-lgpd" element={<DataRights />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/termos" element={<TermsOfUse />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
