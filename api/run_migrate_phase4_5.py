import os
from dotenv import load_dotenv

load_dotenv()
direct_url = os.environ.get("DIRECT_URL")
if direct_url:
    os.environ["DATABASE_URL"] = direct_url

import migrate_phase4_5
migrate_phase4_5.upgrade()
