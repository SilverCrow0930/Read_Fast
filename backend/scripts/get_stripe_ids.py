import stripe
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Stripe with your secret key
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

def create_products_if_not_exist():
    """Create products and prices if they don't exist"""
    products = {
        'pro': {
            'name': 'Quick Focus Pro',
            'description': 'Unlock the full power of Quick Focus',
            'prices': {
                'monthly': {
                    'unit_amount': 799,  # $7.99 per month
                    'recurring': {'interval': 'month'}
                },
                'yearly': {
                    'unit_amount': 4788,  # $47.88 per year ($3.99 per month)
                    'recurring': {'interval': 'year'}
                }
            }
        },
        'ultimate': {
            'name': 'Quick Focus Ultimate',
            'description': 'For power users and teams',
            'prices': {
                'monthly': {
                    'unit_amount': 1999,  # $19.99 per month
                    'recurring': {'interval': 'month'}
                },
                'yearly': {
                    'unit_amount': 11988,  # $119.88 per year ($9.99 per month)
                    'recurring': {'interval': 'year'}
                }
            }
        }
    }

    result = {}

    for product_key, product_data in products.items():
        # Check if product exists by name
        existing_products = stripe.Product.list(active=True)
        product = next((p for p in existing_products if p.name == product_data['name']), None)

        if not product:
            # Create new product
            product = stripe.Product.create(
                name=product_data['name'],
                description=product_data['description']
            )
            print(f"Created new product: {product.name}")
        else:
            print(f"Found existing product: {product.name}")

        result[product_key] = {'product_id': product.id, 'prices': {}}

        # Create or get prices
        for interval, price_data in product_data['prices'].items():
            existing_prices = stripe.Price.list(product=product.id, active=True)
            price = next((
                p for p in existing_prices 
                if p.recurring.interval == price_data['recurring']['interval'] 
                and p.unit_amount == price_data['unit_amount']
            ), None)

            if not price:
                # Create new price
                price = stripe.Price.create(
                    product=product.id,
                    currency='usd',
                    **price_data
                )
                print(f"Created new price for {product.name} ({interval})")
            else:
                print(f"Found existing price for {product.name} ({interval})")

            result[product_key]['prices'][interval] = price.id

    return result

def main():
    print("Retrieving/creating Stripe products and prices...")
    result = create_products_if_not_exist()

    print("\nAdd these to your backend .env file:")
    print(f"STRIPE_PRO_MONTHLY_PRICE_ID={result['pro']['prices']['monthly']}")
    print(f"STRIPE_PRO_YEARLY_PRICE_ID={result['pro']['prices']['yearly']}")
    print(f"STRIPE_ULTIMATE_MONTHLY_PRICE_ID={result['ultimate']['prices']['monthly']}")
    print(f"STRIPE_ULTIMATE_YEARLY_PRICE_ID={result['ultimate']['prices']['yearly']}")
    
    print("\nAdd these to your frontend .env file:")
    print(f"VITE_STRIPE_PRO_MONTHLY_PRICE_ID={result['pro']['prices']['monthly']}")
    print(f"VITE_STRIPE_PRO_YEARLY_PRICE_ID={result['pro']['prices']['yearly']}")
    print(f"VITE_STRIPE_ULTIMATE_MONTHLY_PRICE_ID={result['ultimate']['prices']['monthly']}")
    print(f"VITE_STRIPE_ULTIMATE_YEARLY_PRICE_ID={result['ultimate']['prices']['yearly']}")

if __name__ == "__main__":
    main() 