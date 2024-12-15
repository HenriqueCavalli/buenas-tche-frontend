import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
	title: "Buenas, tchê!",
	description: "Aplicação de Chat em Tempo Real",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="pt-BR">
			<body className="bg-gray-100">
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
