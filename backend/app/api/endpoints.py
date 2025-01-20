from typing import Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, Header, status, HTTPException, Request, BackgroundTasks
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel
from ..services.auth import auth_service
from ..services.pdf import pdf_service
from ..services.stripe import stripe_service
from ..core.storage import storage
from ..core.config import settings
import logging
import traceback

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

async def get_token_data(authorization: str = Header(None)) -> Dict[str, Any]:
    """Dependency for verifying the authorization token."""
    token = authorization.replace('Bearer ', '') if authorization else None
    return auth_service.verify_token(token)

@router.get("/health")
async def health_check(token_data: Dict[str, Any] = Depends(get_token_data)) -> Dict[str, str]:
    """Check if the server is running and PDF processing is available."""
    return {
        "status": "ok",
        "message": "Server is running and PDF processing is available"
    }

async def cleanup_files(input_path: str, output_path: str):
    """Background task to clean up files after they've been processed."""
    try:
        await storage.delete_file(input_path)
        await storage.delete_file(output_path)
        logger.info(f"Cleaned up files: {input_path}, {output_path}")
    except Exception as e:
        logger.error(f"Error cleaning up files: {str(e)}")

@router.post("/convert")
async def convert_pdf(
    file: UploadFile = File(...),
    token_data: Dict[str, Any] = Depends(get_token_data),
    background_tasks: BackgroundTasks = BackgroundTasks()
) -> Response:
    """Convert a PDF file to bionic reading format."""
    logger.debug(f"Starting conversion for file: {file.filename}")
    logger.debug(f"Token data: {token_data}")
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )
    
    # Read file content
    content = await file.read()
    logger.debug("File validation passed")
    logger.debug(f"File size: {len(content)} bytes")
    
    try:
        # Upload original file to Supabase
        input_path = await storage.upload_file(content, file.filename)
        logger.debug(f"Uploaded original file to Supabase: {input_path}")
        
        # Start PDF conversion
        logger.debug("Starting PDF conversion")
        processed_content = await pdf_service.convert_to_bionic(content, file.filename)
        
        # Upload converted file to Supabase
        output_filename = f"converted_{file.filename}"
        output_path = await storage.upload_file(processed_content, output_filename)
        logger.debug(f"Uploaded converted file to Supabase: {output_path}")
        
        # Schedule cleanup after expiry time
        background_tasks.add_task(cleanup_files, input_path, output_path)
        
        # Return the processed PDF
        return Response(
            content=processed_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={file.filename.replace('.pdf', '')}_bionic.pdf"
            }
        )
        
    except Exception as e:
        logger.error("Conversion failed:", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

class CheckoutSessionRequest(BaseModel):
    price_id: str

@router.post("/create-checkout-session")
async def create_checkout_session(
    request: CheckoutSessionRequest,
    token_data: Dict[str, Any] = Depends(get_token_data)
) -> Dict[str, str]:
    """Create a Stripe checkout session for subscription."""
    user_id = token_data.get('sub')
    user_email = token_data.get('email')
    
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    if not user_email:
        raise HTTPException(status_code=400, detail="User email not found")

    success_url = f"{settings.FRONTEND_URL}/payment-success"
    cancel_url = f"{settings.FRONTEND_URL}/pricing"
    
    try:
        session = await stripe_service.create_checkout_session(
            price_id=request.price_id,
            user_id=user_id,
            user_email=user_email,
            success_url=success_url,
            cancel_url=cancel_url
        )
        return {"url": session.url}
    except Exception as e:
        logger.error(f"Failed to create checkout session: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.post("/create-portal-session")
async def create_portal_session(
    token_data: Dict[str, Any] = Depends(get_token_data)
) -> Dict[str, str]:
    """Create a Stripe billing portal session."""
    user_id = token_data.get('sub')
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    return_url = f"{settings.FRONTEND_URL}/account"
    session = await stripe_service.create_portal_session(
        customer_id=user_id,
        return_url=return_url
    )
    
    return {"url": session.url}

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None)
) -> JSONResponse:
    """Handle Stripe webhooks."""
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing stripe signature")
    
    payload = await request.body()
    
    result = await stripe_service.handle_webhook(payload, stripe_signature)
    return JSONResponse(content=result) 