from slowapi import Limiter
from slowapi.util import get_remote_address

# Inicializa el limiter usando la dirección IP del cliente (get_remote_address)
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
