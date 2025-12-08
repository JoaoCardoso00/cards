"use client"

import { authClient } from "./auth-client"

export function useSession() {
	return authClient.useSession()
}

export function useUser() {
	const { data: session } = useSession()
	return session?.user ?? null
}

export function useIsAuthenticated() {
	const { data: session, isPending } = useSession()
	return {
		isAuthenticated: !!session?.user,
		isPending,
	}
}
