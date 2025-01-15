import {
    Body,
    Button,
    Container,
    Font,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import React from "react";

interface IResetPasswordProps {
    email: string;
    restoreToken:string
}

const API_URL = process.env.APP_URL;
const REACT_URL = process.env.ALLOWED_ORIGIN;

export default function ResetPassword({ email, restoreToken }: IResetPasswordProps):React.JSX.Element {
    return (
        <Html>
        <Head>
            <Font
                webFont={{
                    url: "https://fonts.gstatic.com/s/firasans/v11/6xkMeQp4Qp9I5z7Gf-4PQK1dG_Q8T6kgPl6tZWG0L5hd-w5qFPV8Bf9Y7lDLrJ3YwQ.woff2",
                    format: "woff2",
                }}
                fontFamily="Fira Sans"
                fallbackFontFamily="Arial"
            />
            <title>{`Восстановление пароля - ${email}`}</title>
        </Head>

        <Preview>
            Вы запросили восстановление пароля на Kod.kz. Следуйте инструкции.
        </Preview>

        <Body style={styles.main}>
            <Container style={styles.container}>
                <Img
                    src={`${API_URL}/uploads/default/kod-logo.png`}
                    height="40"
                    alt="Kod.kz"
                    style={styles.logo}
                />
                <Heading style={styles.heading}>Восстановление пароля</Heading>
                <Text style={styles.paragraph}>
                    Вы запросили восстановление пароля. Перейдите по ссылке ниже
                    для внесения нового пароля.
                </Text>
                <Section>
                    <Button
                        style={styles.button}
                        href={`${REACT_URL}/auth/restore?token=${restoreToken}`}
                    >
                        Изменение пароля
                    </Button>
                </Section>
                <Hr style={styles.hr} />
                <Text style={styles.footer}>
                    Kod.kz © 2025. Все права защищены.
                </Text>
            </Container>
        </Body>
    </Html>
    )
}

const styles = {
    main: {
        backgroundColor: "#1c1b21",
        color: "#fafafa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center" as const,
    },
    container: {
        padding: "20px",
        maxWidth: "600px",
        textAlign: "center" as const,
        borderRadius: "5px",
        backgroundColor: "#25232a",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    logo: {
        margin: "0 auto",
        display: "inline-block",
    },
    heading: {
        marginBottom: "20px",
        fontSize: "35px",
    },
    paragraph: {
        fontSize: "16px",
        lineHeight: "24px",
    },
    button: {
        backgroundColor: "#6b37cc",
        borderRadius: "10px",
        color: "#fafafa",
        fontSize: "18px",
        textDecoration: "none",
        textAlign: "center" as const,
        display: "inline-block",
        padding: "12px 24px",
        margin: "20px auto",
    },
    hr: {
        borderColor: "#4d5064",
        margin: "20px 0",
    },
    footer: {
        color: "#8898aa",
        fontSize: "12px",
    },
};
