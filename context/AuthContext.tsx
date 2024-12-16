"use client";

import React, {
	createContext,
	useState,
	useEffect,
	ReactNode,
	useMemo,
} from "react";
import api from "../services/api";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // Importação correta
import { JwtPayload } from "../types/jwt";
import { User } from "../types/user";
import axios, { AxiosResponse } from "axios";

interface AuthContextType {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	loading: boolean; // Adicionado
	login: (username: string, password: string) => Promise<void>;
	register: (
		name: string,
		username: string,
		password: string,
	) => Promise<void>;
	logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
	user: null,
	token: null,
	isAuthenticated: false,
	loading: true,
	login: async () => {},
	register: async () => {},
	logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const router = useRouter();

	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		if (storedToken) {
			setToken(storedToken);
			fetchCurrentUser(storedToken);
		} else {
			setLoading(false);
		}
	}, []);

	const fetchCurrentUser = async (token: string) => {
		try {
			const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
			const userId = decoded.id;

			const currentTime = Date.now() / 1000;
			if (decoded.exp && decoded.exp < currentTime) {
				throw new Error("Token expirado");
			}

			const response: AxiosResponse<User, any> = await api.get<User>(
				`/users/${userId}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			setUser(response.data || null);
		} catch (error) {
			console.error("Erro ao buscar usuário atual:", error);
			logout();
		} finally {
			setLoading(false);
		}
	};

	const login = async (username: string, password: string) => {
		try {
			const response = await api.post<{ token: string }>("/login", {
				username,
				password,
			});
			const { token } = response.data;
			setToken(token);
			localStorage.setItem("token", token);
			await fetchCurrentUser(token);
			router.push("/chat");
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				throw new Error(error.response.data.message || "Erro no login");
			} else {
				throw new Error("Erro no login");
			}
		}
	};

	const register = async (
		name: string,
		username: string,
		password: string,
	) => {
		try {
			await api.post("/register", { name, username, password });
			router.push("/login");
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				throw new Error(
					error.response.data.message || "Erro no registro",
				);
			} else {
				throw new Error("Erro no registro");
			}
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("token");
		router.push("/login");
	};

	const isAuthenticated = useMemo(() => !!user, [user]);

	// **Não renderizar filhos enquanto estiver carregando**
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>Carregando...</p>
			</div>
		);
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isAuthenticated,
				loading,
				login,
				register,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
