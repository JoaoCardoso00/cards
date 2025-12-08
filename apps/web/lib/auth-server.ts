import { createAuth } from "@/convex/auth"
import { getToken as getTokenNextjs } from "@convex-dev/better-auth/nextjs"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"

export const getToken = () => getTokenNextjs(createAuth)

export async function getAuthUser() {
	const token = await getToken()
	if (!token) return null
	return fetchQuery(api.auth.getCurrentUser, {}, { token })
}
