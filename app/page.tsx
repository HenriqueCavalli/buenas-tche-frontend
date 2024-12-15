"use client";

import { useRouter } from "next/navigation";
import { useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
	const router = useRouter();
	const { isAuthenticated } = useContext(AuthContext);

	useEffect(() => {
		if (isAuthenticated) {
			router.push("/chat");
		} else {
			router.push("/login");
		}
	}, [isAuthenticated, router]);

	return null;
};

export default Home;
