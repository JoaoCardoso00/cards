import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Text,
} from "@react-email/components";

interface MagicLinkEmailProps {
	loginUrl?: string;
}

export const MagicLinkEmail = ({
	loginUrl = "https://example.com",
}: MagicLinkEmailProps) => (
	<Html>
		<Head />
		<Body style={body}>
			<Preview>Log in with this magic link</Preview>
			<Container style={container}>
				<Heading style={heading}>Login</Heading>
				<Link href={loginUrl} target="_blank" style={link}>
					Click here to log in with this magic link
				</Link>
				<Text style={hint}>
					If you didn&apos;t try to login, you can safely ignore this email.
				</Text>
				<Text style={footer}>Cards</Text>
			</Container>
		</Body>
	</Html>
);

const body = {
	backgroundColor: "#f5f5f5",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
	padding: "40px 20px",
};

const container = {
	backgroundColor: "#ffffff",
	borderRadius: "8px",
	margin: "0 auto",
	maxWidth: "480px",
	padding: "40px",
};

const heading = {
	color: "#333",
	fontSize: "24px",
	fontWeight: "600",
	margin: "0 0 24px 0",
	padding: "0",
};

const link = {
	color: "#2754C5",
	display: "block",
	fontSize: "14px",
	marginBottom: "16px",
	textDecoration: "underline",
};

const hint = {
	color: "#ababab",
	fontSize: "13px",
	marginTop: "24px",
};

const footer = {
	color: "#898989",
	fontSize: "12px",
	marginTop: "32px",
	textAlign: "center" as const,
};

export default MagicLinkEmail;
