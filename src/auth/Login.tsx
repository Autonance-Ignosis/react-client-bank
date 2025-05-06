import { Button } from "../ui/button";
import React from "react";
import { LogIn } from "lucide-react";

export default function LoginButton() {
    return (
        <a href="http://localhost:8081/oauth2/authorization/google">
            <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2"
            >
                <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 326667 333333" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd">
                    <path d="M326667 170370c0-13704-1112-23704-3518-34074H166667v61851h91851c-1851 15371-11851 38519-34074 54074l-311 2071 49476 38204 3428 342c31481-29074 49630-71852 49630-122468z" fill="#4285f4" />
                    <path d="M166667 333333c44999 0 82776-14815 110370-40370l-52593-40742c-14074 9815-32963 16667-57777 16667-44074 0-81481-29073-94816-69258l-1954 166-51447 39815-673 1870c27407 54444 83704 91852 148890 91852z" fill="#34a853" />
                    <path d="M71851 199630c-3518-10370-5556-21482-5556-32963 0-11482 2038-22593 5371-32963l-93 2209-52091-40455-1704 811C6482 114444 1 139814 1 166666s6482 52221 17777 73629l54074-40666z" fill="#fbbc04" />
                    <path d="M166667 64444c31296 0 52406 13519 64444 24816l47037-45926C249260 16482 211666 1 166667 1 101481 1 45185 37408 17777 91852l53889 41927c13520-40185 50927-69335 95001-69335z" fill="#ea4335" />
                </svg>
                Sign in with Google
            </Button>

            <Button
                variant="ghost"
                size="icon"

                className="md:hidden"
            >
                <LogIn className="h-5 w-5" />
            </Button>
        </a>
    );
}

