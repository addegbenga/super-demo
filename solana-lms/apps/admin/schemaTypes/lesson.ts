import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  fields: [
    // Language field (added by plugin, but we make it explicit)
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Display order within the module',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (minutes)',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(180),
    }),
    defineField({
      name: 'xpReward',
      title: 'XP Reward',
      type: 'number',
      description: 'XP earned for completing this lesson',
      validation: (Rule) => Rule.required().min(10).max(200),
      initialValue: 50,
    }),

    // ==================== CONTENT OPTIONS ====================

    defineField({
      name: 'hasVideo',
      title: 'Include Video Content',
      type: 'boolean',
      description: 'Does this lesson have a video?',
      initialValue: false,
    }),

    defineField({
      name: 'hasTextContent',
      title: 'Include Text Content',
      type: 'boolean',
      description: 'Does this lesson have written content?',
      initialValue: true,
    }),

    defineField({
      name: 'hasCodeChallenge',
      title: 'Include Code Challenge',
      type: 'boolean',
      description: 'Does this lesson have an interactive coding challenge?',
      initialValue: false,
    }),

    // ==================== VIDEO FIELDS ====================

    defineField({
      name: 'videoProvider',
      title: 'Video Provider',
      type: 'string',
      options: {
        list: [
          {title: 'YouTube', value: 'youtube'},
          {title: 'Vimeo', value: 'vimeo'},
          {title: 'Direct URL (MP4)', value: 'direct'},
          {title: 'Loom', value: 'loom'},
        ],
      },
      hidden: ({parent}) => !parent?.hasVideo,
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube, Vimeo, Loom, or direct video URL',
      hidden: ({parent}) => !parent?.hasVideo,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent?.hasVideo && !value) {
            return 'Video URL is required when video is enabled'
          }
          return true
        }),
    }),
    defineField({
      name: 'videoDuration',
      title: 'Video Duration (minutes)',
      type: 'number',
      description: 'Length of the video',
      hidden: ({parent}) => !parent?.hasVideo,
    }),
    defineField({
      name: 'videoThumbnail',
      title: 'Video Thumbnail (optional)',
      type: 'image',
      description: 'Custom thumbnail for the video player',
      options: {
        hotspot: true,
      },
      hidden: ({parent}) => !parent?.hasVideo,
    }),

    // ==================== TEXT CONTENT FIELDS ====================

    defineField({
      name: 'content',
      title: 'Text Content',
      type: 'array',
      description: 'Written lesson content with markdown support',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
              {title: 'Underline', value: 'underline'},
              {title: 'Strike', value: 'strike-through'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                  {
                    name: 'openInNewTab',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
        {
          type: 'code',
          title: 'Code Block',
          options: {
            language: 'rust',
            languageAlternatives: [
              {title: 'Rust', value: 'rust'},
              {title: 'TypeScript', value: 'typescript'},
              {title: 'JavaScript', value: 'javascript'},
              {title: 'JSON', value: 'json'},
              {title: 'Shell', value: 'sh'},
              {title: 'Solidity', value: 'solidity'},
              {title: 'Python', value: 'python'},
            ],
            withFilename: true,
          },
        },
      ],
      hidden: ({parent}) => !parent?.hasTextContent,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent?.hasTextContent && (!value || value.length === 0)) {
            return 'Text content is required when text content is enabled'
          }
          return true
        }),
    }),

    // ==================== CODE CHALLENGE FIELDS ====================

    defineField({
      name: 'challengePrompt',
      title: 'Challenge Prompt',
      type: 'text',
      rows: 4,
      description: 'Clear objectives and expected output',
      hidden: ({parent}) => !parent?.hasCodeChallenge,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent?.hasCodeChallenge && !value) {
            return 'Challenge prompt is required when code challenge is enabled'
          }
          return true
        }),
    }),
    defineField({
      name: 'starterCode',
      title: 'Starter Code',
      type: 'code',
      options: {
        language: 'typescript',
        languageAlternatives: [
          {title: 'Rust', value: 'rust'},
          {title: 'TypeScript', value: 'typescript'},
          {title: 'JavaScript', value: 'javascript'},
          {title: 'Python', value: 'python'},
        ],
        withFilename: true,
      },
      hidden: ({parent}) => !parent?.hasCodeChallenge,
    }),
    defineField({
      name: 'solution',
      title: 'Solution Code',
      type: 'code',
      options: {
        language: 'typescript',
        languageAlternatives: [
          {title: 'Rust', value: 'rust'},
          {title: 'TypeScript', value: 'typescript'},
          {title: 'JavaScript', value: 'javascript'},
          {title: 'Python', value: 'python'},
        ],
        withFilename: true,
      },
      hidden: ({parent}) => !parent?.hasCodeChallenge,
    }),
    defineField({
      name: 'testCases',
      title: 'Test Cases',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              type: 'string',
              title: 'Test Name',
            },
            {
              name: 'input',
              type: 'text',
              title: 'Input',
            },
            {
              name: 'expectedOutput',
              type: 'text',
              title: 'Expected Output',
            },
            {
              name: 'isHidden',
              type: 'boolean',
              title: 'Hidden Test',
              description: 'Hide this test from the student',
              initialValue: false,
            },
          ],
          preview: {
            select: {
              name: 'name',
              isHidden: 'isHidden',
            },
            prepare({name, isHidden}) {
              return {
                title: name || 'Test Case',
                subtitle: isHidden ? '🔒 Hidden' : '👁️ Visible',
              }
            },
          },
        },
      ],
      hidden: ({parent}) => !parent?.hasCodeChallenge,
    }),

    // ==================== COMMON FIELDS ====================

    defineField({
      name: 'hints',
      title: 'Hints',
      type: 'array',
      of: [{type: 'text'}],
      description: 'Progressive hints to help students',
    }),
    defineField({
      name: 'resources',
      title: 'Additional Resources',
      type: 'array',
      description: 'Links to documentation, articles, etc.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Resource Title',
            },
            {
              name: 'url',
              type: 'url',
              title: 'URL',
            },
            {
              name: 'type',
              type: 'string',
              title: 'Resource Type',
              options: {
                list: ['documentation', 'article', 'video', 'tool', 'github'],
              },
            },
          ],
          preview: {
            select: {
              title: 'title',
              type: 'type',
            },
            prepare({title, type}) {
              const emoji = {
                documentation: '📚',
                article: '📄',
                video: '🎥',
                tool: '🔧',
                github: '💻',
              }
              return {
                title,
                subtitle: emoji[type as keyof typeof emoji] || '🔗',
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      hasVideo: 'hasVideo',
      hasTextContent: 'hasTextContent',
      hasCodeChallenge: 'hasCodeChallenge',
      order: 'order',
      xp: 'xpReward',
    },
    prepare({title, hasVideo, hasTextContent, hasCodeChallenge, order, xp}) {
      // Build emoji based on what's included
      const parts = []
      if (hasVideo) parts.push('🎥')
      if (hasTextContent) parts.push('📝')
      if (hasCodeChallenge) parts.push('💻')

      const emoji = parts.length > 0 ? parts.join(' ') : '📖'

      return {
        title: `${order + 1}. ${title}`,
        subtitle: `${emoji} • ${xp} XP`,
      }
    },
  },
})
