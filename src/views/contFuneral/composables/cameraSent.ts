import { useFuneralStore } from '@/stores/funeralBookingData.js'
import { supabase } from '@/utils/supabase.js'
import { insertReferenceNumber } from './refInsert'

export function useCameraFuneralUpload() {
  const funeralStore = useFuneralStore()

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
              reject(new Error('Failed to create blob from canvas'))
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

  // Upload images to Supabase storage and update funeral booking
  async function updateFuneralBookingWithImages(documentImages: Record<string, (string | { uri: string; id?: number; name?: string })[]>) {
    const user = await funeralStore.getUser()
    if (!user) {
      return { error: 'User not authenticated' }
    }

    try {
      // Get most recent funeral booking para sa user
      const recentBooking = await funeralStore.fetchRecentFuneralBooking()
      if (!recentBooking) {
        return { error: 'No funeral booking found para sa user' }
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
          const filename = `funeral_${recentBooking.id}_${documentType}_${i + 1}_${timestamp}.png`
          const filePath = `funeral_documents/${user.id}/${filename}`

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
              console.error(`Upload failed para sa ${filename}:`, uploadError)
              throw uploadError
            }

            console.log(`Upload successful:`, uploadData)

            // Get public URL ng uploaded image
            const { data: { publicUrl } } = supabase.storage
              .from('forms')
              .getPublicUrl(filePath)

            documentUrls.push(publicUrl)
            console.log(`Added public URL: ${publicUrl}`)

          } catch (fileError) {
            console.error(`Error processing image ${i + 1} para sa ${documentType}:`, fileError)
            // Continue with other images even if one fails
            continue
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

      // Update funeral booking with uploaded image URLs
      const imageUrls = {
        attached_images_1: uploadedUrls['permission_of_funeral']?.join(',') || null
      }

      const { data, error } = await supabase
        .from('funeral_bookings')
        .update(imageUrls)
        .eq('id', recentBooking.id)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Error updating funeral booking:', error)
        return { error: error.message }
      }

      // Insert reference number after successful image upload
      const refResult = await insertReferenceNumber(recentBooking.id, user.id)
      if (refResult.error) {
        console.warn('Warning: Failed to generate reference number:', refResult.error)
        // Continue with success even if reference number failed
      }

      console.log('Successfully uploaded and updated funeral booking with document images')
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
    updateFuneralBookingWithImages
  }
}
