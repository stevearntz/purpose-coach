import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface InvitationEmailProps {
  inviteUrl: string;
  recipientName?: string;
  recipientEmail: string;
  companyName: string;
  companyLogo?: string;
  inviterName?: string;
  personalMessage?: string;
}

export const InvitationEmail = ({
  inviteUrl,
  recipientName,
  recipientEmail,
  companyName,
  companyLogo,
  inviterName,
  personalMessage,
}: InvitationEmailProps) => {
  const previewText = `You're invited to join ${companyName} on Campfire`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with logo */}
          <Section style={logoSection}>
            {companyLogo ? (
              <Img
                src={companyLogo}
                alt={`${companyName} Logo`}
                style={companyLogoStyle}
              />
            ) : (
              <>
                <Img
                  src="https://tools.getcampfire.com/campfire-logo-new.png"
                  alt="Campfire"
                  width="150"
                  height="40"
                  style={logo}
                />
                {/* Fallback text if image doesn't load */}
                <Text style={logoFallback}>Campfire</Text>
              </>
            )}
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Heading style={heading}>
              Welcome to {companyName}'s Leadership Development Platform
            </Heading>

            <Text style={paragraph}>
              Hi {recipientName || 'there'},
            </Text>

            <Text style={paragraph}>
              {inviterName 
                ? `${inviterName} has invited you to join ${companyName} on Campfire, our leadership development and assessment platform.`
                : `You've been invited to join ${companyName} on Campfire, our leadership development and assessment platform.`
              }
            </Text>

            {personalMessage && (
              <Section style={messageBox}>
                <Text style={messageText}>
                  <strong>Personal message:</strong><br />
                  {personalMessage}
                </Text>
              </Section>
            )}

            <Text style={paragraph}>
              Campfire provides personalized coaching tools and assessments to help you grow as a leader and achieve your professional goals.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={inviteUrl}>
                Accept Invitation & Get Started
              </Button>
            </Section>

            <Text style={smallText}>
              Or copy and paste this link into your browser:
            </Text>
            <Link href={inviteUrl} style={link}>
              {inviteUrl}
            </Link>

            <Hr style={hr} />

            <Text style={paragraph}>
              <strong>What happens next?</strong>
            </Text>
            <Text style={listItem}>
              • Click the link above to accept your invitation
            </Text>
            <Text style={listItem}>
              • Create your secure account with a password
            </Text>
            <Text style={listItem}>
              • Access your personalized dashboard
            </Text>
            <Text style={listItem}>
              • Start exploring leadership development tools
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              This invitation was sent to {recipientEmail}. If you believe this was sent in error, you can safely ignore this email.
            </Text>

            <Text style={footer}>
              Need help? Contact your HR team or visit{' '}
              <Link href="https://getcampfire.com" style={link}>
                getcampfire.com
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Campfire. All rights reserved.
            </Text>
            {companyLogo && (
              <Text style={footerText}>
                Powered by Campfire
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f7f7f7',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const logoSection = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const logo = {
  height: '40px',
  width: 'auto',
  margin: '0 auto',
};

const logoFallback = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#8b5cf6',
  textAlign: 'center' as const,
  margin: '0',
  display: 'none', // Hidden by default, shown if image fails
};

const companyLogoStyle = {
  height: '60px',
  width: 'auto',
  maxWidth: '200px',
};

const content = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '32px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#333333',
  lineHeight: '1.3',
  marginBottom: '24px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#555555',
  marginBottom: '16px',
};

const messageBox = {
  backgroundColor: '#f0f7ff',
  borderLeft: '4px solid #3b82f6',
  padding: '16px',
  marginBottom: '24px',
  borderRadius: '4px',
};

const messageText = {
  fontSize: '15px',
  lineHeight: '22px',
  color: '#555555',
  margin: '0',
};

const listItem = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#555555',
  marginBottom: '8px',
  marginLeft: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#8b5cf6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  border: 'none',
};

const smallText = {
  fontSize: '14px',
  color: '#777777',
  marginTop: '16px',
  marginBottom: '8px',
};

const link = {
  color: '#8b5cf6',
  textDecoration: 'underline',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '32px 0',
};

const footer = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#888888',
  marginTop: '16px',
};

const footerSection = {
  textAlign: 'center' as const,
  padding: '24px 20px 0',
};

const footerText = {
  fontSize: '12px',
  color: '#999999',
  margin: '4px 0',
};

export default InvitationEmail;