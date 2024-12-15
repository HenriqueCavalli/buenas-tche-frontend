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
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "../types/jwt";
import { User } from "../types/user";
import axios from "axios"; 

interface AuthContextType {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
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
	login: async () => {},
	register: async () => {},
	logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		if (storedToken) {
			setToken(storedToken);
			fetchCurrentUser(storedToken);
		}
	}, []);

	const fetchCurrentUser = async (token: string) => {
		try {
			const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
			const userId = decoded.id;

			const response = await api.get<User[]>("/users");
			const currentUser =
				response.data.find((u) => u._id === userId) || null;
			setUser(currentUser);
		} catch (error) {
			console.error("Erro ao buscar usuário atual:", error);
			logout();
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

	return (
		<AuthContext.Provider
			value={{ user, token, isAuthenticated, login, register, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
};
