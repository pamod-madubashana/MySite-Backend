import { Request, Response } from 'express';
import { uploadImage } from '../controllers/imageUploadController';

// Re-export the uploadImage function for use in other controllers
export { uploadImage };

// Helper function to handle image upload for articles
export const handleArticleImageUpload = async (req: Request): Promise<string | undefined> => {
  if (!req.file) {
    return undefined;
  }

  // Create a temporary request object to pass to uploadImage
  const tempReq = {
    ...req,
    file: req.file
  } as Request;

  // Create a temporary response object to capture the result
  let imageUrlResult: string | undefined = undefined;
  let errorResult: any = null;
  
  const tempRes: Response = {
    status: function(code: number) {
      // We'll handle the status internally
      return this;
    },
    json: function(data: any) {
      if (data.success && data.imageUrl) {
        imageUrlResult = data.imageUrl;
      } else {
        errorResult = data;
      }
    },
    // Add other needed methods
  } as any;

  await uploadImage(tempReq, tempRes);
  
  if (errorResult) {
    throw new Error(errorResult.message || 'Failed to upload image');
  }
  
  return imageUrlResult;
};

// Helper function to handle image upload for projects
export const handleProjectImageUpload = async (req: Request): Promise<{ thumbnail?: string; screenshots?: string[] }> => {
  const result: { thumbnail?: string; screenshots?: string[] } = {};
  
  // Handle single file upload (legacy case)
  if (req.file) {
    // Single file upload (for thumbnail)
    const tempReq = {
      ...req,
      file: req.file
    } as Request;

    let imageUrlResult: string | undefined = undefined;
    let errorResult: any = null;
    
    const tempRes: Response = {
      status: function(code: number) {
        return this;
      },
      json: function(data: any) {
        if (data.success && data.imageUrl) {
          imageUrlResult = data.imageUrl;
        } else {
          errorResult = data;
        }
      },
    } as any;

    await uploadImage(tempReq, tempRes);
    
    if (errorResult) {
      throw new Error(errorResult.message || 'Failed to upload image');
    }
    
    result.thumbnail = imageUrlResult;
  } else if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
    // Handle named fields from upload.fields() - { thumbnail: [file], screenshots: [file1, file2, ...] }
    
    // Process thumbnail if provided
    if (req.files['thumbnail'] && Array.isArray(req.files['thumbnail']) && req.files['thumbnail'].length > 0) {
      const thumbnailFile = req.files['thumbnail'][0];
      
      const tempReq = {
        ...req,
        file: thumbnailFile as Express.Multer.File
      } as Request;
      
      let imageUrlResult: string | undefined = undefined;
      let errorResult: any = null;
      
      const tempRes: Response = {
        status: function(code: number) {
          return this;
        },
        json: function(data: any) {
          if (data.success && data.imageUrl) {
            imageUrlResult = data.imageUrl;
          } else {
            errorResult = data;
          }
        },
      } as any;
      
      await uploadImage(tempReq, tempRes);
      
      if (errorResult) {
        throw new Error(errorResult.message || 'Failed to upload thumbnail');
      }
      
      result.thumbnail = imageUrlResult;
    }
    
    // Process screenshots if provided
    if (req.files['screenshots'] && Array.isArray(req.files['screenshots']) && req.files['screenshots'].length > 0) {
      const screenshotUrls: string[] = [];
      
      for (const file of req.files['screenshots']) {
        const tempReq = {
          ...req,
          file: file as Express.Multer.File
        } as Request;
        
        let imageUrlResult: string | undefined = undefined;
        let errorResult: any = null;
        
        const tempRes: Response = {
          status: function(code: number) {
            return this;
          },
          json: function(data: any) {
            if (data.success && data.imageUrl) {
              imageUrlResult = data.imageUrl;
            } else {
              errorResult = data;
            }
          },
        } as any;
        
        await uploadImage(tempReq, tempRes);
        
        if (errorResult) {
          throw new Error(errorResult.message || 'Failed to upload screenshot');
        }
        
        if (imageUrlResult) {
          screenshotUrls.push(imageUrlResult);
        }
      }
      
      result.screenshots = screenshotUrls;
    }
  } else if (req.files && Array.isArray(req.files)) {
    // Multiple file upload (for screenshots - fallback)
    const screenshotUrls: string[] = [];
    
    for (const file of req.files) {
      const tempReq = {
        ...req,
        file: file as Express.Multer.File
      } as Request;

      let imageUrlResult: string | undefined = undefined;
      let errorResult: any = null;
      
      const tempRes: Response = {
        status: function(code: number) {
          return this;
        },
        json: function(data: any) {
          if (data.success && data.imageUrl) {
            imageUrlResult = data.imageUrl;
          } else {
            errorResult = data;
          }
        },
      } as any;

      await uploadImage(tempReq, tempRes);
      
      if (errorResult) {
        throw new Error(errorResult.message || 'Failed to upload image');
      }
      
      if (imageUrlResult) {
        screenshotUrls.push(imageUrlResult);
      }
    }
    
    result.screenshots = screenshotUrls;
  }
  
  return result;
};