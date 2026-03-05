import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@workspace/sanity-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, userId } = body

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: 'courseId and userId are required' },
        { status: 400 }
      )
    }

    // Find enrollment
    const enrollment = await serverClient.fetch(
      `*[_type == "enrollment" && courseId == $courseId && userId == $userId][0]`,
      { courseId, userId }
    )

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    if (enrollment.completed) {
      return NextResponse.json(
        { message: 'Course already completed' },
        { status: 200 }
      )
    }

    // Mark as completed
    await serverClient
      .patch(enrollment._id)
      .set({
        completed: true,
        completedAt: new Date().toISOString(),
        'progress.completionPercentage': 100,
      })
      .commit()

    // Update course stats
    const currentStats = await serverClient.fetch(
      `*[_type == "course" && i18n.current == $courseId][0].stats`,
      { courseId }
    )

    await serverClient
      .patch(courseId)
      .set({
        'stats.totalCompletions': (currentStats?.totalCompletions || 0) + 1,
      })
      .commit()

    return NextResponse.json(
      { message: 'Course completed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete course' },
      { status: 500 }
    )
  }
}