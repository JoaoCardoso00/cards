import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { render } from "@react-email/render";
import MagicLinkEmail from "../emails/magic-link";

const siteUrl = process.env.SITE_URL!;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
	ctx: GenericCtx<DataModel>,
	{ optionsOnly } = { optionsOnly: false },
) => {
	return betterAuth({
		// disable logging when createAuth is called just to generate options.
		// this is not required, but there's a lot of noise in logs without it.
		logger: {
			disabled: optionsOnly,
		},
		baseURL: siteUrl,
		database: authComponent.adapter(ctx),
		plugins: [
			// The Convex plugin is required for Convex compatibility
			convex(),
			magicLink({
				sendMagicLink: async ({ email, url }) => {
					const resend = new Resend(process.env.RESEND_API_KEY);
					const html = await render(MagicLinkEmail({ loginUrl: url }));
					await resend.emails.send({
						from: "Cards <cards@joao-cardoso.com>",
						to: email,
						subject: "Sign in to Cards",
						html,
					});
				},
			}),
		],
	});
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return authComponent.getAuthUser(ctx);
	},
});
