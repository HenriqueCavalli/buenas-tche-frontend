"use client";

import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { token } = useContext(AuthContext);
	const router = useRouter();

	useEffect(() => {
		if (!token) {
			router.push("/login");
		}
	}, [token, router]);

	if (!token) {
		return null;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
