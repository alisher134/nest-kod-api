import { Body, Font, Head, Heading, Html } from "@react-email/components";
import * as React from "react";

export interface IResetPasswordProps {
    email: string;
}

const ResetPassword: React.FC<IResetPasswordProps> = ({ email }):React.JSX.Element => {
    return (
        <Html lang="ru">
            <Head>
                <Font 
                    webFont={{
                        url: 'https://fonts.gstatic.com/s/firasans/v11/6xkMeQp4Qp9I5z7Gf-4PQK1dG_Q8T6kgPl6tZWG0L5hd-w5qFPV8Bf9Y7lDLrJ3YwQ.woff2',
                        format: 'woff2',
                    }} 
                    fontFamily="Fira Sans" 
                    fallbackFontFamily="Arial"
                />
                <title>{`Восстановление пароля - ${email}`}</title>
            </Head>
            <Body style={main}>
                <Heading>Восстановление пароля</Heading>
            </Body>
        </Html>
    );
};

const main = {
    color: '#fafafa',
    backgroundColor: '#1c1b21'
};

export default ResetPassword;