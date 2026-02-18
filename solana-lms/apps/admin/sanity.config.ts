import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {codeInput} from '@sanity/code-input'
import {schemaTypes} from './schemaTypes'
import {documentInternationalization} from '@sanity/document-internationalization'

// Supported languages
const supportedLanguages = [
  {id: 'en', title: 'English', isDefault: true},
  {id: 'pt', title: 'Português'},
  {id: 'es', title: 'Español'},
]

export default defineConfig({
  name: 'default',
  title: 'solana-learn',

  projectId: 'yvweav2z',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem().title('Courses').child(S.documentTypeList('course').title('Courses')),
            S.listItem().title('Modules').child(S.documentTypeList('module').title('Modules')),
            S.listItem().title('Lessons').child(S.documentTypeList('lesson').title('Lessons')),
            S.divider(),
            S.listItem()
              .title('Learning Paths')
              .child(S.documentTypeList('learningPath').title('Learning Paths')),
            S.divider(),
            S.listItem()
              .title('Instructors')
              .child(S.documentTypeList('instructor').title('Instructors')),
            S.listItem()
              .title('Achievements')
              .child(S.documentTypeList('achievement').title('Achievements')),
            S.listItem().title('Review').child(S.documentTypeList('review').title('Review')),
          ]),
    }),
    visionTool(),
    codeInput(),
    documentInternationalization({
      // Document types that should be translatable
      supportedLanguages,
      schemaTypes: ['course', 'module', 'lesson', 'learningPath'],
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
