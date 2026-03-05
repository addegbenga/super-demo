import { NextRequest, NextResponse } from 'next/server'
import { serverClient} from '@workspace/sanity-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, userId, lessonId } = body

    if (!courseId || !userId || !lessonId) {
      return NextResponse.json(
        { error: 'courseId, userId, and lessonId are required' },
        { status: 400 }
      )
    }

    // Get enrollment
    const enrollment = await serverClient.fetch(
      `*[_type == "enrollment" && courseId == $courseId && userId == $userId][0]`,
      { courseId, userId }
    )

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 }
      )
    }

    // Add lesson to completed lessons if not already there
    const completedLessons = enrollment.progress?.completedLessons || []
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId)

      // Get total lessons in course
      const course = await serverClient.fetch(
        `*[_type == "course" && i18n.current == $courseId][0] {
          "totalLessons": count(modules[]->lessons)
        }`,
        { courseId }
      )

      console.log(course,"coursw")

      const completionPercentage = Math.round(
        (completedLessons.length / course.totalLessons) * 100
      )

      // Update enrollment
      await serverClient
        .patch(enrollment._id)
        .set({
          'progress.completedLessons': completedLessons,
          'progress.completionPercentage': completionPercentage,
          lastActivityAt: new Date().toISOString(),
        })
        .commit()

      return NextResponse.json({
        message: 'Progress updated',
        completedLessons: completedLessons.length,
        totalLessons: course.totalLessons,
        completionPercentage,
      })
    }

    return NextResponse.json({ message: 'Lesson already completed' })
  } catch (error) {
    console.error('Progress error:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

// GET user's progress for a course
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const userId = searchParams.get('userId')

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: 'courseId and userId are required' },
        { status: 400 }
      )
    }

    const enrollment = await serverClient.fetch(
      `*[_type == "enrollment" && courseId == $courseId && userId == $userId][0]`,
      { courseId, userId }
    )

    return NextResponse.json({ enrollment })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}