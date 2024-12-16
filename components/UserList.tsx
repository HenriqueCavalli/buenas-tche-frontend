"use client";

import React, { useEffect, useState } from "react";
import api from "../services/api";

interface User {
	_id: string;
	name: string;
	username: string;
	online: boolean;
}

interface UserListProps {
	onSelectUser: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser }) => {
	const [users, setUsers] = useState<User[]>([]);

	const fetchUsers = async () => {
		try {
			const response = await api.get("/users");
			setUsers(response.data);
		} catch (error) {
			console.error("Erro ao buscar usuários:", error);
		}
	};

	useEffect(() => {
		fetchUsers();

		const interval = setInterval(fetchUsers, 4000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="p-4 border-r h-full">
			<h3 className="text-xl mb-4">Usuários</h3>
			<ul>
				{users.map((user) => (
					<li
						key={user._id}
						className="flex items-center mb-2 cursor-pointer"
						onClick={() => onSelectUser(user)}
					>
						<span
							className={`h-2 w-2 rounded-full mr-2 ${
								user.online ? "bg-green-500" : "bg-gray-400"
							}`}
						></span>
						<span>
							{user.name} ({user.username})
						</span>
					</li>
				))}
			</ul>
		</div>
	);
};

export default UserList;
