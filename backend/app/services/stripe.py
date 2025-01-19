import stripe
from fastapi import HTTPException
from ..core.config import settings

class StripeService:
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        self.prices = {
            'pro_monthly': settings.STRIPE_PRO_MONTHLY_PRICE_ID,
            'pro_yearly': settings.STRIPE_PRO_YEARLY_PRICE_ID,
            'ultimate_monthly': settings.STRIPE_ULTIMATE_MONTHLY_PRICE_ID,
            'ultimate_yearly': settings.STRIPE_ULTIMATE_YEARLY_PRICE_ID,
        }

    async def create_checkout_session(self, price_id: str, user_id: str, user_email: str, success_url: str, cancel_url: str):
        try:
            session = stripe.checkout.Session.create(
                customer_email=user_email,  # Using user's email instead of ID
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    'user_id': user_id
                }
            )
            return session
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def create_portal_session(self, customer_id: str, return_url: str):
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            return session
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def handle_webhook(self, payload: bytes, sig_header: str):
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            
            if event['type'] == 'customer.subscription.created':
                await self._handle_subscription_created(event)
            elif event['type'] == 'customer.subscription.updated':
                await self._handle_subscription_updated(event)
            elif event['type'] == 'customer.subscription.deleted':
                await self._handle_subscription_deleted(event)
                
            return {'status': 'success'}
            
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail='Invalid signature')
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def _handle_subscription_created(self, event):
        subscription = event['data']['object']
        # Update user's subscription status in Supabase
        # This will be implemented when we add the database schema

    async def _handle_subscription_updated(self, event):
        subscription = event['data']['object']
        # Update user's subscription status in Supabase
        # This will be implemented when we add the database schema

    async def _handle_subscription_deleted(self, event):
        subscription = event['data']['object']
        # Update user's subscription status in Supabase
        # This will be implemented when we add the database schema

stripe_service = StripeService() 