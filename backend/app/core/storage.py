from supabase import create_client, Client
import os
import tempfile
from datetime import datetime, timedelta
from .config import settings
import logging

logger = logging.getLogger(__name__)

class SupabaseStorage:
    def __init__(self):
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        self._check_bucket_exists()

    def _check_bucket_exists(self):
        """Check if the bucket exists. The bucket should be created manually in Supabase dashboard."""
        try:
            self.supabase.storage.from_(settings.SUPABASE_BUCKET_NAME).list()
            logger.info(f"Successfully connected to bucket: {settings.SUPABASE_BUCKET_NAME}")
        except Exception as e:
            logger.error(f"Error accessing bucket {settings.SUPABASE_BUCKET_NAME}: {str(e)}")
            logger.error("Please create the bucket manually in the Supabase dashboard")
            raise Exception(f"Bucket '{settings.SUPABASE_BUCKET_NAME}' not found or not accessible. Please create it in the Supabase dashboard.")

    async def upload_file(self, file_content: bytes, file_name: str) -> str:
        """Upload a file to Supabase storage and return its path."""
        try:
            # Create a unique file path
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            file_path = f"{timestamp}_{file_name}"
            
            logger.info(f"Uploading file to Supabase storage: {file_path}")
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                temp_file.write(file_content)
                temp_file.flush()
                
                # Upload to Supabase
                self.supabase.storage.from_(settings.SUPABASE_BUCKET_NAME).upload(
                    file_path,
                    temp_file.name
                )
            
            # Clean up temp file
            os.unlink(temp_file.name)
            
            logger.info(f"File uploaded successfully: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Error uploading file to Supabase: {str(e)}")
            raise

    async def download_file(self, file_path: str) -> bytes:
        """Download a file from Supabase storage."""
        try:
            logger.info(f"Downloading file from Supabase storage: {file_path}")
            
            # Create temporary file to store the download
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                # Download from Supabase
                self.supabase.storage.from_(settings.SUPABASE_BUCKET_NAME).download(
                    file_path,
                    temp_file.name
                )
                
                # Read the file content
                with open(temp_file.name, 'rb') as f:
                    content = f.read()
                
            # Clean up temp file
            os.unlink(temp_file.name)
            
            logger.info(f"File downloaded successfully: {file_path}")
            return content
            
        except Exception as e:
            logger.error(f"Error downloading file from Supabase: {str(e)}")
            raise

    async def delete_file(self, file_path: str):
        """Delete a file from Supabase storage."""
        try:
            logger.info(f"Deleting file from Supabase storage: {file_path}")
            self.supabase.storage.from_(settings.SUPABASE_BUCKET_NAME).remove([file_path])
            logger.info(f"File deleted successfully: {file_path}")
        except Exception as e:
            logger.error(f"Error deleting file from Supabase: {str(e)}")
            raise

    async def cleanup_old_files(self):
        """Delete files older than the expiry time."""
        try:
            logger.info("Starting cleanup of old files")
            expiry_time = datetime.now() - timedelta(seconds=settings.SUPABASE_FILE_EXPIRY)
            
            # List all files
            files = self.supabase.storage.from_(settings.SUPABASE_BUCKET_NAME).list()
            
            # Filter and delete old files
            for file in files:
                # Extract timestamp from filename (format: YYYYMMDD_HHMMSS_filename)
                try:
                    timestamp_str = file['name'].split('_')[0:2]
                    file_time = datetime.strptime('_'.join(timestamp_str), '%Y%m%d_%H%M%S')
                    
                    if file_time < expiry_time:
                        await self.delete_file(file['name'])
                        logger.info(f"Deleted expired file: {file['name']}")
                except:
                    logger.warning(f"Could not parse timestamp for file: {file['name']}")
                    continue
                    
            logger.info("Cleanup completed")
            
        except Exception as e:
            logger.error(f"Error during file cleanup: {str(e)}")
            raise

# Create a singleton instance
storage = SupabaseStorage() 