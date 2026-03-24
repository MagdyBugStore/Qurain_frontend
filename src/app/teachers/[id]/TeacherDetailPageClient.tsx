'use client'

import React from "react";
import { TeacherDetailPage } from '../../../features/teachers/pages/TeacherDetailPage'

// Thin wrapper to keep backwards compatibility with existing route structure
export default function TeacherDetailPageClient() {
  return <TeacherDetailPage />
}
