import { useState, useEffect, useRef } from 'react'
import { Save, X, Upload, FileText, Eye, EyeOff, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import MarkdownReader from '@/components/lesson/MarkdownReader'
import type { Lesson } from '@/types'

interface LessonEditorProps {
  lesson: Lesson | null
  onSave: (lesson: Lesson) => Promise<void>
  onUploadVideo: (lessonId: number, file: File) => Promise<void>
  isSaving: boolean
}

export default function LessonEditor({
  lesson,
  onSave,
  onUploadVideo,
  isSaving
}: LessonEditorProps) {
  const [title, setTitle] = useState('')
  const [contentMarkdown, setContentMarkdown] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync local state with selected lesson
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title)
      setContentMarkdown(lesson.content_markdown || '')
      setHasChanges(false)
    }
  }, [lesson?.id])

  // Track changes
  useEffect(() => {
    if (lesson) {
      const titleChanged = title !== lesson.title
      const contentChanged = contentMarkdown !== (lesson.content_markdown || '')
      setHasChanges(titleChanged || contentChanged)
    }
  }, [title, contentMarkdown, lesson])

  const handleSave = async () => {
    if (!lesson || !hasChanges) return

    await onSave({
      ...lesson,
      title: title.trim(),
      content_markdown: contentMarkdown
    })
    setHasChanges(false)
  }

  const handleDiscard = () => {
    if (lesson) {
      setTitle(lesson.title)
      setContentMarkdown(lesson.content_markdown || '')
      setHasChanges(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !lesson) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file')
      return
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Video file is too large. Maximum size is 500MB')
      return
    }

    setIsUploadingVideo(true)
    try {
      await onUploadVideo(lesson.id, file)
    } finally {
      setIsUploadingVideo(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Empty state when no lesson is selected
  if (!lesson) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a lesson to edit
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Choose a lesson from the curriculum panel on the left, or create a new lesson to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Editor header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Edit Lesson</h2>
          {hasChanges && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDiscard}
            disabled={!hasChanges || isSaving}
          >
            <X className="h-4 w-4 mr-1" />
            Discard
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Lesson Title */}
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Lesson Title</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson title"
              className="text-lg"
            />
          </div>

          {/* Video Upload Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">Lesson Video</span>
                </div>
                {lesson.video_file && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Video uploaded
                  </span>
                )}
              </div>

              {lesson.video_file ? (
                <div className="space-y-3">
                  <video
                    src={lesson.video_file}
                    controls
                    className="w-full rounded-lg bg-black max-h-64"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingVideo}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Replace Video
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
                >
                  {isUploadingVideo ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-3" />
                      <p className="text-sm text-gray-600">Uploading video...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Click to upload a video
                      </p>
                      <p className="text-xs text-gray-500">
                        MP4, WebM, or MOV (max 500MB)
                      </p>
                    </>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Markdown Content Editor */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">Lesson Content (Markdown)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Show Preview
                    </>
                  )}
                </Button>
              </div>

              {showPreview ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Editor</Label>
                    <textarea
                      value={contentMarkdown}
                      onChange={(e) => setContentMarkdown(e.target.value)}
                      placeholder="Write your lesson content using Markdown..."
                      className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Preview</Label>
                    <div className="h-96 p-4 border rounded-lg overflow-y-auto bg-white">
                      {contentMarkdown ? (
                        <MarkdownReader content={contentMarkdown} />
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Preview will appear here...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  placeholder="Write your lesson content using Markdown...

# Heading 1
## Heading 2

Regular paragraph text with **bold** and *italic* formatting.

- Bullet point 1
- Bullet point 2

```javascript
// Code blocks are supported
const example = 'Hello World';
```"
                  className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              )}

              <p className="text-xs text-gray-500 mt-3">
                Supports Markdown formatting including headings, lists, code blocks, and more.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
