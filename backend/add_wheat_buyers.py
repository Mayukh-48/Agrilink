import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'agrilink.db')
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    # Add Wheat to buyers 1 and 3 if they don't already have it
    c.execute("UPDATE buyers SET commodities = commodities || ',Wheat' WHERE id IN (1, 3) AND commodities NOT LIKE '%Wheat%'")
    conn.commit()
    conn.close()
    print("Fixed: Added 'Wheat' to buyers in the local database.")
else:
    print("agrilink.db not found. Run this in the backend folder after the DB is created.")
