# backend/app/config/crypto_config.py

"""
Configuración de criptomonedas y exchanges
Cada cripto se asigna al exchange donde tiene mejor liquidez/disponibilidad
"""

CRYPTO_CONFIG = {
    # ========== KRAKEN (13 criptos) ==========
    "BTC/USDT": {
        "exchange": "kraken",
        "category": "L1",
        "name": "Bitcoin"
    },
    "ETH/USDT": {
        "exchange": "kraken",
        "category": "L1",
        "name": "Ethereum"
    },
    "XRP/USDT": {
        "exchange": "kraken",
        "category": "Payment",
        "name": "Ripple"
    },
    "ADA/USDT": {
        "exchange": "kraken",
        "category": "L1",
        "name": "Cardano"
    },
    "SOL/USDT": {
        "exchange": "kraken",
        "category": "L1",
        "name": "Solana"
    },
    "DOT/USDT": {
        "exchange": "kraken",
        "category": "L0",
        "name": "Polkadot"
    },
    "LINK/USDT": {
        "exchange": "kraken",
        "category": "Oracle",
        "name": "Chainlink"
    },
    "AVAX/USDT": {
        "exchange": "kraken",
        "category": "L1",
        "name": "Avalanche"
    },
    "ALGO/USDT": {
        "exchange": "kraken",
        "category": "L1",
        "name": "Algorand"
    },
    "ATOM/USDT": {
        "exchange": "kraken",
        "category": "L0",
        "name": "Cosmos"
    },
    "LTC/USDT": {
        "exchange": "kraken",
        "category": "Payment",
        "name": "Litecoin"
    },
    "DOGE/USDT": {
        "exchange": "kraken",
        "category": "Meme",
        "name": "Dogecoin"
    },
    "BCH/USDT": {
        "exchange": "kraken",
        "category": "Payment",
        "name": "Bitcoin Cash"
    },

    # ========== BINANCE (10 criptos) ==========
    "MATIC/USDT": {
        "exchange": "binance",
        "category": "L2",
        "name": "Polygon"
    },
    "UNI/USDT": {
        "exchange": "binance",
        "category": "DeFi",
        "name": "Uniswap"
    },
    "XLM/USDT": {
        "exchange": "binance",
        "category": "Payment",
        "name": "Stellar"
    },
    "AAVE/USDT": {
        "exchange": "binance",
        "category": "DeFi",
        "name": "Aave"
    },
    "SNX/USDT": {
        "exchange": "binance",
        "category": "DeFi",
        "name": "Synthetix"
    },
    "FIL/USDT": {
        "exchange": "binance",
        "category": "Storage",
        "name": "Filecoin"
    },
    "VET/USDT": {
        "exchange": "binance",
        "category": "Supply Chain",
        "name": "VeChain"
    },
    "ETC/USDT": {
        "exchange": "binance",
        "category": "L1",
        "name": "Ethereum Classic"
    },
    "TRX/USDT": {
        "exchange": "binance",
        "category": "L1",
        "name": "Tron"
    },
    "SUSHI/USDT": {
        "exchange": "binance",
        "category": "DeFi",
        "name": "SushiSwap"
    },
}


def get_crypto_config():
    """Retorna la configuración completa de criptomonedas"""
    return CRYPTO_CONFIG


def get_cryptos_by_exchange(exchange: str):
    """Filtra criptomonedas por exchange"""
    return {
        symbol: config 
        for symbol, config in CRYPTO_CONFIG.items() 
        if config["exchange"] == exchange
    }


def get_exchange_for_crypto(symbol: str):
    """Obtiene el exchange correcto para una criptomoneda"""
    config = CRYPTO_CONFIG.get(symbol)
    if config:
        return config["exchange"]
    return "kraken"  # Default


def get_all_symbols():
    """Retorna lista de todos los símbolos configurados"""
    return list(CRYPTO_CONFIG.keys())


def get_crypto_name(symbol: str):
    """Obtiene el nombre completo de una cripto"""
    config = CRYPTO_CONFIG.get(symbol)
    if config:
        return config["name"]
    return symbol


def get_cryptos_by_category(category: str):
    """Filtra criptomonedas por categoría"""
    return {
        symbol: config 
        for symbol, config in CRYPTO_CONFIG.items() 
        if config["category"] == category
    }


# Estadísticas de configuración
TOTAL_CRYPTOS = len(CRYPTO_CONFIG)
KRAKEN_COUNT = len(get_cryptos_by_exchange("kraken"))
BINANCE_COUNT = len(get_cryptos_by_exchange("binance"))