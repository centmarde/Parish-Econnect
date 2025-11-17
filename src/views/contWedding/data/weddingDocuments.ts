/**
 * Wedding document definitions
 * Centralized data for all wedding-related documents
 */

import { computed } from 'vue'

export interface WeddingDocument {
  name: string
  filename: string
  description: string
  icon: string
  color: string
  category: string
  required?: boolean
}

/**
 * Primary wedding documents (always required)
 */
export const primaryWeddingDocuments: WeddingDocument[] = [
  {
    name: 'Marriage Interview',
    filename: 'marriage_interview.pdf',
    description: 'Interview form para sa mag-asawa',
    icon: 'mdi-account-heart',
    color: 'primary',
    category: 'Interview',
  },
  {
    name: 'Marriage Banns',
    filename: 'marriage_banns.pdf',
    description: 'Banns announcement form',
    icon: 'mdi-bullhorn',
    color: 'secondary',
    category: 'Announcement',
  },
  {
    name: 'Jurisdiction for Marriage',
    filename: 'jurisdiction_for_marriage.pdf',
    description: 'Jurisdiction requirements',
    icon: 'mdi-gavel',
    color: 'success',
    category: 'Legal',
  },
]

/**
 * Additional wedding documents (mix of required and optional)
 */
export const additionalWeddingDocuments: WeddingDocument[] = [
  {
    name: 'Baptismal Certificate',
    filename: 'baptismal_certificate.pdf',
    description: 'Baptismal certificate ng mag-asawa',
    icon: 'mdi-water',
    color: 'cyan',
    category: 'Certificate',
    required: true,
  },
  {
    name: 'Confirmation Certificate',
    filename: 'confirmation_certificate.pdf',
    description: 'Confirmation certificate ng mag-asawa',
    icon: 'mdi-cross',
    color: 'purple',
    category: 'Certificate',
    required: true,
  },
  {
    name: 'Certification of Recommendation',
    filename: 'certification_recommendation.pdf',
    description: 'Optional certification of recommendation',
    icon: 'mdi-file-certificate',
    color: 'teal',
    category: 'Certificate',
    required: false,
  },
  {
    name: 'Birth Certificate (PSA)',
    filename: 'birth_certificate_psa.pdf',
    description: 'Birth certificate from PSA',
    icon: 'mdi-card-account-details',
    color: 'indigo',
    category: 'Legal',
    required: true,
  },
  {
    name: 'CENOMAR',
    filename: 'cenomar.pdf',
    description: 'Certificate of No Marriage (photocopy)',
    icon: 'mdi-file-document-outline',
    color: 'blue',
    category: 'Legal',
    required: true,
  },
  {
    name: 'Marriage License',
    filename: 'marriage_license.pdf',
    description: 'Marriage License from City Hall',
    icon: 'mdi-license',
    color: 'success',
    category: 'Legal',
    required: true,
  },
  {
    name: 'Pre-Cana Seminar',
    filename: 'pre_cana_seminar.pdf',
    description: 'Seminar certificate for couples',
    icon: 'mdi-school',
    color: 'orange',
    category: 'Seminar',
    required: true,
  },
  {
    name: 'Publication of Marriage Banns',
    filename: 'marriage_banns_publication.pdf',
    description: 'Banns publication (if applicable)',
    icon: 'mdi-newspaper-variant',
    color: 'amber',
    category: 'Announcement',
    required: false,
  },
  {
    name: 'Jurisdiction Permit',
    filename: 'jurisdiction_permit.pdf',
    description: 'Needed if not a parish member',
    icon: 'mdi-file-certificate-outline',
    color: 'deep-purple',
    category: 'Legal',
    required: false,
  },
]

/**
 * All wedding documents combined
 */
export const allWeddingDocuments = [
  ...primaryWeddingDocuments,
  ...additionalWeddingDocuments,
]

/**
 * Get all required wedding documents (primary + required additional)
 */
export const requiredWeddingDocuments = computed(() => [
  ...primaryWeddingDocuments,
  ...additionalWeddingDocuments.filter(doc => doc.required !== false)
])

/**
 * Get all optional wedding documents
 */
export const optionalWeddingDocuments = computed(() =>
  additionalWeddingDocuments.filter(doc => doc.required === false)
)

/**
 * Photo tips for document uploads
 */
export const photoTips = [
  {
    icon: 'mdi-lightbulb-on',
    title: 'Good Lighting',
    subtitle: 'Use natural light or bright indoor lighting',
  },
  {
    icon: 'mdi-focus-field',
    title: 'Clear Focus',
    subtitle: 'Make sure all text is readable and in focus',
  },
  {
    icon: 'mdi-crop-square',
    title: 'Full Document',
    subtitle: 'Include the entire document in the frame',
  },
  {
    icon: 'mdi-rotate-right',
    title: 'Correct Orientation',
    subtitle: 'Ensure document is right-side up',
  },
  {
    icon: 'mdi-file-image',
    title: 'Auto PNG Conversion',
    subtitle: 'Images will be automatically converted to PNG format',
  },
]
