import { Link } from 'react-router-dom'
import { BookOpen, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Course } from '@/types'

interface CourseCardProps {
  course: Course
  showEnrollButton?: boolean
  onEnroll?: () => void
  isEnrolling?: boolean
  progress?: number
}

export default function CourseCard({
  course,
  showEnrollButton = false,
  onEnroll,
  isEnrolling,
  progress
}: CourseCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm">
          {course.instructor_name && (
            <span>By {course.instructor_name}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-gray-600 line-clamp-3">
          {course.description}
        </p>
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          {course.lessons_count !== undefined && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {course.lessons_count} lessons
            </span>
          )}
          {course.enrolled_count !== undefined && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.enrolled_count} students
            </span>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link to={`/courses/${course.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Course
          </Button>
        </Link>
        {showEnrollButton && onEnroll && (
          <Button onClick={onEnroll} disabled={isEnrolling} className="flex-1">
            {isEnrolling ? 'Enrolling...' : 'Enroll'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
