from database import SessionLocal
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

db = SessionLocal()

existing_user = db.query(User).filter(
    User.username == "buyer1"
).first()

if existing_user:
    print("buyer1 already exists.")
else:
    buyer = User(
        farmer_id=1,
        username="buyer1",
        password_hash=pwd_context.hash("buyer123"),
        role="BUYER",
        is_active=1
    )

    db.add(buyer)
    db.commit()
    db.refresh(buyer)

    print("Buyer created successfully!")
    print("Username: buyer1")
    print("Password: buyer123")
    print("Role:", buyer.role)

db.close()