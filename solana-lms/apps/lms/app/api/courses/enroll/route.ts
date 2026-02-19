import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@workspace/sanity-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, userId, userEmail } = body

    // Validate required fields
    if (!courseId || !userId) {
      return NextResponse.json(
        { error: 'courseId and userId are required' },
        { status: 400 }
      )
    }

    // Check if enrollment document exists
    const existingEnrollment = await serverClient.fetch(
      `*[_type == "enrollment" && courseId == $courseId && userId == $userId][0]`,
      { courseId, userId }
    )

    if (existingEnrollment) {
      return NextResponse.json(
        { message: 'Already enrolled', enrollment: existingEnrollment },
        { status: 200 }
      )
    }

    // Create enrollment document
    const enrollment = await serverClient.create({
      _type: 'enrollment',
      courseId,
      userId,
      userEmail,
      enrolledAt: new Date().toISOString(),
      completed: false,
      progress: {
        completedLessons: [],
        completionPercentage: 0,
      },
    })

    // Update course stats
    const currentStats = await serverClient.fetch(
      `*[_type == "course" && _id == $courseId][0].stats`,
      { courseId }
    )

    await serverClient
      .patch(courseId)
      .set({
        'stats.totalEnrollments': (currentStats?.totalEnrollments || 0) + 1,
      })
      .commit()

    return NextResponse.json(
      { message: 'Enrolled successfully', enrollment },
      { status: 201 }
    )
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: 'Failed to enroll' },
      { status: 500 }
    )
  }
}