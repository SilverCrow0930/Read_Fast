import stripe
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Stripe with your secret key
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

def archive_old_prices():
    """Archive all active prices for our products"""
    try:
        # List all active prices
        prices = stripe.Price.list(active=True)
        
        # Archive each price
        for price in prices.data:
            print(f"Archiving price: {price.id} ({price.unit_amount/100} {price.currency})")
            stripe.Price.modify(
                price.id,
                active=False,
            )
            
        print("\nAll prices have been archived. You can now run get_stripe_ids.py to create new prices.")
        
    except Exception as e:
        print(f"Error archiving prices: {str(e)}")

if __name__ == "__main__":
    archive_old_prices() 