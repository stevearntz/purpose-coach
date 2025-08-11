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

interface AssessmentInvitationEmailProps {
  userName: string;
  inviterName: string;
  companyName: string;
  companyLogo?: string;
  inviteUrl: string;
  personalMessage?: string;
  assessmentName: string;
  deadline?: string | null;
}

// Assessment gradients/colors
const assessmentColors: Record<string, { primary: string; secondary: string }> = {
  'HR Partnership Assessment': { primary: '#30C7C7', secondary: '#2A74B9' },
  'Trust Audit': { primary: '#FFA62A', secondary: '#DB4839' },
  'Burnout Assessment': { primary: '#74DEDE', secondary: '#30B859' },
  'Team Charter': { primary: '#FF6B6B', secondary: '#4ECDC4' },
  'Change Style Profile': { primary: '#F595B6', secondary: '#BF4C74' },
  'Decision Making Audit': { primary: '#6DC7FF', secondary: '#3C36FF' },
  'User Guide': { primary: '#30C7C7', secondary: '#2A74B9' },
};

export const AssessmentInvitationEmail = ({
  userName,
  inviterName,
  companyName,
  companyLogo,
  inviteUrl,
  personalMessage,
  assessmentName,
  deadline,
}: AssessmentInvitationEmailProps) => {
  const previewText = `${inviterName} invited you to complete the ${assessmentName}`;
  const colors = assessmentColors[assessmentName] || { primary: '#8b5cf6', secondary: '#7c3aed' };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Assessment Header with Gradient */}
          <Section style={{
            ...assessmentHeader,
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          }}>
            <Img
              src="https://tools.getcampfire.com/icons/lightbulb-white.png"
              alt=""
              width="60"
              height="60"
              style={assessmentIcon}
            />
            <Heading style={assessmentTitle}>
              {assessmentName}
            </Heading>
            <Text style={assessmentSubtitle}>
              {assessmentName === 'HR Partnership Assessment' 
                ? 'Help us understand where you need support most, so we can better partner with you.'
                : `Complete your ${assessmentName} assessment`
              }
            </Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Text style={paragraph}>
              Hi {userName},
            </Text>

            <Text style={paragraph}>
              {inviterName} has invited you to complete the <strong>{assessmentName}</strong> as part of {companyName}'s leadership development initiative.
            </Text>

            {personalMessage && (
              <Section style={messageBox}>
                <Text style={messageText}>
                  <strong>Message from {inviterName}:</strong><br />
                  {personalMessage}
                </Text>
              </Section>
            )}

            {deadline && (
              <Section style={deadlineBox}>
                <Text style={deadlineText}>
                  <strong>📅 Please complete by: {deadline}</strong>
                </Text>
              </Section>
            )}

            <Section style={buttonContainer}>
              <Button 
                style={{
                  ...button,
                  backgroundColor: colors.primary,
                }} 
                href={inviteUrl}
              >
                Start Assessment
              </Button>
            </Section>

            <Text style={smallText}>
              Or copy and paste this link into your browser:
            </Text>
            <Link href={inviteUrl} style={{...link, color: colors.primary}}>
              {inviteUrl}
            </Link>

            <Hr style={hr} />

            <Text style={paragraph}>
              <strong>What to expect:</strong>
            </Text>
            <Text style={listItem}>
              • Takes approximately 10-15 minutes to complete
            </Text>
            <Text style={listItem}>
              • Your responses help us understand your needs
            </Text>
            <Text style={listItem}>
              • Results will be shared with {inviterName} to improve support
            </Text>
            <Text style={listItem}>
              • All responses are confidential within your organization
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              This assessment invitation was sent by {inviterName} from {companyName}. 
              If you have questions about this assessment, please contact them directly.
            </Text>

            <Text style={footer}>
              Powered by{' '}
              <Link href="https://getcampfire.com" style={link}>
                Campfire
              </Link>
              {' '}• Leadership Development Platform
            </Text>
          </Section>

          {/* Footer with company branding */}
          {companyLogo && !companyLogo.toLowerCase().includes('.svg') && (
            <Section style={footerSection}>
              <Img
                src={companyLogo}
                alt={companyName}
                style={footerLogo}
              />
            </Section>
          )}
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

const assessmentHeader = {
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  padding: '48px 32px',
  textAlign: 'center' as const,
};

const assessmentIcon = {
  margin: '0 auto 16px',
  display: 'block',
};

const assessmentTitle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#ffffff',
  lineHeight: '1.2',
  margin: '0 0 12px 0',
};

const assessmentSubtitle = {
  fontSize: '16px',
  color: '#ffffff',
  opacity: 0.95,
  lineHeight: '24px',
  margin: '0',
  maxWidth: '400px',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const content = {
  backgroundColor: '#ffffff',
  borderBottomLeftRadius: '8px',
  borderBottomRightRadius: '8px',
  padding: '32px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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

const deadlineBox = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
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

const deadlineText = {
  fontSize: '15px',
  lineHeight: '22px',
  color: '#92400e',
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
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
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

const footerLogo = {
  height: '40px',
  width: 'auto',
  maxWidth: '150px',
  opacity: 0.6,
};

export default AssessmentInvitationEmail;