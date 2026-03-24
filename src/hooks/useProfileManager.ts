'use client'

import { useAuth } from '../contexts/AuthContext'
import { userApi } from '../services/userApi'
import type { UserProfile } from '../models/UserModel'

interface UpdateAccountTypeOptions {
  roleAlso?: boolean
}

export function useProfileManager() {
  const { saveUserProfile } = useAuth()

  const updateAccountType = async (
    accountType: 'student' | 'teacher',
    options: UpdateAccountTypeOptions = { roleAlso: true }
  ) => {
    await saveUserProfile({ accountType })
    if (options.roleAlso) {
      await userApi.updateMe({ role: accountType })
    }
  }

  const updateProfile = async (profile: Partial<UserProfile>) => {
    await saveUserProfile(profile)
  }

  return {
    updateAccountType,
    updateProfile,
  }
}

