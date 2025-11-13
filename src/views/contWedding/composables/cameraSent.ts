import { supabase } from '@/utils/supabase.js'
import { useWeddingStore } from '@/stores/weddingBookingData.js'
import { insertReferenceNumber } from '@/views/contWedding/composables/refInsert'

export function useCameraWeddingUpload() {
  const weddingStore = useWeddingStore()

  // Convert image URI to File object para sa upload
  async function uriToFile(uri: string, filename: string): Promise<File> {
    try {
      // Check if it's a data URL (base64)
      if (uri.startsWith('data:')) {
        const response = await fetch(uri)
        const blob = await response.blob()
        return new File([blob], filename, { type: 'image/png' })
      }

      // Check if it's a blob URL
      if (uri.startsWith('blob:')) {
        const response = await fetch(uri)
        const blob = await response.blob()
        return new File([blob], filename, { type: 'image/png' })
      }

      // For regular HTTP URLs
      if (uri.startsWith('http')) {
        const response = await fetch(uri)
        const blob = await response.blob()
        return new File([blob], filename, { type: 'image/png' })
      }

      // For file:// URLs or other local file URIs, try to convert to blob
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      return new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], filename, { type: 'image/png' }))
            } else {
              reject(new Error('Failed to convert image to blob'))
            }
          }, 'image/png')
        }

        img.onerror = () => reject(new Error('Failed to load image'))
        img.crossOrigin = 'anonymous'
        img.src = uri
      })

    } catch (error) {
      console.error('Error converting URI to file:', error)
      throw new Error(`Failed to process image: ${error.message}`)
    }
  }

  // Upload images to Supabase storage and update wedding booking
  async function updateWeddingBookingWithImages(documentImages: Record<string, (string | { uri: string; id?: number; name?: string })[]>) {
    const user = await weddingStore.getUser()
    if (!user) {
      return { error: 'User not authenticated' }
    }

    try {
      // Get most recent wedding booking para sa user
      const recentBooking = await weddingStore.fetchRecentWeddingBooking()
      if (!recentBooking) {
        return { error: 'No wedding booking found para sa user' }
      }

      const uploadedUrls: Record<string, string[]> = {}

      // Upload images para sa each document type
      for (const [documentType, images] of Object.entries(documentImages)) {
        if (!images || !Array.isArray(images) || images.length === 0) continue

        const documentUrls: string[] = []

        for (let i = 0; i < images.length; i++) {
          const imageItem = images[i]

          // Handle both string URIs and objects with uri property
          let imageUri: string
          if (typeof imageItem === 'string') {
            imageUri = imageItem
          } else if (imageItem && typeof imageItem === 'object' && 'uri' in imageItem) {
            imageUri = imageItem.uri
            console.log(`Processing image object ${i + 1} para sa ${documentType}:`, imageItem)
          } else {
            console.warn(`Invalid image data at index ${i} para sa ${documentType}:`, imageItem)
            continue
          }

          // Check if imageUri is valid
          if (!imageUri || typeof imageUri !== 'string') {
            console.warn(`Invalid image URI at index ${i} para sa ${documentType}:`, imageUri)
            continue
          }

          console.log(`Processing image ${i + 1} para sa ${documentType}:`, imageUri.substring(0, 50) + '...')

          // Create unique filename para sa image
          const timestamp = Date.now()
          const filename = `wedding_${recentBooking.id}_${documentType}_${i + 1}_${timestamp}.png`
          const filePath = `wedding_documents/${user.id}/${filename}`

          try {
            // Convert URI to File object
            console.log(`Converting URI to file: ${filename}`)
            const file = await uriToFile(imageUri, filename)
            console.log(`File converted successfully. Size: ${file.size} bytes`)

            // Upload to Supabase storage
            console.log(`Uploading to Supabase: ${filePath}`)
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('forms')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
              })

            if (uploadError) {
              console.error(`Upload error para sa ${filename}:`, uploadError)
              continue // Skip this image but continue with others
            }

            console.log(`Upload successful:`, uploadData)

            // Get public URL ng uploaded image
            const { data: publicUrlData } = supabase.storage
              .from('forms')
              .getPublicUrl(filePath)

            if (publicUrlData?.publicUrl) {
              documentUrls.push(publicUrlData.publicUrl)
              console.log(`Successfully uploaded: ${filename} -> ${publicUrlData.publicUrl}`)
            }

          } catch (fileError) {
            console.error(`File processing error para sa image ${i + 1}:`, fileError)
            continue // Skip this image but continue with others
          }
        }

        if (documentUrls.length > 0) {
          uploadedUrls[documentType] = documentUrls
        }
      }

      // Check if naka-upload ang at least one image
      if (Object.keys(uploadedUrls).length === 0) {
        return { error: 'No images were successfully uploaded' }
      }

      // Update wedding booking with uploaded image URLs
      // Map all document types to database columns
      const imageUrls = {
        // Primary documents (always required)
        attached_images_1: uploadedUrls['marriage_interview']?.join(',') || null,
        attached_images_2: uploadedUrls['marriage_banns']?.join(',') || null,
        attached_images_3: uploadedUrls['jurisdiction_for_marriage']?.join(',') || null,

        // Required additional documents
        attached_images_4: uploadedUrls['baptismal_certificate']?.join(',') || null,
        attached_images_5: uploadedUrls['confirmation_certificate']?.join(',') || null,
        attached_images_6: uploadedUrls['birth_certificate_psa']?.join(',') || null,
        attached_images_7: uploadedUrls['cenomar']?.join(',') || null,
        attached_images_8: uploadedUrls['marriage_license']?.join(',') || null,
        attached_images_9: uploadedUrls['pre_cana_seminar']?.join(',') || null,

        // Optional documents
        attached_images_10: uploadedUrls['certification_recommendation']?.join(',') || null,
        attached_images_11: uploadedUrls['marriage_banns_publication']?.join(',') || null,
        attached_images_12: uploadedUrls['jurisdiction_permit']?.join(',') || null
      }

      const { data, error } = await supabase
        .from('wedding_bookings')
        .update(imageUrls)
        .eq('id', recentBooking.id)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Error updating wedding booking:', error)
        return { error: error.message }
      }

      // Insert reference number after successful image upload
      const refResult = await insertReferenceNumber(recentBooking.id, user.id)
      if (refResult.error) {
        console.warn('Warning: Failed to generate reference number:', refResult.error)
        // Continue with success even if reference number failed
      }

      console.log('Successfully uploaded and updated wedding booking with document images')
      return {
        data: data[0],
        uploadedUrls,
        totalUploaded: Object.values(uploadedUrls).flat().length,
        referenceNumber: refResult.referenceNumber || null
      }

    } catch (err: any) {
      console.error('Upload and update error:', err)
      return { error: err.message || 'Upload failed' }
    }
  }

  return {
    updateWeddingBookingWithImages
  }
}
