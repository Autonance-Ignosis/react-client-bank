import React from 'react'
import { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";


export default function Logout() {
    const dispatch = useDispatch();
    const [showProfileCard, setShowProfileCard] = useState(false);
    const { user } = useSelector((state: any) => state.user) || {};
    const navigate = useNavigate();

    const handleLogout = async () => {
        localStorage.removeItem("useremail");
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("classroom-") && key.endsWith("-role")) {
                localStorage.removeItem(key);
            }
        });
        navigate("/");
        try {
            await axios.post(
                `http://localhost:8080/api/user/logout`,
                {},
                { withCredentials: true }
            );

            dispatch({ type: "CLEAR_USER" });
            console.log("Logged out");
        } catch (error) {
            window.location.reload();
            console.error(error);
        }
    };
    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                            <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        {user?.fullName}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        {user?.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={handleLogout}
                    >Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
