import { createContext } from "react";
import type { AuthContextType } from "../types/auth";

// Tạo context và export
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
