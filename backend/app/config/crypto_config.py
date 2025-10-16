# backend/app/config/crypto_config.py
"""
Configuración de criptomonedas soportadas
Total: 50 monedas seleccionadas por capitalización y volumen
"""

CRYPTO_CONFIG = {
    # ========== ORIGINALES (23) ==========
    "BTC/USDT": {"exchange": "kraken", "category": "L1", "name": "Bitcoin"},
    "ETH/USDT": {"exchange": "kraken", "category": "L1", "name": "Ethereum"},
    "XRP/USDT": {"exchange": "kraken", "category": "Payment", "name": "Ripple"},
    "ADA/USDT": {"exchange": "kraken", "category": "L1", "name": "Cardano"},
    "SOL/USDT": {"exchange": "kraken", "category": "L1", "name": "Solana"},
    "DOT/USDT": {"exchange": "kraken", "category": "L0", "name": "Polkadot"},
    "LINK/USDT": {"exchange": "kraken", "category": "Oracle", "name": "Chainlink"},
    "AVAX/USDT": {"exchange": "kraken", "category": "L1", "name": "Avalanche"},
    "ALGO/USDT": {"exchange": "kraken", "category": "L1", "name": "Algorand"},
    "ATOM/USDT": {"exchange": "kraken", "category": "L0", "name": "Cosmos"},
    "LTC/USDT": {"exchange": "kraken", "category": "Payment", "name": "Litecoin"},
    "DOGE/USDT": {"exchange": "kraken", "category": "Meme", "name": "Dogecoin"},
    "BCH/USDT": {"exchange": "kraken", "category": "Payment", "name": "Bitcoin Cash"},
    "MATIC/USDT": {"exchange": "binance", "category": "L2", "name": "Polygon"},
    "UNI/USDT": {"exchange": "binance", "category": "DeFi", "name": "Uniswap"},
    "XLM/USDT": {"exchange": "binance", "category": "Payment", "name": "Stellar"},
    "AAVE/USDT": {"exchange": "binance", "category": "DeFi", "name": "Aave"},
    "SNX/USDT": {"exchange": "binance", "category": "DeFi", "name": "Synthetix"},
    "FIL/USDT": {"exchange": "binance", "category": "Storage", "name": "Filecoin"},
    "VET/USDT": {"exchange": "binance", "category": "Supply Chain", "name": "VeChain"},
    "ETC/USDT": {"exchange": "binance", "category": "L1", "name": "Ethereum Classic"},
    "TRX/USDT": {"exchange": "binance", "category": "L1", "name": "Tron"},
    "SUSHI/USDT": {"exchange": "binance", "category": "DeFi", "name": "SushiSwap"},

    # ========== NUEVAS SOLICITADAS (13) ==========
    "BNB/USDT": {"exchange": "binance", "category": "Exchange", "name": "BNB"},
    "PEPE/USDT": {"exchange": "binance", "category": "Meme", "name": "Pepe"},
    "BONK/USDT": {"exchange": "binance", "category": "Meme", "name": "Bonk"},
    "HBAR/USDT": {"exchange": "coinex", "category": "L1", "name": "Hedera"},
    "XDC/USDT": {"exchange": "coinex", "category": "Enterprise", "name": "XDC Network"},
    "IOTA/USDT": {"exchange": "coinex", "category": "IoT", "name": "IOTA"},
    "VIRTUALS/USDT": {"exchange": "binance", "category": "AI", "name": "Virtuals Protocol"},
    "ONDO/USDT": {"exchange": "binance", "category": "RWA", "name": "Ondo Finance"},
    "NEAR/USDT": {"exchange": "binance", "category": "L1", "name": "NEAR Protocol"},
    "W/USDT": {"exchange": "binance", "category": "Infrastructure", "name": "Wormhole"},
    "RENDER/USDT": {"exchange": "binance", "category": "AI", "name": "Render"},
    "FLR/USDT": {"exchange": "coinex", "category": "L1", "name": "Flare"},
    "VELO/USDT": {"exchange": "coinex", "category": "DeFi", "name": "Velo"},

    # ========== TOP POR CAPITALIZACIÓN (14) ==========
    "HYPE/USDT": {"exchange": "binance", "category": "DeFi", "name": "Hyperliquid"},
    "TON/USDT": {"exchange": "binance", "category": "L1", "name": "Toncoin"},
    "SUI/USDT": {"exchange": "binance", "category": "L1", "name": "Sui"},
    "TAO/USDT": {"exchange": "binance", "category": "AI", "name": "Bittensor"},
    "ARB/USDT": {"exchange": "binance", "category": "L2", "name": "Arbitrum"},
    "OP/USDT": {"exchange": "binance", "category": "L2", "name": "Optimism"},
    "INJ/USDT": {"exchange": "binance", "category": "DeFi", "name": "Injective"},
    "SEI/USDT": {"exchange": "binance", "category": "L1", "name": "Sei"},
    "APT/USDT": {"exchange": "binance", "category": "L1", "name": "Aptos"},
    "IMX/USDT": {"exchange": "binance", "category": "L2", "name": "Immutable X"},
    "FTM/USDT": {"exchange": "binance", "category": "L1", "name": "Fantom"},
    "RUNE/USDT": {"exchange": "binance", "category": "DeFi", "name": "THORChain"},
    "GRT/USDT": {"exchange": "binance", "category": "Infrastructure", "name": "The Graph"},
    "LDO/USDT": {"exchange": "binance", "category": "DeFi", "name": "Lido DAO"},
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
    return "binance"  # Default


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
COINEX_COUNT = len(get_cryptos_by_exchange("coinex"))
