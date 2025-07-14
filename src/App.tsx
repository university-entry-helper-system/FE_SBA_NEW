import AuthProvider from "./contexts/AuthProvider";
import AppRouter from "../router/AppRouter";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </LocalizationProvider>
  );
}

export default App;
