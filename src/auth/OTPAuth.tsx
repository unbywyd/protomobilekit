import React, { useState, useCallback } from 'react'
import { cn } from '../ui/utils'
import { useTheme } from '../ui/theme'
import { Screen } from '../ui/Screen'
import { Header, BackButton } from '../ui/Header'
import { Button } from '../ui/Button'
import { Text } from '../ui/Text'
import { PhoneInput } from '../forms/inputs/PhoneInput'
import { OTPInput } from '../forms/inputs/OTPInput'
import { useAuth } from './hooks'
import { getAllAppUsers } from './registry'
import type { AuthUser } from './types'

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
  className,
}: OTPAuthProps) {
  const { colors, platform } = useTheme()
  const isIOS = platform === 'ios'
  const { login } = useAuth({ namespace })

  const [step, setStep] = useState<OTPAuthStep>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState(defaultRole)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Phone step
  const handlePhoneSubmit = useCallback(async () => {
    setError(null)

    // Validate phone
    if (!phone || phone.length < 10) {
      setError('Enter a valid phone number')
      return
    }

    if (validatePhone) {
      const result = validatePhone(phone)
      if (result !== true) {
        setError(typeof result === 'string' ? result : 'Invalid phone number')
        return
      }
    }

    setLoading(true)
    try {
      if (onSendOTP) {
        await onSendOTP(phone)
      }
      setStep('code')
    } catch (e) {
      setError('Failed to send code')
    } finally {
      setLoading(false)
    }
  }, [phone, validatePhone, onSendOTP])

  // OTP step
  const handleCodeSubmit = useCallback(async () => {
    setError(null)

    if (code.length !== otpLength) {
      setError(`Enter ${otpLength}-digit code`)
      return
    }

    setLoading(true)
    try {
      // Default: accept any code in demo mode
      const isValid = validateOTP
        ? await validateOTP(code, phone)
        : code.length === otpLength

      if (!isValid) {
        setError('Invalid code')
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
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }, [code, otpLength, validateOTP, phone, skipProfile, selectedRole, login, onSuccess])

  // Profile step
  const handleProfileSubmit = useCallback(() => {
    setError(null)

    if (!name.trim()) {
      setError('Enter your name')
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
  }, [name, phone, selectedRole, login, onSuccess])

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
      <div className="flex-1 flex flex-col px-6 pt-8">
        {/* Phone Step */}
        {step === 'phone' && (
          <>
            <Text size="xl" bold className="mb-2">
              Enter your phone
            </Text>
            <Text secondary className="mb-6">
              We'll send you a verification code
            </Text>

            <PhoneInput
              value={phone}
              onChange={setPhone}
              defaultCountry={countryCode}
              error={error}
              autoFocus
            />

            <div className="mt-auto pb-safe-bottom pb-6">
              <Button
                fullWidth
                size="lg"
                onClick={handlePhoneSubmit}
                disabled={loading || !phone}
              >
                {loading ? 'Sending...' : 'Continue'}
              </Button>
            </div>
          </>
        )}

        {/* OTP Step */}
        {step === 'code' && (
          <>
            <Text size="xl" bold className="mb-2">
              Enter code
            </Text>
            <Text secondary className="mb-6">
              Sent to {phone}
            </Text>

            <div className="flex justify-center mb-4">
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

            <button
              onClick={() => {
                setCode('')
                onSendOTP?.(phone)
              }}
              className="text-center py-2"
              style={{ color: colors.primary }}
            >
              <Text primary size="sm">Resend code</Text>
            </button>

            <div className="mt-auto pb-safe-bottom pb-6">
              <Button
                fullWidth
                size="lg"
                onClick={handleCodeSubmit}
                disabled={loading || code.length !== otpLength}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </>
        )}

        {/* Profile Step */}
        {step === 'profile' && (
          <>
            <Text size="xl" bold className="mb-2">
              Complete profile
            </Text>
            <Text secondary className="mb-6">
              Tell us about yourself
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
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                autoFocus
                className="w-full transition-colors focus:outline-none"
                style={{
                  height: isIOS ? 44 : 48,
                  paddingLeft: 14,
                  paddingRight: 14,
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
                  I am a
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
                Complete
              </Button>
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}

OTPAuth.displayName = 'OTPAuth'
