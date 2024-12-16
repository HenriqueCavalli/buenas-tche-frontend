"use client";

import { useRouter } from "next/navigation";
import { useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
	const router = useRouter();
	const { isAuthenticated, loading } = useContext(AuthContext);

	useEffect(() => {
		if (!loading) {
			if (isAuthenticated) {
				router.push("/chat");
			} else {
				router.push("/login");
			}
		}
	}, [isAuthenticated, loading, router]);

	if (loading) {
		return <div>Carregando...</div>;
	}

	return null;
};

export default Home;
