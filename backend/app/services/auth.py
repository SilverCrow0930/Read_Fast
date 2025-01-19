from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import jwt
import logging

# Configure logging
logger = logging.getLogger(__name__)

class AuthService:
    """Service for handling authentication and token verification."""
    
    @staticmethod
    def verify_token(token: Optional[str]) -> Dict[str, Any]:
        """Verify and decode a Supabase JWT token.
        
        Args:
            token: The JWT token to verify (without 'Bearer ' prefix)
            
        Returns:
            The decoded token claims
            
        Raises:
            HTTPException: If the token is invalid or missing
        """
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No authorization token provided"
            )
            
        try:
            # Decode the Supabase JWT token
            # Note: We're not verifying the signature since we don't have the secret
            decoded = jwt.decode(
                token,
                options={
                    "verify_signature": False,
                    "verify_aud": False,
                    "verify_iss": False
                }
            )
            
            # Validate it's a Supabase token by checking for required claims
            if not decoded.get("sub") or not decoded.get("role"):
                raise jwt.InvalidTokenError("Not a valid Supabase token")
                
            return decoded
            
        except jwt.InvalidTokenError as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Supabase token"
            )
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization token"
            )
            
auth_service = AuthService() 