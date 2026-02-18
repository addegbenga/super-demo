import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'module',
  title: 'Module',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Display order within the course',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'lessons',
      title: 'Lessons',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'lesson'}]}],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      order: 'order',
      lessonCount: 'lessons',
    },
    prepare({title, order, lessonCount}) {
      return {
        title: `${order + 1}. ${title}`,
        subtitle: `${lessonCount?.length || 0} lessons`,
      }
    },
  },
})
