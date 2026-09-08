from datetime import date

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import engine, get_db, SessionLocal
from models import (
    Base,
    Farmer,
    CropLot,
    MarketPrice,
    Buyer,
    Offer,
    Logistics,
    Transaction,
    Grievance
)
from prediction import predict_price

def seed_initial_data(db: Session):
    existing_prices = db.query(MarketPrice).count()
    if existing_prices == 0:
        prices = [
            MarketPrice(
                market_name="Lasalgaon APMC",
                district="Nashik",
                commodity="Onion",
                variety="Red Onion",
                min_price=25,
                max_price=34,
                modal_price=31,
                arrival_quantity=850
            ),
            MarketPrice(
                market_name="Pimpalgaon APMC",
                district="Nashik",
                commodity="Onion",
                variety="Red Onion",
                min_price=24,
                max_price=33,
                modal_price=30,
                arrival_quantity=720
            ),
            MarketPrice(
                market_name="Pune APMC",
                district="Pune",
                commodity="Onion",
                variety="Red Onion",
                min_price=27,
                max_price=36,
                modal_price=33,
                arrival_quantity=640
            ),
            MarketPrice(
                market_name="Vashi APMC",
                district="Mumbai",
                commodity="Onion",
                variety="Red Onion",
                min_price=30,
                max_price=40,
                modal_price=37,
                arrival_quantity=900
            )
        ]
        db.add_all(prices)
        db.commit()

    if db.query(Farmer).count() == 0:
        farmer = Farmer(
            id=1,
            name="Ramesh Patil",
            phone="9876543210",
            village="Pimpalgaon",
            taluka="Niphad",
            district="Nashik",
            state="Maharashtra"
        )
        db.add(farmer)
        db.commit()

    if db.query(CropLot).count() == 0:
        lots = [
            CropLot(
                id=1,
                farmer_id=1,
                commodity="Onion",
                quantity_kg=5000,
                quality_grade="Grade A",
                district="Nashik",
                harvest_date=date(2026, 9, 1),
                expected_price=32.0,
                status="AVAILABLE"
            ),
            CropLot(
                id=2,
                farmer_id=1,
                commodity="Tomato",
                quantity_kg=3000,
                quality_grade="Grade A",
                district="Pune",
                harvest_date=date(2026, 9, 5),
                expected_price=28.0,
                status="AVAILABLE"
            ),
            CropLot(
                id=3,
                farmer_id=1,
                commodity="Potato",
                quantity_kg=8000,
                quality_grade="Grade B",
                district="Nashik",
                harvest_date=date(2026, 8, 28),
                expected_price=22.0,
                status="AVAILABLE"
            )
        ]
        db.add_all(lots)
        db.commit()

    if db.query(Buyer).count() == 0:
        buyers = [
            Buyer(
                id=1,
                business_name="Sahyadri Agro Traders",
                buyer_type="Wholesaler",
                district="Nashik",
                state="Maharashtra",
                commodities="Onion,Tomato,Potato",
                max_quantity_kg=10000,
                max_price_per_kg=35.0,
                reliability_score=92.0,
                verified=1
            ),
            Buyer(
                id=2,
                business_name="Reliance Fresh Sourcing",
                buyer_type="Retail Chain",
                district="Mumbai",
                state="Maharashtra",
                commodities="Onion,Tomato",
                max_quantity_kg=25000,
                max_price_per_kg=38.0,
                reliability_score=95.0,
                verified=1
            ),
            Buyer(
                id=3,
                business_name="BigBasket Agri Hub",
                buyer_type="E-Commerce",
                district="Pune",
                state="Maharashtra",
                commodities="Onion,Tomato,Potato",
                max_quantity_kg=15000,
                max_price_per_kg=34.0,
                reliability_score=88.0,
                verified=1
            ),
            Buyer(
                id=4,
                business_name="Kisan Fresh Exports",
                buyer_type="Exporter",
                district="Nashik",
                state="Maharashtra",
                commodities="Onion",
                max_quantity_kg=50000,
                max_price_per_kg=40.0,
                reliability_score=96.0,
                verified=1
            )
        ]
        db.add_all(buyers)
        db.commit()

    if db.query(Offer).count() == 0:
        offer1 = Offer(
            id=1,
            crop_lot_id=1,
            buyer_id=1,
            offered_price_per_kg=34.0,
            quantity_kg=2000,
            total_amount=68000.0,
            status="ACCEPTED"
        )
        offer2 = Offer(
            id=2,
            crop_lot_id=1,
            buyer_id=4,
            offered_price_per_kg=35.0,
            quantity_kg=3000,
            total_amount=105000.0,
            status="PENDING"
        )
        db.add_all([offer1, offer2])
        db.commit()

    if db.query(Logistics).count() == 0:
        logistics1 = Logistics(
            id=1,
            offer_id=1,
            pickup_location="Pimpalgaon Farm Gate, Nashik",
            delivery_location="Sahyadri Hub, Lasalgaon APMC",
            transporter_name="Om Logistics",
            vehicle_number="MH-15-AB-1234",
            status="IN_TRANSIT"
        )
        db.add(logistics1)
        db.commit()

# Create database tables
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_initial_data(db)
db.close()


app = FastAPI(
    title="AgriLink API",
    description="Agricultural market intelligence and buyer marketplace",
    version="1.0.0"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "AgriLink API is running successfully 🌾"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "OK",
        "service": "AgriLink Backend"
    }


@app.get("/api/database-test")
def database_test(db: Session = Depends(get_db)):

    farmer_count = db.query(Farmer).count()
    crop_lot_count = db.query(CropLot).count()

    return {
        "database": "Connected successfully",
        "farmers": farmer_count,
        "crop_lots": crop_lot_count
    }


@app.post("/api/farmers")
def create_farmer(
    name: str,
    phone: str,
    village: str,
    taluka: str,
    district: str,
    db: Session = Depends(get_db)
):
    farmer = Farmer(
        name=name,
        phone=phone,
        village=village,
        taluka=taluka,
        district=district,
        state="Maharashtra"
    )

    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    return {
        "message": "Farmer created successfully",
        "farmer_id": farmer.id,
        "name": farmer.name
    }
@app.post("/api/crop-lots")
def create_crop_lot(
    farmer_id: int,
    commodity: str,
    quantity_kg: float,
    quality_grade: str,
    district: str,
    harvest_date: date,
    expected_price: float,
    db: Session = Depends(get_db)
):
    crop_lot = CropLot(
        farmer_id=farmer_id,
        commodity=commodity,
        quantity_kg=quantity_kg,
        quality_grade=quality_grade,
        district=district,
        harvest_date=harvest_date,
        expected_price=expected_price
    )

    db.add(crop_lot)
    db.commit()
    db.refresh(crop_lot)

    return {
        "message": "Crop lot created successfully",
        "crop_lot_id": crop_lot.id,
        "commodity": crop_lot.commodity,
        "quantity_kg": crop_lot.quantity_kg,
        "quality_grade": crop_lot.quality_grade,
        "district": crop_lot.district,
        "harvest_date": str(crop_lot.harvest_date),
        "expected_price": crop_lot.expected_price,
        "status": crop_lot.status
    }


@app.get("/api/crop-lots")
def get_crop_lots(
    db: Session = Depends(get_db)
):
    crop_lots = db.query(CropLot).all()

    return crop_lots

@app.get("/api/market/prices")
def get_market_prices(
    commodity: str,
    db: Session = Depends(get_db)
):
    prices = (
        db.query(MarketPrice)
        .filter(MarketPrice.commodity == commodity)
        .all()
    )

    return prices
@app.get("/api/prediction/price")
def price_prediction(
    commodity: str = None,
    market_name: str = None,
    current_price: float = None,
    days: int = 7,
    district: str = None,
    db: Session = Depends(get_db)
):
    if current_price is not None:
        predictions = predict_price(
            current_price=float(current_price),
            days=int(days)
        )
        return predictions

    query = db.query(MarketPrice)
    if commodity:
        query = query.filter(func.lower(MarketPrice.commodity) == commodity.lower())
    if market_name:
        query = query.filter(func.lower(MarketPrice.market_name) == market_name.lower())
    elif district:
        query = query.filter(func.lower(MarketPrice.district) == district.lower())

    market = query.first()

    if market is None:
        market = db.query(MarketPrice).first()

    base_price = market.modal_price if market else 30.0
    comm_name = market.commodity if market else (commodity or "Onion")
    mkt_name = market.market_name if market else (market_name or "Lasalgaon APMC")

    predictions = predict_price(
        current_price=base_price,
        days=int(days)
    )

    return {
        "commodity": comm_name,
        "market": mkt_name,
        "current_price": base_price,
        "forecast_days": days,
        "predictions": predictions
    }

@app.post("/api/buyers")
def create_buyer(
    business_name: str,
    buyer_type: str,
    district: str,
    commodities: str,
    max_quantity_kg: float,
    max_price_per_kg: float,
    reliability_score: float = 50,
    verified: int = 1,
    db: Session = Depends(get_db)
):

    buyer = Buyer(
        business_name=business_name,
        buyer_type=buyer_type,
        district=district,
        commodities=commodities,
        max_quantity_kg=max_quantity_kg,
        max_price_per_kg=max_price_per_kg,
        reliability_score=reliability_score,
        verified=verified
    )

    db.add(buyer)
    db.commit()
    db.refresh(buyer)

    return {
        "message": "Buyer created successfully",
        "buyer_id": buyer.id,
        "business_name": buyer.business_name,
        "verified": bool(buyer.verified)
    }


@app.get("/api/buyers")
def get_buyers(
    db: Session = Depends(get_db)
):

    buyers = db.query(Buyer).all()

    return buyers

@app.get("/api/buyers/match/{crop_lot_id}")
def match_buyers(
    crop_lot_id: int,
    db: Session = Depends(get_db)
):
    # Find the crop lot
    crop_lot = (
        db.query(CropLot)
        .filter(CropLot.id == crop_lot_id)
        .first()
    )

    if crop_lot is None:
        return {
            "error": "Crop lot not found"
        }

    # Get all buyers
    buyers = db.query(Buyer).all()

    matches = []

    for buyer in buyers:

        # Check whether buyer accepts this commodity
        buyer_commodities = buyer.commodities.lower().split(",")

        if crop_lot.commodity.lower() not in [
            c.strip() for c in buyer_commodities
        ]:
            continue

        # Calculate matching score
        score = 0

        # 1. Price score
        if buyer.max_price_per_kg >= crop_lot.expected_price:
            score += 40
        else:
            score += 20

        # 2. Quantity score
        if buyer.max_quantity_kg >= crop_lot.quantity_kg:
            score += 25
        else:
            score += 10

        # 3. Location score
        if buyer.district.lower() == crop_lot.district.lower():
            score += 15
        else:
            score += 5

        # 4. Reliability score
        score += buyer.reliability_score * 0.15

        # 5. Verification bonus
        if buyer.verified:
            score += 5

        matches.append({
            "buyer_id": buyer.id,
            "business_name": buyer.business_name,
            "buyer_type": buyer.buyer_type,
            "district": buyer.district,
            "max_price_per_kg": buyer.max_price_per_kg,
            "max_quantity_kg": buyer.max_quantity_kg,
            "reliability_score": buyer.reliability_score,
            "verified": bool(buyer.verified),
            "match_score": round(score, 2)
        })

    # Sort highest score first
    matches.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return {
        "crop_lot_id": crop_lot.id,
        "commodity": crop_lot.commodity,
        "quantity_kg": crop_lot.quantity_kg,
        "expected_price": crop_lot.expected_price,
        "matches": matches
    }

@app.post("/api/offers")
def create_offer(
    crop_lot_id: int,
    buyer_id: int,
    offered_price_per_kg: float,
    quantity_kg: float,
    db: Session = Depends(get_db)
):

    # Check crop lot
    crop_lot = (
        db.query(CropLot)
        .filter(CropLot.id == crop_lot_id)
        .first()
    )

    if crop_lot is None:
        return {
            "error": "Crop lot not found"
        }

    # Check buyer
    buyer = (
        db.query(Buyer)
        .filter(Buyer.id == buyer_id)
        .first()
    )

    if buyer is None:
        return {
            "error": "Buyer not found"
        }

    # Calculate total amount
    total_amount = offered_price_per_kg * quantity_kg

    offer = Offer(
        crop_lot_id=crop_lot_id,
        buyer_id=buyer_id,
        offered_price_per_kg=offered_price_per_kg,
        quantity_kg=quantity_kg,
        total_amount=total_amount,
        status="PENDING"
    )

    db.add(offer)
    db.commit()
    db.refresh(offer)

    return {
        "message": "Offer created successfully",
        "offer_id": offer.id,
        "id": offer.id,
        "crop_lot_id": crop_lot_id,
        "buyer_id": buyer_id,
        "offered_price_per_kg": offered_price_per_kg,
        "quantity_kg": quantity_kg,
        "total_amount": total_amount,
        "status": offer.status
    }

@app.get("/api/offers")
def get_offers(
    db: Session = Depends(get_db)
):
    offers = db.query(Offer).all()

    return offers

@app.patch("/api/offers/{offer_id}/accept")
def accept_offer(
    offer_id: int,
    db: Session = Depends(get_db)
):
    offer = (
        db.query(Offer)
        .filter(Offer.id == offer_id)
        .first()
    )

    if offer is None:
        return {
            "error": "Offer not found"
        }

    offer.status = "ACCEPTED"

    db.commit()
    db.refresh(offer)

    return {
        "message": "Offer accepted successfully",
        "offer_id": offer.id,
        "status": offer.status
    }

@app.patch("/api/offers/{offer_id}/reject")
def reject_offer(
    offer_id: int,
    db: Session = Depends(get_db)
):
    offer = (
        db.query(Offer)
        .filter(Offer.id == offer_id)
        .first()
    )

    if offer is None:
        return {
            "error": "Offer not found"
        }

    offer.status = "REJECTED"

    db.commit()
    db.refresh(offer)

    return {
        "message": "Offer rejected successfully",
        "offer_id": offer.id,
        "status": offer.status
    }
@app.post("/api/logistics")
def create_logistics(
    offer_id: int,
    pickup_location: str,
    delivery_location: str,
    transporter_name: str = "",
    vehicle_number: str = "",
    db: Session = Depends(get_db)
):

    # Check offer
    offer = (
        db.query(Offer)
        .filter(Offer.id == offer_id)
        .first()
    )

    if offer is None:
        return {
            "error": "Offer not found"
        }

    # Create logistics record
    logistics = Logistics(
        offer_id=offer_id,
        pickup_location=pickup_location,
        delivery_location=delivery_location,
        transporter_name=transporter_name,
        vehicle_number=vehicle_number,
        status="PENDING"
    )

    db.add(logistics)
    db.commit()
    db.refresh(logistics)

    return {
        "message": "Logistics created successfully",
        "logistics_id": logistics.id,
        "id": logistics.id,
        "offer_id": logistics.offer_id,
        "pickup_location": logistics.pickup_location,
        "delivery_location": logistics.delivery_location,
        "transporter_name": logistics.transporter_name,
        "vehicle_number": logistics.vehicle_number,
        "status": logistics.status
    }

@app.get("/api/logistics")
def get_logistics(
    db: Session = Depends(get_db)
):
    logistics_records = db.query(Logistics).all()

    return logistics_records

@app.patch("/api/logistics/{logistics_id}/status")
def update_logistics_status(
    logistics_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    logistics = (
        db.query(Logistics)
        .filter(Logistics.id == logistics_id)
        .first()
    )

    if logistics is None:
        return {
            "error": "Logistics record not found"
        }

    allowed_statuses = [
        "PENDING",
        "PICKUP",
        "IN_TRANSIT",
        "DELIVERED"
    ]

    status = status.upper()

    if status not in allowed_statuses:
        return {
            "error": "Invalid status",
            "allowed_statuses": allowed_statuses
        }

    logistics.status = status

    db.commit()
    db.refresh(logistics)

    return {
        "message": "Logistics status updated successfully",
        "logistics_id": logistics.id,
        "status": logistics.status
    }

@app.post("/api/payments")
def create_payment(
    offer_id: int,
    payment_method: str,
    transaction_reference: str,
    db: Session = Depends(get_db)
):

    # Find offer
    offer = (
        db.query(Offer)
        .filter(Offer.id == offer_id)
        .first()
    )

    if offer is None:
        return {
            "error": "Offer not found"
        }

    # Payment should only happen after offer is accepted
    if offer.status != "ACCEPTED":
        return {
            "error": "Offer must be ACCEPTED before payment"
        }

    # Check if payment already exists
    existing_transaction = (
        db.query(Transaction)
        .filter(Transaction.offer_id == offer_id)
        .first()
    )

    if existing_transaction:
        return {
            "error": "Payment already exists for this offer"
        }

    transaction = Transaction(
        offer_id=offer.id,
        farmer_id=1,
        buyer_id=offer.buyer_id,
        amount=offer.total_amount,
        payment_method=payment_method,
        transaction_reference=transaction_reference,
        status="PAID"
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return {
        "message": "Payment recorded successfully",
        "transaction_id": transaction.id,
        "id": transaction.id,
        "offer_id": transaction.offer_id,
        "amount": transaction.amount,
        "payment_method": transaction.payment_method,
        "transaction_reference": transaction.transaction_reference,
        "status": transaction.status
    }

@app.get("/api/payments")
def get_payments(
    db: Session = Depends(get_db)
):

    transactions = db.query(Transaction).all()

    return transactions

@app.post("/api/grievances")
def create_grievance(
    farmer_id: int,
    category: str,
    description: str,
    offer_id: int = None,
    db: Session = Depends(get_db)
):

    # Check farmer
    farmer = (
        db.query(Farmer)
        .filter(Farmer.id == farmer_id)
        .first()
    )

    if farmer is None:
        return {
            "error": "Farmer not found"
        }

    # Create grievance
    grievance = Grievance(
        farmer_id=farmer_id,
        offer_id=offer_id,
        category=category,
        description=description,
        status="OPEN"
    )

    db.add(grievance)
    db.commit()
    db.refresh(grievance)

    return {
        "message": "Grievance created successfully",
        "grievance_id": grievance.id,
        "id": grievance.id,
        "farmer_id": grievance.farmer_id,
        "category": grievance.category,
        "description": grievance.description,
        "status": grievance.status
    }

@app.get("/api/grievances")
def get_grievances(
    db: Session = Depends(get_db)
):

    grievances = db.query(Grievance).all()

    return grievances

@app.patch("/api/grievances/{grievance_id}/resolve")
def resolve_grievance(
    grievance_id: int,
    resolution: str,
    db: Session = Depends(get_db)
):

    grievance = (
        db.query(Grievance)
        .filter(Grievance.id == grievance_id)
        .first()
    )

    if grievance is None:
        return {
            "error": "Grievance not found"
        }

    grievance.status = "RESOLVED"
    grievance.resolution = resolution

    db.commit()
    db.refresh(grievance)

    return {
        "message": "Grievance resolved successfully",
        "grievance_id": grievance.id,
        "status": grievance.status,
        "resolution": grievance.resolution
    }