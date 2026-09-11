from sqlalchemy import Column, Integer, String, Float, Date
from database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    phone = Column(String, nullable=False)

    village = Column(String)

    taluka = Column(String)

    district = Column(String)

    state = Column(String, default="Maharashtra")


class CropLot(Base):
    __tablename__ = "crop_lots"

    id = Column(Integer, primary_key=True, index=True)

    farmer_id = Column(Integer, nullable=False)

    commodity = Column(String, nullable=False)

    quantity_kg = Column(Float, nullable=False)

    quality_grade = Column(String)

    district = Column(String)

    harvest_date = Column(Date)

    expected_price = Column(Float)

    status = Column(String, default="AVAILABLE")


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)

    market_name = Column(String, nullable=False)

    district = Column(String, nullable=False)

    commodity = Column(String, nullable=False)

    variety = Column(String)

    min_price = Column(Float)

    max_price = Column(Float)

    modal_price = Column(Float)

    arrival_quantity = Column(Float)

class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, index=True)

    business_name = Column(String, nullable=False)

    buyer_type = Column(String)

    district = Column(String)

    state = Column(String, default="Maharashtra")

    commodities = Column(String)

    max_quantity_kg = Column(Float)

    max_price_per_kg = Column(Float)

    reliability_score = Column(Float, default=50)

    verified = Column(Integer, default=1)

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)

    crop_lot_id = Column(Integer, nullable=False)
    buyer_id = Column(Integer, nullable=False)

    # FARMER = farmer sent the offer
    # BUYER = buyer sent the offer
    sender_role = Column(String, default="FARMER")

    offered_price_per_kg = Column(Float, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)

    status = Column(String, default="PENDING")

class Logistics(Base):
    __tablename__ = "logistics"

    id = Column(Integer, primary_key=True, index=True)

    offer_id = Column(Integer, nullable=False)

    pickup_location = Column(String, nullable=False)

    delivery_location = Column(String, nullable=False)

    transporter_name = Column(String, nullable=True)

    vehicle_number = Column(String, nullable=True)

    status = Column(String, default="PENDING")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    offer_id = Column(Integer, nullable=False)

    farmer_id = Column(Integer, nullable=False)

    buyer_id = Column(Integer, nullable=False)

    amount = Column(Float, nullable=False)

    payment_method = Column(String, default="UPI")

    transaction_reference = Column(String)

    status = Column(String, default="PENDING")

class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)

    farmer_id = Column(Integer, nullable=False)

    offer_id = Column(Integer, nullable=True)

    category = Column(String, nullable=False)

    description = Column(String, nullable=False)

    status = Column(String, default="OPEN")

    resolution = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, nullable=False)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="FARMER")
    is_active = Column(Integer, default=1)
    buyer_id = Column(Integer, nullable=True)