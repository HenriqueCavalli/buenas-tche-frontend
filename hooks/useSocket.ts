import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useSocket = (token: string | null) => {
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (token && !socket) {
			socket = io(
				process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
				{
					auth: { token },
				},
			);

			socket.on("connect", () => {
				setIsConnected(true);
				console.log("Conectado ao Socket.io");
			});

			socket.on("disconnect", () => {
				setIsConnected(false);
				console.log("Desconectado do Socket.io");
			});
		}

		return () => {
			if (socket) {
				socket.disconnect();
				socket = null;
			}
		};
	}, [token]);

	return { socket, isConnected };
};
