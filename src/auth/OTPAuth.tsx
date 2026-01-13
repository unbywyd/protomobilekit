import React, { useState, useCallback, useEffect } from 'react'
import { cn } from '../ui/utils'
import { useTheme } from '../ui/theme'
import { Screen } from '../ui/Screen'
import { Header, BackButton } from '../ui/Header'
import { Button } from '../ui/Button'
import { Text } from '../ui/Text'
import { BottomSheet } from '../ui/BottomSheet'
import { PhoneInput } from '../forms/inputs/PhoneInput'
import { OTPInput } from '../forms/inputs/OTPInput'
import { useAuth } from './hooks'
import { getAllAppUsers } from './registry'
import type { AuthUser } from './types'

const LOREM_IPSUM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`

/**
 * Find a test user by phone number across all apps
 */
function findUserByPhone(phone: string): AuthUser | null {
  const allApps = getAllAppUsers()

  for (const [, { users }] of allApps) {
    for (const user of users) {
      // Normalize phone numbers for comparison (remove spaces, dashes)
      const normalizedUserPhone = user.phone?.replace(/[\s\-\(\)]/g, '')
      const normalizedInputPhone = phone.replace(/[\s\-\(\)]/g, '')

      if (normalizedUserPhone && normalizedUserPhone === normalizedInputPhone) {
        // Return user data as AuthUser
        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        }
      }
    }
  }

  return null
}

export type OTPAuthStep = 'phone' | 'code' | 'profile'

export interface OTPAuthProps {
  /** Called on successful auth, receives the user */
  onSuccess: (user: AuthUser) => void
  /** Called when user goes back from first step */
  onBack?: () => void
  /** Default role for new users */
  defaultRole?: string
  /** Skip profile step and auto-create user */
  skipProfile?: boolean
  /** Custom phone validation */
  validatePhone?: (phone: string) => boolean | string
  /** Custom OTP validation (for demo - check code) */
  validateOTP?: (code: string, phone: string) => boolean | Promise<boolean>
  /** Simulate OTP send (for demo) */
  onSendOTP?: (phone: string) => void | Promise<void>
  /** Auth namespace */
  namespace?: string
  /** Country code for phone input */
  countryCode?: string
  /** OTP length */
  otpLength?: number
  /** Custom header title */
  title?: string
  /** Show role selector in profile step */
  showRoleSelector?: boolean
  /** Available roles for selector */
  roles?: Array<{ value: string; label: string }>
  /** Show Terms of Use / Privacy Policy links */
  showLegalLinks?: boolean
  /** Terms of Use title */
  termsTitle?: string
  /** Privacy Policy title */
  privacyTitle?: string
  /** Terms of Use content (defaults to Lorem Ipsum) */
  termsContent?: React.ReactNode
  /** Privacy Policy content (defaults to Lorem Ipsum) */
  privacyContent?: React.ReactNode
  /** "Wrong number?" link text */
  wrongNumberText?: string
  /** "Resend code" link text */
  resendText?: string
  /** Resend cooldown in seconds */
  resendCooldown?: number
  /** Text direction (ltr/rtl) */
  dir?: 'ltr' | 'rtl'
  /** i18n texts */
  texts?: {
    /** Phone step title */
    phoneTitle?: string
    /** Phone step subtitle */
    phoneSubtitle?: string
    /** Continue button */
    continueButton?: string
    /** Sending... button state */
    sendingButton?: string
    /** Legal text prefix */
    legalPrefix?: string
    /** Legal text "and" */
    legalAnd?: string
    /** Code step title */
    codeTitle?: string
    /** Code step subtitle (use {phone} as placeholder) */
    codeSubtitle?: string
    /** Verify button */
    verifyButton?: string
    /** Verifying... button state */
    verifyingButton?: string
    /** Profile step title */
    profileTitle?: string
    /** Profile step subtitle */
    profileSubtitle?: string
    /** Name label */
    nameLabel?: string
    /** Name placeholder */
    namePlaceholder?: string
    /** Role label */
    roleLabel?: string
    /** Complete button */
    completeButton?: string
    /** Error: invalid phone */
    errorInvalidPhone?: string
    /** Error: invalid code */
    errorInvalidCode?: string
    /** Error: enter name */
    errorEnterName?: string
    /** Error: failed to send */
    errorFailedToSend?: string
    /** Error: verification failed */
    errorVerificationFailed?: string
    /** BottomSheet cancel button */
    cancelButton?: string
  }
  className?: string
}

/**
 * OTPAuth - Complete OTP authentication flow
 *
 * Includes:
 * 1. Phone number input
 * 2. OTP code verification
 * 3. Profile completion (optional)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <OTPAuth
 *   onSuccess={(user) => navigate('home')}
 *   defaultRole="customer"
 * />
 *
 * // With role selection
 * <OTPAuth
 *   onSuccess={(user) => navigate('home')}
 *   showRoleSelector
 *   roles={[
 *     { value: 'customer', label: 'Customer' },
 *     { value: 'courier', label: 'Courier' },
 *   ]}
 * />
 *
 * // Demo mode with any code accepted
 * <OTPAuth
 *   onSuccess={handleSuccess}
 *   validateOTP={() => true}
 *   skipProfile
 * />
 * ```
 */
export function OTPAuth({
  onSuccess,
  onBack,
  defaultRole = 'user',
  skipProfile = false,
  validatePhone,
  validateOTP,
  onSendOTP,
  namespace,
  countryCode = 'RU',
  otpLength = 4,
  title = 'Sign In',
  showRoleSelector = false,
  roles = [
    { value: 'customer', label: 'Customer' },
    { value: 'courier', label: 'Courier' },
    { value: 'admin', label: 'Admin' },
  ],
  showLegalLinks = true,
  termsTitle = 'Terms of Use',
  privacyTitle = 'Privacy Policy',
  termsContent,
  privacyContent,
  wrongNumberText = 'Wrong number?',
  resendText = 'Resend code',
  resendCooldown = 60,
  dir,
  texts = {},
  className,
}: OTPAuthProps) {
  const { colors, platform } = useTheme()
  const isIOS = platform === 'ios'
  const { login } = useAuth({ namespace })

  // Merge texts with defaults
  const t = {
    phoneTitle: texts.phoneTitle || 'Enter your phone',
    phoneSubtitle: texts.phoneSubtitle || "We'll send you a verification code",
    continueButton: texts.continueButton || 'Continue',
    sendingButton: texts.sendingButton || 'Sending...',
    legalPrefix: texts.legalPrefix || 'By continuing, you agree to our',
    legalAnd: texts.legalAnd || 'and',
    codeTitle: texts.codeTitle || 'Enter code',
    codeSubtitle: texts.codeSubtitle || 'Sent to {phone}',
    verifyButton: texts.verifyButton || 'Verify',
    verifyingButton: texts.verifyingButton || 'Verifying...',
    profileTitle: texts.profileTitle || 'Complete profile',
    profileSubtitle: texts.profileSubtitle || 'Tell us about yourself',
    nameLabel: texts.nameLabel || 'Your name',
    namePlaceholder: texts.namePlaceholder || 'John Doe',
    roleLabel: texts.roleLabel || 'I am a',
    completeButton: texts.completeButton || 'Complete',
    errorInvalidPhone: texts.errorInvalidPhone || 'Enter a valid phone number',
    errorInvalidCode: texts.errorInvalidCode || `Enter ${otpLength}-digit code`,
    errorEnterName: texts.errorEnterName || 'Enter your name',
    errorFailedToSend: texts.errorFailedToSend || 'Failed to send code',
    errorVerificationFailed: texts.errorVerificationFailed || 'Verification failed',
    cancelButton: texts.cancelButton || undefined,
  }

  // RTL support
  const isRTL = dir === 'rtl'

  const [step, setStep] = useState<OTPAuthStep>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState(defaultRole)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Legal sheets state
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  // Resend cooldown state
  const [resendTimer, setResendTimer] = useState(0)

  // Resend cooldown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Phone step
  const handlePhoneSubmit = useCallback(async () => {
    setError(null)

    // Validate phone
    if (!phone || phone.length < 10) {
      setError(t.errorInvalidPhone)
      return
    }

    if (validatePhone) {
      const result = validatePhone(phone)
      if (result !== true) {
        setError(typeof result === 'string' ? result : t.errorInvalidPhone)
        return
      }
    }

    setLoading(true)
    try {
      if (onSendOTP) {
        await onSendOTP(phone)
      }
      setStep('code')
      setResendTimer(resendCooldown)
    } catch (e) {
      setError(t.errorFailedToSend)
    } finally {
      setLoading(false)
    }
  }, [phone, validatePhone, onSendOTP, resendCooldown])

  // OTP step
  const handleCodeSubmit = useCallback(async () => {
    setError(null)

    if (code.length !== otpLength) {
      setError(t.errorInvalidCode)
      return
    }

    setLoading(true)
    try {
      // Default: accept any code in demo mode
      const isValid = validateOTP
        ? await validateOTP(code, phone)
        : code.length === otpLength

      if (!isValid) {
        setError(t.errorInvalidCode)
        setLoading(false)
        return
      }

      // Try to find existing test user by phone
      const existingUser = findUserByPhone(phone)

      if (existingUser) {
        // Use test user data
        login(existingUser)
        onSuccess(existingUser)
      } else if (skipProfile) {
        // Auto-create user and complete
        const user: AuthUser = {
          id: `user_${Date.now()}`,
          phone,
          role: selectedRole,
        }
        login(user)
        onSuccess(user)
      } else {
        setStep('profile')
      }
    } catch (e) {
      setError(t.errorVerificationFailed)
    } finally {
      setLoading(false)
    }
  }, [code, otpLength, validateOTP, phone, skipProfile, selectedRole, login, onSuccess, t.errorInvalidCode, t.errorVerificationFailed])

  // Profile step
  const handleProfileSubmit = useCallback(() => {
    setError(null)

    if (!name.trim()) {
      setError(t.errorEnterName)
      return
    }

    const user: AuthUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      phone,
      role: selectedRole,
    }

    login(user)
    onSuccess(user)
  }, [name, phone, selectedRole, login, onSuccess, t.errorEnterName])

  // Go back
  const handleBack = useCallback(() => {
    setError(null)
    if (step === 'code') {
      setStep('phone')
      setCode('')
    } else if (step === 'profile') {
      setStep('code')
    } else if (onBack) {
      onBack()
    }
  }, [step, onBack])

  const canGoBack = step !== 'phone' || !!onBack

  return (
    <Screen
      header={
        <Header
          title={title}
          left={canGoBack ? <BackButton onPress={handleBack} /> : undefined}
        />
      }
      className={className}
    >
      <div className="flex-1 flex flex-col px-6 pt-8" dir={dir}>
        {/* Phone Step */}
        {step === 'phone' && (
          <>
            <Text size="xl" bold className="mb-2">
              {t.phoneTitle}
            </Text>
            <Text secondary className="mb-6">
              {t.phoneSubtitle}
            </Text>

            {/* Phone input - always LTR */}
            <div dir="ltr">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                defaultCountry={countryCode}
                error={error}
                autoFocus
              />
            </div>

            <div className="mt-auto pb-safe-bottom pb-6">
              <Button
                fullWidth
                size="lg"
                onClick={handlePhoneSubmit}
                disabled={loading || !phone}
              >
                {loading ? t.sendingButton : t.continueButton}
              </Button>

              {/* Legal links */}
              {showLegalLinks && (
                <div className="flex justify-center gap-1 mt-4 flex-wrap">
                  <Text size="xs" secondary>
                    {t.legalPrefix}
                  </Text>
                  <button
                    onClick={() => setTermsOpen(true)}
                    className="text-xs"
                    style={{ color: colors.primary }}
                  >
                    {termsTitle}
                  </button>
                  <Text size="xs" secondary>
                    {t.legalAnd}
                  </Text>
                  <button
                    onClick={() => setPrivacyOpen(true)}
                    className="text-xs"
                    style={{ color: colors.primary }}
                  >
                    {privacyTitle}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* OTP Step */}
        {step === 'code' && (
          <>
            <Text size="xl" bold className="mb-2">
              {t.codeTitle}
            </Text>
            <Text secondary className="mb-6">
              {t.codeSubtitle.replace('{phone}', phone)}
            </Text>

            {/* OTP input - always LTR */}
            <div className="flex justify-center mb-4" dir="ltr">
              <OTPInput
                value={code}
                onChange={setCode}
                length={otpLength}
                error={error}
                autoFocus
                onComplete={handleCodeSubmit}
              />
            </div>

            {error && (
              <Text danger center size="sm" className="mb-4">
                {error}
              </Text>
            )}

            {/* Wrong number + Resend links */}
            <div className="flex justify-center gap-4 mt-2">
              <button
                onClick={() => {
                  setStep('phone')
                  setCode('')
                  setError(null)
                }}
                className="text-sm py-2"
                style={{ color: colors.primary }}
              >
                {wrongNumberText}
              </button>
              <button
                onClick={() => {
                  if (resendTimer === 0) {
                    setCode('')
                    setResendTimer(resendCooldown)
                    onSendOTP?.(phone)
                  }
                }}
                className="text-sm py-2"
                style={{
                  color: resendTimer > 0 ? colors.textSecondary : colors.primary,
                }}
                disabled={resendTimer > 0}
              >
                {resendTimer > 0 ? `${resendText} (${resendTimer}s)` : resendText}
              </button>
            </div>

            <div className="mt-auto pb-safe-bottom pb-6">
              <Button
                fullWidth
                size="lg"
                onClick={handleCodeSubmit}
                disabled={loading || code.length !== otpLength}
              >
                {loading ? t.verifyingButton : t.verifyButton}
              </Button>
            </div>
          </>
        )}

        {/* Profile Step */}
        {step === 'profile' && (
          <>
            <Text size="xl" bold className="mb-2">
              {t.profileTitle}
            </Text>
            <Text secondary className="mb-6">
              {t.profileSubtitle}
            </Text>

            {/* Name input */}
            <div className="mb-4">
              <label
                className={cn(
                  'block mb-1.5 font-medium',
                  isIOS ? 'text-sm' : 'text-xs uppercase tracking-wide'
                )}
                style={{ color: colors.textSecondary }}
              >
                {t.nameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                autoFocus
                className="w-full transition-colors focus:outline-none"
                style={{
                  height: isIOS ? 44 : 48,
                  paddingInlineStart: 14,
                  paddingInlineEnd: 14,
                  fontSize: 16,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: error ? colors.danger : colors.border,
                  borderRadius: isIOS ? 10 : 8,
                  color: colors.text,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? colors.danger : colors.border
                }}
              />
            </div>

            {/* Role selector */}
            {showRoleSelector && (
              <div className="mb-4">
                <label
                  className={cn(
                    'block mb-1.5 font-medium',
                    isIOS ? 'text-sm' : 'text-xs uppercase tracking-wide'
                  )}
                  style={{ color: colors.textSecondary }}
                >
                  {t.roleLabel}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all',
                        selectedRole === role.value ? 'shadow-sm' : ''
                      )}
                      style={{
                        backgroundColor: selectedRole === role.value
                          ? colors.primary
                          : colors.surfaceSecondary,
                        color: selectedRole === role.value
                          ? '#FFFFFF'
                          : colors.text,
                      }}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <Text danger size="sm" className="mb-4">
                {error}
              </Text>
            )}

            <div className="mt-auto pb-safe-bottom pb-6">
              <Button
                fullWidth
                size="lg"
                onClick={handleProfileSubmit}
                disabled={!name.trim()}
              >
                {t.completeButton}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Terms of Use BottomSheet */}
      <BottomSheet
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        title={termsTitle}
        cancelText={t.cancelButton}
        height="half"
      >
        <div className="p-4" dir={dir}>
          <Text secondary style={{ lineHeight: 1.6 }}>
            {termsContent || LOREM_IPSUM}
          </Text>
        </div>
      </BottomSheet>

      {/* Privacy Policy BottomSheet */}
      <BottomSheet
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        title={privacyTitle}
        cancelText={t.cancelButton}
        height="half"
      >
        <div className="p-4" dir={dir}>
          <Text secondary style={{ lineHeight: 1.6 }}>
            {privacyContent || LOREM_IPSUM}
          </Text>
        </div>
      </BottomSheet>
    </Screen>
  )
}

OTPAuth.displayName = 'OTPAuth'
