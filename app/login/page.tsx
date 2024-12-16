"use client";

import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Link from "next/link";
import Swal from "sweetalert2";

export default function LoginPage() {
	const { login } = useContext(AuthContext);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await login(username, password);
			Swal.fire({
				position: "top-end",
				icon: "success",
				title: "Login bem-sucedido!",
				showConfirmButton: false,
				timer: 2000,
				toast: true,
			});
		} catch (err: any) {
			Swal.fire({
				position: "top-end",
				icon: "error",
				title: err.message || "Erro no Login",
				showConfirmButton: false,
				timer: 2000,
				toast: true,
			});
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen">
			<form
				onSubmit={handleSubmit}
				className="bg-white p-6 rounded shadow-md w-full max-w-sm"
			>
				<h2 className="text-2xl mb-4 text-center">Login</h2>
				<div className="mb-4">
					<label className="block mb-1">Username</label>
					<input
						type="text"
						className="w-full border px-3 py-2 rounded"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
				</div>
				<div className="mb-4">
					<label className="block mb-1">Password</label>
					<input
						type="password"
						className="w-full border px-3 py-2 rounded"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>
				<button
					type="submit"
					className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
				>
					Entrar
				</button>
				<p className="mt-4 text-center">
					Não tem uma conta?{" "}
					<Link href="/register" className="text-blue-500">
						Registre-se
					</Link>
				</p>
			</form>
		</div>
	);
}
