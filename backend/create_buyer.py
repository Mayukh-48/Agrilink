from database import SessionLocal
from models import User, Buyer
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

db = SessionLocal()

# Find the actual buyer record
buyer_record = db.query(Buyer).filter(
    Buyer.business_name == "Sahyadri Agro Traders"
).first()

if buyer_record is None:
    print("Sahyadri Agro Traders buyer record was not found.")
    db.close()
    exit()

print("Buyer found:")
print("Buyer ID:", buyer_record.id)
print("Business:", buyer_record.business_name)

# Find buyer login account
existing_user = db.query(User).filter(
    User.username == "buyer1"
).first()

if existing_user:
    existing_user.buyer_id = buyer_record.id
    existing_user.role = "BUYER"

    db.commit()
    db.refresh(existing_user)

    print("buyer1 already exists.")
    print("buyer1 linked to Buyer ID:", existing_user.buyer_id)

else:
    buyer_user = User(
        farmer_id=1,
        buyer_id=buyer_record.id,
        username="buyer1",
        password_hash=pwd_context.hash("buyer123"),
        role="BUYER",
        is_active=1
    )

    db.add(buyer_user)
    db.commit()
    db.refresh(buyer_user)

    print("Buyer login created successfully!")
    print("Username: buyer1")
    print("Password: buyer123")
    print("Buyer ID:", buyer_user.buyer_id)

db.close()