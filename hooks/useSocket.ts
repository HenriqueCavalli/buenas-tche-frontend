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
			});

			socket.on("disconnect", () => {
				setIsConnected(false);
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
